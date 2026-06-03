/**
 * Google OAuth token refresh — prefers secure server endpoint (client secret).
 */

export interface GoogleTokenRefreshResult {
  access_token: string;
  expires_in: number;
  token_type?: string;
}

export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<GoogleTokenRefreshResult> {
  const res = await fetch('/api/auth/google/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.error_description || 'Token refresh failed');
  }

  if (!data.access_token) {
    throw new Error('No access token in refresh response');
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in ?? 3600,
    token_type: data.token_type,
  };
}

export function isGoogleAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('401') ||
    m.includes('invalid credentials') ||
    m.includes('invalid authentication') ||
    m.includes('authcredentials') ||
    m.includes('token expired') ||
    m.includes('unauthorized')
  );
}
