import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Calendar, 
  User, 
  ExternalLink, 
  Trash2, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { ActionItem, MeetingRecord } from '../types';

interface ActionItemsHubProps {
  meetings: MeetingRecord[];
  onUpdateMeeting: (updatedMeeting: MeetingRecord) => void;
  onNavigateToMeeting: (meetingId: string) => void;
}

interface EnrichedTask extends ActionItem {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingType: MeetingRecord['type'];
}

export const ActionItemsHub: React.FC<ActionItemsHubProps> = ({
  meetings,
  onUpdateMeeting,
  onNavigateToMeeting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTaskMeetingId, setNewTaskMeetingId] = useState<string>(meetings[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newTaskDeadline, setNewTaskDeadline] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );

  // Flatten all action items across all meetings
  const allTasks: EnrichedTask[] = useMemo(() => {
    const list: EnrichedTask[] = [];
    meetings.forEach((m) => {
      m.actionItems.forEach((item) => {
        list.push({
          ...item,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          meetingType: m.type,
        });
      });
    });
    return list;
  }, [meetings]);

  // Unique assignees and categories
  const assignees = useMemo(() => {
    const set = new Set<string>();
    allTasks.forEach((t) => {
      if (t.assignee && t.assignee.trim()) {
        set.add(t.assignee.trim());
      }
    });
    return Array.from(set).sort();
  }, [allTasks]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allTasks.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [allTasks]);

  // Check if overdue
  const isOverdue = (deadlineStr: string, completed: boolean) => {
    if (completed) return false;
    const now = new Date().toISOString().split('T')[0];
    return deadlineStr < now;
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTask = task.task.toLowerCase().includes(q);
        const matchAssignee = task.assignee.toLowerCase().includes(q);
        const matchCategory = task.category.toLowerCase().includes(q);
        const matchMeeting = task.meetingTitle.toLowerCase().includes(q);
        if (!matchTask && !matchAssignee && !matchCategory && !matchMeeting) return false;
      }

      // Status filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'overdue' && !isOverdue(task.deadline, task.completed)) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

      return true;
    });
  }, [allTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, categoryFilter]);

  // Metrics
  const totalCount = allTasks.length;
  const completedCount = allTasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityPending = allTasks.filter((t) => !t.completed && t.priority === 'high').length;
  const overdueCount = allTasks.filter((t) => isOverdue(t.deadline, t.completed)).length;

  // Toggle completion
  const handleToggleTask = (task: EnrichedTask) => {
    const parentMeeting = meetings.find((m) => m.id === task.meetingId);
    if (!parentMeeting) return;

    const updatedActions = parentMeeting.actionItems.map((a) =>
      a.id === task.id ? { ...a, completed: !a.completed } : a
    );

    onUpdateMeeting({
      ...parentMeeting,
      actionItems: updatedActions,
    });
  };

  // Delete task
  const handleDeleteTask = (task: EnrichedTask) => {
    const parentMeeting = meetings.find((m) => m.id === task.meetingId);
    if (!parentMeeting) return;

    const updatedActions = parentMeeting.actionItems.filter((a) => a.id !== task.id);
    onUpdateMeeting({
      ...parentMeeting,
      actionItems: updatedActions,
    });
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !newTaskMeetingId) return;

    const parentMeeting = meetings.find((m) => m.id === newTaskMeetingId);
    if (!parentMeeting) return;

    const newItem: ActionItem = {
      id: `act-${Date.now()}`,
      task: newTaskText.trim(),
      assignee: newTaskAssignee.trim() || 'Unassigned',
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      category: newTaskCategory.trim() || 'General',
      completed: false,
    };

    onUpdateMeeting({
      ...parentMeeting,
      actionItems: [newItem, ...parentMeeting.actionItems],
    });

    setNewTaskText('');
    setNewTaskAssignee('');
    setIsAddModalOpen(false);
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    const lines = [
      `# Action Items & Commitments (${new Date().toLocaleDateString()})`,
      '',
      ...filteredTasks.map((t) => {
        const statusBox = t.completed ? '[x]' : '[ ]';
        const priorityTag = t.priority === 'high' ? '🔥 HIGH' : t.priority === 'medium' ? '⚡ MED' : 'ℹ️ LOW';
        return `- ${statusBox} **${t.task}** | Assignee: @${t.assignee} | Due: ${t.deadline} | Priority: ${priorityTag} | Source: *${t.meetingTitle}*`;
      }),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = ['Task', 'Assignee', 'Deadline', 'Priority', 'Category', 'Status', 'Source Meeting', 'Meeting Date'];
    const rows = filteredTasks.map((t) => [
      `"${t.task.replace(/"/g, '""')}"`,
      `"${t.assignee.replace(/"/g, '""')}"`,
      `"${t.deadline}"`,
      `"${t.priority}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.completed ? 'Completed' : 'Pending'}"`,
      `"${t.meetingTitle.replace(/"/g, '""')}"`,
      `"${t.meetingDate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `action_items_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Banner & Stats Cards */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight font-display">
                Action Items & Commitments Hub
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Consolidated task tracker synchronized across all your meeting scribes, sprint reviews & interviews.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 transition"
              title="Copy filtered tasks as Markdown list"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMarkdown ? 'Copied Markdown' : 'Copy List'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 transition"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Total Tasks</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-1">{totalCount}</div>
            <span className="text-[10px] text-slate-400">Across {meetings.length} meetings</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Pending</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{pendingCount}</div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">{highPriorityPending} high priority</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Completed</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{completedCount}</div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% completion
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">Overdue Tasks</span>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">{overdueCount}</div>
            <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Require immediate follow-up</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks, assignees, categories or meeting titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
              }`}
            >
              All ({allTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
            {overdueCount > 0 && (
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/50'
                }`}
              >
                Overdue ({overdueCount})
              </button>
            )}
          </div>
        </div>

        {/* Secondary Select Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Assignee */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Assignees ({assignees.length})</option>
            {assignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Category */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {(priorityFilter !== 'all' || assigneeFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setAssigneeFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">No Action Items Found</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
              {searchQuery || priorityFilter !== 'all' || assigneeFilter !== 'all'
                ? 'Try adjusting your search terms or filters to see more tasks.'
                : 'Upload or record a meeting to automatically extract action items, or add a custom task.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action Item</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-neutral-800">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.completed);
              return (
                <div
                  key={`${task.meetingId}-${task.id}`}
                  className={`group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 ${
                    task.completed ? 'opacity-65 bg-slate-50/40 dark:bg-neutral-900/40' : ''
                  }`}
                >
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`mt-0.5 flex-shrink-0 transition rounded-md ${
                        task.completed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200'
                      }`}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950/60" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-neutral-500'
                              : 'text-slate-900 dark:text-neutral-100'
                          }`}
                        >
                          {task.task}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category */}
                        {task.category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {/* Source Meeting Pill + Assignee & Date */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-neutral-400">
                        {/* Assignee */}
                        <div className="inline-flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-neutral-300">{task.assignee}</span>
                        </div>

                        <span>•</span>

                        {/* Deadline */}
                        <div
                          className={`inline-flex items-center gap-1 ${
                            overdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-slate-500 dark:text-neutral-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Due: {task.deadline}</span>
                          {overdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
                        </div>

                        <span>•</span>

                        {/* Meeting Link */}
                        <button
                          onClick={() => onNavigateToMeeting(task.meetingId)}
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-[11px]"
                          title="Open meeting scribe"
                        >
                          <span>{task.meetingTitle}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Done'}
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100">
                Create Action Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Target Meeting *
                </label>
                <select
                  value={newTaskMeetingId}
                  onChange={(e) => setNewTaskMeetingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Task Description *
                </label>
                <textarea
                  rows={2}
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="e.g., Deliver updated API schema to mobile team..."
                  className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="e.g., Sarah Chen"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="high">🔥 High</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">ℹ️ Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    placeholder="e.g., Engineering, Scope"
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
