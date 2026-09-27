import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "./Home.css";

/**
 * RentEase Home Page
 *
 * Supports displaying a success message received through React Router
 * navigation state (e.g. from Login success) with smooth slide-in toast
 * and 2-3 second auto-dismiss using reusable Toast component.
 */
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [toast, setToast] = useState(null);

  // 1. Read and display success message received through React Router navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setToast({
        type: "success",
        message: location.state.successMessage,
      });

      // Clear navigation state in history so toast does not repeat on page reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleExplore = () => {
    navigate("/properties");
  };

  return (
    <div className="home-page page-fade-in">
      {/* Existing reusable Navbar */}
      <Navbar />

      {/* Reusable Toast Notification (Top-Right) */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot"></span>
            Seamless Property Rental Experience
          </div>

          <h1 className="home-hero-title">
            Find and manage your next <span>rental home</span> with ease
          </h1>

          <p className="home-hero-subtitle">
            RentEase simplifies property discovery, leasing, and tenancy
            management with a fast, modern, and transparent platform designed
            for both tenants and owners.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="home-btn-primary"
              onClick={handleExplore}
            >
              Explore Properties
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <Link to="/register" className="home-btn-secondary">
              List Your Property
            </Link>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="home-features">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h2 className="home-feature-title">Verified Listings</h2>
            <p className="home-feature-desc">
              Browse curated apartments, houses, and studios verified for
              authenticity, pricing, and genuine landlords.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h2 className="home-feature-title">Fast Scheduling</h2>
            <p className="home-feature-desc">
              Request home tours and schedule visits directly with property
              managers in just a few clicks.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h2 className="home-feature-title">Secure Tenancy</h2>
            <p className="home-feature-desc">
              Manage leases, rent payments, and documentation seamlessly with
              complete transparency and record protection.
            </p>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        © {new Date().getFullYear()} RentEase. All rights reserved. Property
        rental management made effortless.
      </footer>
    </div>
  );
}
