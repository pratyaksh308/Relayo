import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import relayoIcon from '../../assets/images/relayo-r.png';
import '../login-page/LoginPage.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordCaretPos, setPasswordCaretPos] = useState(null);
  const [confirmCaretPos, setConfirmCaretPos] = useState(null);

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setError('');
      setSuccess('');

      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        setError('Enter a valid email address.');
        return;
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setSuccess('Account created successfully.');
    },
    [name, email, password, confirmPassword]
  );

  const togglePasswordVisibility = useCallback(() => {
    const currentPos = passwordCaretPos;
    setShowPassword((prev) => !prev);

    setTimeout(() => {
      if (passwordRef.current && currentPos !== null) {
        passwordRef.current.setSelectionRange(currentPos, currentPos);
      }
    }, 0);
  }, [passwordCaretPos]);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    const currentPos = confirmCaretPos;
    setShowConfirmPassword((prev) => !prev);

    setTimeout(() => {
      if (confirmPasswordRef.current && currentPos !== null) {
        confirmPasswordRef.current.setSelectionRange(currentPos, currentPos);
      }
    }, 0);
  }, [confirmCaretPos]);

  return (
    <div className="relayo-root fade-in">
      <div className="relayo-overlay">
        <div className="relayo-card">
          <div className="logo-wrap">
            <img src={relayoIcon} alt="Relayo" className="relayo-logo" />
          </div>

          <div className="subtitle-centre">
            <p className="relayo-subtitle">Create your account to start chatting</p>
          </div>

          <form className="relayo-form" onSubmit={handleSubmit} noValidate>
            <div className="alert-space">
              {error && <div className="relayo-alert relayo-alert-error">{error}</div>}
              {success && (
                <div className="relayo-alert relayo-alert-success success-animate">{success}</div>
              )}
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-name">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                className="relayo-input"
                placeholder="John Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="relayo-input"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-password">
                Password
              </label>
              <div className="password-box">
                <input
                  id="register-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  className="relayo-input"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onSelect={(event) => setPasswordCaretPos(event.target.selectionStart)}
                />
                <span
                  className="eye-icon"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={togglePasswordVisibility}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-confirm-password">
                Confirm password
              </label>
              <div className="password-box">
                <input
                  id="register-confirm-password"
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="relayo-input"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  onSelect={(event) => setConfirmCaretPos(event.target.selectionStart)}
                />
                <span
                  className="eye-icon"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={toggleConfirmPasswordVisibility}
                  role="button"
                  tabIndex={0}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            <button type="submit" className="relayo-button">
              CREATE ACCOUNT
            </button>

            <div className="auth-link-row">
              <a
                href="/login"
                className="auth-link"
                onClick={(event) => {
                  event.preventDefault();
                  navigate('/login');
                }}
              >
                Back to login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
