import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Copy, 
  Check, 
  Star, 
  Briefcase, 
  ThumbsUp 
} from 'lucide-react';
import { CandidateScorecard } from '../types';

interface CandidateScorecardViewProps {
  scorecard: CandidateScorecard;
}

export const CandidateScorecardView: React.FC<CandidateScorecardViewProps> = ({ scorecard }) => {
  const [copied, setCopied] = useState(false);

  const getRecommendationBadge = (rec: CandidateScorecard['recommendation']) => {
    switch (rec) {
      case 'strong_hire':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" /> Strong Hire
          </span>
        );
      case 'hire':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5" /> Hire
          </span>
        );
      case 'lean_no':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Lean No
          </span>
        );
      case 'strong_no':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Strong No
          </span>
        );
    }
  };

  const handleCopy = () => {
    const text = `Candidate: ${scorecard.candidateName} (${scorecard.role})
Recommendation: ${scorecard.recommendation.toUpperCase()} (Overall: ${scorecard.overallScore}/10)
Scores: Technical: ${scorecard.technicalScore}/10 | Communication: ${scorecard.communicationScore}/10 | Cultural Fit: ${scorecard.culturalFitScore}/10

Key Strengths:
${scorecard.keyStrengths.map((s) => `• ${s}`).join('\n')}

Areas of Concern:
${scorecard.areasOfConcern.map((c) => `• ${c}`).join('\n')}

Salary Expectation: ${scorecard.salaryExpectation || 'Not specified'}

Hiring Committee Summary:
${scorecard.interviewerNotes}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 p-5 shadow-xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-neutral-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Recruiter & Hiring Scorecard
            </h3>
            {getRecommendationBadge(scorecard.recommendation)}
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Standardized evaluation matrix auto-extracted from interview audio.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy ATS Scorecard'}</span>
        </button>
      </div>

      {/* Candidate Overview & Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Candidate & Role</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-neutral-100 mt-1">{scorecard.candidateName}</div>
          <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 truncate">{scorecard.role}</div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Overall Score</span>
            <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
            {scorecard.overallScore} <span className="text-xs text-slate-400 dark:text-neutral-500 font-normal">/ 10</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${(scorecard.overallScore / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Technical Mastery</div>
          <div className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
            {scorecard.technicalScore} <span className="text-xs text-slate-400 dark:text-neutral-500 font-normal">/ 10</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full"
              style={{ width: `${(scorecard.technicalScore / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Cultural & Comms</div>
          <div className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-1">
            {scorecard.culturalFitScore} <span className="text-xs text-slate-400 dark:text-neutral-500 font-normal">/ 10</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full"
              style={{ width: `${(scorecard.culturalFitScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-slate-50 dark:bg-neutral-850 p-4 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2.5">
            <CheckCircle className="w-4 h-4" /> Demonstrated Key Strengths
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
            {scorecard.keyStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="bg-slate-50 dark:bg-neutral-850 p-4 rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4" /> Potential Gaps / Inquiries
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
            {scorecard.areasOfConcern.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compensation & Notes */}
      <div className="p-4 bg-slate-50 dark:bg-neutral-850 rounded-lg border border-slate-200 dark:border-neutral-800 space-y-2">
        {scorecard.salaryExpectation && (
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-neutral-300 pb-2 border-b border-slate-200 dark:border-neutral-800">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-neutral-400 font-medium">Stated Comp Expectation:</span>
            <span className="font-semibold text-slate-900 dark:text-neutral-100">{scorecard.salaryExpectation}</span>
          </div>
        )}

        <div className="text-xs text-slate-700 dark:text-neutral-300">
          <span className="text-slate-500 dark:text-neutral-400 font-semibold block mb-1">Hiring Committee Synthesis:</span>
          <p className="leading-relaxed italic text-slate-800 dark:text-neutral-200">{scorecard.interviewerNotes}</p>
        </div>
      </div>
    </div>
  );
};
