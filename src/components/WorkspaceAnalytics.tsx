import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  DollarSign, 
  Users, 
  Calendar, 
  Smile, 
  Award, 
  CheckSquare, 
  PieChart, 
  TrendingUp, 
  Search, 
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { MeetingRecord, MeetingType, UserUsageState } from '../types';

interface WorkspaceAnalyticsProps {
  meetings: MeetingRecord[];
  usageState: UserUsageState;
  onNavigateToMeeting: (meetingId: string) => void;
  onOpenPricing: () => void;
}

export const WorkspaceAnalytics: React.FC<WorkspaceAnalyticsProps> = ({
  meetings,
  usageState,
  onNavigateToMeeting,
  onOpenPricing,
}) => {
  const [hourlyRate, setHourlyRate] = useState(80);
  const [decisionSearch, setDecisionSearch] = useState('');
  const [decisionCategoryFilter, setDecisionCategoryFilter] = useState('all');

  // Aggregations
  const totalMeetings = meetings.length;
  const totalMinutesRecorded = useMemo(
    () => meetings.reduce((acc, m) => acc + (m.durationMinutes || 0), 0),
    [meetings]
  );
  const totalMinutesSaved = useMemo(
    () => meetings.reduce((acc, m) => acc + (m.sentiment.timeSavedMinutes || 45), 0),
    [meetings]
  );

  const hoursSaved = (totalMinutesSaved / 60).toFixed(1);
  const dollarRoi = Math.round((totalMinutesSaved / 60) * hourlyRate);

  // Action Items Completion
  const totalActionItems = useMemo(
    () => meetings.reduce((acc, m) => acc + m.actionItems.length, 0),
    [meetings]
  );
  const completedActionItems = useMemo(
    () => meetings.reduce((acc, m) => acc + m.actionItems.filter((a) => a.completed).length, 0),
    [meetings]
  );
  const actionCompletionRate = totalActionItems > 0 ? Math.round((completedActionItems / totalActionItems) * 100) : 0;

  // Breakdown by Type
  const typeCounts = useMemo(() => {
    const counts: Record<MeetingType, number> = {
      client_call: 0,
      team_sync: 0,
      job_interview: 0,
      general: 0,
    };
    meetings.forEach((m) => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return counts;
  }, [meetings]);

  // Sentiment Breakdown
  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, cautious: 0, decisive: 0 };
    meetings.forEach((m) => {
      const s = m.sentiment.overall || 'positive';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [meetings]);

  // Average Talk Ratio
  const averageTalkRatio = useMemo(() => {
    let hostTotal = 0;
    let guestTotal = 0;
    let count = 0;
    meetings.forEach((m) => {
      if (m.sentiment.talkRatio) {
        hostTotal += m.sentiment.talkRatio.host;
        guestTotal += m.sentiment.talkRatio.guest;
        count++;
      }
    });
    if (count === 0) return { host: 50, guest: 50 };
    return {
      host: Math.round(hostTotal / count),
      guest: Math.round(guestTotal / count),
    };
  }, [meetings]);

  // Duration buckets
  const durationBuckets = useMemo(() => {
    const buckets = { under15: 0, under30: 0, under60: 0, over60: 0 };
    meetings.forEach((m) => {
      if (m.durationMinutes <= 15) buckets.under15++;
      else if (m.durationMinutes <= 30) buckets.under30++;
      else if (m.durationMinutes <= 60) buckets.under60++;
      else buckets.over60++;
    });
    return buckets;
  }, [meetings]);

  // Top Collaborators
  const collaborators = useMemo(() => {
    const map = new Map<string, { count: number; lastDate: string; meetings: { id: string; title: string }[] }>();
    meetings.forEach((m) => {
      m.attendees.forEach((att) => {
        const cleaned = att.trim();
        if (cleaned && cleaned.toLowerCase() !== 'you' && cleaned.toLowerCase() !== 'host') {
          const prev = map.get(cleaned) || { count: 0, lastDate: m.date, meetings: [] };
          prev.count += 1;
          if (m.date > prev.lastDate) prev.lastDate = m.date;
          prev.meetings.push({ id: m.id, title: m.title });
          map.set(cleaned, prev);
        }
      });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [meetings]);

  // Consolidated Decisions
  const allDecisions = useMemo(() => {
    const list: {
      id: string;
      text: string;
      category: string;
      context?: string;
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
    }[] = [];

    meetings.forEach((m) => {
      m.decisions.forEach((d) => {
        list.push({
          id: d.id,
          text: d.text,
          category: d.category,
          context: d.context,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
        });
      });
    });
    return list;
  }, [meetings]);

  // Decision categories
  const decisionCategories = useMemo(() => {
    const set = new Set<string>();
    allDecisions.forEach((d) => set.add(d.category));
    return Array.from(set);
  }, [allDecisions]);

  const filteredDecisions = useMemo(() => {
    return allDecisions.filter((d) => {
      if (decisionCategoryFilter !== 'all' && d.category !== decisionCategoryFilter) return false;
      if (decisionSearch.trim()) {
        const q = decisionSearch.toLowerCase();
        return (
          d.text.toLowerCase().includes(q) ||
          d.meetingTitle.toLowerCase().includes(q) ||
          (d.context && d.context.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allDecisions, decisionSearch, decisionCategoryFilter]);

  return (
    <div className="w-full space-y-5">
      {/* Top Banner & ROI Simulator */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight font-display">
                Meeting Intelligence & Executive Analytics
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              Data-driven insights across meeting volume, audio hours, team talk balance & calculated productivity ROI.
            </p>
          </div>

          {/* Hourly Rate Customizer for ROI */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-neutral-700 text-xs">
            <span className="text-slate-500 dark:text-neutral-400 font-medium">Hourly Value:</span>
            <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-neutral-200">
              <span>$</span>
              <input
                type="number"
                min="20"
                max="500"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value) || 80)}
                className="w-12 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded px-1.5 py-0.5 text-center text-xs font-bold"
              />
              <span className="text-slate-400 font-normal">/hr</span>
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Total Scribes</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
              {totalMeetings}
            </div>
            <span className="text-[10px] text-slate-400">Active records</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-750">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Audio Transcribed</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
              {(totalMinutesRecorded / 60).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </div>
            <span className="text-[10px] text-slate-400">{totalMinutesRecorded} min dialogue</span>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">Time Saved</span>
            <div className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
              {hoursSaved} <span className="text-xs font-normal">hrs</span>
            </div>
            <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">From automated summaries</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Calculated Value ROI</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              ${dollarRoi.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">At ${hourlyRate}/hr rate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Task Completion</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {actionCompletionRate}%
            </div>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
              {completedActionItems}/{totalActionItems} tasks done
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card: Meetings by Type Distribution */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <span>Meeting Types Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">{totalMeetings} total</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Client Calls */}
            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Client & Stakeholder Calls</span>
                </span>
                <span className="font-semibold">
                  {typeCounts.client_call} ({totalMeetings > 0 ? Math.round((typeCounts.client_call / totalMeetings) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalMeetings > 0 ? (typeCounts.client_call / totalMeetings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Team Syncs */}
            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Team Syncs & Sprints</span>
                </span>
                <span className="font-semibold">
                  {typeCounts.team_sync} ({totalMeetings > 0 ? Math.round((typeCounts.team_sync / totalMeetings) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalMeetings > 0 ? (typeCounts.team_sync / totalMeetings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Job Interviews */}
            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Job Interviews & Rubrics</span>
                </span>
                <span className="font-semibold">
                  {typeCounts.job_interview} ({totalMeetings > 0 ? Math.round((typeCounts.job_interview / totalMeetings) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalMeetings > 0 ? (typeCounts.job_interview / totalMeetings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* General */}
            <div>
              <div className="flex justify-between font-medium mb-1 text-slate-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>General & Ad-Hoc Discussions</span>
                </span>
                <span className="font-semibold">
                  {typeCounts.general} ({totalMeetings > 0 ? Math.round((typeCounts.general / totalMeetings) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalMeetings > 0 ? (typeCounts.general / totalMeetings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card: Talk Balance & Sentiment Health */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-500" />
              <span>Collaboration & Dialogue Health</span>
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active Monitoring</span>
          </div>

          {/* Talk Ratio Progress Bar */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 dark:text-neutral-300 font-medium">
              <span>Host Talk Share ({averageTalkRatio.host}%)</span>
              <span>Guest / Stakeholder ({averageTalkRatio.guest}%)</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-neutral-800">
              <div
                className="bg-indigo-600 h-full transition-all duration-500"
                style={{ width: `${averageTalkRatio.host}%` }}
                title={`Host: ${averageTalkRatio.host}%`}
              />
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${averageTalkRatio.guest}%` }}
                title={`Guest: ${averageTalkRatio.guest}%`}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {Math.abs(averageTalkRatio.host - 50) <= 15
                ? 'Balanced dialogue: Both host and participants have active voice participation.'
                : 'Uneven talk balance: Consider asking more open-ended inquiry questions.'}
            </p>
          </div>

          {/* Sentiment Grid */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-center">
            <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Positive</span>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {sentimentCounts.positive}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-700">
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-neutral-400">Neutral</span>
              <div className="text-base font-bold text-slate-700 dark:text-neutral-300 mt-0.5">
                {sentimentCounts.neutral}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Cautious</span>
              <div className="text-base font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                {sentimentCounts.cautious}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/30">
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">Decisive</span>
              <div className="text-base font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                {sentimentCounts.decisive}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Collaborators & Consolidated Decisions Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Collaborators / Attendees (1 col) */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Key Stakeholders</span>
            </h3>
            <span className="text-xs text-slate-400">{collaborators.length} people</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-neutral-800 max-h-96 overflow-y-auto pr-1">
            {collaborators.map((c, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-neutral-200 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400">Last met: {c.lastDate}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 font-semibold text-[11px] text-slate-700 dark:text-neutral-300">
                  {c.count} {c.count === 1 ? 'meeting' : 'meetings'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Consolidated Decisions Stream (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-5 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-neutral-800">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Consolidated Decisions Feed ({allDecisions.length})</span>
            </h3>

            {/* Search & Filter Decisions */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search decisions..."
                  value={decisionSearch}
                  onChange={(e) => setDecisionSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
                />
              </div>

              {decisionCategories.length > 0 && (
                <select
                  value={decisionCategoryFilter}
                  onChange={(e) => setDecisionCategoryFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-neutral-300"
                >
                  <option value="all">All Categories</option>
                  {decisionCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Decisions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredDecisions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No decisions match the filter.</p>
            ) : (
              filteredDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-750 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300">
                        {dec.category}
                      </span>
                      <button
                        onClick={() => onNavigateToMeeting(dec.meetingId)}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 truncate"
                      >
                        <span>{dec.meetingTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[10px] text-slate-400">• {dec.meetingDate}</span>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-neutral-100">{dec.text}</p>
                    {dec.context && (
                      <p className="text-slate-500 dark:text-neutral-400 text-[11px] italic">{dec.context}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
