import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Clock, 
  HelpCircle,
  FileText,
  AlertTriangle,
  ListTodo,
  MessageSquare
} from 'lucide-react';
import { MeetingRecord } from '../types';

interface MeetingAIChatProps {
  meeting: MeetingRecord;
  onJumpToTimestamp?: (time: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const MeetingAIChat: React.FC<MeetingAIChatProps> = ({ meeting, onJumpToTimestamp }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: `welcome-${meeting.id}`,
      role: 'assistant',
      content: `Hello! I'm your **ActionScribe AI Meeting Assistant**.

I have analyzed **"${meeting.title}"**, including the full discussion transcript, ${meeting.decisions.length} decisions, and ${meeting.actionItems.length} action items.

Ask me anything about this meeting, or choose a prompt below!`,
      timestamp: 'Just now',
      source: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync welcome message when active meeting changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${meeting.id}`,
        role: 'assistant',
        content: `Hello! I'm your **ActionScribe AI Meeting Assistant**.

I have analyzed **"${meeting.title}"**, including the full discussion transcript, ${meeting.decisions.length} decisions, and ${meeting.actionItems.length} action items.

Ask me anything about this meeting, or choose a prompt below!`,
        timestamp: 'Just now',
        source: 'gemini-3.8-flash',
      },
    ]);
  }, [meeting.id, meeting.title, meeting.decisions.length, meeting.actionItems.length]);

  const quickPrompts = [
    { label: 'Executive Brief', icon: FileText, query: 'Generate an executive 3-bullet summary highlighting the most critical takeaway for our C-suite.' },
    { label: 'Risks & Blockers', icon: AlertTriangle, query: 'What potential risks, roadblocks, or technical debt were mentioned in this meeting?' },
    { label: 'Action Items by Owner', icon: ListTodo, query: 'List all action items grouped strictly by assignee with their respective deadlines.' },
    { label: 'Draft Slack Update', icon: MessageSquare, query: 'Draft a concise, polished Slack announcement updating the team on what was decided today.' },
    { label: 'Open Questions', icon: HelpCircle, query: 'What unresolved questions or pending client feedback items need answering before our next sync?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/meeting-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting,
          messages: [...messages, userMsg],
          userMessage: messageText,
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I could not find relevant details in the meeting notes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue contacting the scribe assistant. Please verify your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat history reset. How can I help you extract insights from **"${meeting.title}"**?`,
        timestamp: 'Just now',
        source: 'gemini-3.8-flash',
      },
    ]);
  };

  // Render assistant messages with rich Markdown and interactive timestamp buttons
  const renderAssistantMarkdown = (rawContent: string) => {
    // Transform [02:15] timestamps into Markdown links with #time- prefix
    const prepared = rawContent.replace(
      /\[(\d{2}:\d{2})\]/g,
      (_, time) => `[${time}](#time-${time})`
    );

    return (
      <div className="text-slate-800 dark:text-neutral-100 text-xs sm:text-[13px] leading-relaxed">
        <Markdown
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith('#time-')) {
                const time = href.replace('#time-', '');
                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onJumpToTimestamp?.(time);
                    }}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold rounded cursor-pointer transition align-baseline shadow-2xs"
                    title={`Jump audio & transcript to ${time}`}
                  >
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                    <span>[{time}]</span>
                  </button>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {children}
                </a>
              );
            },
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900 dark:text-white">
                {children}
              </strong>
            ),
            p: ({ children }) => (
              <p className="mb-2.5 last:mb-0 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 my-2 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 my-2 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">
                {children}
              </li>
            ),
            h1: ({ children }) => (
              <h1 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xs font-bold text-slate-900 dark:text-white mt-2.5 mb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mt-2 mb-1">
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-indigo-500 pl-3 my-2 italic text-slate-600 dark:text-neutral-300 bg-indigo-50/50 dark:bg-indigo-950/30 py-1 rounded-r text-xs">
                {children}
              </blockquote>
            ),
            code: ({ inline, children }: any) => {
              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-neutral-700/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                    {children}
                  </code>
                );
              }
              return (
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto my-2 border border-slate-800">
                  <code>{children}</code>
                </pre>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-neutral-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-neutral-700 text-xs text-left">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-3 py-1.5 font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-1.5 border-t border-slate-200 dark:border-neutral-700">
                {children}
              </td>
            ),
          }}
        >
          {prepared}
        </Markdown>
      </div>
    );
  };

  // Render user messages cleanly with markdown support
  const renderUserMarkdown = (rawContent: string) => {
    return (
      <div className="text-white text-xs sm:text-[13px] leading-relaxed">
        <Markdown
          components={{
            p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed text-white">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5 text-white">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5 text-white">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed text-white">{children}</li>,
          }}
        >
          {rawContent}
        </Markdown>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col h-[600px] overflow-hidden transition-colors">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-100">
                ActionScribe AI Meeting Chat
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              Query transcript context, extract custom breakdowns, and draft communications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition flex items-center gap-1"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-5 py-2.5 bg-indigo-50/40 dark:bg-neutral-800/40 border-b border-slate-200 dark:border-neutral-800 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-neutral-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Ask:
        </span>
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap shadow-2xs transition"
            >
              <Icon className="w-3 h-3 text-indigo-500" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-2xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 rounded-tl-xs border border-slate-200 dark:border-neutral-700'
                }`}
              >
                <div>
                  {isUser
                    ? renderUserMarkdown(msg.content)
                    : renderAssistantMarkdown(msg.content)}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:opacity-100 opacity-70 flex items-center gap-1 transition"
                        title="Copy answer"
                      >
                        {copiedIndex === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 rounded-2xl rounded-tl-xs p-3.5 border border-slate-200 dark:border-neutral-700 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-500 dark:text-neutral-400 ml-1">Searching meeting context & formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/80 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question about this meeting (e.g. 'What was agreed on pricing?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition transform active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
