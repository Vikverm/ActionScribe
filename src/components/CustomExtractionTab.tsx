import React, { useState } from 'react';
import { MeetingRecord, CustomExtraction } from '../types';
import Markdown from 'react-markdown';
import {
  Sparkles,
  SearchCode,
  Copy,
  Check,
  BookmarkPlus,
  Trash2,
  Send,
  Loader2,
  DollarSign,
  AlertTriangle,
  CheckSquare,
  Compass,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CustomExtractionTabProps {
  meeting: MeetingRecord;
  onUpdateMeeting: (updated: MeetingRecord) => void;
}

const PRESET_PROMPTS = [
  {
    id: 'budget',
    icon: DollarSign,
    label: 'Financial & Budget Extraction',
    color: 'emerald',
    prompt:
      'Extract all pricing, contract values, budget allocations, hourly rates, and payment milestones discussed in this meeting into a structured financial table with line items, figures, and responsible parties.',
  },
  {
    id: 'risks',
    icon: AlertTriangle,
    label: 'Client Objections & Risk Factors',
    color: 'amber',
    prompt:
      'Identify and extract all client hesitations, scope creep warnings, technical risks, competitor mentions, and delivery objections raised during this call, along with any proposed mitigations.',
  },
  {
    id: 'jira',
    icon: CheckSquare,
    label: 'Jira User Stories Backlog',
    color: 'blue',
    prompt:
      'Transform all technical tasks, architecture changes, and bug fixes into developer-ready Jira user stories formatted as "As a [user], I want to [action] so that [benefit]" including Acceptance Criteria and Priority estimation.',
  },
  {
    id: 'swot',
    icon: Compass,
    label: 'Strategic SWOT Analysis',
    color: 'purple',
    prompt:
      'Perform an executive SWOT matrix (Strengths, Weaknesses, Opportunities, Threats) evaluating the project, partnership, or client status based strictly on the discussions in this call.',
  },
  {
    id: 'unresolved',
    icon: HelpCircle,
    label: 'Unresolved Questions',
    color: 'rose',
    prompt:
      'List all open questions, unanswered technical inquiries, and missing requirements that were flagged during the conversation as needing follow-up.',
  },
];

export const CustomExtractionTab: React.FC<CustomExtractionTabProps> = ({
  meeting,
  onUpdateMeeting,
}) => {
  const [promptText, setPromptText] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [lastExecutedPrompt, setLastExecutedPrompt] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setActivePreset(preset.id);
    setPromptText(preset.prompt);
  };

  const handleExecuteExtraction = async () => {
    if (!promptText.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/custom-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: meeting.title,
          transcript: meeting.transcript,
          prompt: promptText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to extract data`);
      }

      const data = await response.json();
      setCurrentResult(data.result);
      setLastExecutedPrompt(promptText.trim());
    } catch (err: any) {
      console.error('Custom extraction error:', err);
      setError(err.message || 'Could not complete custom extraction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToMeeting = () => {
    if (!currentResult) return;

    const newExtraction: CustomExtraction = {
      id: `ext-${Date.now()}`,
      prompt: lastExecutedPrompt || promptText,
      result: currentResult,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const existing = meeting.customExtractions || [];
    onUpdateMeeting({
      ...meeting,
      customExtractions: [newExtraction, ...existing],
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDeleteSaved = (id: string) => {
    const existing = meeting.customExtractions || [];
    onUpdateMeeting({
      ...meeting,
      customExtractions: existing.filter((e) => e.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-neutral-900 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-sm">
            Custom AI Extraction Rules
          </h3>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            Gemini Flash
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          Apply specialized prompt rules to extract customized intelligence from this meeting's transcript—such as financial numbers, client objections, Jira tickets, or risk registers.
        </p>
      </div>

      {/* Preset Rules Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
          Quick Extraction Templates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_PROMPTS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl text-left border transition flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 mt-0.5 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                    {preset.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                    {preset.prompt}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Rule Textarea & Run Control */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
            <SearchCode className="w-3.5 h-3.5 text-indigo-500" />
            <span>Extraction Prompt Rule</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Natural language rule executed over {meeting.transcript.length} speaker turns
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              setActivePreset(null);
            }}
            placeholder="e.g., Extract all budget numbers into a financial table with deliverables, or list all objections raised by Sarah..."
            className="w-full bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 text-xs text-slate-800 dark:text-neutral-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPromptText('')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-neutral-300"
            >
              Clear
            </button>
          </div>

          <button
            type="button"
            id="run-custom-extraction-btn"
            onClick={handleExecuteExtraction}
            disabled={isLoading || !promptText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Extraction</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* Extraction Result Card */}
      {currentResult && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Extraction Output
              </span>
              <h4 className="text-xs font-medium text-slate-600 dark:text-neutral-400 truncate max-w-md">
                Prompt: "{lastExecutedPrompt}"
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="copy-extraction-result-btn"
                onClick={handleCopyResult}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                id="save-extraction-to-meeting-btn"
                onClick={handleSaveToMeeting}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved to Meeting!' : 'Save to Record'}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-neutral-200 leading-relaxed bg-slate-50/60 dark:bg-neutral-950/50 p-4 rounded-xl border border-slate-200/60 dark:border-neutral-800/80 overflow-x-auto">
            <Markdown>{currentResult}</Markdown>
          </div>
        </div>
      )}

      {/* Saved Extractions History */}
      {meeting.customExtractions && meeting.customExtractions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Saved Meeting Extractions ({meeting.customExtractions.length})
            </h4>
          </div>

          <div className="space-y-3">
            {meeting.customExtractions.map((extraction) => (
              <div
                key={extraction.id}
                className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {extraction.prompt}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Extracted at {extraction.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(extraction.result);
                        alert('Copied saved extraction to clipboard!');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(extraction.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete saved extraction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-neutral-950/60 rounded-lg border border-slate-100 dark:border-neutral-800/80 text-xs text-slate-800 dark:text-neutral-200 prose prose-xs dark:prose-invert max-w-none overflow-x-auto">
                  <Markdown>{extraction.result}</Markdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
