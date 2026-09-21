import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Link as LinkIcon, 
  X, 
  Plus, 
  Sparkles,
  Layers
} from 'lucide-react';
import { CalendarEvent, MeetingType } from '../types';

interface AddScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: CalendarEvent) => void;
}

export const AddScheduleMeetingModal: React.FC<AddScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('Today');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('11:45 AM');
  const [platform, setPlatform] = useState<'google_meet' | 'zoom' | 'teams'>('google_meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('team_sync');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a meeting title.');
      return;
    }

    const attendees = attendeesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    // Generate fallback link if not provided
    let link = meetingUrl.trim();
    if (!link) {
      if (platform === 'google_meet') {
        const randId = Math.random().toString(36).substring(2, 5) + '-' + 
                       Math.random().toString(36).substring(2, 6) + '-' + 
                       Math.random().toString(36).substring(2, 5);
        link = `https://meet.google.com/${randId}`;
      } else if (platform === 'zoom') {
        const randId = Math.floor(1000000000 + Math.random() * 9000000000);
        link = `https://zoom.us/j/${randId}`;
      } else {
        link = `https://teams.microsoft.com/l/meetup-join/${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      time: `${startTime} - ${endTime}`,
      date: date.trim() || 'Today',
      durationMinutes: 45,
      platform,
      link,
      attendees: attendees.length > 0 ? attendees : ['You (Host)'],
      type: meetingType,
    };

    onAddEvent(newEvent);
    // Reset form
    setTitle('');
    setMeetingUrl('');
    setAttendeesInput('');
    setErrorMessage('');
    onClose();
  };

  const applyQuickPreset = (presetTitle: string, pStart: string, pEnd: string, pPlatform: 'google_meet' | 'zoom' | 'teams', pType: MeetingType) => {
    setTitle(presetTitle);
    setStartTime(pStart);
    setEndTime(pEnd);
    setPlatform(pPlatform);
    setMeetingType(pType);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-neutral-100">
                Add Scheduled Meeting
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Add an upcoming call to today's schedule for live transcription & bot inviter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyQuickPreset('Client Discovery & Scope Sync', '01:00 PM', '01:45 PM', 'google_meet', 'client_call')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 transition text-[11px]"
              >
                + Client Discovery (Meet)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('Engineering Sprint Standup', '03:00 PM', '03:30 PM', 'zoom', 'team_sync')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 transition text-[11px]"
              >
                + Sprint Standup (Zoom)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('Technical Candidate Interview', '05:00 PM', '05:45 PM', 'teams', 'job_interview')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 transition text-[11px]"
              >
                + Tech Screen (Teams)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Meeting Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Handoff & Product Sync"
              className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Today"
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="11:00 AM"
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="11:45 AM"
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
              Meeting Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlatform('google_meet')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  platform === 'google_meet'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google Meet</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('zoom')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  platform === 'zoom'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>Zoom</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('teams')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  platform === 'teams'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-purple-500" />
                <span>Teams</span>
              </button>
            </div>
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
              Meeting URL (optional, bot will use this to join)
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder={
                  platform === 'google_meet'
                    ? 'https://meet.google.com/abc-defg-hij'
                    : platform === 'zoom'
                    ? 'https://zoom.us/j/1234567890'
                    : 'https://teams.microsoft.com/l/meetup-join/...'
                }
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Attendees & Archetype */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                Attendees (comma separated)
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  placeholder="e.g. David Vance, Sarah Miller"
                  className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">
                Meeting Archetype
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="team_sync">Team Sync & Standup</option>
                <option value="client_call">Client / Agency Project Sync</option>
                <option value="job_interview">Candidate Tech Screen</option>
                <option value="all_hands">All-Hands / Leadership</option>
                <option value="one_on_one">1-on-1 Catchup</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMessage}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
