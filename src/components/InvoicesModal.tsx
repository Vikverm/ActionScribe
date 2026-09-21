import React from 'react';
import { 
  X, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Check, 
  Zap, 
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { InvoiceRecord } from '../types';
import { generateInvoicePDF } from '../utils/pdfInvoice';

interface InvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  onOpenPricing: () => void;
  onOpenContact: () => void;
  onApproveInvoice?: (id: string) => void;
  onDeleteInvoice?: (id: string) => void;
}

export const InvoicesModal: React.FC<InvoicesModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onOpenPricing,
  onOpenContact,
  onApproveInvoice,
  onDeleteInvoice,
}) => {
  if (!isOpen) return null;

  const pendingCount = invoices.filter((i) => i.status === 'pending_verification').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                Billing & PDF Invoices
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Download verified tax invoices and audit settlement records.
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Pending Verification Notice Banner */}
          {pendingCount > 0 && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{pendingCount} UPI Reference Awaiting Settlement Verification</span>
              </div>
              <p className="text-amber-700/90 dark:text-amber-400/90 text-[11px] leading-relaxed">
                To prevent fraud, UPI subscriptions require matching the 12-digit UTR against merchant SBI credits (<code className="font-semibold">9711040665@ptsbi</code>). Once matched, click <strong>"Verify & Activate Plan"</strong> below to grant full plan privileges.
              </p>
            </div>
          )}

          {invoices.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-neutral-700">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                  No Payment Invoices Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  When you upgrade using UPI (ID: <code className="font-semibold text-slate-700 dark:text-neutral-300">9711040665@ptsbi</code>) or PayPal, your official tax receipts and downloadable PDFs appear here.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="upgrade-from-invoices-btn"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>View Plans & Upgrade</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 pb-1">
                <span>{invoices.length} Payment {invoices.length === 1 ? 'Record' : 'Records'} Found</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1">
                  Merchant: <strong className="text-slate-700 dark:text-neutral-300">vikasverm48472@gmail.com</strong>
                </span>
              </div>

              {invoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isPending = inv.status === 'pending_verification';

                return (
                  <div
                    key={inv.id}
                    className={`p-4 rounded-xl border transition ${
                      isPending
                        ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/40'
                        : 'bg-slate-50 dark:bg-neutral-800/70 border-slate-200 dark:border-neutral-700/80 hover:border-slate-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-neutral-100">
                            {inv.id}
                          </span>
                          
                          {isPaid ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> PAID & ACTIVE
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> PENDING VERIFICATION
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300">
                              REJECTED
                            </span>
                          )}

                          <span className="text-xs text-slate-400 dark:text-neutral-500">•</span>
                          <span className="text-xs text-slate-500 dark:text-neutral-400">{inv.date}</span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                          ActionScribe {inv.planName} ({inv.billingCycle === 'annual' ? 'Annual Subscription' : 'Monthly Subscription'})
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-neutral-400">
                          <span>Client: <strong className="text-slate-700 dark:text-neutral-300">{inv.clientName}</strong></span>
                          <span>Email: <span className="text-slate-600 dark:text-neutral-400">{inv.clientEmail}</span></span>
                          <span>Method: <strong className="uppercase text-slate-700 dark:text-neutral-300">{inv.paymentMethod}</strong></span>
                          <span>Ref / UTR: <code className="font-mono font-semibold text-slate-700 dark:text-neutral-300">{inv.paymentRef}</code></span>
                        </div>

                        {isPending && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1">
                            Awaiting verification against SBI Payee (9711040665@ptsbi). Plan unlocks upon settlement approval.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-neutral-700/80">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-display">
                            {inv.paymentMethod === 'upi'
                              ? `₹${inv.amountINR.toLocaleString('en-IN')}`
                              : `$${inv.amountUSD.toFixed(2)} USD`}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-neutral-500">
                            {inv.paymentMethod === 'upi' ? `≈ $${inv.amountUSD} USD` : `≈ ₹${inv.amountINR} INR`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Approve action for pending UPI */}
                          {isPending && onApproveInvoice && (
                            <button
                              type="button"
                              onClick={() => onApproveInvoice(inv.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs transition"
                              title="Verify against bank credits and activate plan"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify & Activate</span>
                            </button>
                          )}

                          {/* Download PDF button */}
                          <button
                            type="button"
                            onClick={() => generateInvoicePDF(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition transform active:scale-95"
                            title="Download official PDF format invoice"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>

                          {/* Delete invoice button (to delete fake/demo submissions) */}
                          {onDeleteInvoice && (
                            <button
                              type="button"
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                              title="Remove invoice record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span>Official ActionScribe Tax Receipts</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
  );
};
