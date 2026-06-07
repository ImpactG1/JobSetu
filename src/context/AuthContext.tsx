import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { refreshGoogleAccessToken } from '../lib/googleAuth';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const STORAGE_KEY_TOKEN = 'reflyt_google_token';
const STORAGE_KEY_REFRESH = 'reflyt_google_refresh';
const STORAGE_KEY_EXPIRES = 'reflyt_google_expires';

/** Refresh access token this many ms before expiry */
const REFRESH_BUFFER_MS = 5 * 60 * 1000;
/** How often to check whether a proactive refresh is needed */
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  providerToken: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  /** @deprecated Prefer getValidGoogleAccessToken */
  refreshGoogleToken: (forceRefresh?: boolean) => Promise<string | null>;
  getValidGoogleAccessToken: (options?: { forceRefresh?: boolean }) => Promise<string | null>;
  isGmailConnected: boolean;
  gmailTokenRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredTokens() {
  return {
    access: localStorage.getItem(STORAGE_KEY_TOKEN),
    refresh: localStorage.getItem(STORAGE_KEY_REFRESH),
    expiresAt: parseInt(localStorage.getItem(STORAGE_KEY_EXPIRES) || '0', 10),
  };
}

function persistTokens(token: string | null, refresh: string | null, expiresAt: number) {
  if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
  else localStorage.removeItem(STORAGE_KEY_TOKEN);
  if (refresh) localStorage.setItem(STORAGE_KEY_REFRESH, refresh);
  else localStorage.removeItem(STORAGE_KEY_REFRESH);
  if (expiresAt) localStorage.setItem(STORAGE_KEY_EXPIRES, String(expiresAt));
  else localStorage.removeItem(STORAGE_KEY_EXPIRES);
}

function applyProviderSession(session: Session | null) {
  if (!session?.provider_token) return null;
  const expiresAt = Date.now() + 3500 * 1000;
  const refresh = session.provider_refresh_token || localStorage.getItem(STORAGE_KEY_REFRESH);
  persistTokens(session.provider_token, refresh, expiresAt);
  return {
    access: session.provider_token,
    refresh,
    expiresAt,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [providerRefreshToken, setProviderRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);
  const [gmailTokenRefreshing, setGmailTokenRefreshing] = useState(false);

  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  const syncFromStorage = useCallback(() => {
    const stored = readStoredTokens();
    setProviderToken(stored.access);
    setProviderRefreshToken(stored.refresh);
    setTokenExpiresAt(stored.expiresAt);
    return stored;
  }, []);

  const saveTokens = useCallback((access: string, refresh: string | null, expiresAt: number) => {
    const refreshToStore = refresh || localStorage.getItem(STORAGE_KEY_REFRESH);
    persistTokens(access, refreshToStore, expiresAt);
    setProviderToken(access);
    if (refreshToStore) setProviderRefreshToken(refreshToStore);
    setTokenExpiresAt(expiresAt);
  }, []);

  const clearGoogleTokens = useCallback(() => {
    persistTokens(null, null, 0);
    setProviderToken(null);
    setProviderRefreshToken(null);
    setTokenExpiresAt(0);
  }, []);

  const refreshViaClientOnly = async (refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!clientId) return null;

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.access_token) return null;
    return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 };
  };

  const performTokenRefresh = useCallback(async (): Promise<string | null> => {
    const stored = readStoredTokens();
    const refreshToken = stored.refresh || providerRefreshToken;
    if (!refreshToken) {
      console.warn('[Auth] No Google refresh token. User must sign in with Google again.');
      return null;
    }

    setGmailTokenRefreshing(true);
    try {
      let access_token: string;
      let expires_in: number;

      try {
        const result = await refreshGoogleAccessToken(refreshToken);
        access_token = result.access_token;
        expires_in = result.expires_in;
      } catch (serverErr) {
        console.warn('[Auth] Server refresh failed, trying client-only:', serverErr);
        const fallback = await refreshViaClientOnly(refreshToken);
        if (!fallback) throw serverErr;
        access_token = fallback.access_token;
        expires_in = fallback.expires_in;
      }

      const newExpiresAt = Date.now() + (expires_in - 60) * 1000;
      saveTokens(access_token, refreshToken, newExpiresAt);
      return access_token;
    } catch (err) {
      console.error('[Auth] Token refresh failed:', err);
      const storedAccess = readStoredTokens().access;
      if (!storedAccess) {
        setProviderToken(null);
        setTokenExpiresAt(0);
      }
      return null;
    } finally {
      setGmailTokenRefreshing(false);
    }
  }, [providerRefreshToken, saveTokens]);

  const refreshGoogleToken = useCallback(
    async (forceRefresh = false): Promise<string | null> => {
      const stored = readStoredTokens();

      if (!forceRefresh && stored.access && Date.now() < stored.expiresAt - REFRESH_BUFFER_MS) {
        setProviderToken(stored.access);
        setTokenExpiresAt(stored.expiresAt);
        return stored.access;
      }

      if (!stored.refresh && !providerRefreshToken) {
        return stored.access && Date.now() < stored.expiresAt ? stored.access : null;
      }

      if (refreshInFlightRef.current) {
        return refreshInFlightRef.current;
      }

      refreshInFlightRef.current = performTokenRefresh().finally(() => {
        refreshInFlightRef.current = null;
      });

      return refreshInFlightRef.current;
    },
    [performTokenRefresh, providerRefreshToken]
  );

  const getValidGoogleAccessToken = useCallback(
    async (options?: { forceRefresh?: boolean }): Promise<string | null> => {
      return refreshGoogleToken(Boolean(options?.forceRefresh));
    },
    [refreshGoogleToken]
  );

  useEffect(() => {
    syncFromStorage();

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      const applied = applyProviderSession(initialSession);
      if (applied) {
        setProviderToken(applied.access);
        setProviderRefreshToken(applied.refresh);
        setTokenExpiresAt(applied.expiresAt);
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      const applied = applyProviderSession(nextSession);
      if (applied) {
        setProviderToken(applied.access);
        setProviderRefreshToken(applied.refresh);
        setTokenExpiresAt(applied.expiresAt);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh expired token once after auth hydration
  useEffect(() => {
    if (loading) return;
    const stored = readStoredTokens();
    if (stored.refresh && Date.now() >= stored.expiresAt - REFRESH_BUFFER_MS) {
      void refreshGoogleToken(true);
    }
  }, [loading, refreshGoogleToken]);

  // Proactive refresh while the app is open
  useEffect(() => {
    const interval = window.setInterval(() => {
      const stored = readStoredTokens();
      if (!stored.refresh) return;
      if (Date.now() >= stored.expiresAt - REFRESH_BUFFER_MS) {
        refreshGoogleToken(true);
      }
    }, REFRESH_CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const stored = readStoredTokens();
      if (stored.refresh && Date.now() >= stored.expiresAt - REFRESH_BUFFER_MS) {
        refreshGoogleToken(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshGoogleToken]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearGoogleTokens();
  };

  const hasRefreshToken = !!providerRefreshToken || !!localStorage.getItem(STORAGE_KEY_REFRESH);
  const hasValidAccess =
    !!providerToken && tokenExpiresAt > 0 && Date.now() < tokenExpiresAt;
  const isGmailConnected = hasRefreshToken || hasValidAccess;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        providerToken,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshGoogleToken,
        getValidGoogleAccessToken,
        isGmailConnected,
        gmailTokenRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
