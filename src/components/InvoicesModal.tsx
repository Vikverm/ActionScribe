import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Zap, 
  ShieldAlert,
  ShieldCheck,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { InvoiceRecord } from '../types';
import { generateInvoicePDF } from '../utils/pdfInvoice';
import { BrandLogo } from './BrandLogo';

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
  onApproveInvoice,
  onDeleteInvoice,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  if (!isOpen) return null;

  const pendingCount = invoices.filter((i) => i.status === 'pending_verification').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            {selectedInvoice ? (
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Invoices</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                {selectedInvoice ? `Tax Invoice ${selectedInvoice.id}` : 'Billing & PDF Invoices'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {selectedInvoice 
                  ? 'Official tax receipt and settlement audit record.' 
                  : 'Download verified tax invoices and audit settlement records.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedInvoice && (
              <button
                type="button"
                onClick={() => generateInvoicePDF(selectedInvoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {selectedInvoice ? (
            /* Detailed On-Screen Invoice Preview (matching the PDF format) */
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs overflow-hidden text-left">
              {/* Top Accent Bar */}
              <div className="w-full">
                <div className="h-1.5 bg-slate-800 dark:bg-neutral-800 w-full" />
                <div className="h-1 bg-indigo-600 w-full" />
              </div>

              <div className="p-6 space-y-6">
                {/* Header row with logo and invoice title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <BrandLogo size="md" showTagline={false} />
                    <div className="border-l border-slate-200 dark:border-neutral-800 pl-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                        Enterprise Meeting Intelligence
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Merchant: vikasverm48472@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-display font-black text-xl text-slate-900 dark:text-neutral-100 tracking-tight">
                      TAX INVOICE
                    </span>
                    <div className="mt-1">
                      {selectedInvoice.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Paid & Active
                        </span>
                      ) : selectedInvoice.status === 'pending_verification' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3" /> Pending Verification
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4-column Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">Invoice Number</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-neutral-100 mt-0.5">{selectedInvoice.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">Date of Issue</span>
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 mt-0.5">{selectedInvoice.date}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">Payment Channel</span>
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 mt-0.5">
                      {selectedInvoice.paymentMethod === 'upi' ? 'UPI Instant Pay' : 'PayPal Gateway'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">Reference / UTR</span>
                    <p className="font-mono font-semibold text-slate-900 dark:text-neutral-100 mt-0.5 truncate" title={selectedInvoice.paymentRef}>
                      {selectedInvoice.paymentRef}
                    </p>
                  </div>
                </div>

                {/* Two-Column Billing Parties Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Billed To (Subscriber)
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                      {selectedInvoice.clientName || 'Valued Subscriber'}
                    </p>
                    {selectedInvoice.companyName && (
                      <p className="text-slate-600 dark:text-neutral-400">Organization: {selectedInvoice.companyName}</p>
                    )}
                    <p className="text-slate-600 dark:text-neutral-400">Email: {selectedInvoice.clientEmail}</p>
                    {selectedInvoice.billingAddress && (
                      <p className="text-slate-500 dark:text-neutral-500 text-[11px]">Location: {selectedInvoice.billingAddress}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                      Issued By (Merchant)
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                      ActionScribe AI Operations
                    </p>
                    <p className="text-slate-600 dark:text-neutral-400">Authorized Receiver: Vikas Verma</p>
                    <p className="text-slate-600 dark:text-neutral-400">Payee Email: vikasverm48472@gmail.com</p>
                    <p className="text-slate-500 dark:text-neutral-500 text-[11px]">
                      {selectedInvoice.paymentMethod === 'upi' ? 'Merchant VPA: 9711040665@ptsbi (SBI)' : 'Gateway: PayPal Official Merchant'}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-neutral-800/60 text-slate-600 dark:text-neutral-300 font-semibold border-b border-slate-200 dark:border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-4">Billing Cycle</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Rate</th>
                        <th className="py-2.5 px-4 text-right">Net Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-slate-800 dark:text-neutral-200">
                      <tr>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-neutral-100">
                            ActionScribe {selectedInvoice.planName} Plan
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                            Automated intelligent meeting recaps, audio transcription, and action items.
                          </p>
                        </td>
                        <td className="py-3 px-4 capitalize">
                          {selectedInvoice.billingCycle === 'annual' ? 'Annual (12 Mos)' : 'Monthly Recurring'}
                        </td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {selectedInvoice.paymentMethod === 'upi'
                            ? `₹${selectedInvoice.amountINR.toLocaleString('en-IN')}.00`
                            : `$${selectedInvoice.amountUSD.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-neutral-100">
                          {selectedInvoice.paymentMethod === 'upi'
                            ? `₹${selectedInvoice.amountINR.toLocaleString('en-IN')}.00`
                            : `$${selectedInvoice.amountUSD.toFixed(2)}`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">
                        {selectedInvoice.paymentMethod === 'upi'
                          ? `₹${selectedInvoice.amountINR.toLocaleString('en-IN')}.00`
                          : `$${selectedInvoice.amountUSD.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Taxes & Surcharges (GST/VAT):</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Gateway Processing Fee:</span>
                      <span className="font-semibold text-slate-900 dark:text-neutral-100">Waived</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border">
                      <span>Total Paid:</span>
                      <span>
                        {selectedInvoice.paymentMethod === 'upi'
                          ? `₹${selectedInvoice.amountINR.toLocaleString('en-IN')}.00`
                          : `$${selectedInvoice.amountUSD.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Record Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-neutral-100 text-[11px] uppercase tracking-wider">
                    Payment Settlement Receipt & Audit Record
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-neutral-400">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Gateway Processor: </span>
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">
                        {selectedInvoice.paymentMethod === 'upi' ? 'UPI NPCI Network (SBI)' : 'PayPal Inc.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Payee Account: </span>
                      <span className="font-semibold text-slate-800 dark:text-neutral-200">
                        {selectedInvoice.paymentMethod === 'upi' ? '9711040665@ptsbi (Vikas Verma)' : 'vikasverm48472@gmail.com'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">UTR / Reference: </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-neutral-200">
                        {selectedInvoice.paymentRef}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Verification Status: </span>
                      <span className={`font-semibold ${selectedInvoice.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {selectedInvoice.status === 'paid' ? 'Verified & Credited' : 'Pending Bank Match'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Invoices List */
            <>
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
                              {/* Preview invoice */}
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-semibold text-xs transition"
                                title="Inspect aligned invoice receipt"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

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

                              {/* Delete invoice button */}
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
            </>
          )}
        </div>

        {/* Modal Footer */}
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
