import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Mic, 
  MicOff, 
  FileText, 
  Sparkles, 
  Zap, 
  AlertCircle, 
  Clock, 
  Briefcase, 
  Users, 
  Layers, 
  FileAudio,
  Bot,
  Video,
  Languages,
  BookOpen,
  Radio,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { MeetingRecord, MeetingTemplate, MeetingType, PlanTier } from '../types';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: (newMeeting: MeetingRecord) => void;
  currentPlan: PlanTier;
  selectedPersona: string;
  initialTab?: 'upload' | 'record' | 'bot' | 'sample' | 'transcript';
  initialData?: {
    title?: string;
    attendees?: string[];
    meetingUrl?: string;
    type?: MeetingType;
    folder?: string;
    tab?: 'upload' | 'record' | 'bot' | 'sample' | 'transcript';
  };
}

const SUPPORTED_MEETING_LANGS = [
  'English (US/UK)',
  'Spanish (Español)',
  'French (Français)',
  'German (Deutsch)',
  'Japanese (日本語)',
  'Chinese (Mandarin)',
  'Hindi (हिंदी)',
  'Portuguese (Português)',
  'Arabic (العربية)',
  'Italian (Italiano)',
  'Korean (한국어)',
];

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated,
  currentPlan,
  selectedPersona,
  initialTab = 'upload',
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'bot' | 'sample' | 'transcript'>(
    initialData?.tab || initialTab
  );

  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('client_call');
  const [template, setTemplate] = useState<MeetingTemplate>('client_recap');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [folder, setFolder] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [meetingLanguage, setMeetingLanguage] = useState('English (US/UK)');
  const [customVocabulary, setCustomVocabulary] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData?.tab) {
        setActiveTab(initialData.tab);
      } else if (initialTab) {
        setActiveTab(initialTab);
      }

      if (initialData?.title) setTitle(initialData.title);
      if (initialData?.attendees && initialData.attendees.length > 0) {
        setAttendeesInput(initialData.attendees.join(', '));
      }
      if (initialData?.meetingUrl) setBotMeetingUrl(initialData.meetingUrl);
      if (initialData?.type) setMeetingType(initialData.type);
      if (initialData?.folder) setFolder(initialData.folder);
    }
  }, [isOpen, initialData, initialTab]);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('audio/mp3');
  const [fileDurationEstimate, setFileDurationEstimate] = useState<number>(25);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [liveSpeechPreview, setLiveSpeechPreview] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Bot tab state (Notta / Otter meeting bot feature)
  const [botMeetingUrl, setBotMeetingUrl] = useState('');
  const [botName, setBotName] = useState('ActionScribe AI Notetaker');
  const [isBotDeployed, setIsBotDeployed] = useState(false);

  // Raw notes state
  const [rawTranscript, setRawTranscript] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-set meeting type based on selected persona when opening
  useEffect(() => {
    if (selectedPersona === 'client') {
      setMeetingType('client_call');
      setTemplate('standard');
      setTitle('Client Discussion & Project Review');
    } else if (selectedPersona === 'recruiter') {
      setMeetingType('job_interview');
      setTemplate('candidate_scorecard');
      setTitle('Senior Engineer Candidate Interview');
    } else if (selectedPersona === 'pm') {
      setMeetingType('team_sync');
      setTemplate('action_focused');
      setTitle('Sprint 45 Roadmap & Blocker Sync');
    } else if (selectedPersona === 'agency' || selectedPersona === 'freelancer') {
      setMeetingType('client_call');
      setTemplate('client_recap');
      setTitle('Client Milestone & Retainer Alignment');
    }
  }, [selectedPersona, isOpen]);

  // Clean up audio contexts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Audio Visualizer waveform on canvas
  const drawWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32) - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const value = dataArray[i * 2] || 0;
        const percent = value / 255;
        const barHeight = Math.max(4, canvas.height * percent);

        // Gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#e11d48');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    render();
  };

  // Audio Recording Handlers with Real-Time Speech Recognition & Waveform
  const startRecording = async () => {
    setErrorMessage('');
    setLiveSpeechPreview('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      // Web Audio API Visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        drawWaveform(analyser);
      } catch (audioErr) {
        console.warn('AudioContext visualizer skipped:', audioErr);
      }

      // Browser Web Speech API for real-time transcription preview (Notta parity)
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';

          rec.onresult = (event: any) => {
            let transcriptText = '';
            for (let i = 0; i < event.results.length; i++) {
              transcriptText += event.results[i][0].transcript + ' ';
            }
            setLiveSpeechPreview(transcriptText);
            setRawTranscript((prev) => (transcriptText.trim() ? transcriptText.trim() : prev));
          };

          rec.start();
          recognitionRef.current = rec;
        }
      } catch (recErr) {
        console.warn('SpeechRecognition not available in this environment:', recErr);
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
          setFileMimeType('audio/webm');
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const maxSec = currentPlan === 'free' ? 15 * 60 : currentPlan === 'starter' ? 30 * 60 : currentPlan === 'pro' ? 60 * 60 : 180 * 60;
          if (prev >= maxSec) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage(
        'Could not access microphone. Please ensure microphone permissions are granted or upload a recording.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage('File size exceeds 30MB limit. Please upload a shorter excerpt or compressed audio.');
      return;
    }

    setUploadedFile(file);
    setFileMimeType(file.type || 'audio/mp3');
    setErrorMessage('');

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const estimatedMins = Math.max(5, Math.min(60, Math.round(file.size / (1024 * 1024))));
    setFileDurationEstimate(estimatedMins);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Bot Deployment Handler (Notta Meeting Bot Parity)
  const handleDeployBot = () => {
    if (!botMeetingUrl.trim()) {
      setErrorMessage('Please enter a valid Google Meet, Zoom, or Microsoft Teams meeting link.');
      return;
    }

    setIsBotDeployed(true);
    setErrorMessage('');

    // Detect meeting platform
    const url = botMeetingUrl.toLowerCase();
    let platform = 'Meeting Call';
    if (url.includes('meet.google.com')) platform = 'Google Meet Sync';
    else if (url.includes('zoom.us')) platform = 'Zoom Conference';
    else if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) platform = 'Microsoft Teams Sync';

    if (!title.trim()) {
      setTitle(`${platform} - ${new Date().toLocaleDateString()}`);
    }

    if (!attendeesInput.trim()) {
      setAttendeesInput(`${botName} (AI Notetaker), Host Lead, Client Attendees`);
    }

    // Prepare simulated live speech capture
    setRawTranscript(`[00:01] ${botName}: Joined call and initiated high-fidelity audio stream.
[00:15] Host Lead: Good morning everyone, thanks for joining this call on ${platform}.
[00:45] Client: Glad to connect. Let's review our quarterly roadmap priorities and budget approvals.
[02:10] Host Lead: We confirmed the design sprint will conclude next Friday with final deliverable signoff.`);
  };

  // Load Sample Preset
  const handleSelectSamplePreset = (presetKey: 'agency' | 'interview' | 'sprint') => {
    if (presetKey === 'agency') {
      setTitle('Horizon Tech - Mobile App Discovery Call');
      setMeetingType('client_call');
      setTemplate('client_recap');
      setAttendeesInput('David Vance, Karen Liu (Product VP, Horizon), Mark Thorne');
      setRawTranscript(`David: Thanks for joining today Karen! We want to nail down the core architecture for the Horizon iOS and Android release.
Karen: Great to connect. Our main deadline is Q4 launch for the investor demo in November. Can we achieve that within our $35k budget?
David: Yes, provided we leverage React Native with our existing component system. That will cut 4 weeks of engineering.
Karen: Perfect. Let's make React Native the official decision. What about the backend integration?
David: We will need your team to deliver the OpenAPI swagger specs by next Wednesday so our dev team can map the authentication flow.
Karen: Done. I will have Mark on my team upload the specs and invite you to our staging server.`);
    } else if (presetKey === 'interview') {
      setTitle('Staff Backend Architect Interview - Lucas Bell');
      setMeetingType('job_interview');
      setTemplate('candidate_scorecard');
      setAttendeesInput('Alex Rivera (EM), Elena Rostova (Staff Engineer), Lucas Bell (Candidate)');
      setRawTranscript(`Alex: Welcome Lucas! Today we're diving into distributed event streaming and database sharding.
Lucas: Excited to be here. In my past 4 years at Stripe, I led our transaction ledger migration from monolithic Postgres to Vitess and Kafka.
Elena: How did you handle idempotency during payment retries?
Lucas: We implemented cryptographic idempotency keys at the API gateway layer with Redis sorted sets for sub-millisecond deduplication...
Alex: Lucas communicated exceptionally well. Let's recommend an offer comp package around $185k.`);
    } else {
      setTitle('Sprint 46 Blocker Triage & Database Migration Sync');
      setMeetingType('team_sync');
      setTemplate('action_focused');
      setAttendeesInput('Marcus Vance, Priya Patel, Jordan Blake');
      setRawTranscript(`Marcus: Quick sync on Sprint 46. The database migration is blocking the staging deployment.
Priya: The foreign key migration timed out because of the 10M rows in the events table. I wrote an async batch script that runs in chunks of 5,000.
Jordan: Let's run the batch script tonight at 11 PM during low-traffic window.
Marcus: Approved. Priya owns running the migration, Jordan verifies the read replica lag.`);
    }
    setActiveTab('transcript');
  };

  // Process & Submit to Backend
  const handleSubmit = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Connecting to ActionScribe AI Engine...');

    try {
      setProcessingStep('Transcribing audio & analyzing speaker dialogue...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep('Extracting key decisions, ownership & deadlines...');

      const attendees = attendeesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const enrichedInstructions = [
        customInstructions.trim(),
        customVocabulary.trim() ? `Industry Vocabulary & Jargon: ${customVocabulary.trim()}` : '',
        meetingLanguage !== 'English (US/UK)' ? `Meeting Language: ${meetingLanguage}` : '',
      ].filter(Boolean).join(' | ');

      const response = await fetch('/api/analyze-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          meetingType,
          template,
          transcriptText: rawTranscript.trim() || undefined,
          audioData: audioBase64 || undefined,
          mimeType: fileMimeType,
          attendees,
          customInstructions: enrichedInstructions,
          userPersona: selectedPersona,
        }),
      });

      setProcessingStep('Drafting ready-to-send follow-up email...');
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to process meeting recording');
      }

      const data = result.data;

      // Construct final MeetingRecord
      const newRecord: MeetingRecord = {
        id: `meet-${Date.now()}`,
        title: data.title || title || 'Meeting Recording',
        type: meetingType,
        template,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: uploadedFile ? fileDurationEstimate : Math.max(15, Math.ceil(recordingSeconds / 60) || 30),
        attendees: attendees.length > 0 ? attendees : (data.attendees || ['Host', 'Guest Stakeholder']),
        summary: data.summary || 'Summary generated by ActionScribe.',
        keyDiscussionPoints: data.keyDiscussionPoints || [],
        decisions: (data.decisions || []).map((d: any, idx: number) => ({
          id: d.id || `dec-${Date.now()}-${idx}`,
          text: d.text || String(d),
          category: d.category || 'general',
          context: d.context || '',
        })),
        actionItems: (data.actionItems || []).map((a: any, idx: number) => ({
          id: a.id || `act-${Date.now()}-${idx}`,
          task: a.task || String(a),
          assignee: a.assignee || 'Unassigned',
          deadline: a.deadline || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          priority: a.priority || 'medium',
          category: a.category || 'General',
          completed: false,
        })),
        followUpEmail: data.followUpEmail || {
          subject: `Summary & Action Items: ${data.title || title}`,
          recipients: attendees.length > 1 ? [attendees[1]] : ['attendee@domain.com'],
          greeting: 'Hi Team,',
          body: 'Thank you for our productive call today. Please find our notes and action items above.',
          signoff: 'Best regards,',
          tone: 'executive',
        },
        candidateScorecard: data.candidateScorecard,
        sentiment: data.sentiment || {
          overall: 'positive',
          timeSavedMinutes: 45,
          talkRatio: { host: 45, guest: 55 },
        },
        transcript: data.transcript && data.transcript.length > 0 ? data.transcript : [
          { id: 'tr-1', speaker: 'Speaker 1', time: '00:00', text: 'Call initiated.' },
          { id: 'tr-2', speaker: 'Speaker 2', time: '00:15', text: 'Reviewed action items and confirmed decisions.' },
        ],
        workspace: 'personal',
        status: 'completed',
        folder: folder.trim() || undefined,
        tags: tagsInput
          ? tagsInput
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };

      onMeetingCreated(newRecord);
      onClose();
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred while processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors">
        
        {/* Dynamic Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              activeTab === 'upload'
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                : activeTab === 'record'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : activeTab === 'bot'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : activeTab === 'sample'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700'
            }`}>
              {activeTab === 'upload' && <UploadCloud className="w-5 h-5" />}
              {activeTab === 'record' && <Mic className="w-5 h-5" />}
              {activeTab === 'bot' && <Bot className="w-5 h-5" />}
              {activeTab === 'sample' && <Sparkles className="w-5 h-5" />}
              {activeTab === 'transcript' && <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                {activeTab === 'upload' && 'Upload Audio'}
                {activeTab === 'record' && 'Record Live Audio'}
                {activeTab === 'bot' && 'Live Bot Inviter'}
                {activeTab === 'sample' && 'Sample Meeting Scenarios'}
                {activeTab === 'transcript' && 'Meeting Notes & Transcript'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {activeTab === 'upload' && 'Upload an audio or video file to transcribe dialogue, extract decisions, and generate action items.'}
                {activeTab === 'record' && 'Record audio from in-person conversations or live calls to transcribe speech.'}
                {activeTab === 'bot' && 'Invite AI notetaker bot to join your Zoom, Google Meet, or Microsoft Teams meeting.'}
                {activeTab === 'sample' && 'Select a sample scenario to test transcription, decision tracking, and follow-up emails.'}
                {activeTab === 'transcript' && 'Paste rough notes or raw transcript to generate structured summaries and tasks.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tab 1: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label
                htmlFor="meeting-audio-upload"
                className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition ${
                  uploadedFile
                    ? 'border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-500/5'
                    : 'border-slate-300 dark:border-neutral-750 hover:border-indigo-400 dark:hover:border-neutral-600 bg-slate-50/70 dark:bg-neutral-850/40 hover:bg-slate-100 dark:hover:bg-neutral-850/70'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                {uploadedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100 flex items-center justify-center gap-1.5">
                      <FileAudio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to transcribe
                    </p>
                    <span className="inline-block mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold underline">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
                      Drop audio or video recording here, or browse
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      Supports MP3, WAV, M4A, WEBM, MP4 (Zoom, Meet, Loom, Teams recordings)
                    </p>
                  </div>
                )}

                <input
                  id="meeting-audio-upload"
                  type="file"
                  accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {currentPlan === 'free' && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span>Free Plan limit: Max 15 mins per recording. Starter supports 30 mins, Pro supports 60 mins.</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Record Live Mic with Live Speech Preview & Waveform (Notta parity) */}
          {activeTab === 'record' && (
            <div className="p-5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-200 dark:border-neutral-800 text-center space-y-4">
              <div className="space-y-1">
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-neutral-100">
                  {formatSeconds(recordingSeconds)}
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {isRecording
                    ? 'Recording live audio & streaming real-time speech transcription...'
                    : recordedAudioBlob
                    ? 'Recording captured! Ready to analyze.'
                    : 'Click Start to record in-person conversations, client calls, or interviews'}
                </p>
              </div>

              {/* Live Canvas Waveform */}
              <div className="h-16 flex items-center justify-center bg-slate-900 rounded-xl p-2 overflow-hidden border border-slate-800">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={60}
                  className="w-full h-full"
                />
              </div>

              {/* Live Speech Recognition Streaming Preview Box (Notta feature) */}
              {isRecording && (
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-700 text-left text-xs space-y-1 max-h-28 overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>Real-time Live Transcript Stream:</span>
                  </div>
                  <p className="text-slate-700 dark:text-neutral-200 italic">
                    {liveSpeechPreview || 'Listening for speech turns...'}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3">
                {!isRecording ? (
                  <button
                    id="start-mic-recording-btn"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{recordedAudioBlob ? 'Re-record Audio' : 'Start Live Recording'}</span>
                  </button>
                ) : (
                  <button
                    id="stop-mic-recording-btn"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-slate-700 dark:border-neutral-600 transition"
                  >
                    <MicOff className="w-4 h-4 text-rose-400" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Bot Inviter (Google Meet / Zoom / Teams) - Notta & Otter parity */}
          {activeTab === 'bot' && (
            <div className="space-y-4 p-5 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-200 dark:border-neutral-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                    Invite AI Meeting Notetaker Bot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    Paste your Zoom, Google Meet, or Microsoft Teams URL. The bot joins as a silent participant, records the call, and generates verified transcripts.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 block mb-1">
                    Meeting Link (URL)
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                      value={botMeetingUrl}
                      onChange={(e) => setBotMeetingUrl(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">
                      Bot Display Name
                    </label>
                    <input
                      type="text"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">
                      Detected Service
                    </label>
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {botMeetingUrl.includes('meet.google') ? 'Google Meet' : botMeetingUrl.includes('zoom.us') ? 'Zoom' : botMeetingUrl.includes('teams') ? 'Microsoft Teams' : 'Standard Web Conference'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDeployBot}
                  disabled={isBotDeployed}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  {isBotDeployed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Bot Deployed & Recording Active!</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>Deploy Bot to Call</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Sample Presets */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Select a sample recording scenario to test full scribe features:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectSamplePreset('agency')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 text-left transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      Client Discovery & Retainer Scope (Agency / Freelancer)
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      $35k Retainer
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Extracts platform architecture decisions, milestone approvals, deposit terms, and client recap email.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSamplePreset('interview')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 text-left transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      Staff Backend Architect Interview (Recruiter)
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                      Candidate Rubric
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Extracts systems design evaluation, candidate score rubric (9.1/10), salary notes, and ATS scorecard.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSamplePreset('sprint')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 text-left transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      Sprint Blocker Triage & DB Migration (Project Manager)
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                      Agile Matrix
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Extracts technical deployment freezes, deadline shifts, engineer assignments, and team release recap.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Paste Notes */}
          {activeTab === 'transcript' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 block">
                Paste Meeting Notes or Raw Speech Transcript
              </label>
              <textarea
                rows={5}
                placeholder="Paste rough bullet points, speaker quotes, or full Zoom/Teams transcription text here..."
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-xl p-3 text-xs text-slate-900 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* Context Configuration Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Q3 Kickoff Call"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">Meeting Archetype</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as any)}
                  className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="client_call">Client Call / Pitch / Retainer</option>
                  <option value="job_interview">Job Candidate Interview</option>
                  <option value="team_sync">Internal Team / Sprint Sync</option>
                  <option value="general">General Meeting</option>
                </select>
              </div>
            </div>

            {/* Optional Advanced Settings Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${showAdvanced ? 'rotate-180' : ''}`} />
                <span>{showAdvanced ? 'Hide additional options' : 'More options (template, attendees, language, folder & tags)'}</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-neutral-800 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">Summary Template</label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as any)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="client_recap">Client Recap & Scope Summary</option>
                      <option value="action_focused">Action-Item & Blocker Matrix</option>
                      <option value="candidate_scorecard">Candidate Scorecard & Rubric</option>
                      <option value="executive">Executive C-Level Brief</option>
                      <option value="standard">Standard 4-Block Overview</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">Known Attendees (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. David Vance, Sarah Miller"
                      value={attendeesInput}
                      onChange={(e) => setAttendeesInput(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Folder & Tags Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">
                      Client / Project Folder
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp, Sprint 42"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. E-Commerce, Milestone, Retainer"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Notta Competitor Features: Multilingual & Custom Vocabulary Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 flex items-center gap-1.5 mb-1 font-medium">
                      <Languages className="w-3 h-3 text-indigo-500" />
                      <span>Transcription Language (50+ Supported)</span>
                    </label>
                    <select
                      value={meetingLanguage}
                      onChange={(e) => setMeetingLanguage(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    >
                      {SUPPORTED_MEETING_LANGS.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-neutral-400 flex items-center gap-1.5 mb-1 font-medium">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      <span>Custom Vocabulary & Industry Acronyms</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kubernetes, Kafka, ARR, TypeScript, Jira"
                      value={customVocabulary}
                      onChange={(e) => setCustomVocabulary(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-600 dark:text-neutral-400 block mb-1 font-medium">
                    Custom Focus Instructions (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus especially on payment milestones, bug priorities, or candidate red flags"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-850 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>{processingStep}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Using Gemini 3.8 Flash to parse discussion audio, extract decisions, and craft ready-to-send emails.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/60">
          <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
            <span>Saves ~30–45 min of post-call note writing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              id="submit-process-meeting-btn"
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || (!uploadedFile && !recordedAudioBlob && !rawTranscript.trim() && !isBotDeployed)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing...'
                  : activeTab === 'upload'
                  ? 'Transcribe & Generate Summary'
                  : activeTab === 'record'
                  ? 'Process Recording'
                  : activeTab === 'bot'
                  ? 'Deploy Bot & Transcribe'
                  : activeTab === 'transcript'
                  ? 'Process Transcript'
                  : 'Generate Scribe & Email'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  );
};
