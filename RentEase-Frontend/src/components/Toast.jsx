import React, { useEffect } from "react";
import "./Toast.css";

/**
 * RentEase Reusable Toast Notification Component
 *
 * Supports:
 * - type: "success" | "error"
 * - message: string
 * - onClose: optional callback when dismissed
 * - duration: auto-dismiss timer in ms (default 2800ms)
 * - position: "default" (for pages with navbar, top 80px) | "auth" (for auth pages without navbar, top 24px)
 */
export default function Toast({
  type = "success",
  message = "",
  onClose,
  duration = 2800,
  position = "default",
}) {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`re-toast re-toast-${type} ${
        position === "auth" ? "auth-pos" : ""
      }`}
      role="alert"
    >
      <div className="re-toast-icon">
        {isSuccess ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      <span className="re-toast-message">{message}</span>

      {onClose && (
        <button
          type="button"
          className="re-toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
