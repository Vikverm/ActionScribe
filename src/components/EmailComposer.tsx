import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Edit3, 
  RefreshCw, 
  UserCheck 
} from 'lucide-react';
import { FollowUpEmail, MeetingRecord } from '../types';

interface EmailComposerProps {
  meeting: MeetingRecord;
  onUpdateEmail: (updated: FollowUpEmail) => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({ meeting, onUpdateEmail }) => {
  const [email, setEmail] = useState<FollowUpEmail>(meeting.followUpEmail);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [recipientInput, setRecipientInput] = useState(email.recipients.join(', '));

  const tones: Array<{ id: FollowUpEmail['tone']; label: string; desc: string }> = [
    { id: 'executive', label: 'Executive', desc: 'High-level, structured, polished' },
    { id: 'friendly', label: 'Friendly & Warm', desc: 'Relational, enthusiastic, clear' },
    { id: 'concise', label: 'Ultra-Concise', desc: 'Direct bullet points & blockers only' },
    { id: 'interview_update', label: 'Candidate Update', desc: 'Encouraging, transparent, next-step focused' },
  ];

  const handleCopy = () => {
    const fullText = `Subject: ${email.subject}\nTo: ${email.recipients.join(', ')}\n\n${email.greeting}\n\n${email.body}\n\n${email.signoff}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailto = () => {
    const to = encodeURIComponent(email.recipients.join(', '));
    const subject = encodeURIComponent(email.subject);
    const body = encodeURIComponent(`${email.greeting}\n\n${email.body}\n\n${email.signoff}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleToneChange = async (newTone: FollowUpEmail['tone']) => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/regenerate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: meeting.summary,
          decisions: meeting.decisions,
          actionItems: meeting.actionItems,
          tone: newTone,
          recipientName: meeting.attendees[1] || 'Team',
        }),
      });

      const data = await res.json();
      if (data.success && data.email) {
        const updated: FollowUpEmail = {
          ...email,
          subject: data.email.subject || email.subject,
          greeting: data.email.greeting || email.greeting,
          body: data.email.body || email.body,
          signoff: data.email.signoff || email.signoff,
          tone: newTone,
        };
        setEmail(updated);
        onUpdateEmail(updated);
      }
    } catch (e) {
      console.error('Failed to regenerate email', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = () => {
    const updatedRecipients = recipientInput.split(',').map((r) => r.trim()).filter(Boolean);
    const updated: FollowUpEmail = {
      ...email,
      recipients: updatedRecipients,
    };
    setEmail(updated);
    onUpdateEmail(updated);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Ready-to-Send Follow-Up Email
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
              Zero Editing Needed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Auto-synthesized from discussion decisions, deadlines, and designated owners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="copy-email-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>

          <button
            id="mailto-email-btn"
            onClick={handleOpenMailto}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open in Mail App</span>
          </button>
        </div>
      </div>

      {/* Tone Switcher */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-medium text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Tone:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {tones.map((t) => {
            const active = email.tone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleToneChange(t.id)}
                disabled={isRegenerating}
                title={t.desc}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700'
                } ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {isRegenerating && (
          <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 animate-pulse ml-2">
            <RefreshCw className="w-3 h-3 animate-spin" /> Regenerating draft...
          </span>
        )}
      </div>

      {/* Email Editor / Display Canvas */}
      <div className="bg-slate-50 dark:bg-neutral-950 rounded-lg border border-slate-200 dark:border-neutral-800 overflow-hidden font-sans transition-colors">
        {/* Email Metadata Bar */}
        <div className="p-3.5 bg-slate-100/70 dark:bg-neutral-900/60 border-b border-slate-200 dark:border-neutral-800/80 space-y-2 text-xs">
          {/* Recipients */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-neutral-500 font-medium w-16">To:</span>
            {isEditing ? (
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                className="flex-1 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded px-2 py-1 text-slate-900 dark:text-neutral-200"
                placeholder="Separate emails with commas"
              />
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {email.recipients.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700 font-mono text-[11px]"
                  >
                    <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-neutral-500 font-medium w-16">Subject:</span>
            {isEditing ? (
              <input
                type="text"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                className="flex-1 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded px-2 py-1 text-slate-900 dark:text-neutral-200 font-medium"
              />
            ) : (
              <span className="text-slate-900 dark:text-neutral-100 font-semibold flex-1">{email.subject}</span>
            )}

            <button
              onClick={() => {
                if (isEditing) handleSaveEdit();
                else setIsEditing(true);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-neutral-800"
            >
              <Edit3 className="w-3 h-3" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-4 text-sm text-slate-800 dark:text-neutral-200 leading-relaxed space-y-3 font-sans">
          {isEditing ? (
            <textarea
              rows={12}
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-3 text-slate-900 dark:text-neutral-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <div className="whitespace-pre-line text-slate-700 dark:text-neutral-300">
              <p className="font-medium text-slate-900 dark:text-neutral-100 mb-2">{email.greeting}</p>
              {email.body}
              <div className="mt-4 pt-2 border-t border-slate-200 dark:border-neutral-900 text-slate-500 dark:text-neutral-400 italic text-xs">
                {email.signoff}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
