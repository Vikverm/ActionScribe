import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Check, 
  Copy, 
  Download, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PlanTier, InvoiceRecord } from '../types';
import { generateInvoicePDF } from '../utils/pdfInvoice';
import { PayPalCheckout } from './PayPalCheckout';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PlanTier;
  billingCycle: 'monthly' | 'annual';
  onPaymentSuccess: (invoice: InvoiceRecord) => void;
  onOpenContact: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle,
  onPaymentSuccess,
  onOpenContact,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'paypal'>('upi');
  const [upiCopied, setUpiCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Billing details
  const [clientName, setClientName] = useState('Vikas Verma');
  const [clientEmail, setClientEmail] = useState('vikasverm48472@gmail.com');
  const [companyName, setCompanyName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  
  // UPI fields
  const [utrNumber, setUtrNumber] = useState('');
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const upiId = '9711040665@ptsbi';

  // Pricing calculations
  const isStarter = selectedPlan === 'starter';
  const isPro = selectedPlan === 'pro';
  const planName = isStarter ? 'Starter Solo' : isPro ? 'Pro Scribe' : 'Team & Agency';
  
  // Starter: $5/mo ($3.50/mo on annual = $42/yr)
  // Pro: $10/mo ($7.50/mo on annual = $90/yr)
  // Team: $24/mo ($18/mo on annual = $216/yr)
  const amountUSD = isStarter
    ? billingCycle === 'annual' ? 42 : 5
    : isPro
    ? billingCycle === 'annual' ? 90 : 10
    : billingCycle === 'annual' ? 216 : 24;
    
  // INR equivalent:
  // Starter: ₹299/mo | Annual: ₹2,388/yr (₹199/mo)
  // Pro: ₹599/mo ($10) | Annual: ₹5,388/yr (₹449/mo or $7.50/mo)
  // Team: ₹1,499/mo ($24) | Annual: ₹13,188/yr (₹1,099/mo or $18/mo)
  const amountINR = isStarter
    ? billingCycle === 'annual' ? 2388 : 299
    : isPro
    ? billingCycle === 'annual' ? 5388 : 599
    : billingCycle === 'annual' ? 13188 : 1499;

  // Generate UPI QR code
  useEffect(() => {
    if (!isOpen) return;
    
    // Construct standard UPI payment deep-link URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('ActionScribe AI')}&am=${amountINR}&cu=INR&tn=${encodeURIComponent(`ActionScribe ${planName}`)}`;
    
    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [isOpen, amountINR, planName]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2500);
  };

  const handleConfirmUpi = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!clientName.trim()) {
      setErrorMessage('Please enter your name for the invoice.');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for invoice delivery.');
      return;
    }

    const cleanUtr = utrNumber.trim();
    // Real Indian UPI UTR is strictly 12 numeric digits
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(cleanUtr)) {
      setErrorMessage(
        'Invalid UPI Reference! An official UPI UTR consists of exactly 12 numeric digits (e.g. 425612345678). Letters or fake reference codes are strictly rejected. Please check your transaction receipt in GPay, PhonePe, or Paytm.'
      );
      return;
    }

    setIsProcessing(true);
    // Real submission without fake simulated activation:
    const newInvoice: InvoiceRecord = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      planId: selectedPlan,
      planName: planName,
      amountUSD,
      amountINR,
      billingCycle,
      paymentMethod: 'upi',
      paymentRef: cleanUtr,
      upiId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      companyName: companyName.trim() || undefined,
      billingAddress: billingAddress.trim() || undefined,
      status: 'pending_verification',
    };

    setCompletedInvoice(newInvoice);
    setIsProcessing(false);
    onPaymentSuccess(newInvoice);
  };

  const handlePayPalSuccess = (realTxnId: string, details?: any) => {
    setErrorMessage('');
    const newInvoice: InvoiceRecord = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      planId: selectedPlan,
      planName: planName,
      amountUSD,
      amountINR,
      billingCycle,
      paymentMethod: 'paypal',
      paymentRef: realTxnId,
      clientName: clientName.trim() || 'Valued Subscriber',
      clientEmail: clientEmail.trim() || (details?.payer?.email_address || 'vikasverm48472@gmail.com'),
      companyName: companyName.trim() || undefined,
      billingAddress: billingAddress.trim() || undefined,
      status: 'paid',
    };

    setCompletedInvoice(newInvoice);
    setIsProcessing(false);
    onPaymentSuccess(newInvoice);
  };

  const handleDownloadPDF = () => {
    if (completedInvoice) {
      generateInvoicePDF(completedInvoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 fill-white/20" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-neutral-100">
                {completedInvoice 
                  ? (completedInvoice.status === 'pending_verification' ? 'UPI Reference Submitted' : 'Payment Successful!') 
                  : `Upgrade to ${planName}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {completedInvoice 
                  ? (completedInvoice.status === 'pending_verification' 
                      ? 'Awaiting bank credit verification. Download your official tax invoice below.' 
                      : 'Your plan is active. Download your official tax invoice below.') 
                  : `Select payment method (UPI / PayPal) & enter billing info.`}
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

        {/* Modal Body */}
        {completedInvoice ? (
          completedInvoice.status === 'pending_verification' ? (
            /* PENDING VERIFICATION STATE (UPI REAL WORKFLOW) */
            <div className="p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500 shadow-lg shadow-amber-500/10">
                <Clock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-full text-xs font-semibold mb-2">
                  Status: Payment Awaiting Settlement Verification
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-100">
                  UPI Reference Logged
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                  Your 12-digit UTR (<code className="font-mono font-bold text-slate-700 dark:text-neutral-200">{completedInvoice.paymentRef}</code>) has been submitted for verification against the merchant SBI account (<code className="font-semibold text-slate-700 dark:text-neutral-200">9711040665@ptsbi</code>). To prevent fraud, plan activation occurs once credit is verified.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 dark:bg-neutral-800/70 p-4 rounded-xl border border-slate-200 dark:border-neutral-700/80 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-neutral-700/80">
                  <span className="text-slate-500 dark:text-neutral-400">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-neutral-100">{completedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Plan Requested:</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">ActionScribe {completedInvoice.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Client / Email:</span>
                  <span className="text-slate-800 dark:text-neutral-200">{completedInvoice.clientName} ({completedInvoice.clientEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Payable Amount:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{completedInvoice.amountINR.toLocaleString('en-IN')} INR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Submitted 12-Digit UTR:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-neutral-100">{completedInvoice.paymentRef}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-neutral-700/80">
                  <span className="text-slate-500 dark:text-neutral-400">Reconciliation:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Merchant Bank Clearance</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="download-invoice-btn"
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pending Tax Invoice (PDF)</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-semibold text-xs border border-slate-200 dark:border-neutral-700 transition"
                >
                  Close Window
                </button>
              </div>

              <div className="p-3 bg-indigo-50/70 dark:bg-neutral-800/80 rounded-xl border border-indigo-100 dark:border-neutral-700 text-left text-xs max-w-md mx-auto space-y-1">
                <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Settlement Reconciliation Note</span>
                </div>
                <p className="text-slate-600 dark:text-neutral-400 text-[11px] leading-relaxed">
                  Merchant Vikas Verma (<a href="mailto:vikasverm48472@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">vikasverm48472@gmail.com</a>) verifies payments in SBI account (<code className="font-mono">9711040665@ptsbi</code>) and approves invoices in the Billing & Invoices dashboard.
                </p>
              </div>
            </div>
          ) : (
            /* SUCCESS STATE (PAYPAL REAL PAYMENT) */
            <div className="p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-lg shadow-emerald-500/10">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-xs font-semibold mb-2">
                  Plan Activated: {completedInvoice.planName}
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-100">
                  Payment Captured & Verified!
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto mt-1">
                  Your payment via PayPal has been authenticated and captured in real-time. All premium features are unlocked.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 dark:bg-neutral-800/70 p-4 rounded-xl border border-slate-200 dark:border-neutral-700/80 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-neutral-700/80">
                  <span className="text-slate-500 dark:text-neutral-400">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-neutral-100">{completedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Client Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">{completedInvoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Billing Email:</span>
                  <span className="text-slate-800 dark:text-neutral-200">{completedInvoice.clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">Amount Paid:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ${completedInvoice.amountUSD.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-neutral-400">PayPal Order ID:</span>
                  <span className="font-mono text-slate-700 dark:text-neutral-300">{completedInvoice.paymentRef}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="download-invoice-btn"
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice (PDF)</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-semibold text-xs border border-slate-200 dark:border-neutral-700 transition"
                >
                  Go to My Workspace
                </button>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                Need assistance or custom invoice changes? Email{' '}
                <a href="mailto:vikasverm48472@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  vikasverm48472@gmail.com
                </a>
              </p>
            </div>
          )
        ) : (
          /* CHECKOUT FORM */
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Plan Header Pill */}
            <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-500/20 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-neutral-100">
                    {planName} ({billingCycle === 'annual' ? 'Annual Super Saver • 43% Off' : 'Monthly Flexible'})
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Super-cheap competitor rate • 65% less than Otter & Fireflies with instant UPI & PayPal
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-display text-base text-indigo-600 dark:text-indigo-400">
                  ${amountUSD} USD
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {billingCycle === 'annual' 
                    ? `₹${amountINR.toLocaleString('en-IN')} (Only ₹${isStarter ? '149' : isPro ? '299' : '699'}/mo)` 
                    : `₹${amountINR.toLocaleString('en-IN')} INR`}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="select-method-upi"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-50/60 dark:bg-neutral-800 border-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-neutral-100">UPI Instant Pay</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400">GPay, PhonePe, Paytm, QR</div>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>

                <button
                  type="button"
                  id="select-method-paypal"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition ${
                    paymentMethod === 'paypal'
                      ? 'bg-indigo-50/60 dark:bg-neutral-800 border-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-neutral-900/80 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center font-bold text-xs">
                      PP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-neutral-100">PayPal</div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400">Cards & Digital Wallet</div>
                    </div>
                  </div>
                  {paymentMethod === 'paypal' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* METHOD 1: UPI METHOD VIEW */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-1">
                {/* UPI ID & QR Code Card */}
                <div className="bg-slate-50 dark:bg-neutral-800/70 p-4 rounded-xl border border-slate-200 dark:border-neutral-700/80 flex flex-col sm:flex-row items-center gap-5">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="UPI Payment QR Code" 
                          className="w-36 h-36 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-slate-400">
                          <QrCode className="w-8 h-8 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium mt-1.5 flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      Scan with any UPI App
                    </span>
                  </div>

                  {/* UPI Details & Copy */}
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                        Official Merchant UPI ID
                      </span>
                      <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                        <code className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 font-mono font-bold text-slate-900 dark:text-neutral-100 text-xs sm:text-sm">
                          {upiId}
                        </code>
                        <button
                          type="button"
                          id="copy-upi-id-btn"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold transition"
                          title="Copy UPI ID"
                        >
                          {upiCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{upiCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-neutral-400 space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-slate-500">Payable Amount:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-display">
                          ₹{amountINR.toLocaleString('en-IN')} INR
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Supported: Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Instant automatic activation upon UTR verification</span>
                    </div>
                  </div>
                </div>

                {/* Form to enter UTR & Client info */}
                <form onSubmit={handleConfirmUpi} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                      UPI Reference / 12-Digit UTR Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-utr-number"
                      placeholder="e.g. 425689123456 or Bank Ref ID"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200 placeholder:text-slate-400"
                      required
                    />
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                      Found in your GPay / PhonePe / Paytm transaction history after successful transfer.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Client / Name for Invoice <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Vikas Verma"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Billing Email (Invoice recipient) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="vikasverm48472@gmail.com"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Company / Agency Name <span className="text-slate-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Studio LLC"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Billing Address / City <span className="text-slate-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="e.g. New Delhi, India"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                      />
                    </div>
                  </div>

                  {/* Real Payment Anti-Fraud Notice */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Real Payment Verification Enforced</span>
                    </div>
                    <p className="text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
                      Entering fake numbers or letters is rejected. Submitted 12-digit UTR references are matched against the merchant SBI UPI statement (<code className="font-semibold">9711040665@ptsbi</code>) before activating plan features. For instant automated 1-second activation, switch to <strong>PayPal</strong>.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      id="verify-upi-payment-btn"
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting 12-Digit UTR for Verification...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit 12-Digit UPI UTR (₹{amountINR.toLocaleString('en-IN')}) for Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* METHOD 2: PAYPAL REAL INTEGRATION */}
            {paymentMethod === 'paypal' && (
              <div className="space-y-4 pt-1">
                <div className="bg-slate-50 dark:bg-neutral-800/70 p-4 rounded-xl border border-slate-200 dark:border-neutral-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold text-xs italic">
                        P
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-neutral-100">
                          PayPal Live Payment Gateway
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                          Pay securely using your activated PayPal account, cards, or direct transfer
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-neutral-100 font-display">
                      ${amountUSD}.00 USD
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Real, authenticated payment. Instant verified PDF tax invoice issued upon transaction completion.
                  </p>
                </div>

                {/* Billing Info Details */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                    Invoice Beneficiary Details:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Client Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Vikas Verma"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        PayPal / Billing Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="vikasverm48472@gmail.com"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Company Name <span className="text-slate-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-neutral-300 block mb-1">
                        Country / Billing Address <span className="text-slate-400 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="India / United States"
                        className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-slate-900 dark:text-neutral-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Real PayPal Checkout (Smart Buttons & Direct Gateway) */}
                <div className="pt-2">
                  <PayPalCheckout
                    amountUSD={amountUSD}
                    planName={planName}
                    billingCycle={billingCycle}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    onSuccess={handlePayPalSuccess}
                    onError={(err) => setErrorMessage(err)}
                  />
                </div>
              </div>
            )}

            {/* Questions Banner */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                <span>Need support, custom invoicing, or payment queries?</span>
              </div>
              <button
                type="button"
                onClick={onOpenContact}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
};
