import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Lock, 
  Sparkles, 
  FileCode, 
  Share2, 
  Send,
  FileText,
  Subtitles,
  FileSpreadsheet,
  Globe,
  Link
} from 'lucide-react';
import { MeetingRecord, PlanTier } from '../types';
import { 
  generateNotionMarkdown, 
  generateSlackMarkdown, 
  generateCrmJson, 
  generateSrtSubtitles,
  generateTimestampedTxt,
  generateWordHtml,
  downloadFile 
} from '../utils/exportHelpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingRecord;
  currentPlan: PlanTier;
  onOpenPricing: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  meeting,
  currentPlan,
  onOpenPricing,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<
    'notion' | 'slack' | 'srt' | 'txt' | 'word' | 'crm' | 'markdown' | 'share_link'
  >('notion');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const allowsNotion = currentPlan === 'starter' || currentPlan === 'pro' || currentPlan === 'team';
  const allowsSlack = currentPlan === 'pro' || currentPlan === 'team';
  const allowsCrm = currentPlan === 'team';
  const allowsShareLink = currentPlan === 'pro' || currentPlan === 'team';

  // Check feature permission
  const isLocked =
    (selectedFormat === 'notion' && !allowsNotion) ||
    (selectedFormat === 'slack' && !allowsSlack) ||
    (selectedFormat === 'crm' && !allowsCrm) ||
    (selectedFormat === 'share_link' && !allowsShareLink);

  const getShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://actionscribe.ai';
    return `${origin}/shared/${meeting.id}?token=as_${meeting.id.slice(-6)}&view=readonly`;
  };

  const getPayload = () => {
    switch (selectedFormat) {
      case 'notion':
        return generateNotionMarkdown(meeting);
      case 'slack':
        return generateSlackMarkdown(meeting);
      case 'srt':
        return generateSrtSubtitles(meeting);
      case 'txt':
        return generateTimestampedTxt(meeting);
      case 'word':
        return generateWordHtml(meeting);
      case 'crm':
        return generateCrmJson(meeting);
      case 'share_link':
        return `ActionScribe Public Shared Meeting Link (Notta-parity):
URL: ${getShareLink()}

Share with clients or non-workspace participants to view the verified summary, action item checklist, and full timestamped transcript.`;
      case 'markdown':
      default:
        return generateNotionMarkdown(meeting);
    }
  };

  const handleCopy = () => {
    const content = selectedFormat === 'share_link' ? getShareLink() : getPayload();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const titleSlug = meeting.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const content = getPayload();

    switch (selectedFormat) {
      case 'srt':
        downloadFile(content, `${titleSlug}-subtitles.srt`, 'text/plain');
        break;
      case 'txt':
        downloadFile(content, `${titleSlug}-transcript.txt`, 'text/plain');
        break;
      case 'word':
        downloadFile(content, `${titleSlug}-recap.doc`, 'application/msword');
        break;
      case 'crm':
        downloadFile(content, `${titleSlug}-crm.json`, 'application/json');
        break;
      case 'share_link':
        navigator.clipboard.writeText(getShareLink());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'markdown':
      case 'notion':
      case 'slack':
      default:
        downloadFile(content, `${titleSlug}.md`, 'text/markdown');
        break;
    }
  };

  const formats = [
    { id: 'notion', label: 'Notion Page', sub: 'Synced blocks', lock: !allowsNotion },
    { id: 'slack', label: 'Slack Post', sub: 'Mentions & bullets', lock: !allowsSlack },
    { id: 'srt', label: 'SRT Subtitles', sub: 'Video & audio sync', lock: false },
    { id: 'txt', label: 'Text (.txt)', sub: 'Timestamped log', lock: false },
    { id: 'word', label: 'Word (.doc)', sub: 'Google Docs / Word', lock: false },
    { id: 'crm', label: 'CRM Payload', sub: 'HubSpot / SFDC', lock: !allowsCrm },
    { id: 'markdown', label: 'Markdown', sub: 'Universal .md', lock: false },
    { id: 'share_link', label: 'Share Link', sub: 'Public read-only', lock: !allowsShareLink },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                  Export & Synchronize Meeting
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  Notta & Otter Compatible
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Download subtitles, text transcripts, Word summaries, or copy direct workspace sync blocks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Format Selector Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {formats.map((f) => {
              const isSelected = selectedFormat === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 dark:bg-neutral-800 dark:border-indigo-500 dark:text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-neutral-800/70 dark:border-neutral-700/80 dark:text-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-neutral-100">{f.label}</span>
                    {f.lock && <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">{f.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Plan Lock Warning */}
          {isLocked && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Premium Feature:</strong>{' '}
                  {selectedFormat.replace('_', ' ').toUpperCase()} is enabled on Pro & Team plans. You can preview below!
                </span>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 text-neutral-950 font-bold text-[11px] whitespace-nowrap shadow-xs"
              >
                Upgrade Plan
              </button>
            </div>
          )}

          {/* Preview Box */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 pb-1">
              <span>Formatted Output Preview ({selectedFormat.toUpperCase()}):</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-neutral-500">
                {selectedFormat === 'crm' ? 'JSON' : selectedFormat === 'srt' ? 'SubRip Text' : selectedFormat === 'word' ? 'HTML Document' : 'Text/Markdown'}
              </span>
            </div>
            <pre className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs font-mono text-slate-800 dark:text-neutral-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {getPayload()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {selectedFormat !== 'share_link' && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{selectedFormat === 'share_link' ? 'Link Copied!' : 'Copied to Clipboard!'}</span>
                </>
              ) : (
                <>
                  {selectedFormat === 'share_link' ? <Link className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{selectedFormat === 'share_link' ? 'Copy Share Link' : 'Copy to Clipboard'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
};
