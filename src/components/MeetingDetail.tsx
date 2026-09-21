import React, { useState } from 'react';
import { 
  FileText, 
  Mail, 
  BarChart3, 
  Award, 
  Share2, 
  Download, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Check, 
  Edit3, 
  Sparkles, 
  MessageSquare,
  Globe,
  Languages,
  Folder,
  Tag
} from 'lucide-react';
import { ActionItem, Decision, FollowUpEmail, MeetingRecord } from '../types';
import { ActionItemsList } from './ActionItemsList';
import { EmailComposer } from './EmailComposer';
import { CandidateScorecardView } from './CandidateScorecardView';
import { InsightsCard } from './InsightsCard';
import { MeetingAIChat } from './MeetingAIChat';
import { CustomExtractionTab } from './CustomExtractionTab';
import { generateNotionMarkdown } from '../utils/exportHelpers';

interface MeetingDetailProps {
  meeting: MeetingRecord;
  onUpdateMeeting: (updated: MeetingRecord) => void;
  onDeleteMeeting: (id: string) => void;
  onOpenExport: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'original', name: 'Original Language' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ko', name: 'Korean (한국어)' },
];

export const MeetingDetail: React.FC<MeetingDetailProps> = ({
  meeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'extract' | 'chat' | 'email' | 'scorecard' | 'insights'>('overview');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(meeting.title);
  const [copiedMd, setCopiedMd] = useState(false);
  const [newDecisionText, setNewDecisionText] = useState('');
  const [showAddDecision, setShowAddDecision] = useState(false);

  // Folder & Tag local management
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [folderInput, setFolderInput] = useState(meeting.folder || '');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Jump timestamp for audio player
  const [jumpTimestamp, setJumpTimestamp] = useState<string | null>(null);

  // Multi-Language Translation State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('original');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<{
    summary?: string;
    points?: string[];
    decisions?: string[];
    languageName?: string;
  } | null>(null);

  React.useEffect(() => {
    setTitleInput(meeting.title);
    setSelectedLanguage('original');
    setTranslatedData(null);
  }, [meeting.id, meeting.title]);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateMeeting({ ...meeting, title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleToggleActionItem = (itemId: string) => {
    const updatedActions = meeting.actionItems.map((a) =>
      a.id === itemId ? { ...a, completed: !a.completed } : a
    );
    onUpdateMeeting({ ...meeting, actionItems: updatedActions });
  };

  const handleAddActionItem = (itemData: Omit<ActionItem, 'id'>) => {
    const newItem: ActionItem = {
      ...itemData,
      id: `act-${Date.now()}`,
    };
    onUpdateMeeting({
      ...meeting,
      actionItems: [...meeting.actionItems, newItem],
    });
  };

  const handleDeleteActionItem = (itemId: string) => {
    const updatedActions = meeting.actionItems.filter((a) => a.id !== itemId);
    onUpdateMeeting({ ...meeting, actionItems: updatedActions });
  };

  const handleUpdateEmail = (updatedEmail: FollowUpEmail) => {
    onUpdateMeeting({ ...meeting, followUpEmail: updatedEmail });
  };

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionText.trim()) return;

    const newDec: Decision = {
      id: `dec-${Date.now()}`,
      text: newDecisionText.trim(),
      category: 'scope',
    };

    onUpdateMeeting({
      ...meeting,
      decisions: [...meeting.decisions, newDec],
    });
    setNewDecisionText('');
    setShowAddDecision(false);
  };

  const handleDeleteDecision = (decId: string) => {
    onUpdateMeeting({
      ...meeting,
      decisions: meeting.decisions.filter((d) => d.id !== decId),
    });
  };

  const handleCopyMarkdown = () => {
    const md = generateNotionMarkdown(meeting);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleLanguageChange = async (targetCode: string) => {
    setSelectedLanguage(targetCode);
    if (targetCode === 'original') {
      setTranslatedData(null);
      return;
    }

    const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetCode);
    const targetName = targetLangObj ? targetLangObj.name : targetCode;

    try {
      setIsTranslating(true);
      const res = await fetch('/api/translate-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingText: meeting.summary,
          discussionPoints: meeting.keyDiscussionPoints,
          decisions: meeting.decisions.map((d) => d.text),
          targetLanguage: targetName,
        }),
      });

      if (!res.ok) throw new Error('Failed to translate meeting');
      const data = await res.json();
      if (data.success) {
        setTranslatedData({
          summary: data.translatedSummary,
          points: data.translatedPoints,
          decisions: data.translatedDecisions,
          languageName: targetName,
        });
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const getTypeLabel = (type: MeetingRecord['type']) => {
    switch (type) {
      case 'client_call':
        return 'Client Call';
      case 'job_interview':
        return 'Interview';
      case 'team_sync':
        return 'Team Sync';
      default:
        return 'Meeting';
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Clean Meeting Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 transition-colors shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
              <span className="font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md text-[11px]">
                {getTypeLabel(meeting.type)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {meeting.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {meeting.durationMinutes}m
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {meeting.sentiment.timeSavedMinutes}m saved
              </span>
            </div>

            {/* Editable Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-1 text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
                    {meeting.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-300 p-1 rounded transition"
                    title="Rename meeting"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Attendees */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <Users className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              {meeting.attendees.map((att, i) => (
                <span
                  key={i}
                  className="text-xs text-slate-600 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md text-[11px]"
                >
                  {att}
                </span>
              ))}
            </div>

            {/* Folder & Tags Manager */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {/* Folder pill / editor */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 dark:text-neutral-500">Folder:</span>
                {isEditingFolder ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={folderInput}
                      onChange={(e) => setFolderInput(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="px-2 py-0.5 rounded text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 w-28"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        onUpdateMeeting({ ...meeting, folder: folderInput.trim() || undefined });
                        setIsEditingFolder(false);
                      }}
                      className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingFolder(false)}
                      className="px-1 py-0.5 text-slate-400 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setFolderInput(meeting.folder || '');
                      setIsEditingFolder(true);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-750 transition flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Folder className="w-3 h-3 text-indigo-500" />
                    <span>{meeting.folder || '+ Add Folder'}</span>
                  </button>
                )}
              </div>

              {/* Tag pills / editor */}
              <div className="flex flex-wrap items-center gap-1">
                {meeting.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium flex items-center gap-1"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => {
                        const updated = meeting.tags?.filter((_, i) => i !== idx);
                        onUpdateMeeting({ ...meeting, tags: updated?.length ? updated : undefined });
                      }}
                      className="text-indigo-400 hover:text-rose-500 ml-0.5 text-[11px]"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="tag name..."
                      className="px-2 py-0.5 rounded text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 w-20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          const currentTags = meeting.tags || [];
                          if (!currentTags.includes(tagInput.trim())) {
                            onUpdateMeeting({ ...meeting, tags: [...currentTags, tagInput.trim()] });
                          }
                          setTagInput('');
                          setIsAddingTag(false);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (tagInput.trim()) {
                          const currentTags = meeting.tags || [];
                          if (!currentTags.includes(tagInput.trim())) {
                            onUpdateMeeting({ ...meeting, tags: [...currentTags, tagInput.trim()] });
                          }
                          setTagInput('');
                        }
                        setIsAddingTag(false);
                      }}
                      className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px]"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Tag</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              id="copy-markdown-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 transition"
              title="Copy entire meeting as Markdown"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedMd ? 'Copied' : 'Markdown'}</span>
            </button>

            <button
              id="open-export-modal-btn"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this meeting?')) {
                  onDeleteMeeting(meeting.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 transition"
              title="Delete meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Modern Navigation Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-2.5 border-t border-slate-200/60 dark:border-neutral-800 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary & Actions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'overview'
                ? 'bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400'
            }`}>
              {meeting.actionItems.length}
            </span>
          </button>

          {/* Custom AI Extraction Prompts Tab */}
          <button
            id="tab-btn-extract"
            onClick={() => setActiveTab('extract')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
              activeTab === 'extract'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Extraction</span>
            {meeting.customExtractions && meeting.customExtractions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {meeting.customExtractions.length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Chat</span>
          </button>

          <button
            id="tab-btn-insights"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audio & Transcript</span>
          </button>

          <button
            id="tab-btn-email"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
              activeTab === 'email'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Follow-up Email</span>
          </button>

          {meeting.type === 'job_interview' && meeting.candidateScorecard && (
            <button
              id="tab-btn-scorecard"
              onClick={() => setActiveTab('scorecard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
                activeTab === 'scorecard'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold border border-indigo-200/70 dark:border-indigo-900/50'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scorecard ({meeting.candidateScorecard.overallScore}/10)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Executive Summary Card with Translation */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-neutral-100">
                  Executive Summary
                </h3>
              </div>

              {/* Multi-Language Selector */}
              <div className="flex items-center gap-2 text-xs">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isTranslating}
                  className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                {isTranslating && (
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                    Translating...
                  </span>
                )}
              </div>
            </div>

            {/* Summary Text */}
            <div>
              {translatedData && (
                <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                  <Globe className="w-3 h-3" />
                  <span>Translated to {translatedData.languageName}</span>
                </div>
              )}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
                {translatedData?.summary || meeting.summary}
              </p>
            </div>

            {/* Key Discussion Points */}
            {meeting.keyDiscussionPoints.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Key Discussion Points
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-neutral-300">
                  {(translatedData?.points || meeting.keyDiscussionPoints).map((point, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Decisions Made Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Decisions Made ({meeting.decisions.length})
              </h3>
              <button
                onClick={() => setShowAddDecision(!showAddDecision)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Decision
              </button>
            </div>

            {showAddDecision && (
              <form onSubmit={handleAddDecision} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Record a specific decision..."
                  value={newDecisionText}
                  onChange={(e) => setNewDecisionText(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDecision(false)}
                  className="px-2 py-2 text-slate-500 hover:text-slate-700 dark:text-neutral-400"
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="space-y-2">
              {meeting.decisions.map((dec, idx) => (
                <div
                  key={dec.id}
                  className="group flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-750 transition"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 mt-0.5">
                      {dec.category}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-neutral-100 leading-snug">
                        {translatedData?.decisions?.[idx] || dec.text}
                      </p>
                      {dec.context && (
                        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5 italic">
                          {dec.context}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDecision(dec.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items List */}
          <ActionItemsList
            actionItems={meeting.actionItems}
            onToggleComplete={handleToggleActionItem}
            onAddItem={handleAddActionItem}
            onDeleteItem={handleDeleteActionItem}
          />
        </div>
      )}

      {/* AI Meeting Chat Assistant */}
      {activeTab === 'chat' && (
        <MeetingAIChat
          meeting={meeting}
          onJumpToTimestamp={(time) => {
            setJumpTimestamp(time);
            setActiveTab('insights');
          }}
        />
      )}

      {/* Audio & Transcript Sync */}
      {activeTab === 'insights' && (
        <InsightsCard
          meeting={meeting}
          onUpdateMeeting={onUpdateMeeting}
          jumpTimestamp={jumpTimestamp}
        />
      )}

      {/* Follow-up Email */}
      {activeTab === 'email' && (
        <EmailComposer meeting={meeting} onUpdateEmail={handleUpdateEmail} />
      )}

      {/* Custom AI Extraction Prompts Tab */}
      {activeTab === 'extract' && (
        <CustomExtractionTab
          meeting={meeting}
          onUpdateMeeting={onUpdateMeeting}
        />
      )}

      {/* Candidate Scorecard */}
      {activeTab === 'scorecard' && meeting.candidateScorecard && (
        <CandidateScorecardView scorecard={meeting.candidateScorecard} />
      )}
    </div>
  );
};
