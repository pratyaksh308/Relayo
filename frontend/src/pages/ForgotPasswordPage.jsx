import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import relayoIcon from '../assets/images/relayo-r.png';
import authBgVideo from '../assets/video/auth-bg.mp4';
import '../styles/auth.css';
import { forgotPassword } from '../api/auth.api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = ({ onBackToLogin }) => {
  const navigate = useNavigate();

  const handleBackToLogin = useCallback(() => {
    if (onBackToLogin) onBackToLogin();
    else navigate('/login');
  }, [onBackToLogin, navigate]);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      setSuccess('');

      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        setError('Enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        const { data } = await forgotPassword({ email });
        setSuccess(data.message || 'Reset link sent');
        // Use the real token from the API (sent for testing; in production you'd get this via email)
        if (data.resetToken) {
          setTimeout(() => {
            navigate(`/reset-password/${data.resetToken}`);
          }, 1500);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || 'Failed to send reset link'
        );
      } finally {
        setLoading(false);
      }
    },
    [email, navigate]
  );

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

          <div className="subtitle-centre">
            <p className="relayo-subtitle">Enter your email to reset your password</p>
          </div>

          <form className="relayo-form" onSubmit={handleSubmit} noValidate>
            <div className="alert-space">
              {error && <div className="relayo-alert relayo-alert-error">{error}</div>}
              {success && (
                <div className="relayo-alert relayo-alert-success success-animate">
                  {success}
                </div>
              )}
            </div>

            <div className="relayo-field">
              <label className="relayo-label" htmlFor="forgot-password-email">
                Email
              </label>
              <input
                id="forgot-password-email"
                type="email"
                className="relayo-input"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <button type="submit" className="relayo-button" disabled={loading}>
              {loading ? "Sending…" : "SEND RESET LINK"}
            </button>

            <div className="auth-link-row">
              <a
                href="/login"
                className="auth-link"
                onClick={(event) => {
                  event.preventDefault();
                  handleBackToLogin();
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

export default ForgotPasswordPage;