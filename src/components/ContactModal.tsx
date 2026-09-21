import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing?: () => void;
}

// Official WhatsApp Logo SVG
const WhatsAppLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.768.46 3.493 1.332 5.006L2 22l5.105-1.339a10.024 10.024 0 004.926 1.288h.005c5.534 0 10.03-4.496 10.03-10.031 0-2.679-1.043-5.197-2.937-7.091A9.96 9.96 0 0012.031 2zm0 18.358h-.004a8.337 8.337 0 01-4.25-1.163l-.305-.181-3.161.829.844-3.08-.198-.316a8.312 8.312 0 01-1.278-4.416c0-4.605 3.747-8.352 8.356-8.352 2.23 0 4.327.869 5.904 2.446a8.298 8.298 0 012.444 5.904c0 4.606-3.748 8.35-8.358 8.35zm4.582-6.257c-.251-.126-1.488-.734-1.719-.817-.23-.084-.398-.126-.565.126-.168.251-.649.817-.796.985-.147.168-.293.189-.544.063-.251-.126-1.06-.391-2.02-1.247-.746-.666-1.25-1.489-1.396-1.74-.147-.252-.016-.388.11-.513.113-.112.251-.293.377-.44.126-.147.168-.251.251-.419.084-.168.042-.314-.021-.44-.063-.126-.565-1.362-.774-1.865-.204-.49-.41-.423-.565-.431-.147-.008-.314-.01-.482-.01-.168 0-.44.063-.67.314-.23.251-.879.859-.879 2.095 0 1.236.9 2.43 1.026 2.598.126.168 1.77 2.703 4.29 3.791.6.259 1.068.414 1.433.53.602.191 1.15.164 1.583.1.483-.072 1.488-.608 1.697-1.194.209-.586.209-1.088.147-1.194-.063-.105-.23-.168-.481-.293z"/>
  </svg>
);

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const supportEmail = 'vikasverm48472@gmail.com';
  const whatsappNumber = '+91 97110 40665';
  const whatsappRaw = '919711040665';
  
  // Direct link without pre-filled greeting
  const whatsappLink = `https://wa.me/${whatsappRaw}`;

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(whatsappNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="contact-modal-dialog"
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-contact-modal-btn"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Section matching user design */}
        <div className="pt-8 pb-4 px-6 sm:px-8 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>We're Here to Help 24/7</span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-neutral-50 tracking-tight mt-3.5">
            Contact ActionScribe Support & Sales
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mt-2.5">
            Have questions about meeting transcription, plan limits, UPI & PayPal payments, or custom team subscriptions? Our team is ready to assist you directly.
          </p>
        </div>

        {/* Contact Cards Container */}
        <div className="p-6 sm:p-8 pt-2 space-y-3.5">
          {/* WhatsApp Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-850/90 border border-slate-200 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {/* WhatsApp Circular Logo Badge */}
                <div className="w-11 h-11 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] flex-shrink-0">
                  <WhatsAppLogo className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                      WhatsApp
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-800 dark:text-neutral-200 font-sans tracking-wide mt-0.5">
                    {whatsappNumber}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                id="open-whatsapp-btn"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition shadow-xs"
              >
                <WhatsAppLogo className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                type="button"
                id="copy-phone-btn"
                onClick={handleCopyPhone}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-750 text-xs font-medium transition shadow-xs"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Support Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-850/90 border border-slate-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700/60 transition shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                      Email Support
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-neutral-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Replies &lt; 2-4 hrs
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-neutral-200 font-mono select-all mt-0.5">
                    {supportEmail}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="copy-email-btn"
              onClick={handleCopyEmail}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-750 text-xs font-semibold transition shadow-xs"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Email Address</span>
                </>
              )}
            </button>
          </div>

          {/* Guarantee Pill / Footnote */}
          <div className="pt-2 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500 dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Direct assistance for all questions, invoices & custom setups</span>
          </div>
        </div>
      </div>
    </div>
  );
};
