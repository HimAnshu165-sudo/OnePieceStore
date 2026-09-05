'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types/auth';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onOpenCheckout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onOpenCheckout }) => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalOptions,
    login,
    signup,
    executePendingAction
  } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [userMode, setUserMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // User form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Forgot password UI state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Validation & Error handling
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize options when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setSelectedRole(authModalOptions.defaultRole);
      setUserMode(authModalOptions.defaultTab);
      setGeneralError(null);
      setFieldErrors({});
      setIsForgotOpen(false);
      setForgotSent(false);
    }
  }, [isAuthModalOpen, authModalOptions]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handlePostAuthSuccess = (role: UserRole, userName: string) => {
    closeAuthModal();
    const pending = executePendingAction();

    if (role === 'admin') {
      showToast(`Administrative clearance granted. Welcome, ${userName}.`, 'info');
      router.push('/admin/dashboard');
      return;
    }

    if (pending) {
      if (pending.type === 'ADD_TO_CART') {
        addToCart(pending.product, pending.size, pending.color, pending.quantity);
        showToast(`"${pending.product.name}" added to your voyage bag!`, 'success');
      } else if (pending.type === 'CHECKOUT') {
        if (onOpenCheckout) {
          onOpenCheckout();
        }
        showToast('Account verified. Proceeding to checkout.', 'info');
      }
    } else {
      showToast(`Welcome back, ${userName}!`, 'success');
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';

    if (!password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await login(email, password, 'user', rememberMe);
      if (res.success) {
        handlePostAuthSuccess('user', email.split('@')[0]);
      } else {
        setGeneralError(res.error || 'Invalid credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupFullNameChange = (newName: string) => {
    setFullName(newName);
    if (fieldErrors.fullName && newName.trim()) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.fullName;
        return updated;
      });
    }
  };

  const handleSignupEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
  };

  const handleSignupPasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setFieldErrors((prev) => {
      const updated = { ...prev };

      // Clear password requirement error if fulfilled
      if (updated.password && newPassword.length >= 6) {
        delete updated.password;
      }

      // Real-time synchronization with confirmPassword
      if (confirmPassword) {
        if (newPassword === confirmPassword) {
          delete updated.confirmPassword;
        } else {
          updated.confirmPassword = 'Passwords do not match.';
        }
      } else {
        // If confirmPassword is empty, do not show mismatch error
        if (updated.confirmPassword === 'Passwords do not match.') {
          delete updated.confirmPassword;
        }
      }

      return updated;
    });
  };

  const handleSignupConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
    setFieldErrors((prev) => {
      const updated = { ...prev };

      if (!newConfirmPassword) {
        // Empty: do not show mismatch error
        if (updated.confirmPassword === 'Passwords do not match.') {
          delete updated.confirmPassword;
        }
      } else if (newConfirmPassword === password) {
        // Exact match: immediately remove error
        delete updated.confirmPassword;
      } else {
        // Mismatch: immediately show error
        updated.confirmPassword = 'Passwords do not match.';
      }

      return updated;
    });
  };

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';

    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';

    if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';

    if (!termsAccepted) errors.terms = 'You must accept the terms & conditions to proceed.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await signup({
        name: fullName,
        email,
        password,
        role: 'user'
      });

      if (res.success) {
        showToast('Account registered successfully! Welcome to Grand Line Supply.', 'success');
        handlePostAuthSuccess('user', fullName);
      } else {
        setGeneralError(res.error || 'Failed to create account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!adminEmail.trim()) errors.adminEmail = 'Admin identifier/email is required.';
    if (!adminPassword) errors.adminPassword = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await login(adminEmail, adminPassword, 'admin', true);
      if (res.success) {
        handlePostAuthSuccess('admin', 'Commander');
      } else {
        setGeneralError(res.error || 'Administrative clearance verification failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('tanjiro@demonslayer.store');
    setPassword('Demon@123');
    setFieldErrors({});
    setGeneralError(null);
  };

  const fillDemoAdmin = () => {
    setAdminEmail('admin@demonslayer.store');
    setAdminPassword('Admin@123');
    setFieldErrors({});
    setGeneralError(null);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setGeneralError('Please enter a valid email address.');
      return;
    }
    setForgotSent(true);
    setGeneralError(null);
    showToast(`Password reset link dispatched to ${forgotEmail}`, 'info');
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={closeAuthModal}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className={styles.modalCard}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Top Crimson/Gold Accent Bar */}
          <div className={styles.accentGlow} aria-hidden="true" />

          {/* Top Brand Seal & Close Button */}
          <div className={styles.topSeal}>
            <div className={styles.sealBrand}>
              <span className={styles.sealDot} />
              <span>SHIN SEKAI // ACCESS TERMINAL</span>
            </div>
            <button
              onClick={closeAuthModal}
              className={styles.closeBtn}
              aria-label="Close authentication modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Role Selector: USER vs ADMIN */}
          <div className={styles.roleSelectorWrapper}>
            <span className={styles.roleLabel}>CONTINUE AS</span>
            <div className={styles.roleToggle}>
              <button
                type="button"
                className={`${styles.roleBtn} ${
                  selectedRole === 'user' ? styles.activeUserRole : ''
                }`}
                onClick={() => {
                  setSelectedRole('user');
                  setGeneralError(null);
                  setFieldErrors({});
                }}
              >
                <User size={15} />
                <span>USER / CREW</span>
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${
                  selectedRole === 'admin' ? styles.activeAdminRole : ''
                }`}
                onClick={() => {
                  setSelectedRole('admin');
                  setGeneralError(null);
                  setFieldErrors({});
                }}
              >
                <Shield size={15} />
                <span>ADMIN CONSOLE</span>
              </button>
            </div>
          </div>

          {/* USER FLOW */}
          {selectedRole === 'user' && (
            <>
              {!isForgotOpen ? (
                <>
                  <div className={styles.userModeTabs}>
                    <button
                      type="button"
                      className={`${styles.tabBtn} ${
                        userMode === 'LOGIN' ? styles.activeTabBtn : ''
                      }`}
                      onClick={() => {
                        setUserMode('LOGIN');
                        setGeneralError(null);
                        setFieldErrors({});
                      }}
                    >
                      LOGIN
                    </button>
                    <button
                      type="button"
                      className={`${styles.tabBtn} ${
                        userMode === 'SIGNUP' ? styles.activeTabBtn : ''
                      }`}
                      onClick={() => {
                        setUserMode('SIGNUP');
                        setGeneralError(null);
                        setFieldErrors({});
                      }}
                    >
                      CREATE ACCOUNT
                    </button>
                  </div>

                  <h2 className={styles.headerTitle}>
                    {userMode === 'LOGIN' ? 'Welcome Back, Ronin.' : 'Join The Voyage Crew.'}
                  </h2>
                  <p className={styles.headerSubtitle}>
                    {userMode === 'LOGIN'
                      ? 'Enter your credentials to access your saved pieces, orders, and exclusive releases.'
                      : 'Create your account to unlock private 500 GSM drop access and voyage tracking.'}
                  </p>

                  {generalError && (
                    <div className={styles.errorBanner} role="alert">
                      <AlertCircle size={16} />
                      <span>{generalError}</span>
                    </div>
                  )}

                  {/* USER LOGIN FORM */}
                  {userMode === 'LOGIN' ? (
                    <form onSubmit={handleUserLogin} className={styles.form} noValidate>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>EMAIL ADDRESS</span>
                          {fieldErrors.email && (
                            <span className={styles.fieldError}>{fieldErrors.email}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <Mail size={15} className={styles.inputIcon} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tanjiro@demonslayer.store"
                            className={styles.textInput}
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>PASSWORD</span>
                          {fieldErrors.password && (
                            <span className={styles.fieldError}>{fieldErrors.password}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <Lock size={15} className={styles.inputIcon} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={styles.textInput}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.togglePasswordBtn}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className={styles.optionsRow}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className={styles.checkboxInput}
                          />
                          <span>Remember me</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsForgotOpen(true)}
                          className={styles.forgotBtn}
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                      >
                        <span>{isSubmitting ? 'VERIFYING...' : 'SIGN IN'}</span>
                        <ArrowRight size={15} />
                      </button>

                      {/* Demo Quick-Fill Pill for Friction-Free Testing */}
                      <div className={styles.demoPillBox}>
                        <div className={styles.demoInfo}>
                          <span className={styles.demoTitle}>DEMO CUSTOMER PASS</span>
                          <span className={styles.demoCreds}>tanjiro@demonslayer.store</span>
                        </div>
                        <button
                          type="button"
                          onClick={fillDemoUser}
                          className={styles.quickFillBtn}
                        >
                          Auto Fill
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* USER SIGNUP FORM */
                    <form onSubmit={handleUserSignup} className={styles.form} noValidate>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>FULL NAME</span>
                          {fieldErrors.fullName && (
                            <span className={styles.fieldError}>{fieldErrors.fullName}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <User size={15} className={styles.inputIcon} />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => handleSignupFullNameChange(e.target.value)}
                            placeholder="Tanjiro Kamado"
                            className={`${styles.textInput} ${fieldErrors.fullName ? styles.inputError : ''}`}
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>EMAIL ADDRESS</span>
                          {fieldErrors.email && (
                            <span className={styles.fieldError}>{fieldErrors.email}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <Mail size={15} className={styles.inputIcon} />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => handleSignupEmailChange(e.target.value)}
                            placeholder="tanjiro@demonslayer.store"
                            className={`${styles.textInput} ${fieldErrors.email ? styles.inputError : ''}`}
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>PASSWORD (MIN 6 CHARS)</span>
                          {fieldErrors.password && (
                            <span className={styles.fieldError}>{fieldErrors.password}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <Lock size={15} className={styles.inputIcon} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => handleSignupPasswordChange(e.target.value)}
                            placeholder="••••••••"
                            className={`${styles.textInput} ${fieldErrors.password ? styles.inputError : ''}`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.togglePasswordBtn}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>CONFIRM PASSWORD</span>
                          {fieldErrors.confirmPassword && (
                            <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
                          )}
                        </label>
                        <div className={styles.inputWrapper}>
                          <Lock size={15} className={styles.inputIcon} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => handleSignupConfirmPasswordChange(e.target.value)}
                            placeholder="••••••••"
                            className={`${styles.textInput} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                            autoComplete="new-password"
                          />
                        </div>
                      </div>

                      <div className={styles.termsRow}>
                        <input
                          type="checkbox"
                          id="termsCheck"
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (e.target.checked && fieldErrors.terms) {
                              setFieldErrors((prev) => {
                                const updated = { ...prev };
                                delete updated.terms;
                                return updated;
                              });
                            }
                          }}
                          className={styles.checkboxInput}
                        />
                        <label htmlFor="termsCheck">
                          I accept the Shin Sekai Terms of Service and Privacy Policy.
                        </label>
                      </div>
                      {fieldErrors.terms && (
                        <div className={styles.fieldError}>{fieldErrors.terms}</div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                      >
                        <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</span>
                        <ArrowRight size={15} />
                      </button>
                    </form>
                  )}
                </>
              ) : (
                /* FORGOT PASSWORD FORM */
                <div className={styles.forgotCard}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(false);
                      setForgotSent(false);
                      setGeneralError(null);
                    }}
                    className={styles.backToLoginBtn}
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Login</span>
                  </button>

                  <h3 className={styles.headerTitle}>Reset Account Access</h3>
                  <p className={styles.forgotText}>
                    Provide your verified registered email. We will generate an encrypted
                    recovery token for password reinitialization.
                  </p>

                  {forgotSent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52c41a', fontSize: '13px' }}>
                      <CheckCircle2 size={16} />
                      <span>Recovery instructions sent! Check your inbox.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotSubmit} className={styles.form}>
                      <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                          <Mail size={15} className={styles.inputIcon} />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="Enter your account email"
                            className={styles.textInput}
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className={styles.submitBtn}>
                        <span>DISPATCH RECOVERY LINK</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* ADMIN FLOW */}
          {selectedRole === 'admin' && (
            <div className={styles.adminContainer}>
              <h2 className={styles.headerTitle}>Command Clearance</h2>
              <p className={styles.headerSubtitle}>
                Restricted access for Shin Sekai inventory controllers, logistics chiefs, and commanders.
              </p>

              {generalError && (
                <div className={styles.errorBanner} role="alert">
                  <AlertCircle size={16} />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className={styles.form} noValidate>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    <span>ADMIN IDENTIFIER</span>
                    {fieldErrors.adminEmail && (
                      <span className={styles.fieldError}>{fieldErrors.adminEmail}</span>
                    )}
                  </label>
                  <div className={styles.inputWrapper}>
                    <Shield size={15} className={styles.inputIcon} />
                    <input
                      type="text"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@demonslayer.store"
                      className={styles.textInput}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    <span>COMMAND CIPHER</span>
                    {fieldErrors.adminPassword && (
                      <span className={styles.fieldError}>{fieldErrors.adminPassword}</span>
                    )}
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className={styles.textInput}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className={styles.togglePasswordBtn}
                      aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.submitBtn} ${styles.adminSubmitBtn}`}
                >
                  <span>{isSubmitting ? 'AUTHENTICATING CLEARANCE...' : 'AUTHORIZE ADMIN ACCESS'}</span>
                  <ArrowRight size={15} />
                </button>

                {/* Admin Demo Credentials Quick Fill */}
                <div className={styles.demoPillBox}>
                  <div className={styles.demoInfo}>
                    <span className={styles.demoTitle}>COMMANDER CLEARANCE PASS</span>
                    <span className={styles.demoCreds}>admin@demonslayer.store (Admin@123)</span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className={styles.quickFillBtn}
                  >
                    Auto Fill
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
