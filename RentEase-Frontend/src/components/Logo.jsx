import React from "react";
import "./Logo.css";

/**
 * RentEase Reusable Brand Logo Component
 * 
 * Preserves the exact visual design, blue gradient icon, typography,
 * size, spacing, and styling across all authentication and app views.
 */
export default function Logo({ className = "" }) {
  return (
    <div className={`brand-header ${className}`.trim()}>
      <div className="brand-logo-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h1 className="brand-name">
        Rent<span>Ease</span>
      </h1>
    </div>
  );
}