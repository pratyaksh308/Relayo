import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import relayoIcon from '../assets/images/relayo-r.png';
import authBgVideo from '../assets/video/auth-bg.mp4';
import '../styles/auth.css';
import { registerUser } from "../api/auth.api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordCaretPos, setPasswordCaretPos] = useState(null);

  const passwordRef = useRef(null);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      setSuccess('');

      if (!name.trim() || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Please fill in all fields.');
        return;
      }

      const usernameRegex = /^[a-z0-9_]+$/;
      if (username.length < 3 || username.length > 20) {
        setError('Username must be between 3 and 20 characters.');
        return;
      }
      if (!usernameRegex.test(username)) {
        setError('Username can only contain lowercase letters, numbers, and underscores.');
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

      try {
        const res = await registerUser({
          name,
          username,
          email,
          password,
        });

        setSuccess('Account created successfully.');

        console.log('Register response:', res.data);

        setTimeout(() => {
          navigate('/login');
        }, 1500);

      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    },
    [name, email, password, confirmPassword, navigate]
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

  return (
    <div className="relayo-root fade-in">
      <video
        className="relayo-auth-video"
        src={authBgVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="relayo-overlay">
        <div className="relayo-card">
          <div className="logo-wrap">
            <img src={relayoIcon} alt="Relayo" className="relayo-logo" />
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Join Relayo</h2>
            <p className="relayo-subtitle">Create your secure workspace in seconds</p>
          </div>

          <form className="relayo-form" onSubmit={handleSubmit} noValidate>
            <div className="alert-space">
              {error && <div className="relayo-alert relayo-alert-error">{error}</div>}
              {success && (
                <div className="relayo-alert relayo-alert-success success-animate">{success}</div>
              )}
            </div>

            <p className="form-section-label">ACCOUNT DETAILS</p>
            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-name">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                className="relayo-input"
                placeholder="Your Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="register-username">
                Username
              </label>
              <input
                id="register-username"
                type="text"
                className="relayo-input"
                placeholder="lowercase_only123"
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
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

            <div className="form-divider" />

            <div className="security-section">
              <p className="form-section-label">SECURITY</p>
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
                <input
                  id="register-confirm-password"
                  type="password"
                  className="relayo-input"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <p className="password-hint">Use at least 6 characters</p>
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
