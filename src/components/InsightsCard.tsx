import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  MessageSquare, 
  Smile, 
  Search, 
  Volume2, 
  Users,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  VolumeX,
  Volume1,
  Edit2,
  Check,
  X,
  Download,
  Copy,
  Sparkles
} from 'lucide-react';
import { MeetingRecord } from '../types';
import { downloadFile, generateSrtSubtitles, generateTimestampedTxt } from '../utils/exportHelpers';

interface InsightsCardProps {
  meeting: MeetingRecord;
  onUpdateMeeting?: (updated: MeetingRecord) => void;
  jumpTimestamp?: string | null;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ 
  meeting, 
  onUpdateMeeting,
  jumpTimestamp 
}) => {
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  // Total duration in seconds (based on meeting durationMinutes)
  const totalDurationSec = Math.max(60, meeting.durationMinutes * 60);

  // Speaker Renaming State
  const [renamingSpeaker, setRenamingSpeaker] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState('');

  // Convert mm:ss or hh:mm:ss to seconds
  const parseTimeToSeconds = (tStr: string): number => {
    const parts = tStr.split(':').map(Number);
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
    if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    return 0;
  };

  // Convert seconds to mm:ss
  const formatSeconds = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Audio Playback simulation ticker
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSec]);

  // Handle external jump timestamp (e.g. from AI Chat or props)
  useEffect(() => {
    if (jumpTimestamp) {
      const sec = parseTimeToSeconds(jumpTimestamp);
      setCurrentTimeSec(sec);
      setIsPlaying(true);
    }
  }, [jumpTimestamp]);

  const talkRatio = meeting.sentiment.talkRatio || { host: 50, guest: 50 };

  const filteredTranscript = meeting.transcript.filter(
    (t) =>
      t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
      t.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  // Find currently active transcript index based on currentTimeSec
  const currentActiveIndex = meeting.transcript.findIndex((entry, idx) => {
    const currentEntrySec = parseTimeToSeconds(entry.time);
    const nextEntry = meeting.transcript[idx + 1];
    const nextEntrySec = nextEntry ? parseTimeToSeconds(nextEntry.time) : totalDurationSec;
    return currentTimeSec >= currentEntrySec && currentTimeSec < nextEntrySec;
  });

  const handleSeek = (newSec: number) => {
    setCurrentTimeSec(Math.min(totalDurationSec, Math.max(0, newSec)));
  };

  const handleTimestampClick = (timeStr: string) => {
    const sec = parseTimeToSeconds(timeStr);
    handleSeek(sec);
    setIsPlaying(true);
  };

  const startRenameSpeaker = (oldName: string) => {
    setRenamingSpeaker(oldName);
    setNewNameInput(oldName);
  };

  const submitRenameSpeaker = () => {
    if (!renamingSpeaker || !newNameInput.trim() || !onUpdateMeeting) return;
    const trimmed = newNameInput.trim();

    const updatedTranscript = meeting.transcript.map((t) => ({
      ...t,
      speaker: t.speaker === renamingSpeaker ? trimmed : t.speaker,
    }));

    const updatedAttendees = meeting.attendees.map((att) =>
      att === renamingSpeaker ? trimmed : att
    );

    onUpdateMeeting({
      ...meeting,
      transcript: updatedTranscript,
      attendees: updatedAttendees,
    });

    setRenamingSpeaker(null);
  };

  const handleCopyTranscript = () => {
    const txt = generateTimestampedTxt(meeting);
    navigator.clipboard.writeText(txt);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Time Saved */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-neutral-100">
              {meeting.sentiment.timeSavedMinutes} mins
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Time saved on this call</div>
          </div>
        </div>

        {/* Talk Time Ratio */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Talk Balance
            </span>
            <span className="text-slate-700 dark:text-neutral-300 font-medium">
              Host {talkRatio.host}% / Guest {talkRatio.guest}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden flex">
            <div className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all" style={{ width: `${talkRatio.host}%` }} />
            <div className="bg-teal-500 dark:bg-teal-400 h-full transition-all" style={{ width: `${talkRatio.guest}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
            <span>Healthy listening ratio</span>
            <span>Balanced conversation</span>
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-neutral-100 capitalize">
              {meeting.sentiment.overall} Sentiment
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium truncate max-w-[180px]">
              {meeting.sentiment.clientSatisfaction || 'High alignment'}
            </div>
          </div>
        </div>
      </div>

      {/* Notta-Parity Feature: Interactive Audio Waveform & Player Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition transform active:scale-95"
              title={isPlaying ? 'Pause playback' : 'Play audio recording'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(Math.max(0, currentTimeSec - 10))}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSeek(Math.min(totalDurationSec, currentTimeSec + 10))}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Fast forward 10s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Audio Playback & Synchronized Transcript</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                  Notta Player
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {formatSeconds(currentTimeSec)} / {formatSeconds(totalDurationSec)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    playbackSpeed === spd
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume1 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={totalDurationSec}
            value={currentTimeSec}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* Transcript Viewer with Search & Speaker Renaming */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
          <div>
            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-neutral-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Full Timestamped Transcript & Diarization
            </h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Click any timestamp to jump audio. Click speaker name to rename globally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search box */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Export / Copy */}
            <button
              onClick={handleCopyTranscript}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-xs"
              title="Copy entire transcript to clipboard"
            >
              {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => downloadFile(generateSrtSubtitles(meeting), `${meeting.title.toLowerCase().replace(/\s+/g, '-')}.srt`, 'text/plain')}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-xs"
              title="Download SRT Subtitles"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Speaker Rename Dialog Inline */}
        {renamingSpeaker && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold text-slate-700 dark:text-neutral-200">
                Rename <strong>"{renamingSpeaker}"</strong> across all speech turns:
              </span>
              <input
                type="text"
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={submitRenameSpeaker}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs"
              >
                Apply Rename
              </button>
              <button
                onClick={() => setRenamingSpeaker(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Transcript Entries */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredTranscript.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-neutral-500 text-xs">
              No dialogue found matching "{transcriptSearch}".
            </div>
          ) : (
            filteredTranscript.map((entry, idx) => {
              const isCurrentActive = idx === currentActiveIndex;
              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    isCurrentActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400 dark:ring-indigo-600'
                      : 'bg-slate-50 dark:bg-neutral-800/70 border-slate-200 dark:border-neutral-700/80 hover:border-slate-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Volume2 className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                        {entry.speaker}
                      </span>
                      {onUpdateMeeting && (
                        <button
                          onClick={() => startRenameSpeaker(entry.speaker)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition"
                          title={`Rename "${entry.speaker}" everywhere`}
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleTimestampClick(entry.time)}
                      className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700 hover:border-indigo-400 transition flex items-center gap-1"
                      title="Play audio from this timestamp"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{entry.time}</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-neutral-200 leading-relaxed pl-4 font-sans">
                    {entry.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
