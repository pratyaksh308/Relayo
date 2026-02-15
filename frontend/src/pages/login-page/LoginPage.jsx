import React, { useState, useRef, useCallback } from 'react';
import relayoIcon from '../../assets/images/relayo-r.png';
import './LoginPage.css';

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const LOADING_DELAY = 1500;
const SUCCESS_DISPLAY_DURATION = 3000;
const BUTTON_SUCCESS_DURATION = 3000;

const LoginPage = ({ onForgotPassword = () => {}, onSignUp = () => {} }) => {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caretPos, setCaretPos] = useState(null);
  
  const passwordRef = useRef(null);

  // Validation functions
  const validateForm = useCallback(() => {
    if (!email.trim() || !password.trim()) {
      return 'Please fill in both email and password.';
    }

    if (!EMAIL_REGEX.test(email)) {
      return 'Enter a valid email address.';
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return null;
  }, [email, password]);

  // Input handlers
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (error) setError('');
  }, [error]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    if (error) setError('');
  }, [error]);

  // Password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    const currentPos = caretPos;
    setShowPassword((prev) => !prev);

    setTimeout(() => {
      if (passwordRef.current && currentPos !== null) {
        passwordRef.current.setSelectionRange(currentPos, currentPos);
      }
    }, 0);
  }, [caretPos]);

  // Form submission handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setButtonSuccess(true);

      const successMessage = rememberMe
        ? 'Signed in & remembered. Welcome back to Relayo.'
        : 'Signed in successfully. Welcome back to Relayo.';

      setSuccess(successMessage);

      // Reset button success state
      setTimeout(() => {
        setButtonSuccess(false);
      }, BUTTON_SUCCESS_DURATION);

      // Clear success message
      setTimeout(() => {
        setSuccess('');
      }, SUCCESS_DISPLAY_DURATION);
    }, LOADING_DELAY);
  }, [validateForm, rememberMe]);

  // Render alert message
  const renderAlert = () => {
    if (error) {
      return <div className="relayo-alert relayo-alert-error">{error}</div>;
    }
    if (success) {
      return (
        <div className="relayo-alert relayo-alert-success success-animate">
          {success}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relayo-root fade-in">
      <div className="relayo-overlay">
        <div className="relayo-card">
          {/* Logo */}
          <div className="logo-wrap">
            <img
              src={relayoIcon}
              alt="Relayo"
              className="relayo-logo"
            />
          </div>

          {/* Subtitle */}
          <div className="subtitle-centre">
            <p className="relayo-subtitle">Sign in to continue chatting</p>
          </div>

          {/* Login Form */}
          <form className="relayo-form" onSubmit={handleSubmit} noValidate>
            {/* Alert Messages */}
            <div className="alert-space">
              {renderAlert()}
            </div>

            {/* Email Input */}
            <div className="relayo-field">
              <label className="relayo-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="relayo-input"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            {/* Password Input */}
            <div className="relayo-field">
              <label className="relayo-label" htmlFor="password">
                Password
              </label>
              <div className="password-box">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  className="relayo-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onSelect={(e) => setCaretPos(e.target.selectionStart)}
                />
                <span
                  className="eye-icon"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={togglePasswordVisibility}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-row">
              <a
                href="#"
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword();
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Remember Me Checkbox */}
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>Remember me</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className={`relayo-button ${buttonSuccess ? 'btn-success' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'LOGIN'}
            </button>

            {/* Sign Up Link */}
            <div className="signup-row">
              <span className="signup-text">
                Don't have an account?{' '}
                <a
                  href="#"
                  className="signup-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onSignUp();
                  }}
                >
                  Sign up
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
