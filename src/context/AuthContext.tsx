import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Google OAuth token refresh endpoint
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  providerToken: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshGoogleToken: () => Promise<string | null>;
  isGmailConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [providerRefreshToken, setProviderRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);

  // Persist tokens in localStorage for survival across page reloads
  const STORAGE_KEY_TOKEN = 'jobsetu_google_token';
  const STORAGE_KEY_REFRESH = 'jobsetu_google_refresh';
  const STORAGE_KEY_EXPIRES = 'jobsetu_google_expires';

  // Load persisted tokens on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const savedRefresh = localStorage.getItem(STORAGE_KEY_REFRESH);
    const savedExpires = localStorage.getItem(STORAGE_KEY_EXPIRES);
    if (savedToken) setProviderToken(savedToken);
    if (savedRefresh) setProviderRefreshToken(savedRefresh);
    if (savedExpires) setTokenExpiresAt(parseInt(savedExpires, 10));
  }, []);

  // Save tokens to localStorage whenever they change
  const persistTokens = (token: string | null, refresh: string | null, expires: number) => {
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
    else localStorage.removeItem(STORAGE_KEY_TOKEN);
    if (refresh) localStorage.setItem(STORAGE_KEY_REFRESH, refresh);
    else localStorage.removeItem(STORAGE_KEY_REFRESH);
    if (expires) localStorage.setItem(STORAGE_KEY_EXPIRES, String(expires));
    else localStorage.removeItem(STORAGE_KEY_EXPIRES);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Extract provider tokens if available (only present right after OAuth login)
      if (session?.provider_token) {
        const expiresAt = Date.now() + 3500 * 1000; // ~58 min safety margin
        setProviderToken(session.provider_token);
        setProviderRefreshToken(session.provider_refresh_token || null);
        setTokenExpiresAt(expiresAt);
        persistTokens(session.provider_token, session.provider_refresh_token || null, expiresAt);
      }

      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Capture provider tokens on sign-in event
        if (session?.provider_token) {
          const expiresAt = Date.now() + 3500 * 1000;
          setProviderToken(session.provider_token);
          setProviderRefreshToken(session.provider_refresh_token || null);
          setTokenExpiresAt(expiresAt);
          persistTokens(session.provider_token, session.provider_refresh_token || null, expiresAt);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Refresh Google Token ─────────────────────────────────
  const refreshGoogleToken = useCallback(async (): Promise<string | null> => {
    // If current token is still valid, return it
    if (providerToken && Date.now() < tokenExpiresAt) {
      return providerToken;
    }

    // Try to refresh using the refresh token
    if (!providerRefreshToken) {
      console.warn('[Auth] No refresh token available. User needs to re-authenticate.');
      return null;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    if (!clientId) {
      console.error('[Auth] VITE_GOOGLE_CLIENT_ID not set. Cannot refresh token.');
      return null;
    }

    try {
      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'refresh_token',
          refresh_token: providerRefreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Auth] Token refresh failed:', errorData);
        // Clear stale tokens
        setProviderToken(null);
        setTokenExpiresAt(0);
        persistTokens(null, providerRefreshToken, 0);
        return null;
      }

      const data = await response.json();
      const newToken = data.access_token as string;
      const expiresIn = (data.expires_in as number) || 3600;
      const newExpiresAt = Date.now() + (expiresIn - 60) * 1000;

      setProviderToken(newToken);
      setTokenExpiresAt(newExpiresAt);
      persistTokens(newToken, providerRefreshToken, newExpiresAt);

      return newToken;
    } catch (err) {
      console.error('[Auth] Token refresh error:', err);
      return null;
    }
  }, [providerToken, providerRefreshToken, tokenExpiresAt]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
    setProviderToken(null);
    setProviderRefreshToken(null);
    setTokenExpiresAt(0);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
  };

  const isGmailConnected = !!providerToken && Date.now() < tokenExpiresAt;

  return (
    <AuthContext.Provider value={{
      user, session, loading, providerToken,
      signUp, signIn, signInWithGoogle, signOut,
      refreshGoogleToken, isGmailConnected
    }}>
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
