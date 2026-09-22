import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Crown, 
  SlidersHorizontal, 
  Zap, 
  Sun, 
  Moon, 
  Mail, 
  FileText, 
  ChevronDown, 
  Check, 
  Users, 
  Laptop, 
  CheckSquare, 
  UserCheck, 
  Building2, 
  Sparkles, 
  UploadCloud, 
  Mic, 
  Bot, 
  MoreHorizontal, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut, 
  BarChart3, 
  Layers, 
  Video,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { UserUsageState } from '../types';
import { PLANS } from '../data/sampleMeetings';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  usageState: UserUsageState;
  onOpenPricing: () => void;
  onOpenNewModal: () => void;
  onOpenNewModalWithTab?: (tab: 'upload' | 'record' | 'bot' | 'sample' | 'transcript') => void;
  onOpenTemplates: () => void;
  onWorkspaceChange: (ws: 'personal' | 'team') => void;
  selectedPersona: string;
  onSelectPersona: (persona: string) => void;
  onOpenContact: () => void;
  onOpenInvoices: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'profile') => void;
  mainView?: 'meetings' | 'tasks' | 'analytics';
  onChangeMainView?: (view: 'meetings' | 'tasks' | 'analytics') => void;
  pendingTasksCount?: number;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const PERSONAS = [
  { 
    id: 'client', 
    name: 'General Client', 
    shortLabel: 'Client',
    hint: 'Personal & business meetings, key decisions & action items',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60'
  },
  { 
    id: 'freelancer', 
    name: 'Freelancer', 
    shortLabel: 'Freelance',
    hint: 'Milestones, client sign-offs & hourly scope',
    icon: Laptop,
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
  },
  { 
    id: 'pm', 
    name: 'Project Manager', 
    shortLabel: 'PM',
    hint: 'Sprint blockers, deadlines & ticket assignments',
    icon: CheckSquare,
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
  },
  { 
    id: 'recruiter', 
    name: 'Recruiter', 
    shortLabel: 'Recruiter',
    hint: 'Candidate scorecard, technical rubric & hiring consensus',
    icon: UserCheck,
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60'
  },
  { 
    id: 'agency', 
    name: 'Agency Owner', 
    shortLabel: 'Agency',
    hint: 'Retainer scope, budget changes & client recaps',
    icon: Building2,
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
  },
];

