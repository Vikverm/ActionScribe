import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  Zap,
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAS } from './Header';
import { PLANS } from '../data/sampleMeetings';
import logoImage from '../assets/images/actionscribe_clean_logo_1789724989077.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'profile';
  onOpenPricing?: () => void;
  onOpenInvoices?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onOpenPricing,
  onOpenInvoices,
}) => {
  const { user, login, loginWithGoogle, register, logout, updateProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(() => {
    if (user && initialMode === 'profile') return 'profile';
    return initialMode;
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPersona, setRegPersona] = useState('client');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileCompany, setProfileCompany] = useState(user?.company || '');
  const [profilePersona, setProfilePersona] = useState(user?.persona || 'client');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode and form state whenever the modal opens or initialMode / user changes
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'profile') {
        setMode('profile');
      } else {
        setMode(initialMode);
      }
      setErrorMessage(null);
      setSuccessMessage(null);
      if (user) {
        setProfileName(user.name || '');
        setProfileCompany(user.company || '');
        setProfilePersona(user.persona || 'client');
      }
    }
  }, [isOpen, initialMode, user]);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: 'login' | 'register' | 'profile') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (newMode === 'profile' && user) {
      setProfileName(user.name);
      setProfileCompany(user.company || '');
      setProfilePersona(user.persona);
    }
  };

  const handleFillDemo = () => {
    setLoginEmail('vikasverm48472@gmail.com');
    setLoginPassword('password123');
    setErrorMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Successfully authenticated with Google! Welcome.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.error || 'Google authentication could not be completed.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Successfully signed in! Welcome back.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(regName, regEmail, regPassword, regCompany, regPersona);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Account created successfully! Welcome to ActionScribe.');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage(result.error || 'Could not register account.');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!profileName.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setIsUpdatingProfile(true);
    const res = await updateProfile({
      name: profileName.trim(),
      company: profileCompany.trim(),
      persona: profilePersona,
    });
    setIsUpdatingProfile(false);

    if (res.success) {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 2500);
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logout();
    setMode('login');
    setSuccessMessage('Logged out successfully.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const currentPlan = user?.currentPlan ? PLANS[user.currentPlan] : PLANS.free;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs flex-shrink-0 bg-white dark:bg-neutral-800 p-0.5">
              <img 
                src={logoImage} 
                alt="ActionScribe Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg" 
              />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight font-display">
                {mode === 'login' && 'Client Sign In'}
                {mode === 'register' && 'Create Client Account'}
                {mode === 'profile' && 'Client Account Details'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                {mode === 'login' && 'Access your meeting scribes, transcripts & invoices'}
                {mode === 'register' && 'Join ActionScribe Meeting & Interview Intelligence'}
                {mode === 'profile' && (user ? `Signed in as ${user.email}` : 'Please sign in to view your profile')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className={`grid ${user ? 'grid-cols-3' : 'grid-cols-2'} p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold`}>
            {user && (
              <button
                type="button"
                onClick={() => handleSwitchMode('profile')}
                className={`py-2 rounded-lg transition ${
                  mode === 'profile'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Profile
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {user ? 'Switch' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`py-2 rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 pt-3 max-h-[75vh] overflow-y-auto">
          {/* ==================== LOGIN FORM ==================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Account Fill Helper */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Fill (vikasverm48472@gmail.com)</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In with Email</span>
                )}
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 dark:border-neutral-800 w-full"></div>
                <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-medium">or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 dark:text-neutral-400">
                  Don't have an account yet?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create Client Account
                </button>
              </div>
            </form>
          )}

          {/* ==================== REGISTER FORM ==================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Vikas Verma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Work / Personal Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="vikasverm48472@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Apex Digital or Freelance"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Persona / Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Primary Usage Role
                </label>
                <select
                  value={regPersona}
                  onChange={(e) => setRegPersona(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.shortLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Confirm *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRegPassword}
                    onChange={(e) => setShowRegPassword(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Show passwords</span>
                </label>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Encrypted</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Complete Client Registration</span>
                )}
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-neutral-800 w-full"></div>
                <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-medium">or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-750 text-slate-700 dark:text-neutral-200 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-slate-500 dark:text-neutral-400">
                  Already registered?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ==================== PROFILE / ACCOUNT VIEW ==================== */}
          {mode === 'profile' && user && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">{user.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">{user.email}</p>
                    {user.company && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{user.company}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>{currentPlan.name} Plan</span>
                  </span>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleProfileSave} className="space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                  Update Account Details
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Company / Workspace
                  </label>
                  <input
                    type="text"
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    placeholder="Your company or agency name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                    Client Role / Persona
                  </label>
                  <select
                    value={profilePersona}
                    onChange={(e) => setProfilePersona(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    {PERSONAS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.shortLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>

                  {onOpenInvoices && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenInvoices();
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold transition"
                    >
                      My Invoices
                    </button>
                  )}

                  {onOpenPricing && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPricing();
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 text-xs font-semibold transition"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </form>

              {/* Logout Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Client ID: {user.id}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== PROFILE VIEW: NOT LOGGED IN ==================== */}
          {mode === 'profile' && !user && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs border border-indigo-100 dark:border-indigo-900/40">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-neutral-100">Sign in to Access Your Account Profile</h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  Sign in or register to customize your client details, view your plan and access saved meeting scribes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-xs"
                >
                  Sign In to Existing Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSwitchMode('login');
                    handleFillDemo();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition"
                >
                  Quick Fill Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
