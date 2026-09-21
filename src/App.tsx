import React, { useState, useMemo, useEffect } from 'react';
import { Header, PERSONAS } from './components/Header';
import { MeetingSidebar } from './components/MeetingSidebar';
import { MeetingDetail } from './components/MeetingDetail';
import { NewMeetingModal } from './components/NewMeetingModal';
import { PricingModal } from './components/PricingModal';
import { ExportModal } from './components/ExportModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { ContactModal } from './components/ContactModal';
import { InvoicesModal } from './components/InvoicesModal';
import { AuthModal } from './components/AuthModal';
import { ActionItemsHub } from './components/ActionItemsHub';
import { WorkspaceAnalytics } from './components/WorkspaceAnalytics';
import { INITIAL_MEETINGS, PLANS } from './data/sampleMeetings';
import { MeetingRecord, MeetingTemplate, PlanTier, UserUsageState, InvoiceRecord, CalendarEvent, MeetingType } from './types';
import { Zap, Sparkles, Clock, CheckCircle, ShieldCheck, Crown, Mail, FileText, QrCode, HelpCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { 
  saveMeetingToFirestore, 
  deleteMeetingFromFirestore, 
  subscribeToUserMeetings, 
  saveInvoiceToFirestore, 
  subscribeToUserInvoices 
} from './services/firestoreSync';
import { 
  getUserMeetings, 
  saveUserMeetings, 
  filterOutDemoMeetings, 
  purgeLegacyDemoData 
} from './utils/meetingStorage';

export default function App() {
  const { user, isFirebaseAuthenticated } = useAuth();
  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => {
    return getUserMeetings(user?.id);
  });

  const [activeMeetingId, setActiveMeetingId] = useState<string>(() => {
    const initial = getUserMeetings(user?.id);
    return initial.length > 0 ? initial[0].id : '';
  });

  const [selectedPersona, setSelectedPersona] = useState<string>('agency');
  const [activeTemplate, setActiveTemplate] = useState<MeetingTemplate>('client_recap');
  const [mainView, setMainView] = useState<'meetings' | 'tasks' | 'analytics'>('meetings');

  // Usage and Subscription state - starts with clean 0 usage for new users
  const [usageState, setUsageState] = useState<UserUsageState>(() => {
    try {
      const saved = localStorage.getItem('actionscribe_usage');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      currentPlan: 'free',
      meetingsThisMonth: 0,
      minutesSavedTotal: 0,
      activeWorkspace: 'personal',
    };
  });

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('actionscribe_invoices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Count pending action items across all meetings
  const pendingTasksCount = useMemo(() => {
    return meetings.reduce(
      (sum, m) => sum + m.actionItems.filter((a) => !a.completed).length,
      0
    );
  }, [meetings]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newMeetingInitialTab, setNewMeetingInitialTab] = useState<'upload' | 'record' | 'bot' | 'sample' | 'transcript'>('upload');
  const [newMeetingInitialData, setNewMeetingInitialData] = useState<{
    title?: string;
    attendees?: string[];
    meetingUrl?: string;
    type?: MeetingType;
    folder?: string;
    tab?: 'upload' | 'record' | 'bot' | 'sample' | 'transcript';
  } | undefined>(undefined);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'profile'>('login');
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier>('pro');
  const [checkoutCycle, setCheckoutCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleOpenAuth = (mode: 'login' | 'register' | 'profile' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleOpenNewModalWithTab = (tab: 'upload' | 'record' | 'bot' | 'sample' | 'transcript' = 'upload') => {
    setNewMeetingInitialTab(tab);
    setNewMeetingInitialData(undefined);
    setIsNewModalOpen(true);
  };

  const handleJoinAndScribe = (event: CalendarEvent) => {
    setNewMeetingInitialData({
      title: `${event.title} (Live Session)`,
      attendees: event.attendees,
      meetingUrl: event.link,
      type: event.title.toLowerCase().includes('interview')
        ? 'job_interview'
        : event.title.toLowerCase().includes('client') || event.title.toLowerCase().includes('agency')
        ? 'client_call'
        : 'team_sync',
      tab: 'bot',
    });
    setIsNewModalOpen(true);
  };

  // Active meeting object
  const activeMeeting = useMemo(() => {
    if (meetings.length === 0) return undefined;
    return meetings.find((m) => m.id === activeMeetingId) || meetings[0];
  }, [meetings, activeMeetingId]);

  // Sync meetings when user changes (registration, login, logout, account switch)
  useEffect(() => {
    if (isFirebaseAuthenticated && user?.id) return;

    const userMeetings = getUserMeetings(user?.id);
    setMeetings(userMeetings);
    if (userMeetings.length > 0) {
      setActiveMeetingId((curr) => {
        if (!curr || !userMeetings.some((m) => m.id === curr)) {
          return userMeetings[0].id;
        }
        return curr;
      });
    } else {
      setActiveMeetingId('');
    }
  }, [user?.id, isFirebaseAuthenticated]);

  // Sync meetings and invoices in real-time from Firestore when user is authenticated with Firebase
  useEffect(() => {
    if (!isFirebaseAuthenticated || !user?.id) return;

    const unsubMeetings = subscribeToUserMeetings(user.id, (firestoreMeetings) => {
      if (firestoreMeetings) {
        const cleaned = filterOutDemoMeetings(firestoreMeetings);
        setMeetings(cleaned);
        saveUserMeetings(user.id, cleaned);
        if (cleaned.length > 0) {
          setActiveMeetingId((curr) => {
            if (!curr || !cleaned.some((m) => m.id === curr)) {
              return cleaned[0].id;
            }
            return curr;
          });
        } else {
          setActiveMeetingId('');
        }
      }
    });

    const unsubInvoices = subscribeToUserInvoices(user.id, (firestoreInvoices) => {
      if (firestoreInvoices && firestoreInvoices.length > 0) {
        setInvoices(firestoreInvoices);
        try {
          localStorage.setItem('actionscribe_invoices', JSON.stringify(firestoreInvoices));
        } catch (e) {
          console.error(e);
        }
      }
    });

    return () => {
      unsubMeetings();
      unsubInvoices();
    };
  }, [isFirebaseAuthenticated, user?.id]);

  // Handlers with persistent local storage support
  const saveMeetings = (newMeetings: MeetingRecord[]) => {
    const cleaned = filterOutDemoMeetings(newMeetings);
    setMeetings(cleaned);
    saveUserMeetings(user?.id, cleaned);
  };

  const handleUpdateMeeting = (updated: MeetingRecord) => {
    const updatedList = meetings.map((m) => (m.id === updated.id ? updated : m));
    saveMeetings(updatedList);
    if (isFirebaseAuthenticated && user?.id) {
      saveMeetingToFirestore(updated, user.id).catch(() => {});
    }
  };

  const handleDeleteMeeting = (id: string) => {
    const remaining = meetings.filter((m) => m.id !== id);
    saveMeetings(remaining);
    if (activeMeetingId === id) {
      setActiveMeetingId(remaining.length > 0 ? remaining[0].id : '');
    }
    if (isFirebaseAuthenticated) {
      deleteMeetingFromFirestore(id).catch(() => {});
    }
  };

  const handleMeetingCreated = (newMeeting: MeetingRecord) => {
    const updated = [newMeeting, ...meetings];
    saveMeetings(updated);
    setActiveMeetingId(newMeeting.id);
    if (isFirebaseAuthenticated && user?.id) {
      saveMeetingToFirestore(newMeeting, user.id).catch(() => {});
    }
    setUsageState((prev) => {
      const nextUsage = {
        ...prev,
        meetingsThisMonth: prev.meetingsThisMonth + 1,
        minutesSavedTotal: prev.minutesSavedTotal + newMeeting.sentiment.timeSavedMinutes,
      };
      try {
        localStorage.setItem('actionscribe_usage', JSON.stringify(nextUsage));
      } catch (e) {}
      return nextUsage;
    });
  };

  const handleSelectPlan = (newPlan: PlanTier) => {
    setUsageState((prev) => ({
      ...prev,
      currentPlan: newPlan,
      activeWorkspace: newPlan === 'team' ? prev.activeWorkspace : 'personal',
    }));
  };

  const handleUpgradeCheckout = (plan: PlanTier, cycle: 'monthly' | 'annual') => {
    setCheckoutPlan(plan);
    setCheckoutCycle(cycle);
    setIsPricingModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (newInvoice: InvoiceRecord) => {
    // Only update active plan if payment is verified/paid (not pending verification)
    if (newInvoice.status === 'paid') {
      setUsageState((prev) => ({
        ...prev,
        currentPlan: newInvoice.planId,
      }));
    }
    // Append invoice
    setInvoices((prev) => {
      const updated = [newInvoice, ...prev];
      try {
        localStorage.setItem('actionscribe_invoices', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (isFirebaseAuthenticated && user?.id) {
      saveInvoiceToFirestore(newInvoice, user.id).catch(() => {});
    }
  };

  const handleApproveInvoice = (invoiceId: string) => {
    setInvoices((prev) => {
      let approvedPlan: PlanTier | null = null;
      const updated = prev.map((inv) => {
        if (inv.id === invoiceId) {
          approvedPlan = inv.planId;
          return { ...inv, status: 'paid' as const };
        }
        return inv;
      });
      if (approvedPlan) {
        setUsageState((curr) => ({ ...curr, currentPlan: approvedPlan! }));
      }
      try {
        localStorage.setItem('actionscribe_invoices', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== invoiceId);
      try {
        localStorage.setItem('actionscribe_invoices', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleWorkspaceChange = (ws: 'personal' | 'team') => {
    if (ws === 'team' && usageState.currentPlan !== 'team') {
      setIsPricingModalOpen(true);
      return;
    }
    setUsageState((prev) => ({ ...prev, activeWorkspace: ws }));
  };

  const handleSelectPersona = (personaId: string) => {
    setSelectedPersona(personaId);
    if (personaId === 'recruiter') {
      const interviewMeeting = meetings.find((m) => m.type === 'job_interview');
      if (interviewMeeting) setActiveMeetingId(interviewMeeting.id);
    } else if (personaId === 'pm') {
      const teamMeeting = meetings.find((m) => m.type === 'team_sync');
      if (teamMeeting) setActiveMeetingId(teamMeeting.id);
    } else if (personaId === 'agency' || personaId === 'freelancer') {
      const clientMeeting = meetings.find((m) => m.type === 'client_call');
      if (clientMeeting) setActiveMeetingId(clientMeeting.id);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-700 dark:selection:text-indigo-200 transition-colors duration-200">
      {/* Header */}
      <Header
        usageState={usageState}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenNewModal={() => handleOpenNewModalWithTab('upload')}
        onOpenNewModalWithTab={handleOpenNewModalWithTab}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onWorkspaceChange={handleWorkspaceChange}
        selectedPersona={selectedPersona}
        onSelectPersona={handleSelectPersona}
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenInvoices={() => setIsInvoicesModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        mainView={mainView}
        onChangeMainView={setMainView}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full flex flex-col min-h-0">
        {mainView === 'meetings' && (
          <div className="flex-1 w-full flex flex-col lg:flex-row min-h-0">
            {/* Sidebar */}
            <MeetingSidebar
              meetings={meetings}
              activeMeetingId={activeMeeting?.id || ''}
              onSelectMeeting={(id) => {
                setActiveMeetingId(id);
              }}
              onOpenNewModal={() => {
                setNewMeetingInitialData(undefined);
                setIsNewModalOpen(true);
              }}
              onOpenPricing={() => setIsPricingModalOpen(true)}
              usageState={usageState}
              onJoinAndScribe={handleJoinAndScribe}
              userId={user?.id}
            />

            {/* Meeting Detail Canvas */}
            <section className="flex-1 p-4 sm:p-6 min-w-0 overflow-y-auto">
              {activeMeeting ? (
                <MeetingDetail
                  meeting={activeMeeting}
                  onUpdateMeeting={handleUpdateMeeting}
                  onDeleteMeeting={handleDeleteMeeting}
                  onOpenExport={() => setIsExportModalOpen(true)}
                />
              ) : (
                <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-2xs border border-indigo-100 dark:border-indigo-900/50">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                    No meetings yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 max-w-sm leading-relaxed">
                    Upload an audio recording, record live directly in your browser, or schedule an upcoming meeting to generate AI summaries and action items.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
                    <button
                      id="empty-state-upload-btn"
                      onClick={() => handleOpenNewModalWithTab('upload')}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upload Audio File</span>
                    </button>
                    <button
                      id="empty-state-record-btn"
                      onClick={() => handleOpenNewModalWithTab('record')}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Record Live</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {mainView === 'tasks' && (
          <section className="flex-1 p-4 sm:p-6 min-w-0 overflow-y-auto max-w-7xl mx-auto w-full">
            <ActionItemsHub
              meetings={meetings}
              onUpdateMeeting={handleUpdateMeeting}
              onNavigateToMeeting={(id) => {
                setActiveMeetingId(id);
                setMainView('meetings');
              }}
            />
          </section>
        )}

        {mainView === 'analytics' && (
          <section className="flex-1 p-4 sm:p-6 min-w-0 overflow-y-auto max-w-7xl mx-auto w-full">
            <WorkspaceAnalytics
              meetings={meetings}
              usageState={usageState}
              onNavigateToMeeting={(id) => {
                setActiveMeetingId(id);
                setMainView('meetings');
              }}
              onOpenPricing={() => setIsPricingModalOpen(true)}
            />
          </section>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 px-4 sm:px-6 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-neutral-300">ActionScribe</span>
          <span>•</span>
          <span>AI Meeting & Interview Intelligence</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Pricing (UPI / PayPal)
          </button>
          <span>•</span>
          <button
            id="footer-support-btn"
            onClick={() => setIsContactModalOpen(true)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Support & Feedback</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <NewMeetingModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setNewMeetingInitialData(undefined);
        }}
        onMeetingCreated={handleMeetingCreated}
        currentPlan={usageState.currentPlan}
        selectedPersona={selectedPersona}
        initialTab={newMeetingInitialData?.tab || newMeetingInitialTab}
        initialData={newMeetingInitialData}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPlan={usageState.currentPlan}
        onSelectPlan={handleSelectPlan}
        onUpgradeCheckout={handleUpgradeCheckout}
        onOpenInvoices={() => setIsInvoicesModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        selectedPlan={checkoutPlan}
        billingCycle={checkoutCycle}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenContact={() => {
          setIsCheckoutModalOpen(false);
          setIsContactModalOpen(true);
        }}
      />

      <InvoicesModal
        isOpen={isInvoicesModalOpen}
        onClose={() => setIsInvoicesModalOpen(false)}
        invoices={invoices}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onApproveInvoice={handleApproveInvoice}
        onDeleteInvoice={handleDeleteInvoice}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {activeMeeting && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          meeting={activeMeeting}
          currentPlan={usageState.currentPlan}
          onOpenPricing={() => {
            setIsExportModalOpen(false);
            setIsPricingModalOpen(true);
          }}
        />
      )}

      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentPlan={usageState.currentPlan}
        onOpenPricing={() => {
          setIsTemplateModalOpen(false);
          setIsPricingModalOpen(true);
        }}
        activeTemplate={activeTemplate}
        onSelectTemplate={(t) => setActiveTemplate(t)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenInvoices={() => setIsInvoicesModalOpen(true)}
      />
    </div>
  );
}
