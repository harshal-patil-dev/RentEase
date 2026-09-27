import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import "./ForgotPassword.css";

/**
 * RentEase Backend Endpoint for Forgot Password
 * POST http://localhost:8080/rentease-backend/forgot-password?email=USER_EMAIL
 */
const FORGOT_PASSWORD_API_URL =
  "http://localhost:8080/rentease-backend/forgot-password";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // State management
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper to show notification
  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Frontend validation and OTP request handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    // 1. Frontend validation: Empty check
    if (!trimmedEmail) {
      showToast("error", "Please enter your registered email address.");
      return;
    }

    // 2. Frontend validation: Valid email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP to user's email via backend endpoint
      const response = await fetch(
        `${FORGOT_PASSWORD_API_URL}?email=${encodeURIComponent(trimmedEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Check if backend returned an Error
      if (data?.Error) {
        showToast("error", data.Error);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          "Failed to send OTP. Please check your email and try again.";
        showToast("error", errorMsg);
        return;
      }

      // Check if backend returned Success
      if (data?.Success) {
        showToast("success", data.Success);
        // Navigate to Verify OTP page passing user's email and message
        setTimeout(() => {
          navigate("/verify-otp", {
            state: {
              email: trimmedEmail,
              message: data.Success,
            },
          });
        }, 350);
        return;
      }

      // Fallback success
      showToast("success", "OTP has been sent to your email.");
      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: trimmedEmail,
            message: "OTP has been sent to your email.",
          },
        });
      }, 350);
    } catch (err) {
      console.error("Forgot Password error:", err);
      showToast(
        "error",
        "Unable to connect to the server. Please verify your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page auth-page">
      {/* RentEase Reusable Toast Notification */}
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

        <div className="forgot-header">
          <div className="forgot-icon-wrapper" aria-hidden="true">
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
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            Enter your registered email address and we'll send you an OTP to
            reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email-input" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
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
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="forgot-email-input"
                className="form-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Sending OTP...
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send OTP
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
