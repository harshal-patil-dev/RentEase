import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import "./VerifyOtp.css";

/**
 * RentEase Backend Endpoint for OTP Verification
 * POST http://localhost:8080/rentease-backend/verify-otp
 * Body: { "email": "USER_EMAIL", "otp": "123456" }
 * Success: { "Success": "OTP verified successfully.", "ResetToken": "..." }
 */
const VERIFY_OTP_API_URL = "http://localhost:8080/rentease-backend/verify-otp";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email and optional notification message from previous step
  const email = location.state?.email || "";

  // State management
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // If email was not passed in state, inform user
  useEffect(() => {
    if (!email) {
      showToast(
        "error",
        "Email address not found. Please initiate password reset first.",
      );
    } else if (location.state?.message) {
      showToast("success", location.state.message);
      // Clean history state message
      window.history.replaceState({ email }, document.title);
    }
  }, [email, location.state]);

  const handleOtpChange = (e) => {
    // Only allow digits and max length of 6
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast(
        "error",
        "Email is missing. Please go back to Forgot Password.",
      );
      return;
    }

    const trimmedOtp = otp.trim();

    // 1. Check if empty
    if (!trimmedOtp) {
      showToast("error", "Please enter the 6-digit OTP sent to your email.");
      return;
    }

    // 2. Check 6-digit length
    if (trimmedOtp.length !== 6) {
      showToast("error", "OTP must be exactly 6 digits.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(VERIFY_OTP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: trimmedOtp,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // 1. Handle backend Error response
      if (data?.Error) {
        showToast("error", data.Error);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          "Failed to verify OTP. Please try again.";
        showToast("error", errorMsg);
        return;
      }

      // 2. Handle backend Success response
      const resetToken = data?.ResetToken || data?.resetToken;
      const successMsg = data?.Success || "OTP verified successfully.";

      if (resetToken) {
        showToast("success", successMsg);

        // Pass BOTH email and ResetToken to the Reset Password page
        setTimeout(() => {
          navigate("/reset-password", {
            state: {
              email: email.trim(),
              resetToken: resetToken,
              message: successMsg,
            },
          });
        }, 350);
        return;
      }

      // If token missing in response but OK
      showToast(
        "error",
        "Verification token was not received. Please try requesting a new OTP.",
      );
    } catch (err) {
      console.error("Verify OTP error:", err);
      showToast(
        "error",
        "Unable to connect to the server. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-otp-page auth-page">
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

        <div className="otp-header">
          <div className="otp-icon-wrapper" aria-hidden="true">
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
              <circle cx="12" cy="16" r="1.5" />
            </svg>
          </div>
          <h2 className="auth-title">Verify OTP</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to{" "}
            {email ? (
              <span className="otp-email-highlight">{email}</span>
            ) : (
              "your registered email"
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="otp-input" className="form-label">
              Verification Code (OTP)
            </label>
            <div className="otp-input-container">
              <input
                id="otp-input"
                className="form-input otp-field"
                type="text"
                name="otp"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading || !email}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            <span className="otp-input-hint">
              Enter the 6-digit numeric OTP sent to your inbox.
            </span>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || !email || otp.length < 6}
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" aria-hidden="true"></span>
                Verifying OTP...
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
                Verify OTP
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-actions">
          <Link to="/forgot-password" className="back-to-forgot-link">
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
            Back to Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
}
