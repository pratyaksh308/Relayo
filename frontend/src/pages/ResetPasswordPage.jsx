import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import relayoIcon from "../assets/images/relayo-r.png";
import authBgVideo from "../assets/video/auth-bg.mp4";
import "../styles/auth.css";
import { resetPassword } from "../api/auth.api";

const MIN_PASSWORD_LENGTH = 6;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!password.trim()) {
        setError("Enter new password.");
        return;
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        setError("Password must be at least 6 characters.");
        return;
      }

      try {
        await resetPassword({ token, password });

        setSuccess("Password reset successful");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data === "string" ? err.response.data : null) ||
          err.message ||
          "Reset failed";
        setError(msg);
      }
    },
    [password, token, navigate]
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
            <p className="relayo-subtitle">Set a new password</p>
          </div>

          <form className="relayo-form" onSubmit={handleSubmit}>
            <div className="alert-space">
              {error && (
                <div className="relayo-alert relayo-alert-error">{error}</div>
              )}
              {success && (
                <div className="relayo-alert relayo-alert-success success-animate">
                  {success}
                </div>
              )}
            </div>

            <div className="relayo-field">
              <label className="relayo-label">New Password</label>
              <input
                type="password"
                className="relayo-input"
                placeholder="****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="relayo-button">
              RESET PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;