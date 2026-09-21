export type MeetingType = 'client_call' | 'team_sync' | 'job_interview' | 'general';

export type MeetingTemplate = 
  | 'standard' 
  | 'executive' 
  | 'action_focused' 
  | 'candidate_scorecard' 
  | 'client_recap';

export type PlanTier = 'free' | 'starter' | 'pro' | 'team';

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
}

export interface Decision {
  id: string;
  text: string;
  category: 'scope' | 'budget' | 'timeline' | 'technical' | 'hiring' | 'general';
  context?: string;
}

export interface FollowUpEmail {
  subject: string;
  recipients: string[];
  greeting: string;
  body: string;
  signoff: string;
  tone: 'executive' | 'friendly' | 'concise' | 'interview_update';
}

export interface CandidateScorecard {
  candidateName: string;
  role: string;
  recommendation: 'strong_hire' | 'hire' | 'lean_no' | 'strong_no';
  overallScore: number; // 1-10
  technicalScore: number; // 1-10
  communicationScore: number; // 1-10
  culturalFitScore: number; // 1-10
  keyStrengths: string[];
  areasOfConcern: string[];
  salaryExpectation?: string;
  interviewerNotes: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
}

export interface CustomExtraction {
  id: string;
  prompt: string;
  result: string;
  createdAt: string;
}

export interface MeetingRecord {
  id: string;
  title: string;
  type: MeetingType;
  template: MeetingTemplate;
  date: string;
  durationMinutes: number;
  attendees: string[];
  summary: string;
  keyDiscussionPoints: string[];
  decisions: Decision[];
  actionItems: ActionItem[];
  followUpEmail: FollowUpEmail;
  candidateScorecard?: CandidateScorecard;
  sentiment: {
    overall: 'positive' | 'neutral' | 'cautious' | 'decisive';
    clientSatisfaction?: string;
    timeSavedMinutes: number;
    talkRatio?: { host: number; guest: number };
  };
  transcript: TranscriptEntry[];
  workspace: 'personal' | 'team';
  status: 'completed' | 'processing' | 'draft';
  folder?: string;
  tags?: string[];
  isPublicShared?: boolean;
  publicShareToken?: string;
  customExtractions?: CustomExtraction[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  durationMinutes: number;
  platform: 'google_meet' | 'zoom' | 'teams';
  link: string;
  attendees: string[];
  type: MeetingType;
}

export interface PlanFeatures {
  name: string;
  price: string;
  monthlyLimit: number; // e.g. 5, 25, 60, 120
  maxMeetingDurationMinutes: number; // 25, 45, 90, 180
  customTemplates: boolean;
  notionExport: boolean;
  slackExport: boolean;
  crmExport: boolean;
  teamWorkspace: boolean;
  aiMeetingChat: boolean;
  actionItemsHub: boolean;
  customExtractions: boolean;
  candidateScorecard: boolean;
  botInviter: boolean;
  analyticsAccess: boolean;
  badge?: string;
}

export interface UserUsageState {
  currentPlan: PlanTier;
  meetingsThisMonth: number;
  minutesSavedTotal: number;
  activeWorkspace: 'personal' | 'team';
}

export interface InvoiceRecord {
  id: string;
  date: string;
  planId: PlanTier;
  planName: string;
  amountUSD: number;
  amountINR: number;
  billingCycle: 'monthly' | 'annual';
  paymentMethod: 'upi' | 'paypal';
  paymentRef: string; // UPI UTR or PayPal Order/Txn ID
  upiId?: string;
  clientName: string;
  clientEmail: string;
  companyName?: string;
  billingAddress?: string;
  status: 'paid' | 'pending_verification' | 'rejected';
}

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  timestamp: string;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  persona: string;
  currentPlan: PlanTier;
  avatarColor?: string;
  createdAt: string;
}

export interface AuthState {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
