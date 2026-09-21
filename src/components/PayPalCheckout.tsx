import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  CreditCard,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';

interface PayPalCheckoutProps {
  amountUSD: number;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  clientName: string;
  clientEmail: string;
  onSuccess: (transactionId: string, details?: any) => void;
  onError: (errorMessage: string) => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amountUSD,
  planName,
  billingCycle,
  clientName,
  clientEmail,
  onSuccess,
  onError,
}) => {
  // Method 1: Official Smart Buttons SDK vs Method 2: Direct PayPal Webscr Gateway
  const [activeTab, setActiveTab] = useState<'sdk' | 'gateway'>('sdk');
  
  // Merchant PayPal Email
  const metaEnv = (import.meta as any).env || {};
  const envEmail = metaEnv.VITE_PAYPAL_EMAIL;
  const merchantEmail = envEmail && typeof envEmail === 'string' && envEmail.trim() ? envEmail.trim() : 'vikasverm48472@gmail.com';
  
  // PayPal Client ID (defaults to environment or 'sb' for sandbox / testing)
  const envClientId = metaEnv.VITE_PAYPAL_CLIENT_ID;
  const [clientId, setClientId] = useState<string>(envClientId && typeof envClientId === 'string' && envClientId.trim() ? envClientId.trim() : 'sb');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [customClientIdInput, setCustomClientIdInput] = useState<string>('');

  // SDK States
  const [isSdkLoading, setIsSdkLoading] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Gateway States
  const [gatewayOpened, setGatewayOpened] = useState<boolean>(false);
  const [directTxnId, setDirectTxnId] = useState<string>('');
  const [gatewayError, setGatewayError] = useState<string>('');

  // Load and render PayPal JavaScript SDK
  useEffect(() => {
    if (activeTab !== 'sdk') return;

    let isMounted = true;
    const scriptId = 'paypal-js-sdk-script';

    const loadPayPalSdk = () => {
      setIsSdkLoading(true);
      setSdkError(null);

      // Check if SDK already loaded with matching client ID
      if ((window as any).paypal) {
        if (isMounted) {
          setIsSdkLoading(false);
          renderPayPalButtons();
        }
        return;
      }

      // Remove existing script if any
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&components=buttons&enable-funding=venmo,paylater`;
      script.async = true;

      script.onload = () => {
        if (isMounted) {
          setIsSdkLoading(false);
          renderPayPalButtons();
        }
      };

      script.onerror = () => {
        if (isMounted) {
          setIsSdkLoading(false);
          setSdkError(
            'Unable to connect to PayPal Smart Buttons SDK (often due to iframe popup blocking). Please switch to the "Direct PayPal.com Gateway" tab to complete your payment directly.'
          );
        }
      };

      document.body.appendChild(script);
    };

    const renderPayPalButtons = () => {
      const paypal = (window as any).paypal;
      if (!paypal || !buttonContainerRef.current) return;

      buttonContainerRef.current.innerHTML = '';

      try {
        paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 44,
            },
            createOrder: (_data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: `ActionScribe ${planName} Plan (${billingCycle})`,
                    amount: {
                      currency_code: 'USD',
                      value: amountUSD.toFixed(2),
                    },
                  },
                ],
              });
            },
            onApprove: async (data: any, actions: any) => {
              setIsCapturing(true);
              try {
                const details = await actions.order.capture();
                const txnId =
                  details.id ||
                  details.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                  data.orderID ||
                  `PP-${Date.now()}`;
                
                onSuccess(txnId, details);
              } catch (err: any) {
                console.error('Error capturing PayPal transaction:', err);
                const msg = err?.message || 'Payment capture failed. Please try again.';
                setSdkError(msg);
                onError(msg);
              } finally {
                if (isMounted) setIsCapturing(false);
              }
            },
            onError: (err: any) => {
              console.error('PayPal Buttons Error:', err);
              const msg =
                'PayPal checkout encountered a connectivity issue. Try again or switch to the Direct PayPal Gateway tab.';
              setSdkError(msg);
            },
            onCancel: () => {
              console.log('PayPal checkout window closed by user.');
            },
          })
          .render(buttonContainerRef.current)
          .catch((err: any) => {
            console.error('Render error:', err);
            setSdkError('Failed to render buttons. Please use the Direct PayPal Gateway tab.');
          });
      } catch (e: any) {
        console.error('PayPal Buttons initialization error:', e);
        setSdkError('Could not initialize PayPal Buttons. Please use the Direct PayPal Gateway tab.');
      }
    };

    loadPayPalSdk();

    return () => {
      isMounted = false;
    };
  }, [activeTab, clientId, amountUSD, planName, billingCycle, onSuccess, onError]);

  // Handle Direct PayPal Gateway Submission
  const handleOpenDirectPayPal = () => {
    setGatewayError('');
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.paypal.com/cgi-bin/webscr';
      form.target = '_blank';

      const fields: Record<string, string> = {
        cmd: '_xclick',
        business: merchantEmail,
        item_name: `ActionScribe ${planName} Plan (${billingCycle})`,
        amount: amountUSD.toFixed(2),
        currency_code: 'USD',
        no_shipping: '1',
        return: window.location.href,
        cancel_return: window.location.href,
      };

      for (const [key, val] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      form.remove();
      setGatewayOpened(true);
    } catch (e) {
      console.error('Failed to open PayPal form:', e);
      window.open(
        `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
          merchantEmail
        )}&item_name=${encodeURIComponent(
          `ActionScribe ${planName}`
        )}&amount=${amountUSD}&currency_code=USD`,
        '_blank'
      );
      setGatewayOpened(true);
    }
  };

  // Confirm Direct Gateway Transaction ID
  const handleConfirmDirectTxn = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayError('');

    const clean = directTxnId.trim();
    if (!clean) {
      setGatewayError('Please enter the PayPal Transaction ID / Receipt Number from your PayPal email or receipt.');
      return;
    }

    if (clean.length < 5) {
      setGatewayError('Please enter a valid PayPal Transaction ID (typically 10-17 alphanumeric characters).');
      return;
    }

    onSuccess(clean, {
      method: 'paypal_webscr',
      merchantEmail,
      amount: amountUSD,
    });
  };

  return (
    <div className="space-y-4">
      {/* Merchant Account Verified Badge */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold text-xs italic flex-shrink-0">
            P
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span>Merchant PayPal Account Active</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Verified
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-neutral-400 font-mono">
              Receiver: {merchantEmail}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition"
          title="PayPal Developer / Client ID settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Optional Client ID config dropdown */}
      {showConfig && (
        <div className="p-3 bg-slate-100 dark:bg-neutral-850 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs space-y-2">
          <div className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span>PayPal REST API Client ID</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-neutral-400">
            Default is set to official sandbox testing (`sb`). If you created a REST API App at <span className="font-mono text-indigo-600 dark:text-indigo-400">developer.paypal.com</span>, enter your Client ID below:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customClientIdInput}
              onChange={(e) => setCustomClientIdInput(e.target.value)}
              placeholder={clientId}
              className="flex-1 px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-800 dark:text-neutral-200"
            />
            <button
              type="button"
              onClick={() => {
                if (customClientIdInput.trim()) {
                  setClientId(customClientIdInput.trim());
                  setShowConfig(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab('sdk')}
          className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'sdk'
              ? 'border-[#003087] text-[#003087] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>PayPal Smart Buttons (In-App)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gateway')}
          className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'gateway'
              ? 'border-[#003087] text-[#003087] dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Direct PayPal.com Gateway</span>
        </button>
      </div>

      {/* TAB 1: SMART BUTTONS SDK */}
      {activeTab === 'sdk' && (
        <div className="space-y-3">
          <div className="text-[11px] text-slate-600 dark:text-neutral-400">
            Pay securely with your PayPal balance, bank account, or debit/credit card. Click a button below to launch PayPal:
          </div>

          {/* Loading Indicator */}
          {isSdkLoading && (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to PayPal Smart Payment Gateway...</span>
            </div>
          )}

          {/* Error Message */}
          {sdkError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">{sdkError}</p>
              <button
                type="button"
                onClick={() => setActiveTab('gateway')}
                className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-semibold text-[10px] hover:bg-amber-300 transition"
              >
                <span>Switch to Direct PayPal.com Gateway</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* PayPal Buttons Target Container */}
          <div
            ref={buttonContainerRef}
            id="paypal-button-container"
            className="min-h-[90px] pt-1"
          />

          {isCapturing && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>Authorizing payment with PayPal. Capturing order...</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              256-bit Encrypted
            </span>
            <span>•</span>
            <span>PayPal Buyer Protection</span>
            <span>•</span>
            <span>Instant Official Invoice</span>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT PAYPAL GATEWAY */}
      {activeTab === 'gateway' && (
        <div className="space-y-3.5">
          <div className="bg-slate-50 dark:bg-neutral-850 p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-neutral-400">Recipient:</span>
              <span className="font-bold text-slate-900 dark:text-neutral-100 font-mono">{merchantEmail}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-neutral-400">Total Amount:</span>
              <span className="font-extrabold text-sm text-[#003087] dark:text-blue-400 font-display">
                ${amountUSD}.00 USD
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-neutral-400">Product:</span>
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                ActionScribe {planName} ({billingCycle})
              </span>
            </div>
          </div>

          {/* Step 1: Open PayPal Button */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 block">
              Step 1: Open PayPal to Complete Payment
            </label>
            <button
              type="button"
              onClick={handleOpenDirectPayPal}
              className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Official PayPal.com Payment (${amountUSD}.00 USD)</span>
            </button>
            <p className="text-[10px] text-slate-500 dark:text-neutral-400 text-center">
              Opens PayPal's secure checkout in a new window where you log in and authorize the payment.
            </p>
          </div>

          {/* Step 2: Confirm Transaction ID */}
          <form onSubmit={handleConfirmDirectTxn} className="space-y-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
            <label className="text-xs font-bold text-slate-800 dark:text-neutral-200 block">
              Step 2: Enter PayPal Transaction ID / Receipt ID <span className="text-rose-500">*</span>
            </label>
            <div className="text-[11px] text-slate-500 dark:text-neutral-400">
              After completing the payment on PayPal, copy the Transaction ID from your confirmation screen or PayPal receipt email:
            </div>

            <input
              type="text"
              value={directTxnId}
              onChange={(e) => setDirectTxnId(e.target.value)}
              placeholder="e.g. 8XY12345AB678901C"
              className="w-full bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg p-2.5 text-xs font-mono text-slate-900 dark:text-neutral-200 focus:ring-2 focus:ring-blue-500"
              required
            />

            {gatewayError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{gatewayError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify Payment & Download Tax Invoice</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
