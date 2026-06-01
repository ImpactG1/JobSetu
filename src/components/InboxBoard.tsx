import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Star, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Check, 
  Flame, 
  CornerUpLeft,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { EmailThread } from '../types';

interface InboxBoardProps {
  threads: EmailThread[];
  currentProfile: any;
  onSendReply: (threadId: string, replyBody: string) => void;
  searchQuery: string;
}

export const InboxBoard: React.FC<InboxBoardProps> = ({
  threads,
  currentProfile,
  onSendReply,
  searchQuery
}) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [replyText, setReplyText] = useState<string>('');
  
  // AI assist states
  const [selectedTone, setSelectedTone] = useState<'Formal' | 'Warm' | 'Concise'>('Formal');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [aiRefinementResult, setAiRefinementResult] = useState<{
    refinedText: string;
    alternatives: { title: string; text: string }[];
    analysis: { wordCount: number; readTime: string; sentiment: string };
    isMocked?: boolean;
    info?: string;
  } | null>(null);

  const [starredThreadIds, setStarredThreadIds] = useState<string[]>(['thread-1']);

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredThreadIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const getActiveThread = () => threads.find(t => t.id === selectedThreadId) || threads[0];

  // Filters logic
  const filteredThreads = threads.filter(thread => {
    // Header search Bar filter
    if (searchQuery && ! (
      thread.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.preview.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }

    if (inboxFilter === 'unread' && thread.status !== 'Replied' && thread.status !== 'Sent') {
      // simulate unread condition based on "Opened" status
      return thread.status === 'Opened';
    }
    if (inboxFilter === 'starred' && !starredThreadIds.includes(thread.id)) {
      return false;
    }
    return true;
  });

  // Call server-side API to refine drafting with Gemini Flash
  const refineDraftWithAI = async () => {
    if (!replyText.trim()) return;

    setIsRefining(true);
    setAiRefinementResult(null);

    try {
      const response = await fetch('/api/gemini/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText,
          tone: selectedTone,
          variables: {
            first_name: getActiveThread()?.candidateName.split(' ')[0] || 'Candidate',
            company: 'Elite Client',
            position: 'Executive Director',
            sender_name: currentProfile.name
          }
        })
      });

      if (!response.ok) {
        throw new Error('API server refinement failure');
      }

      const data = await response.json();
      setAiRefinementResult(data);
    } catch (err) {
      console.error('AI assistant processing failed:', err);
      // Construct fallback context in case server error triggers
      setAiRefinementResult({
        refinedText: `Dear ${getActiveThread()?.candidateName.split(' ')[0] || 'Candidate'},\n\nFollowing up on our correspondence on talent sourcing strategy, I would deeply appreciate scheduling 15 minutes of your time.\n\nWarmly,\n${currentProfile.name}`,
        alternatives: [
          { title: 'Urgent Connection', text: 'I am available Tuesday morning and would love to lock in our intro round.' },
          { title: 'Brief Outline', text: 'Please let me know if an active consultation aligns on Wednesdays.' }
        ],
        analysis: {
          wordCount: 38,
          readTime: '0.5m',
          sentiment: 'High'
        }
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(selectedThreadId, replyText);
    setReplyText('');
    setAiRefinementResult(null);
  };

  const activeThread = getActiveThread();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Left Column: Candidates Interactions Thread List */}
      <div className="lg:col-span-4 bg-white border border-[#ecebe6] rounded-xl elite-card-shadow flex flex-col h-full overflow-hidden">
        {/* Header filtering toolbar */}
        <div className="p-4 border-b border-[#faf9f6] flex items-center justify-between shrink-0 bg-neutral-50/40">
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-neutral-500" />
            <span>Interactions List</span>
          </span>
          <div className="flex bg-[#ecebe6]/50 rounded-lg p-0.5 space-x-1">
            {(['all', 'unread', 'starred'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setInboxFilter(filter)}
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded transition-all ${
                  inboxFilter === filter
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Candidates Feed Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#ecebe6]/40">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No matching conversation threads found in this list.
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.id === selectedThreadId;
              const isStarred = starredThreadIds.includes(thread.id);
              const lastMessage = thread.conversation[thread.conversation.length - 1];

              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setSelectedThreadId(thread.id);
                    setReplyText('');
                    setAiRefinementResult(null);
                  }}
                  className={`p-4 cursor-pointer hover:bg-neutral-50/50 transition-all flex items-start gap-3 relative ${
                    isSelected ? 'bg-neutral-50 border-r-2 border-neutral-900' : ''
                  }`}
                >
                  <img
                    src={thread.avatar}
                    alt={thread.candidateName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-[#ecebe6] shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {thread.candidateName}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">{thread.time}</span>
                    </div>

                    <h5 className="text-[11px] text-neutral-800 font-semibold truncate leading-tight">
                      {thread.subject}
                    </h5>

                    <p className="text-[11px] text-neutral-500 leading-normal line-clamp-1">
                      {lastMessage ? lastMessage.body : thread.preview}
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      {thread.tags?.map((tag, idx) => (
                        <span 
                          key={idx}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            tag === 'High Priority' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : tag === 'Replied'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bookmark Star button */}
                  <button
                    onClick={(e) => toggleStar(e, thread.id)}
                    className={`shrink-0 p-0.5 rounded hover:bg-neutral-200/50 ${
                      isStarred ? 'text-amber-500' : 'text-neutral-300'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Dialogue & Composer Row (Span 8) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-white border border-[#ecebe6] rounded-xl elite-card-shadow overflow-hidden">
        {activeThread ? (
          <>
            {/* Active Candidate Header */}
            <div className="p-4 border-b border-[#ecebe6] shrink-0 bg-neutral-50/20 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <img
                  src={activeThread.avatar}
                  alt={activeThread.candidateName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-[#ecebe6]"
                />
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>{activeThread.candidateName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono font-medium lowercase">
                      &lt;{activeThread.email}&gt;
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-normal font-semibold">
                    Subject: {activeThread.subject}
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Thread Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/20">
              {activeThread.conversation.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-xl p-4 rounded-xl space-y-1.5 text-xs ${
                    msg.isUser
                      ? 'ml-auto bg-neutral-900 border border-neutral-950 text-neutral-100'
                      : 'mr-auto bg-white border border-[#ecebe6] text-neutral-800 elite-card-shadow'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/5 dark:border-neutral-800">
                    <span className="font-bold flex items-center gap-1">
                      {msg.isUser && <CornerUpLeft className="w-3 h-3 text-neutral-400" />}
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] font-mono opacity-60 font-medium">
                      {msg.time}
                    </span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-light">
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Composer Footer: Complete AI Assist System */}
            <div className="p-5 border-t border-[#ecebe6] shrink-0 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Composer fields */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      E-Mail Draft Editor
                    </span>
                    
                    {/* Tone Selection Group */}
                    <div className="flex bg-[#ecebe6]/40 p-0.5 rounded-lg space-x-1">
                      {(['Formal', 'Warm', 'Concise'] as const).map(tone => (
                        <button
                          key={tone}
                          type="button"
                          onClick={() => setSelectedTone(tone)}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition ${
                            selectedTone === tone
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Draft reply email. (e.g. "Dear ${activeThread.candidateName.split(' ')[0]}, I loved reviewing your recent work...")`}
                      rows={4}
                      className="w-full text-xs bg-[#faf9f6]/80 hover:bg-[#faf9f6] text-neutral-800 border border-neutral-200 focus:border-neutral-900 rounded-lg p-3 outline-none transition-all placeholder:text-neutral-400 font-light resize-none"
                    />
                    
                    {/* Flush Refinement Button */}
                    <button
                      type="button"
                      disabled={isRefining || !replyText.trim()}
                      onClick={refineDraftWithAI}
                      className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200/50 px-2.5 py-1 rounded flex items-center space-x-1 shadow-xs transition disabled:opacity-50"
                    >
                      {isRefining ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-amber-800" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Refine with AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Send Button Trigger */}
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!replyText.trim()}
                      onClick={handleSend}
                      className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase rounded-lg shadow-sm transition disabled:opacity-45 flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch E-Mail</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel: AI Writing Refinement Output Inspector */}
                <div className="md:col-span-5 bg-neutral-50 border border-neutral-200/75 rounded-xl p-4 space-y-4 h-[200px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Writing Assistant</span>
                    </span>

                    {aiRefinementResult && (
                      <span className="text-[9px] text-neutral-400 font-mono font-bold">
                        SENTIMENT: {aiRefinementResult.analysis?.sentiment || 'HIGH'}
                      </span>
                    )}
                  </div>

                  {/* Refinement output stream block */}
                  {!aiRefinementResult && !isRefining ? (
                    <div className="text-center py-6 text-neutral-400 text-[11px] leading-relaxed select-none font-light">
                      Input your preliminary draft, select your desired tone, and trigger 'Refine with AI' to generate a response tailored for executive recruitment.
                    </div>
                  ) : isRefining ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2 text-neutral-500">
                      <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
                      <span className="text-[11px] font-mono tracking-wide">Executing Gemini AI Orchestrator...</span>
                    </div>
                  ) : aiRefinementResult ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Warning highlight for offline processors */}
                      {aiRefinementResult.isMocked && (
                        <div className="bg-amber-50 text-amber-800 rounded p-2 text-[10px] flex items-start gap-1 line-clamp-2">
                          <AlertCircle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                          <span>Local offline assistant loaded. To connect real-time Gemini, input your GEMINI_API_KEY.</span>
                        </div>
                      )}

                      {/* AI refined preview button */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          <span>Refined Output Proposal</span>
                          <span className="font-mono text-neutral-600 lowercase">
                            {aiRefinementResult.analysis?.wordCount || 100}W • {aiRefinementResult.analysis?.readTime || '1.2m'}RT
                          </span>
                        </div>
                        <div className="bg-white border border-[#ecebe6] rounded p-2.5 text-[11px] text-neutral-700 leading-relaxed max-h-32 overflow-y-auto font-light">
                          {aiRefinementResult.refinedText}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyText(aiRefinementResult.refinedText);
                              setAiRefinementResult(null);
                            }}
                            className="text-[10px] font-bold text-neutral-900 hover:text-black uppercase tracking-wider flex items-center gap-0.5 underline"
                          >
                            <span>Apply Draft</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Alternatives list */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          Smart alternatives
                        </span>
                        <div className="space-y-2">
                          {aiRefinementResult.alternatives?.map((alt, idx) => (
                            <div 
                              key={idx} 
                              className="bg-zinc-100 hover:bg-zinc-200/60 p-2.5 rounded text-[11px] space-y-1 transition text-neutral-800"
                            >
                              <span className="block font-bold text-[10px] text-neutral-500 uppercase tracking-wider italic font-serif">
                                {alt.title}
                              </span>
                              <p className="font-light leading-relaxed">{alt.text}</p>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyText(prev => `${prev}\n\n${alt.text}`);
                                  }}
                                  className="text-[9px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5"
                                >
                                  <span>Append</span>
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-xs">
            <Mail className="w-12 h-12 text-neutral-300 mb-3" />
            <span>Select a candidate recruitment dialogue to begin draft processing.</span>
          </div>
        )}
      </div>
    </div>
  );
};
