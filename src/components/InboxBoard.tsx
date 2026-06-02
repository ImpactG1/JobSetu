import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Send, Star, Sparkles, Clock, AlertCircle,
  Check, CornerUpLeft, Loader2, RefreshCw, Inbox,
  ArrowRight, LogIn, Search, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchGmailInbox, fetchGmailSent } from '../lib/gmailService';
import type { GmailMessage } from '../types';

interface InboxBoardProps {
  searchQuery: string;
}

export const InboxBoard: React.FC<InboxBoardProps> = ({ searchQuery }) => {
  const { providerToken, refreshGoogleToken, isGmailConnected, signInWithGoogle } = useAuth();

  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'inbox' | 'sent'>('inbox');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  // ─── Fetch Gmail Messages ─────────────────────────────────

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let token = providerToken;
      // Try refresh if token might be expired
      if (!token) {
        token = await refreshGoogleToken();
      }
      if (!token) {
        setError('Gmail not connected. Please sign in with Google to access your inbox.');
        setLoading(false);
        return;
      }

      const msgs = filter === 'inbox'
        ? await fetchGmailInbox(token, 20, searchQuery)
        : await fetchGmailSent(token, 20);

      setMessages(msgs);
      if (msgs.length > 0 && !selectedId) {
        setSelectedId(msgs[0].id);
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Invalid Credentials')) {
        // Token expired, try refresh
        const newToken = await refreshGoogleToken();
        if (newToken) {
          loadMessages(); // Retry
          return;
        }
        setError('Gmail session expired. Please sign in with Google again.');
      } else {
        setError(err.message || 'Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, [providerToken, filter, searchQuery, refreshGoogleToken, selectedId]);

  useEffect(() => {
    if (isGmailConnected || providerToken) {
      loadMessages();
    }
  }, [filter]);

  // Load on first mount if connected
  useEffect(() => {
    if (isGmailConnected || providerToken) {
      loadMessages();
    }
  }, []);

  const selectedMessage = messages.find(m => m.id === selectedId);

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return dateStr.slice(0, 16); }
  };

  // ─── Not Connected State ──────────────────────────────────

  if (!isGmailConnected && !providerToken) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)] animate-in fade-in duration-300">
        <div className="bg-white border border-[#ecebe6] rounded-2xl elite-card-shadow p-10 max-w-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif-display text-xl font-bold text-neutral-900">Connect Your Gmail</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Sign in with Google to access your Gmail inbox, send emails to HR contacts directly, and track your application progress.
            </p>
          </div>
          <button
            onClick={() => signInWithGoogle()}
            className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase rounded-xl hover:bg-neutral-800 transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In With Google</span>
          </button>
          <p className="text-[10px] text-neutral-400">
            We request read-only inbox access and email sending permission. Your data stays private.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">

      {/* ═══ Left: Message List ═══ */}
      <div className="lg:col-span-4 bg-white border border-[#ecebe6] rounded-xl elite-card-shadow flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#faf9f6] flex items-center justify-between shrink-0 bg-neutral-50/40">
          <div className="flex bg-[#ecebe6]/50 rounded-lg p-0.5 space-x-1">
            {(['inbox', 'sent'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setSelectedId(''); }}
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded transition-all ${filter === f ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={loadMessages} disabled={loading}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#ecebe6]/40">
          {loading && messages.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto" />
              <p className="text-[11px] text-neutral-400">Fetching your Gmail messages...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-600 font-medium">{error}</p>
              <button onClick={() => signInWithGoogle()}
                className="text-[10px] font-bold text-neutral-900 underline uppercase">Re-authenticate</button>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
              <Inbox className="w-8 h-8 text-neutral-300 mx-auto" />
              <p>No messages found</p>
            </div>
          ) : (
            messages.map(msg => {
              const isSelected = msg.id === selectedId;
              const isStarred = starredIds.has(msg.id);
              return (
                <div key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`p-4 cursor-pointer hover:bg-neutral-50/50 transition-all flex items-start gap-3 relative ${isSelected ? 'bg-neutral-50 border-r-2 border-neutral-900' : ''} ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-xs shrink-0">
                    {msg.fromName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs truncate ${!msg.isRead ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-700'}`}>
                        {filter === 'sent' ? `To: ${msg.to.split('<')[0].trim() || msg.to}` : msg.fromName || msg.from.split('@')[0]}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">{formatDate(msg.date)}</span>
                    </div>
                    <h5 className="text-[11px] text-neutral-800 font-semibold truncate leading-tight">{msg.subject}</h5>
                    <p className="text-[11px] text-neutral-500 line-clamp-1">{msg.snippet}</p>
                  </div>
                  <button onClick={e => toggleStar(e, msg.id)}
                    className={`shrink-0 p-0.5 rounded ${isStarred ? 'text-amber-500' : 'text-neutral-300'}`}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ Right: Message Detail ═══ */}
      <div className="lg:col-span-8 flex flex-col h-full bg-white border border-[#ecebe6] rounded-xl elite-card-shadow overflow-hidden">
        {selectedMessage ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#ecebe6] shrink-0 bg-neutral-50/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-serif-display text-base font-bold text-neutral-900 leading-snug">{selectedMessage.subject}</h3>
                  <div className="flex items-center space-x-2 text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-700">{selectedMessage.fromName || selectedMessage.from}</span>
                    <span className="text-neutral-300">→</span>
                    <span className="truncate">{selectedMessage.to}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{selectedMessage.date}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/20">
              <div className="max-w-2xl bg-white border border-[#ecebe6] rounded-xl p-5 elite-card-shadow">
                <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedMessage.body}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-xs">
            <Mail className="w-12 h-12 text-neutral-300 mb-3" />
            <span>Select a message to view its contents</span>
          </div>
        )}
      </div>
    </div>
  );
};
