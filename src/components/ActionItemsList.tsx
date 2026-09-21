import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Tag, 
  Check, 
  Clock, 
  Flame 
} from 'lucide-react';
import { ActionItem } from '../types';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onToggleComplete: (id: string) => void;
  onAddItem: (item: Omit<ActionItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  onToggleComplete,
  onAddItem,
  onDeleteItem,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newCategory, setNewCategory] = useState('Next Steps');

  const total = actionItems.length;
  const completedCount = actionItems.filter((i) => i.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    onAddItem({
      task: newTask.trim(),
      assignee: newAssignee.trim() || 'Me',
      deadline: newDeadline,
      priority: newPriority,
      category: newCategory.trim() || 'General',
      completed: false,
    });

    setNewTask('');
    setNewAssignee('');
    setShowAddForm(false);
  };

  const formatDeadlineText = (deadlineStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(deadlineStr);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 3600 * 24));

      if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
      if (diffDays === 0) return { label: 'Due today', isToday: true };
      if (diffDays === 1) return { label: 'Due tomorrow', isSoon: true };
      return { label: `Due in ${diffDays}d`, isNormal: true };
    } catch {
      return { label: deadlineStr, isNormal: true };
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-2xs transition-colors">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Action Items & Assigned Deadlines
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
              {completedCount}/{total} Done ({percent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Track ownership, delivery deadlines, and priority commitments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="flex bg-slate-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filter === 'completed'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              Completed
            </button>
          </div>

          <button
            id="add-action-item-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-1.5 mb-4 overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-50 dark:bg-neutral-800/70 p-4 rounded-lg border border-slate-200 dark:border-neutral-700 mb-4 animate-in fade-in duration-150"
        >
          <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200 mb-2">New Follow-up Commitment</div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g., Deliver NetSuite product export by Friday afternoon..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1">Assignee</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah / Me"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-neutral-200"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1">Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-neutral-200"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-neutral-200"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Dev, Design, Review"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-neutral-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-sm"
              >
                Save Action Item
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-neutral-500 text-xs">
            No action items match this filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const deadlineInfo = formatDeadlineText(item.deadline);

            const priorityBadge =
              item.priority === 'high' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
                  <Flame className="w-3 h-3 text-rose-500 dark:text-rose-400" /> High
                </span>
              ) : item.priority === 'medium' ? (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                  Med
                </span>
              ) : (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
                  Low
                </span>
              );

            return (
              <div
                key={item.id}
                id={`action-item-${item.id}`}
                className={`group flex items-start sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                  item.completed
                    ? 'bg-slate-50/70 border-slate-200/80 opacity-65 dark:bg-neutral-900/60 dark:border-neutral-800'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 dark:bg-neutral-800/80 dark:hover:bg-neutral-800 dark:border-neutral-700/80 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleComplete(item.id)}
                    className="mt-0.5 sm:mt-0 flex-shrink-0 text-slate-400 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition"
                    title={item.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-neutral-500 group-hover:text-slate-500 dark:group-hover:text-neutral-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        item.completed
                          ? 'line-through text-slate-400 dark:text-neutral-400'
                          : 'font-medium text-slate-900 dark:text-neutral-100'
                      }`}
                    >
                      {item.task}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-neutral-400">
                      {/* Assignee */}
                      <span className="inline-flex items-center gap-1 text-slate-700 dark:text-neutral-300 font-medium">
                        <User className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                        {item.assignee}
                      </span>

                      <span className="text-slate-300 dark:text-neutral-600">•</span>

                      {/* Deadline */}
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          deadlineInfo.isOverdue
                            ? 'text-rose-600 dark:text-rose-400'
                            : deadlineInfo.isToday
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-neutral-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.deadline} ({deadlineInfo.label})
                      </span>

                      {/* Category */}
                      {item.category && (
                        <>
                          <span className="text-slate-300 dark:text-neutral-600">•</span>
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-neutral-400">
                            <Tag className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                            {item.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Priority & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {priorityBadge}

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 rounded transition"
                    title="Delete action item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
