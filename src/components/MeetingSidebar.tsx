import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Crown,
  Briefcase,
  Users,
  Layers,
  Sparkles,
  X,
  Folder,
  FolderPlus,
  Tag,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Globe,
  Plus,
  Trash2
} from 'lucide-react';
import { MeetingRecord, MeetingType, UserUsageState, CalendarEvent } from '../types';
import { PLANS } from '../data/sampleMeetings';
import { AddScheduleMeetingModal } from './AddScheduleMeetingModal';
import { getUserCalendarEvents, saveUserCalendarEvents } from '../utils/meetingStorage';

interface MeetingSidebarProps {
  meetings: MeetingRecord[];
  activeMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onOpenNewModal: () => void;
  onOpenPricing: () => void;
  usageState: UserUsageState;
  onJoinAndScribe?: (event: CalendarEvent) => void;
  userId?: string | null;
}

export const MeetingSidebar: React.FC<MeetingSidebarProps> = ({
  meetings,
  activeMeetingId,
  onSelectMeeting,
  onOpenNewModal,
  onOpenPricing,
  usageState,
  onJoinAndScribe,
  userId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MeetingType | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showCalendarWidget, setShowCalendarWidget] = useState<boolean>(false);
  const [isCalendarSynced, setIsCalendarSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    return getUserCalendarEvents(userId);
  });

  // Re-sync calendar events if userId changes
  React.useEffect(() => {
    setCalendarEvents(getUserCalendarEvents(userId));
  }, [userId]);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const currentPlanConfig = PLANS[usageState.currentPlan];
  const isTeam = usageState.currentPlan === 'team';

  // Extract all distinct folders and tags
  const allFolders = useMemo(() => {
    const list = Array.from(
      new Set([...meetings.map((m) => m.folder).filter(Boolean), ...customFolders])
    ) as string[];
    return list;
  }, [meetings, customFolders]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(meetings.flatMap((m) => m.tags || []).filter(Boolean))
    );
  }, [meetings]);

  const saveCalendarEvents = (events: CalendarEvent[]) => {
    setCalendarEvents(events);
    saveUserCalendarEvents(userId, events);
  };

  const handleAddScheduleEvent = (newEvent: CalendarEvent) => {
    const updated = [newEvent, ...calendarEvents];
    saveCalendarEvents(updated);
    setShowCalendarWidget(true);
  };

  const handleDeleteScheduleEvent = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = calendarEvents.filter((ev) => ev.id !== eventId);
    saveCalendarEvents(updated);
  };

  const handleAddFolder = () => {
    if (newFolderName.trim() && !allFolders.includes(newFolderName.trim())) {
      setCustomFolders([...customFolders, newFolderName.trim()]);
      setSelectedFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleSyncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsCalendarSynced(true);
      setTimeout(() => setIsCalendarSynced(false), 3000);
    }, 800);
  };

  // Deep Filter meetings (Folder, Tag, Type, Search query)
  const filteredMeetings = useMemo(() => {
    return meetings
      .map((m) => {
        // Folder filter
        if (selectedFolder !== 'all' && m.folder !== selectedFolder) return null;

        // Tag filter
        if (selectedTag !== 'all' && !(m.tags && m.tags.includes(selectedTag))) return null;

        // Type filter
        if (filterType !== 'all' && m.type !== filterType) return null;

        // Search filter
        if (!searchQuery.trim()) return { meeting: m, matchReasons: [] };

        const q = searchQuery.toLowerCase();
        const matchReasons: string[] = [];

        if (m.title.toLowerCase().includes(q)) matchReasons.push('Title');
        if (m.attendees.some((a) => a.toLowerCase().includes(q))) matchReasons.push('Attendee');
        if (m.summary.toLowerCase().includes(q)) matchReasons.push('Summary');
        if (m.folder && m.folder.toLowerCase().includes(q)) matchReasons.push('Folder');
        if (m.tags && m.tags.some((t) => t.toLowerCase().includes(q))) matchReasons.push('Tag');

        const transcriptMatches = m.transcript.filter((t) => t.text.toLowerCase().includes(q)).length;
        if (transcriptMatches > 0) {
          matchReasons.push(`${transcriptMatches} spoken ${transcriptMatches === 1 ? 'quote' : 'quotes'}`);
        }

        const actionMatches = m.actionItems.filter((a) => a.task.toLowerCase().includes(q)).length;
        if (actionMatches > 0) {
          matchReasons.push(`${actionMatches} action ${actionMatches === 1 ? 'item' : 'items'}`);
        }

        const decisionMatches = m.decisions.filter((d) => d.text.toLowerCase().includes(q)).length;
        if (decisionMatches > 0) {
          matchReasons.push(`${decisionMatches} ${decisionMatches === 1 ? 'decision' : 'decisions'}`);
        }

        if (matchReasons.length > 0) {
          return { meeting: m, matchReasons };
        }
        return null;
      })
      .filter(Boolean) as { meeting: MeetingRecord; matchReasons: string[] }[];
  }, [meetings, selectedFolder, selectedTag, filterType, searchQuery]);

  const getTypeLabel = (type: MeetingType) => {
    switch (type) {
      case 'client_call':
        return 'Client';
      case 'job_interview':
        return 'Interview';
      case 'team_sync':
        return 'Team';
      default:
        return 'General';
    }
  };

  return (
    <aside className="w-full lg:w-80 xl:w-88 flex-shrink-0 flex flex-col bg-white dark:bg-neutral-900 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-neutral-800 lg:min-h-[calc(100vh-3.5rem)] transition-colors">
      {/* Search & Streamlined Filters */}
      <div className="p-3 border-b border-slate-200/80 dark:border-neutral-800 space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search meetings, notes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Meeting Type Segmented Control */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-neutral-800/80 rounded-lg text-center text-xs font-medium">
          {(['all', 'client_call', 'job_interview', 'team_sync'] as const).map((type) => {
            const isSelected = filterType === type;
            const label = type === 'all' ? 'All' : type === 'client_call' ? 'Clients' : type === 'job_interview' ? 'Interviews' : 'Team';
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-1 rounded-md transition text-[11px] truncate ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Compact Folder & Tag Bar */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1 shrink-0">
              <Folder className="w-3 h-3 text-indigo-500" />
            </span>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-slate-700 dark:text-neutral-300 focus:outline-none cursor-pointer truncate max-w-[130px]"
            >
              <option value="all">All Folders ({meetings.length})</option>
              {allFolders.map((f) => (
                <option key={f} value={f}>
                  📁 {f} ({meetings.filter((m) => m.folder === f).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-[10px] text-slate-500 dark:text-neutral-400 focus:outline-none cursor-pointer truncate max-w-[85px]"
              >
                <option value="all"># All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title="Add new folder"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inline new folder input */}
        {showNewFolderInput && (
          <div className="flex items-center gap-1 pt-1 animate-in fade-in duration-100">
            <input
              type="text"
              placeholder="New folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
              className="flex-1 bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-neutral-200 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleAddFolder}
              className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-medium hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Upcoming Calendar Bar */}
      <div className="border-b border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/40 px-3 py-2">
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setShowCalendarWidget(!showCalendarWidget)}
            className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-[11px]"
          >
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span>Today's Schedule ({calendarEvents.length})</span>
            {showCalendarWidget ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              id="add-schedule-meeting-btn"
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
              title="Add meeting to today's schedule"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>

            <button
              id="sync-calendar-btn"
              onClick={handleSyncCalendar}
              disabled={isSyncing}
              className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition"
              title="Sync with Calendar"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isCalendarSynced ? 'Synced ✓' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {showCalendarWidget && (
          <div className="space-y-1.5 pt-2 animate-in fade-in duration-100">
            {calendarEvents.length === 0 ? (
              <div className="p-3 text-center rounded-lg bg-white dark:bg-neutral-900 border border-dashed border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 dark:text-neutral-400">
                <p>No meetings scheduled for today.</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => setIsAddScheduleModalOpen(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    + Schedule Call
                  </button>
                </div>
              </div>
            ) : (
              <>
                {calendarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex flex-col gap-1 shadow-2xs hover:border-slate-300 dark:hover:border-neutral-700 transition"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[11px] font-semibold text-slate-800 dark:text-neutral-200 truncate">
                          {event.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-neutral-400">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{event.time}</span>
                          <span>•</span>
                          <span className="capitalize text-indigo-600 dark:text-indigo-400 font-medium">
                            {event.platform.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Remove Event Button */}
                      <button
                        onClick={(e) => handleDeleteScheduleEvent(event.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                        title="Remove meeting from schedule"
                        aria-label="Remove meeting"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                        {event.attendees.join(', ')}
                      </span>

                      <button
                        id={`calendar-join-btn-${event.id}`}
                        onClick={() => onJoinAndScribe && onJoinAndScribe(event)}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-[10px] flex items-center gap-1 whitespace-nowrap shadow-2xs transition"
                      >
                        <Video className="w-2.5 h-2.5" />
                        <span>Join & Scribe</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  id="schedule-add-bottom-btn"
                  onClick={() => setIsAddScheduleModalOpen(true)}
                  className="w-full py-1.5 px-2 rounded-lg border border-dashed border-slate-300 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[11px] font-medium text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Schedule Another Meeting</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Meeting Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {meetings.length === 0 ? (
          <div className="text-center py-10 px-3 text-xs text-slate-500 dark:text-neutral-400 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 dark:bg-neutral-800/80 flex items-center justify-center text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-neutral-300">No meetings yet</p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 leading-relaxed">
                Upload audio or schedule a call to create your first scribe.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                id="sidebar-empty-upload-btn"
                onClick={onOpenNewModal}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Audio</span>
              </button>
            </div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-slate-500 dark:text-neutral-400 space-y-2">
            <p>No meetings match your filter.</p>
            <button
              onClick={() => {
                setSelectedFolder('all');
                setSelectedTag('all');
                setFilterType('all');
                setSearchQuery('');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredMeetings.map(({ meeting: m, matchReasons }) => {
            const isActive = m.id === activeMeetingId;
            const completedCount = m.actionItems.filter((a) => a.completed).length;
            const totalActionItems = m.actionItems.length;

            return (
              <button
                key={m.id}
                type="button"
                id={`sidebar-meeting-item-${m.id}`}
                onClick={() => onSelectMeeting(m.id)}
                className={`w-full p-2.5 rounded-lg text-left transition-all relative ${
                  isActive
                    ? 'bg-indigo-50/90 dark:bg-neutral-800 border border-indigo-200/80 dark:border-neutral-700 shadow-2xs'
                    : 'bg-transparent hover:bg-slate-50 dark:hover:bg-neutral-850 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`text-xs leading-snug line-clamp-2 ${
                      isActive
                        ? 'text-indigo-950 dark:text-white font-semibold'
                        : 'text-slate-800 dark:text-neutral-200 font-medium'
                    }`}
                  >
                    {m.title}
                  </h4>

                  {m.isPublicShared && (
                    <span
                      title="Public Guest Link Active"
                      className="text-emerald-600 dark:text-emerald-400 shrink-0"
                    >
                      <Globe className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Folder & Tag Badges */}
                {(m.folder || (m.tags && m.tags.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {m.folder && (
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                        📁 {m.folder}
                      </span>
                    )}
                    {m.tags &&
                      m.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

                {/* Match Badges if deep search active */}
                {matchReasons.length > 0 && searchQuery && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {matchReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                      >
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                      {getTypeLabel(m.type)}
                    </span>
                    <span>{m.date}</span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-neutral-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {completedCount}/{totalActionItems}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Plan Usage Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
          <Crown className={`w-3.5 h-3.5 ${usageState.currentPlan === 'free' ? 'text-slate-400' : 'text-amber-500'}`} />
          <span className="font-semibold text-slate-800 dark:text-neutral-200">{currentPlanConfig.name}</span>
          <span className="text-slate-300 dark:text-neutral-700">•</span>
          <span className="text-[11px]">
            {isTeam ? 'Unlimited' : `${usageState.meetingsThisMonth}/${currentPlanConfig.monthlyLimit} used`}
          </span>
        </div>
        <button
          onClick={onOpenPricing}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
        >
          {usageState.currentPlan === 'free' ? 'Upgrade' : 'Manage'}
        </button>
      </div>

      {/* Add Schedule Meeting Modal */}
      <AddScheduleMeetingModal
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        onAddEvent={handleAddScheduleEvent}
      />
    </aside>
  );
};

