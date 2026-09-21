import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Check, 
  Lock, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Briefcase 
} from 'lucide-react';
import { MeetingTemplate, PlanTier } from '../types';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onOpenPricing: () => void;
  activeTemplate: MeetingTemplate;
  onSelectTemplate: (t: MeetingTemplate) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onOpenPricing,
  activeTemplate,
  onSelectTemplate,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string; name: string; desc: string }>>([
    {
      id: 'custom-1',
      name: 'Agency Fixed-Scope Change Order Log',
      desc: 'Specifically extracts scope expansions, additional billable hours, and client verbal approvals.',
    },
  ]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  if (!isOpen) return null;

  const isProOrTeam = currentPlan === 'pro' || currentPlan === 'team';

  const defaultTemplates: Array<{
    id: MeetingTemplate;
    name: string;
    badge: string;
    description: string;
    structure: string[];
    isProOnly?: boolean;
  }> = [
    {
      id: 'client_recap',
      name: 'Client Scope & Retainer Recap',
      badge: 'Agency & Freelancer',
      description: 'Ideal for kickoff calls, deliverables milestones, and client agreements.',
      structure: ['Executive Summary', 'Approved Commercial Scope', 'Budget & Payment Milestones', 'Client Next Steps'],
    },
    {
      id: 'candidate_scorecard',
      name: 'Job Interview Scorecard & Rubric',
      badge: 'Recruiter & Hiring',
      description: 'Generates candidate hire/no-hire recommendations, technical scores, and ATS synthesis.',
      structure: ['Role & Competency Rubric', 'Technical Mastery Rating', 'Strengths & Concerns', 'Hiring Recommendation'],
    },
    {
      id: 'action_focused',
      name: 'Agile Sprint & Blocker Matrix',
      badge: 'Project Manager',
      description: 'Zero fluff. Highlights engineering blockers, scheduled releases, and assigned ticket owners.',
      structure: ['Release Status', 'Key Decisions', 'Blocked Tasks & Owners', 'Sprint Deadlines'],
    },
    {
      id: 'executive',
      name: 'Executive C-Level Brief',
      badge: 'Pro Template',
      description: 'High-level synthesis for senior executives, board members, and busy stakeholders.',
      structure: ['Strategic Objectives', 'Major Decisions', 'Financial / Timeline Impact', 'Critical Path Deliverables'],
      isProOnly: true,
    },
    {
      id: 'standard',
      name: 'Standard 4-Block Overview',
      badge: 'Universal',
      description: 'Balanced recap suitable for team meetings, partner brainstorms, and general calls.',
      structure: ['Discussion Summary', 'Key Decisions', 'Action Items', 'Follow-up Email Draft'],
    },
  ];

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    setCustomTemplates([
      ...customTemplates,
      {
        id: `ct-${Date.now()}`,
        name: newTemplateName.trim(),
        desc: customPrompt.trim() || 'Custom user prompt template.',
      },
    ]);
    setNewTemplateName('');
    setCustomPrompt('');
    setShowAddCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                Summary Templates & AI Instructions
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Customize how ActionScribe formats meeting takeaways for your specific workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!isProOrTeam && (
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Pro Plan Feature:</strong> Custom summary templates and executive brief layouts unlock on Pro ($7/mo or ₹499/mo).
                </span>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] whitespace-nowrap shadow-xs"
              >
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Built-in Templates */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
              Built-in Summary Blueprints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {defaultTemplates.map((t) => {
                const isSelected = activeTemplate === t.id;
                const locked = t.isProOnly && !isProOrTeam;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (!locked) onSelectTemplate(t.id);
                    }}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/40 border-indigo-500 dark:bg-neutral-850 dark:border-indigo-500 shadow-md shadow-indigo-500/10'
                        : locked
                        ? 'bg-slate-50/60 border-slate-200 dark:bg-neutral-900/50 dark:border-neutral-800/80 opacity-70'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-neutral-850 dark:hover:bg-neutral-800 dark:border-neutral-800 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
                          {t.name}
                        </span>
                        {locked ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        ) : isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 dark:text-neutral-400 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            {t.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed mb-3">
                        {t.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap gap-1">
                      {t.structure.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Templates Section (Pro/Team) */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Custom Team Templates</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-1.5 rounded font-bold">
                  PRO
                </span>
              </h3>

              <button
                onClick={() => {
                  if (!isProOrTeam) onOpenPricing();
                  else setShowAddCustom(!showAddCustom);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Create Custom Blueprint
              </button>
            </div>

            {showAddCustom && isProOrTeam && (
              <form onSubmit={handleSaveCustom} className="p-4 bg-slate-50 dark:bg-neutral-850 rounded-xl border border-slate-200 dark:border-neutral-700 space-y-3">
                <div>
                  <label className="text-xs text-slate-700 dark:text-neutral-300 block mb-1 font-medium">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Venture Capital Due Diligence Scribe"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 dark:text-neutral-300 block mb-1 font-medium">Prompt Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the AI should structure notes, what metrics to extract, etc."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {customTemplates.map((ct) => (
                <div
                  key={ct.id}
                  className="p-3 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-neutral-200">{ct.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">{ct.desc}</div>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