export const Header: React.FC<HeaderProps> = ({
  usageState,
  onOpenPricing,
  onOpenNewModal,
  onOpenNewModalWithTab = (_tab: 'upload' | 'record' | 'bot' | 'sample' | 'transcript') => onOpenNewModal(),
  onOpenTemplates,
  onWorkspaceChange,
  selectedPersona,
  onSelectPersona,
  onOpenContact,
  onOpenInvoices,
  onOpenAuth,
  mainView = 'meetings',
  onChangeMainView,
  pendingTasksCount = 0,
  isMobileMenuOpen: isMobileMenuOpenProp,
  onToggleMobileMenu: onToggleMobileMenuProp,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileNavOpen = isMobileMenuOpenProp !== undefined ? isMobileMenuOpenProp : internalMobileOpen;
  const toggleMobileNav = onToggleMobileMenuProp || (() => setInternalMobileOpen(!internalMobileOpen));
  const closeMobileNav = () => {
    if (onToggleMobileMenuProp && isMobileNavOpen) {
      onToggleMobileMenuProp();
    } else {
      setInternalMobileOpen(false);
    }
  };

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const personaDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const currentPlanConfig = PLANS[usageState.currentPlan];
  const isFree = usageState.currentPlan === 'free';

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];
  const CurrentIcon = currentPersona.icon;

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(event.target as Node)) {
        setIsPersonaOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPersonaOpen(false);
        setIsMoreMenuOpen(false);
        setIsToolsOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800 transition-colors">
      {/* Primary Clean Navigation Bar */}
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand + Mode Selector */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <BrandLogo size="md" />

          {/* Mode Selector Pill */}
          <div className="relative flex items-center pl-2 border-l border-slate-200 dark:border-neutral-800" ref={personaDropdownRef}>
            <button
              type="button"
              id="mode-dropdown-trigger"
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition"
              aria-expanded={isPersonaOpen}
              title="Switch Workspace Mode"
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${currentPersona.iconBg}`}>
                <CurrentIcon className="w-2.5 h-2.5" />
              </div>
              <span className="hidden sm:inline font-semibold">{currentPersona.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isPersonaOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </button>

            {/* Mode Dropdown */}
            {isPersonaOpen && (
              <div 
                id="mode-dropdown-menu"
                className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                  Select Workspace Mode
                </div>
                {PERSONAS.map((p) => {
                  const isSelected = p.id === selectedPersona;
                  const IconComp = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectPersona(p.id);
                        setIsPersonaOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold' 
                          : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${p.iconBg}`}>
                        <IconComp className="w-3 h-3" />
                      </div>
                      <span className="flex-1">{p.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tablet-only Compact Nav: Meetings and Tasks */}
        <div className="hidden md:flex lg:hidden items-center gap-1 bg-slate-100/90 dark:bg-neutral-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-neutral-700/80 text-xs">
          <button
            type="button"
            id="tablet-nav-meetings-btn"
            onClick={() => onChangeMainView && onChangeMainView('meetings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              mainView === 'meetings'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 font-medium'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Meetings</span>
          </button>
          <button
            type="button"
            id="tablet-nav-tasks-btn"
            onClick={() => onChangeMainView && onChangeMainView('tasks')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              mainView === 'tasks'
                ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-neutral-400 font-medium'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tasks</span>
            {pendingTasksCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                {pendingTasksCount}
              </span>
            )}
          </button>
        </div>

        {/* Center: Desktop-matched Navigation Bar */}
        <div className="hidden lg:flex items-center gap-2">
          <nav className="flex items-center gap-1 bg-slate-100/90 dark:bg-neutral-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-neutral-700/80 text-xs shadow-2xs">
            {/* Meetings */}
            <button
              type="button"
              id="nav-meetings-btn"
              onClick={() => onChangeMainView && onChangeMainView('meetings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                mainView === 'meetings'
                  ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800 font-medium'
              }`}
              title="Meetings - Scribes & Transcripts"
            >
              <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Meetings</span>
            </button>

            {/* Tasks */}
            <button
              type="button"
              id="nav-tasks-btn"
              onClick={() => onChangeMainView && onChangeMainView('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                mainView === 'tasks'
                  ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800 font-medium'
              }`}
              title="Tasks & Action Items"
            >
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tasks</span>
              {pendingTasksCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            {/* Upload Audio */}
            <button
              type="button"
              id="nav-upload-audio-btn"
              onClick={() => onOpenNewModalWithTab('upload')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800 font-medium transition"
              title="Upload & Transcribe Audio Files"
            >
              <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Upload Audio</span>
            </button>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                type="button"
                id="nav-tools-btn"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  isToolsOpen || mainView === 'analytics'
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800 font-medium'
                }`}
                title="Tools & Intelligence"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 transition-transform duration-150 ${isToolsOpen ? 'rotate-180 text-amber-500' : ''}`} />
              </button>

              {isToolsOpen && (
                <div 
                  id="nav-tools-popover"
                  className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                >
                  <button
                    id="tools-record-btn"
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenNewModalWithTab && onOpenNewModalWithTab('record');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-500" />
                    <span className="flex-1">Record Live Audio</span>
                  </button>

                  <button
                    id="tools-bot-btn"
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenNewModalWithTab && onOpenNewModalWithTab('bot');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="flex-1">Meeting Bot Inviter</span>
                  </button>

                  <button
                    id="tools-transcript-btn"
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenNewModalWithTab && onOpenNewModalWithTab('transcript');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span className="flex-1">Paste Notes & Transcript</span>
                  </button>

                  <button
                    id="tools-sample-btn"
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenNewModalWithTab && onOpenNewModalWithTab('sample');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="flex-1">Sample Meetings</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <button
              type="button"
              id="nav-pricing-btn"
              onClick={onOpenPricing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800 font-medium transition"
              title="Plans & Pricing"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Pricing</span>
            </button>
          </nav>
        </div>

        {/* Right: Theme Toggle, Profile & Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Gemini AI Live Status Indicator */}
          <div
            id="gemini-live-badge"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80"
            title="Google Gemini 3.8 Flash AI Engine Active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-[11px]">Gemini 3.8</span>
          </div>

          {/* Plan badge (compact status indicator) */}
          <button
            id="plan-quota-badge"
            onClick={onOpenPricing}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 bg-slate-100 hover:bg-slate-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition"
            title="View plans and usage"
          >
            <Crown className={`w-3 h-3 ${isFree ? 'text-amber-500' : 'text-amber-500 fill-amber-500/20'}`} />
            <span className="font-semibold">{currentPlanConfig.name}</span>
            {isFree ? (
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                {usageState.meetingsThisMonth}/5
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Active
              </span>
            )}
          </button>

          {/* More Menu Dropdown for secondary items (Invoices, Templates, Support) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              id="header-more-menu-btn"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
              title="More options (Invoices, Templates, Support)"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div 
                id="header-more-menu-popover"
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
              >
                {onChangeMainView && (
                  <>
                    <button
                      id="more-tasks-btn"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onChangeMainView('tasks');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="flex-1">Action Items Hub</span>
                      {pendingTasksCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                          {pendingTasksCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="more-analytics-btn"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onChangeMainView('analytics');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Executive Analytics</span>
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-neutral-800 my-1" />
                  </>
                )}

                <button
                  id="more-invoices-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenInvoices();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Billing & Invoices</span>
                </button>

                <button
                  id="more-pricing-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenPricing();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Plans & Pricing</span>
                </button>

                <button
                  id="more-templates-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenTemplates();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Templates</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-neutral-800 my-1" />

                <button
                  id="more-contact-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenContact();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Support & Feedback</span>
                </button>

                <div className="h-px bg-slate-100 dark:bg-neutral-800 my-1" />

                <button
                  id="more-auth-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenAuth(user ? 'profile' : 'login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition font-medium"
                >
                  {user ? <User className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                  <span>{user ? 'Account Profile' : 'Client Sign In'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Client Authentication Trigger (Login/Register or User Menu) */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="header-client-profile-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                title="Client Account"
              >
                <div className={`w-5 h-5 rounded-full ${user.avatarColor || 'bg-indigo-600'} text-white font-bold text-[10px] flex items-center justify-center shadow-xs`}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <span className="hidden xl:inline font-semibold max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div
                  id="header-client-dropdown-menu"
                  className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-neutral-800">
                    <div className="font-bold text-slate-900 dark:text-neutral-100 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">{user.email}</div>
                    {user.company && (
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">{user.company}</div>
                    )}
                  </div>

                  <button
                    id="client-menu-account-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuth('profile');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition mt-1"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Account Profile</span>
                  </button>

                  <button
                    id="client-menu-invoices-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenInvoices();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Billing & Invoices</span>
                  </button>

                  <button
                    id="client-menu-pricing-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenPricing();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Subscription Plan</span>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-neutral-800 my-1" />

                  <button
                    id="client-menu-logout-btn"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                id="header-client-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
              >
                Sign In
              </button>
              <button
                id="header-client-register-btn"
                onClick={() => onOpenAuth('register')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition"
              >
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            id="open-new-scribe-btn"
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs transition active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New<span className="hidden sm:inline"> Scribe</span></span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            id="header-mobile-menu-btn"
            onClick={toggleMobileNav}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition lg:hidden"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileNavOpen && (
        <div 
          id="header-mobile-nav-drawer"
          className="fixed inset-x-0 top-14 bottom-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMobileNav();
          }}
        >
          <div className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4 shadow-2xl">
            {/* Header / Close Row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Navigation & Actions
              </span>
              <button
                onClick={closeMobileNav}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Persona / Workspace Selector Pill */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Workspace Persona Mode</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PERSONAS.map((p) => {
                  const IconComp = p.icon;
                  const isSelected = p.id === selectedPersona;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPersona(p.id);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
                          : 'bg-slate-50 dark:bg-neutral-800 border border-slate-200/60 dark:border-neutral-750 text-slate-700 dark:text-neutral-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300'
                      }`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{p.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Navigation Views */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Main Dashboards</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onChangeMainView && onChangeMainView('meetings');
                    closeMobileNav();
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition ${
                    mainView === 'meetings'
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-750 text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-500 mb-1" />
                  <span>Meetings</span>
                </button>

                <button
                  onClick={() => {
                    onChangeMainView && onChangeMainView('tasks');
                    closeMobileNav();
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition relative ${
                    mainView === 'tasks'
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-750 text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-indigo-500 mb-1" />
                  <span>Tasks</span>
                  {pendingTasksCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-600 text-white">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onChangeMainView && onChangeMainView('analytics');
                    closeMobileNav();
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition ${
                    mainView === 'analytics'
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-750 text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-500 mb-1" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>

            {/* Quick Intake Actions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">Add & Record</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    closeMobileNav();
                    onOpenNewModalWithTab('upload');
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-750 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-750 transition"
                >
                  <UploadCloud className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="font-medium text-left">Upload Audio</span>
                </button>

                <button
                  onClick={() => {
                    closeMobileNav();
                    onOpenNewModalWithTab('record');
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-750 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-750 transition"
                >
                  <Mic className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium text-left">Record Live</span>
                </button>

                <button
                  onClick={() => {
                    closeMobileNav();
                    onOpenNewModalWithTab('bot');
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-750 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-750 transition"
                >
                  <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-medium text-left">Bot Inviter</span>
                </button>

                <button
                  onClick={() => {
                    closeMobileNav();
                    onOpenNewModalWithTab('transcript');
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-750 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-750 transition"
                >
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-medium text-left">Paste Notes</span>
                </button>
              </div>
            </div>

            {/* Plan & Usage Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-200/80 dark:border-neutral-750 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${isFree ? 'text-slate-400' : 'text-amber-500'}`} />
                <div>
                  <div className="font-bold text-slate-900 dark:text-neutral-100">
                    {currentPlanConfig.name} Plan
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {usageState.meetingsThisMonth} of {currentPlanConfig.monthlyLimit} monthly scribes used
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  closeMobileNav();
                  onOpenPricing();
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition"
              >
                {isFree ? 'Upgrade' : 'Manage'}
              </button>
            </div>

            {/* Secondary Links & Account */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-neutral-800 text-xs">
              <button
                onClick={() => {
                  closeMobileNav();
                  onOpenInvoices();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Invoices & Billing History</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  closeMobileNav();
                  onOpenTemplates();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>Custom Prompt Templates</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  closeMobileNav();
                  onOpenContact();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Support & Feedback</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    closeMobileNav();
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user?.name || user?.email})</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      closeMobileNav();
                      onOpenAuth('login');
                    }}
                    className="py-2 text-center rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      closeMobileNav();
                      onOpenAuth('register');
                    }}
                    className="py-2 text-center rounded-xl bg-indigo-600 text-white font-semibold shadow-xs"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
