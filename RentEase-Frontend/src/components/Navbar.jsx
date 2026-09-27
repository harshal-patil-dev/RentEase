import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getInitials,
  getStoredProfile,
  fetchUserProfile,
  clearStoredProfile,
} from "../services/profileService";
import "./Navbar.css";

/**
 * RentEase Reusable Navbar Component
 *
 * Features:
 * - Brand emblem matching RentEase visual design system
 * - Main navigation: Home, Properties
 * - Auth detection via localStorage "token" (synchronous initial load, zero flicker)
 * - Profile avatar sharing the exact same initials generator and profile data as Profile page
 * - Deduplicated profile fetching to avoid duplicate API calls
 * - Responsive mobile drawer
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth and cached profile synchronously
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  const [profile, setProfile] = useState(() => getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync auth & profile data
  useEffect(() => {
    const syncState = () => {
      const token = localStorage.getItem("token");
      const loggedIn = Boolean(token);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Fetch or get cached profile without duplicate request
        fetchUserProfile(false).then((result) => {
          if (result.data) {
            setProfile(result.data);
          } else if (result.unauthorized) {
            setIsLoggedIn(false);
            setProfile(null);
          }
        });
      } else {
        setProfile(null);
      }
    };

    syncState();

    const handleProfileUpdate = (e) => {
      setProfile(e.detail);
    };

    window.addEventListener("storage", syncState);
    window.addEventListener("rentease-auth-change", syncState);
    window.addEventListener("rentease-profile-update", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("rentease-auth-change", syncState);
      window.removeEventListener(
        "rentease-profile-update",
        handleProfileUpdate,
      );
    };
  }, [location.pathname]);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearStoredProfile();
    setIsLoggedIn(false);
    setProfile(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Compute initials dynamically (e.g. "Gopal Patil" -> "GP", "Rahul" -> "RA")
  const initials = getInitials(profile?.name || "");

  return (
    <header className="rentease-navbar">
      <div className="rentease-nav-container">
        {/* Brand Logo & Name */}
        <Link to="/" className="rentease-nav-brand">
          <div className="rentease-brand-icon">
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="rentease-brand-name">
            Rent<span>Ease</span>
          </h1>
        </Link>

        {/* Main Navigation (Desktop) */}
        <nav aria-label="Main Navigation">
          <ul className="rentease-nav-menu">
            <li>
              <Link
                to="/home"
                className={`rentease-nav-link ${isActive("/home") ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/properties"
                className={`rentease-nav-link ${isActive("/properties") ? "active" : ""}`}
              >
                Properties
              </Link>
            </li>
          </ul>
        </nav>

        {/* Auth Action Controls (Desktop) */}
        <div className="rentease-nav-actions">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className={`rentease-profile-link ${isActive("/profile") ? "active" : ""}`}
                title={
                  profile?.name
                    ? `View Profile (${profile.name})`
                    : "View Profile"
                }
              >
                {/* Circular profile avatar with initials (matching Profile.jsx) */}
                <div className="rentease-nav-avatar" aria-label="User avatar">
                  {initials}
                </div>
                <span className="rentease-profile-label">Profile</span>
              </Link>
              <button
                type="button"
                className="rentease-btn-logout"
                onClick={handleLogout}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rentease-btn-link">
                Login
              </Link>
              <Link to="/register" className="rentease-btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="rentease-menu-toggle"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
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
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="rentease-mobile-drawer">
          <ul className="rentease-mobile-menu">
            <li>
              <Link
                to="/home"
                className={`rentease-nav-link ${isActive("/home") ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/properties"
                className={`rentease-nav-link ${isActive("/properties") ? "active" : ""}`}
              >
                Properties
              </Link>
            </li>
          </ul>

          <div className="rentease-mobile-divider" />

          <div className="rentease-mobile-actions">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="rentease-profile-link">
                  <div className="rentease-nav-avatar" aria-label="User avatar">
                    {initials}
                  </div>
                  <span className="rentease-profile-label">Profile</span>
                </Link>
                <button
                  type="button"
                  className="rentease-btn-logout"
                  onClick={handleLogout}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rentease-btn-link">
                  Login
                </Link>
                <Link to="/register" className="rentease-btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
