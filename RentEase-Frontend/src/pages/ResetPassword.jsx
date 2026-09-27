import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import "./ResetPassword.css";

/**
 * RentEase Backend Endpoint for Password Reset
 * POST http://localhost:8080/rentease-backend/reset-password
 * Body: { "email": "USER_EMAIL", "resetToken": "...", "newPassword": "...", "confirmPassword": "..." }
 * Success: { "Success": "Password reset successfully." }
 */
const RESET_PASSWORD_API_URL =
  "http://localhost:8080/rentease-backend/reset-password";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email and resetToken passed from VerifyOtp
  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  // State management
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Check token availability on mount
  useEffect(() => {
    if (!email || !resetToken) {
      showToast(
        "error",
        "Reset authorization token is missing. Please start password recovery from the beginning.",
      );
    } else if (location.state?.message) {
      showToast("success", location.state.message);
      window.history.replaceState({ email, resetToken }, document.title);
    }
  }, [email, resetToken, location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !resetToken) {
      showToast(
        "error",
        "Missing authorization token. Please request a new OTP.",
      );
      return;
    }

    const { newPassword, confirmPassword } = formData;

    // 1. Validation: New Password required
    if (!newPassword) {
      showToast("error", "Please enter your new password.");
      return;
    }

    // 2. Validation: Minimum 8 characters
    if (newPassword.length < 8) {
      showToast("error", "New password must be at least 8 characters long.");
      return;
    }

    // 3. Validation: Confirm Password required
    if (!confirmPassword) {
      showToast("error", "Please confirm your new password.");
      return;
    }

    // 4. Validation: Passwords match
    if (newPassword !== confirmPassword) {
      showToast("error", "Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(RESET_PASSWORD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          resetToken: resetToken.trim(),
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Handle backend Error response
      if (data?.Error) {
        showToast("error", data.Error);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          "Failed to reset password. Please try again.";
        showToast("error", errorMsg);
        return;
      }

      // Success handling: Show toast and navigate to /login with successMessage
      const successMessage =
        data?.Success || "Password reset successfully. Please log in.";
      showToast("success", successMessage);

      // Pass successMessage to Login so Login.jsx automatically displays the Toast
      setTimeout(() => {
        navigate("/login", {
          state: {
            successMessage: successMessage,
          },
        });
      }, 500);
    } catch (err) {
      console.error("Reset Password error:", err);
      showToast(
        "error",
        "Unable to connect to the server. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page auth-page">
      {/* RentEase Reusable Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          position="auth"
          onClose={() => setToast(null)}
        />
      )}

      <div className="auth-card">
        {/* Reusable RentEase Brand Logo */}
        <Logo />

        <div className="reset-header">
          <div className="reset-icon-wrapper" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Enter a new password for{" "}
            {email ? (
              <span className="reset-email-highlight">{email}</span>
            ) : (
              "your RentEase account"
            )}
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="new-password-input" className="form-label">
              New Password
            </label>
            <div className="password-wrapper">
              <input
                id="new-password-input"
                className="form-input"
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="At least 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading || !email || !resetToken}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm-password-input" className="form-label">
              Confirm New Password
            </label>
            <div className="password-wrapper">
              <input
                id="confirm-password-input"
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading || !email || !resetToken}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || !email || !resetToken}
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Resetting Password...
              </>
            ) : (
              <>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-actions">
          <Link to="/login" className="back-to-login-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
