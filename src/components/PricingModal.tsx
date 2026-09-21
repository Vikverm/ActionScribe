import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Clock, 
  Building2,
  FileText,
  Mail,
  Coins,
  Zap,
  TrendingDown,
  Bookmark,
  Sparkles,
  MessageSquare,
  ListTodo,
  BarChart3,
  Bot,
  Layers,
  Minus,
  ShieldCheck
} from 'lucide-react';
import { PlanTier } from '../types';
import logoImage from '../assets/images/actionscribe_clean_logo_1789724989077.jpg';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
  onUpgradeCheckout: (plan: PlanTier, cycle: 'monthly' | 'annual') => void;
  onOpenInvoices: () => void;
  onOpenContact: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
  onUpgradeCheckout,
  onOpenInvoices,
  onOpenContact,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [bottomView, setBottomView] = useState<'matrix' | 'benchmark'>('matrix');

  if (!isOpen) return null;

  const planTiers: Array<{
    id: PlanTier;
    name: string;
    priceUSD: string;
    priceINR: string;
    period: string;
    billingNoteUSD: string;
    billingNoteINR: string;
    savingsBadge?: string;
    subhead: string;
    vsCompetitor: string;
    badge?: string;
    features: string[];
    highlight?: boolean;
    buttonLabel: string;
  }> = [
    {
      id: 'free',
      name: 'Free Starter',
      priceUSD: '$0',
      priceINR: '₹0',
      period: 'forever',
      billingNoteUSD: 'Free forever account',
      billingNoteINR: 'Free forever account',
      subhead: 'For personal trials & testing',
      vsCompetitor: 'Full 25 min meetings (Notta cuts free calls at 3-5 mins!)',
      features: [
        '5 meetings / month (up to 25 min each)',
        'Full executive summaries & key decisions',
        'Standard action items checklist & assignees',
        'In-browser live microphone recording & upload',
        'Clean Markdown & plain text export',
        'Single personal workspace',
      ],
      buttonLabel: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
    },
    {
      id: 'starter',
      name: 'Starter Solo',
      priceUSD: billingCycle === 'annual' ? '$3.50' : '$5',
      priceINR: billingCycle === 'annual' ? '₹199' : '₹299',
      period: '/month',
      billingNoteUSD: billingCycle === 'annual' ? 'Billed annually ($42/yr)' : 'Billed monthly ($5/mo)',
      billingNoteINR: billingCycle === 'annual' ? 'Billed annually (₹2,388/yr)' : 'Billed monthly (₹299/mo)',
      savingsBadge: billingCycle === 'annual' ? 'Save 30%' : '70% vs Otter',
      subhead: 'For freelancers & solo consultants',
      vsCompetitor: '70% cheaper than Otter ($16.99/mo) with full Chat & Tasks',
      badge: 'Budget Pick',
      features: [
        '25 meetings / month (up to 45 min each)',
        'Central Action Items Hub (priorities & deadlines)',
        'AI Meeting Chat Assistant (query meeting memory)',
        'Multilingual translation (11+ global languages)',
        'Direct Notion Markdown export & Email composer',
        'Real-time multi-device cloud sync',
      ],
      buttonLabel: currentPlan === 'starter' 
        ? 'Current Plan' 
        : billingCycle === 'annual'
        ? (currency === 'INR' ? 'Get Starter (₹199/mo)' : 'Get Starter ($3.50/mo)')
        : (currency === 'INR' ? 'Get Starter (₹299/mo)' : 'Get Starter ($5/mo)'),
    },
    {
      id: 'pro',
      name: 'Pro Scribe',
      priceUSD: billingCycle === 'annual' ? '$7.50' : '$10',
      priceINR: billingCycle === 'annual' ? '₹449' : '₹599',
      period: '/month',
      billingNoteUSD: billingCycle === 'annual' ? 'Billed annually ($90/yr)' : 'Billed monthly ($10/mo)',
      billingNoteINR: billingCycle === 'annual' ? 'Billed annually (₹5,388/yr)' : 'Billed monthly (₹599/mo)',
      savingsBadge: billingCycle === 'annual' ? 'Save 25%' : '3x Notta Capacity',
      subhead: 'For recruiters, PMs & executives',
      vsCompetitor: '3x Notta Pro capacity (5,400m vs 1,800m) + Scorecards & Bot',
      badge: 'Most Popular',
      highlight: true,
      features: [
        '60 meetings / month (up to 90 min each)',
        'Unlimited AI Meeting Chat & Transcript Memory',
        'Candidate Interview Scorecards & Rubrics',
        'Custom Information & Schema Extraction Engine',
        'Live Bot Inviter (Zoom, Google Meet, Teams)',
        '5 Multi-Role Personas (Agency, PM, Recruiter, etc.)',
        'Workspace Analytics & Time Saved Tracker',
        '1-Click Export to Notion, Slack & Styled PDF',
      ],
      buttonLabel: currentPlan === 'pro' 
        ? 'Current Plan' 
        : billingCycle === 'annual'
        ? (currency === 'INR' ? 'Upgrade Pro (₹449/mo)' : 'Upgrade Pro ($7.50/mo)')
        : (currency === 'INR' ? 'Upgrade Pro (₹599/mo)' : 'Upgrade Pro ($10/mo)'),
    },
    {
      id: 'team',
      name: 'Team & Agency',
      priceUSD: billingCycle === 'annual' ? '$18' : '$24',
      priceINR: billingCycle === 'annual' ? '₹1,099' : '₹1,499',
      period: '/month',
      billingNoteUSD: billingCycle === 'annual' ? 'Billed annually ($216/yr)' : 'Billed monthly ($24/mo)',
      billingNoteINR: billingCycle === 'annual' ? 'Billed annually (₹13,188/yr)' : 'Billed monthly (₹1,499/mo)',
      savingsBadge: billingCycle === 'annual' ? 'Save 25%' : '5 Seats Included',
      subhead: 'For agency founders & product teams',
      vsCompetitor: '5 team seats included (Otter/Notta charge $100-$150/mo for 5 seats)',
      badge: '5 Seats Included',
      features: [
        '120 meetings / month (up to 180 min each)',
        '5 Team Seats Included (saves $100+/mo vs Otter)',
        'Collaborative Action Items Hub with team assignment',
        'Full CRM Export (HubSpot & Salesforce)',
        'Custom Agency Prompts, Brand Guidelines & Rubrics',
        'Shared team workspace & synced team library',
        'Priority Gemini 3.8 Flash pipeline & GST/VAT Invoices',
      ],
      buttonLabel: currentPlan === 'team' 
        ? 'Current Plan' 
        : billingCycle === 'annual'
        ? (currency === 'INR' ? 'Upgrade Team (₹1,099/mo)' : 'Upgrade Team ($18/mo)')
        : (currency === 'INR' ? 'Upgrade Team (₹1,499/mo)' : 'Upgrade Team ($24/mo)'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors">
          
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-neutral-800 relative bg-slate-50/70 dark:bg-neutral-900 text-center">
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-neutral-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo Brand Header & Value Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                <div className="w-4 h-4 rounded-md overflow-hidden bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 flex-shrink-0 p-0.5">
                  <img src={logoImage} alt="ActionScribe Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-[11px] text-slate-900 dark:text-neutral-100 font-display">ActionScribe</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Listen • Scribe • Act</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Lowest Price Guaranteed • Save up to 85%</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>7-Day Money-Back Guarantee • Zero Risk</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-neutral-100 tracking-tight">
              Simple, Ultra-Affordable Pricing Plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-xl mx-auto mt-1">
              Top-tier meeting intelligence, candidate rubrics, and action checklists at a fraction of legacy tool costs.
            </p>

            {/* Controls: Billing Cycle + Currency Switch */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3.5">
              {/* Monthly / Annual Toggle */}
              <div className="inline-flex items-center bg-slate-200/80 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-neutral-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Monthly Plan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <span>Annual Saver</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    billingCycle === 'annual' 
                      ? 'bg-indigo-700 text-indigo-100' 
                      : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    Save up to 43%
                  </span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="inline-flex items-center bg-slate-200/80 dark:bg-neutral-800 p-1 rounded-xl text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 px-1.5 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-neutral-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('INR')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    currency === 'INR'
                      ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-neutral-100 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  INR (₹ UPI)
                </button>
              </div>
            </div>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {planTiers.map((tier) => {
              const isCurrent = currentPlan === tier.id;
              const displayPrice = currency === 'INR' ? tier.priceINR : tier.priceUSD;
              const billingNote = currency === 'INR' ? tier.billingNoteINR : tier.billingNoteUSD;

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition relative ${
                    tier.highlight
                      ? 'bg-indigo-50/50 dark:bg-neutral-800/90 border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/80 hover:border-slate-300 dark:hover:border-neutral-600'
                  }`}
                >
                  {tier.badge && (
                    <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap ${
                      tier.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-100 dark:bg-neutral-700'
                    }`}>
                      {tier.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100">
                        {tier.name}
                      </h3>
                      {tier.id === 'free' ? (
                        <Clock className="w-4 h-4 text-slate-400" />
                      ) : tier.id === 'starter' ? (
                        <Zap className="w-4 h-4 text-emerald-500" />
                      ) : tier.id === 'pro' ? (
                        <Crown className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-tight min-h-[28px]">{tier.subhead}</p>

                    {/* Price Block */}
                    <div className="mt-2.5 pb-2.5 border-b border-slate-200 dark:border-neutral-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 font-display">
                          {displayPrice}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400">{tier.period}</span>
                        {tier.savingsBadge && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">
                            {tier.savingsBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                        {billingNote}
                      </div>
                    </div>

                    {/* Competitor comparison callout */}
                    <div className="mt-2 text-[10.5px] text-indigo-700 dark:text-indigo-300 font-medium leading-snug">
                      {tier.vsCompetitor}
                    </div>

                    {/* Features list */}
                    <ul className="mt-2.5 space-y-1.5 text-[11.5px] text-slate-700 dark:text-neutral-300">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-neutral-800/80">
                    <button
                      id={`select-plan-${tier.id}`}
                      onClick={() => {
                        if (tier.id === 'free') {
                          onSelectPlan('free');
                          onClose();
                        } else {
                          onClose();
                          onUpgradeCheckout(tier.id, billingCycle);
                        }
                      }}
                      disabled={isCurrent}
                      className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-400 cursor-default border border-slate-200 dark:border-neutral-700'
                          : tier.highlight
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : tier.buttonLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ATTRACTIVE DUAL-VIEW SECTION: FEATURE MATRIX OR COMPETITOR BENCHMARK */}
          <div className="px-4 sm:px-5 pb-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden p-4 sm:p-5">
              
              {/* Header with Switcher Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-800/80 rounded-xl">
                  <button
                    type="button"
                    id="pricing-tab-matrix"
                    onClick={() => setBottomView('matrix')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      bottomView === 'matrix'
                        ? 'bg-white dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plan Features Matrix</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">
                      All New Features
                    </span>
                  </button>

                  <button
                    type="button"
                    id="pricing-tab-benchmark"
                    onClick={() => setBottomView('benchmark')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      bottomView === 'benchmark'
                        ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Competitor Benchmark</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">
                      Save 85%
                    </span>
                  </button>
                </div>

                {/* Subtitle / Right Pill */}
                <div className="flex items-center gap-2">
                  {bottomView === 'matrix' ? (
                    <span className="text-xs text-slate-500 dark:text-neutral-400">
                      Transparent breakdown of all limits, AI tools & exports
                    </span>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold shadow-2xs">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Save up to 85% vs Otter & Notta</span>
                    </div>
                  )}
                </div>
              </div>

              {/* VIEW 1: FULL PLAN FEATURE MATRIX (Categorized breakdown of all new features) */}
              {bottomView === 'matrix' && (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-200 font-bold text-[11px] bg-slate-50/50 dark:bg-neutral-850/50">
                        <th className="py-2.5 px-3 w-1/3">Feature Category</th>
                        <th className="py-2.5 px-3 text-center">Free Starter</th>
                        <th className="py-2.5 px-3 text-center">Starter Solo</th>
                        <th className="py-2.5 px-3 text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20">
                          Pro Scribe (Popular)
                        </th>
                        <th className="py-2.5 px-3 text-center">Team & Agency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                      {/* Section 1: Meeting Limits & Intake */}
                      <tr className="bg-slate-100/60 dark:bg-neutral-800/60 font-bold text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                        <td colSpan={5} className="py-1.5 px-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Meeting Quota & Audio Intake</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Monthly Meeting Quota</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-neutral-400 font-semibold">5 calls / mo</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300 font-semibold">25 calls / mo</td>
                        <td className="py-2 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10">60 calls (5,400m)</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-neutral-100">120 calls / mo</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Max Duration per Meeting</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-neutral-400">25 mins (Fair use)</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">45 mins</td>
                        <td className="py-2 px-3 text-center font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10">90 mins</td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-900 dark:text-neutral-100">180 mins (3 Hours)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Browser Live Audio Recording & Upload</td>
                        <td className="py-2 px-3 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                        <td className="py-2 px-3 text-center bg-indigo-50/20 dark:bg-indigo-950/10"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <span>Auto Bot Inviter (Zoom, Meet, Teams)</span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Included</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Included</td>
                      </tr>

                      {/* Section 2: Newly Added Intelligence Features */}
                      <tr className="bg-slate-100/60 dark:bg-neutral-800/60 font-bold text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                        <td colSpan={5} className="py-1.5 px-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Advanced Intelligence & New Features</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                            <span>Central Action Items Hub</span>
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 dark:text-neutral-400">Basic single list</td>
                        <td className="py-2 px-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓ Priorities & Due Dates</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Cross-Meeting Matrix</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Team Assignee Matrix</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                            <span>AI Meeting Chat Assistant</span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">50 Queries / mo</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Unlimited Chat Memory</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Unlimited Team Chat</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-purple-500" />
                            <span>Custom Information Extraction Engine</span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Unlimited JSON Schemas</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Agency Custom Schemas</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Candidate Interview Scorecards & Rubrics</span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Hire/Reject & Competencies</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Team Hiring Consensus</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span>Multi-Role Personas (Agency, PM, Recruiter, Client)</span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 dark:text-neutral-400">1 Standard</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">2 Personas</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ All 5 Personas</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ All 5 + Custom Studio</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Workspace Analytics & Time Saved Tracker</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[9px] font-bold">New</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">Basic Totals</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Full Productivity Ratios</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Team Workspace Analytics</td>
                      </tr>

                      {/* Section 3: Integrations & Collaboration */}
                      <tr className="bg-slate-100/60 dark:bg-neutral-800/60 font-bold text-[10.5px] uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                        <td colSpan={5} className="py-1.5 px-3 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Exports, Team Collaboration & Invoicing</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Notion Markdown & Slack Export</td>
                        <td className="py-2 px-3 text-center text-slate-400 dark:text-neutral-500">Text only</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">Notion Only</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Notion + Slack + PDF</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Notion + Slack + PDF</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">CRM Export (HubSpot & Salesforce)</td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center bg-indigo-50/20 dark:bg-indigo-950/10"><Minus className="w-3.5 h-3.5 text-slate-300 dark:text-neutral-600 mx-auto" /></td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">✓ Direct Sync Included</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Team Seats & Multi-User Access</td>
                        <td className="py-2 px-3 text-center text-slate-500 dark:text-neutral-400">1 Seat</td>
                        <td className="py-2 px-3 text-center text-slate-500 dark:text-neutral-400">1 Seat</td>
                        <td className="py-2 px-3 text-center text-slate-500 dark:text-neutral-400 bg-indigo-50/20 dark:bg-indigo-950/10">1 Seat</td>
                        <td className="py-2 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">5 Seats Included (Free)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-neutral-200">Firestore Cloud Sync & Invoicing</td>
                        <td className="py-2 px-3 text-center text-slate-600 dark:text-neutral-400">Cloud Sync</td>
                        <td className="py-2 px-3 text-center text-slate-700 dark:text-neutral-300">Cloud Sync</td>
                        <td className="py-2 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400 bg-indigo-50/20 dark:bg-indigo-950/10">✓ Instant PDF Tax Invoice</td>
                        <td className="py-2 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">✓ Instant GST/VAT Invoice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW 2: MARKET BENCHMARK COMPARISON TABLE */}
              {bottomView === 'benchmark' && (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-200 font-bold text-[11px] bg-slate-50/50 dark:bg-neutral-850/50">
                        <th className="py-2.5 px-3">Meeting AI Platform</th>
                        <th className="py-2.5 px-3">Annual Price</th>
                        <th className="py-2.5 px-3">Monthly Price</th>
                        <th className="py-2.5 px-3">Starter Calls</th>
                        <th className="py-2.5 px-3">Cost / 100 Mins</th>
                        <th className="py-2.5 px-3">AI Features & Exports</th>
                        <th className="py-2.5 px-3 text-right">User Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                      {/* ActionScribe AI (Our Platform) */}
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/50 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-neutral-100">ActionScribe AI</span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider">
                              OUR PLATFORM
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm">$3.50 – $7.50/mo</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-neutral-200">
                          $5.00 – $10.00/mo
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">25 – 60 calls (5,400m)</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                            $0.18
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-neutral-300 text-[11px] font-medium">
                          AI Chat, Action Hub, Scorecards, Extraction Engine, 5 Free Seats
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                            BEST VALUE & 3X CAPACITY
                          </span>
                        </td>
                      </tr>

                      {/* Notta.ai */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-neutral-850/30 transition text-slate-600 dark:text-neutral-300">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-neutral-100">
                          Notta.ai
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-neutral-200">
                          $13.99/mo
                        </td>
                        <td className="py-3 px-3">
                          $27.00/mo
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400">
                          1,800 mins (strict 3-5m free cutoff)
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">$1.50 (8x higher)</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400 text-[11px]">
                          Business charges $29.99/seat/mo ($60/mo min)
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            HIGH COST / SEAT
                          </span>
                        </td>
                      </tr>

                      {/* Otter.ai */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-neutral-850/30 transition text-slate-600 dark:text-neutral-300">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-neutral-100">
                          Otter.ai
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-neutral-200">
                          $10.00/mo
                        </td>
                        <td className="py-3 px-3">
                          $16.99/mo
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400">
                          300 mins (approx. 5 calls)
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">$3.40 (12x higher)</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400 text-[11px]">
                          Basic transcript only (no candidate rubrics or CRM)
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            EXPENSIVE ENTRY
                          </span>
                        </td>
                      </tr>

                      {/* Fireflies.ai */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-neutral-850/30 transition text-slate-600 dark:text-neutral-300">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-neutral-100">
                          Fireflies.ai
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-neutral-200">
                          $10.00/mo
                        </td>
                        <td className="py-3 px-3">
                          $18.00/mo
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400">
                          Add-on credits needed for AI
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">$3.60 (13x higher)</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400 text-[11px]">
                          Requires paid credits for action items & custom apps
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            HIGH BASE PRICING
                          </span>
                        </td>
                      </tr>

                      {/* Fathom / tl;dv */}
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-neutral-850/30 transition text-slate-600 dark:text-neutral-300">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-neutral-100">
                          Fathom / tl;dv
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-neutral-200">
                          $15.00/mo
                        </td>
                        <td className="py-3 px-3">
                          $19.00/mo
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400">
                          Basic transcription only (no rubrics)
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">$3.80 (14x higher)</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-neutral-400 text-[11px]">
                          Basic call recording (no scorecards or direct CRM)
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            HIGH PRICING
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Footnote Line */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>ActionScribe plans include AI Meeting Chat, Central Action Items Hub, Candidate Scorecards, and Custom Extraction.</span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-neutral-500">
                  *Public pricing data audited against competitor standard plans.
                </div>
              </div>

            </div>
          </div>

          {/* Clean Slim Footer */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50/90 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-neutral-400">
            <div>
              <span>Supported: <strong>Instant UPI QR</strong> (<code className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">9711040665@ptsbi</code>) & <strong>PayPal</strong>. • <strong className="text-emerald-700 dark:text-emerald-400">100% 7-Day Money-Back Guarantee</strong> on all plans.</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="pricing-open-invoices-btn"
                onClick={() => {
                  onClose();
                  onOpenInvoices();
                }}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </button>

              <button
                type="button"
                id="pricing-open-contact-btn"
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact: vikasverm48472@gmail.com</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
