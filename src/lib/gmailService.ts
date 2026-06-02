/**
 * Gmail API Service — REST calls using Google OAuth provider token
 */
import type { GmailMessage, EmailAttachment } from '../types';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

// ─── Fetch Inbox Messages ──────────────────────────────────

export async function fetchGmailInbox(
  token: string,
  maxResults: number = 20,
  query: string = ''
): Promise<GmailMessage[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    labelIds: 'INBOX',
  });
  if (query) params.set('q', query);

  const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    console.error('[Gmail] Inbox fetch failed:', err);
    throw new Error(err.error?.message || 'Failed to fetch inbox');
  }

  const listData = await listRes.json();
  const messageIds: { id: string; threadId: string }[] = listData.messages || [];

  if (!messageIds.length) return [];

  // Fetch message details in parallel (batch of first N)
  const details = await Promise.all(
    messageIds.slice(0, maxResults).map(m => fetchGmailMessage(token, m.id))
  );

  return details.filter(Boolean) as GmailMessage[];
}

// ─── Fetch Single Message ──────────────────────────────────

export async function fetchGmailMessage(
  token: string,
  messageId: string
): Promise<GmailMessage | null> {
  const res = await fetch(`${GMAIL_API}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const msg = await res.json();

  return parseGmailMessage(msg);
}

// ─── Send Email via Gmail ──────────────────────────────────

export async function sendGmailEmail(
  token: string,
  to: string,
  subject: string,
  body: string,
  from: string,
  attachments: EmailAttachment[] = []
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mimeMessage = attachments.length > 0 
    ? createMultipartMimeMessage(to, from, subject, body, attachments)
    : createMimeMessage(to, from, subject, body);
  const raw = base64urlEncode(mimeMessage);

  const res = await fetch(`${GMAIL_API}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error?.message || 'Send failed' };
  }

  const data = await res.json();
  return { success: true, messageId: data.id };
}

// ─── Fetch Sent Messages ───────────────────────────────────

export async function fetchGmailSent(
  token: string,
  maxResults: number = 15
): Promise<GmailMessage[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    labelIds: 'SENT',
  });

  const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listRes.ok) return [];

  const listData = await listRes.json();
  const messageIds: { id: string }[] = listData.messages || [];

  if (!messageIds.length) return [];

  const details = await Promise.all(
    messageIds.slice(0, maxResults).map(m => fetchGmailMessage(token, m.id))
  );

  return details.filter(Boolean) as GmailMessage[];
}

// ─── Helper: Parse Gmail API message into our type ─────────

function parseGmailMessage(msg: any): GmailMessage {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const fromRaw = getHeader('From');
  const fromName = fromRaw.includes('<')
    ? fromRaw.split('<')[0].trim().replace(/"/g, '')
    : fromRaw.split('@')[0];

  // Extract body text
  let body = '';
  if (msg.payload?.body?.data) {
    body = base64urlDecode(msg.payload.body.data);
  } else if (msg.payload?.parts) {
    const textPart = msg.payload.parts.find(
      (p: any) => p.mimeType === 'text/plain'
    );
    if (textPart?.body?.data) {
      body = base64urlDecode(textPart.body.data);
    } else {
      const htmlPart = msg.payload.parts.find(
        (p: any) => p.mimeType === 'text/html'
      );
      if (htmlPart?.body?.data) {
        body = stripHtml(base64urlDecode(htmlPart.body.data));
      }
    }
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: fromRaw,
    fromName,
    to: getHeader('To'),
    subject: getHeader('Subject') || '(No subject)',
    snippet: msg.snippet || '',
    body: body || msg.snippet || '',
    date: getHeader('Date'),
    isRead: !(msg.labelIds || []).includes('UNREAD'),
    labels: msg.labelIds || [],
  };
}

// ─── Helper: Create RFC 2822 MIME message ──────────────────

function createMimeMessage(
  to: string,
  from: string,
  subject: string,
  body: string
): string {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\r\n');
}

function createMultipartMimeMessage(
  to: string,
  from: string,
  subject: string,
  body: string,
  attachments: EmailAttachment[]
): string {
  const boundary = '----=_NextPart_' + Date.now().toString(16);
  const parts = [];
  
  parts.push(`From: ${from}`);
  parts.push(`To: ${to}`);
  parts.push(`Subject: ${subject}`);
  parts.push('MIME-Version: 1.0');
  parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  parts.push('');
  
  // Body part
  parts.push(`--${boundary}`);
  parts.push('Content-Type: text/plain; charset="UTF-8"');
  parts.push('');
  parts.push(body);
  parts.push('');
  
  // Attachments
  for (const att of attachments) {
    parts.push(`--${boundary}`);
    parts.push(`Content-Type: ${att.mimeType}; name="${att.filename}"`);
    parts.push('Content-Disposition: attachment; filename="' + att.filename + '"');
    parts.push('Content-Transfer-Encoding: base64');
    parts.push('');
    // Split base64 into 76-character lines (RFC 2045)
    const b64 = att.base64Data.replace(/(.{76})/g, '$1\r\n');
    parts.push(b64);
  }
  
  parts.push(`--${boundary}--`);
  
  return parts.join('\r\n');
}

// ─── Helper: Base64url encode/decode ───────────────────────

function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(padded);
  }
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
