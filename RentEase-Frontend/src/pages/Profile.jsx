import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import {
  getInitials,
  getStoredProfile,
  fetchUserProfile,
} from "../services/profileService";
import "./Profile.css";

const PROFILE_API_URL = "http://localhost:8080/rentease-backend/profile";
const CHANGE_PASSWORD_API_URL =
  "http://localhost:8080/rentease-backend/change-password";

/**
 * RentEase User Profile Page
 *
 * Fetches user profile from protected Spring Boot API:
 * GET http://localhost:8080/rentease-backend/profile
 * Header: Authorization: Bearer <token>
 *
 * Supports inline editing:
 * - Edit button toggles edit mode
 * - "name" and "phone" are editable
 * - "email" and "role" are strictly read-only
 * - PUT http://localhost:8080/rentease-backend/profile with body: { name, phone }
 * - On success, re-calls GET /profile and refreshes data
 * - On error, logs error in console
 */
export default function Profile() {
  const navigate = useNavigate();

  // Initialize with cached profile if available to prevent flash
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(() => !getStoredProfile());
  const [error, setError] = useState(null);

  // Active Tab state: "profile" | "edit" | "password"
  const [activeTab, setActiveTab] = useState("profile");

  // Edit Mode state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Change Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toast Notification state: { type: "success" | "error", message: string } | null
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const loadProfile = async (isManualRetry = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (isManualRetry) {
      setLoading(true);
    }
    setError(null);

    const result = await fetchUserProfile(true);

    if (result.unauthorized) {
      navigate("/login");
      return;
    }

    if (result.error && !result.data) {
      setError(result.error);
    } else if (result.data) {
      setProfile(result.data);
      setFormData({
        name: result.data.name || "",
        phone: result.data.phone || "",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile(false);
  }, []);

  // When profile loads or updates, keep formData in sync
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // Switch tabs smoothly and sync form data if entering edit mode
  const handleTabChange = (tabName) => {
    if (tabName === activeTab) return;

    if (tabName === "edit") {
      setFormData({
        name: profile?.name || "",
        phone: profile?.phone || "",
      });
    }

    setActiveTab(tabName);
  };

  // Handle Edit button click
  const handleEditClick = () => {
    handleTabChange("edit");
  };

  // Handle Cancel button click
  const handleCancelClick = () => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
    });
    setActiveTab("profile");
  };

  // Handle Form input change (only for name & phone)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Save button click
  const handleSaveClick = async (e) => {
    if (e) e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSaving(true);

    // Request body contains only name and phone
    const updatePayload = {
      name: formData.name,
      phone: formData.phone,
    };

    try {
      const response = await fetch(PROFILE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      // Parse JSON response returned by backend
      let responseData = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      // Check if backend returned an Error (in body or via HTTP error status)
      if (responseData?.Error) {
        showToast("error", responseData.Error);
        setIsSaving(false);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          "Failed to update profile.";
        showToast("error", errorMsg);
        setIsSaving(false);
        return;
      }

      // Check if backend returned a Success
      if (responseData?.Success) {
        // Only call GET /profile after a successful update
        await loadProfile(false);
        setActiveTab("profile");
        showToast("success", responseData.Success);
        return;
      }

      // Fallback if HTTP 200 with standard response
      await loadProfile(false);
      setActiveTab("profile");
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("error", err.message || "Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password form input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear password form fields
  const handlePasswordClear = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Handle Change Password submission
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "Your session has expired. Please login again.");
      navigate("/login");
      return;
    }

    // 1. Frontend validation: empty fields
    if (
      !passwordData.currentPassword.trim() ||
      !passwordData.newPassword.trim() ||
      !passwordData.confirmPassword.trim()
    ) {
      showToast("error", "Please fill in all password fields.");
      return;
    }

    // 2. Frontend validation: password mismatch
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("error", "New password and Confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch(CHANGE_PASSWORD_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      // Check if backend returned an Error (in JSON body)
      if (responseData?.Error) {
        showToast("error", responseData.Error);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          "Failed to change password. Please check your credentials.";
        showToast("error", errorMsg);
        return;
      }

      // Check if backend returned Success
      if (responseData?.Success) {
        showToast("success", responseData.Success);
        // Clear password fields on successful change
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        return;
      }

      // Fallback for success
      showToast("success", "Password changed successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      showToast("error", "Network error. Unable to connect to backend server.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Compute initials dynamically (e.g., "Gopal Patil" -> "GP", "Rahul" -> "RA")
  const initials = getInitials(profile?.name || "");

  return (
    <div className="profile-page page-fade-in">
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

      <main className="profile-main">
        {/* Breadcrumb & Section Header */}
        <div className="profile-header">
          <div className="profile-breadcrumb">
            <span>Account</span>
            <span className="profile-breadcrumb-sep">/</span>
            <span className="profile-breadcrumb-curr">
              {activeTab === "profile" && "Profile"}
              {activeTab === "edit" && "Edit Profile"}
              {activeTab === "password" && "Change Password"}
            </span>
          </div>
          <div className="profile-header-flex">
            <div>
              <h1 className="profile-page-title">
                {activeTab === "profile" && "Personal Information"}
                {activeTab === "edit" && "Edit Profile"}
                {activeTab === "password" && "Security & Password"}
              </h1>
              <p className="profile-page-subtitle">
                {activeTab === "profile" &&
                  "View your personal profile, verified contact details, and role credentials"}
                {activeTab === "edit" &&
                  "Update your public display name and contact phone number"}
                {activeTab === "password" &&
                  "Ensure your account is using a secure password to stay protected"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {profile && !loading && (
            <div className="profile-tabs-container">
              <div
                className="profile-tabs-nav"
                role="tablist"
                aria-label="Profile Sections"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-profile-btn"
                  aria-selected={activeTab === "profile"}
                  aria-controls="panel-profile"
                  className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => handleTabChange("profile")}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-edit-btn"
                  aria-selected={activeTab === "edit"}
                  aria-controls="panel-edit"
                  className={`profile-tab-btn ${activeTab === "edit" ? "active" : ""}`}
                  onClick={() => handleTabChange("edit")}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-password-btn"
                  aria-selected={activeTab === "password"}
                  aria-controls="panel-password"
                  className={`profile-tab-btn ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => handleTabChange("password")}
                >
                  <svg
                    width="17"
                    height="17"
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
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State: Clean Skeleton / Loading Card */}
        {loading && !profile && (
          <div className="profile-card profile-loading-card">
            <div className="profile-skeleton-banner"></div>
            <div className="profile-skeleton-header">
              <div className="profile-skeleton-avatar"></div>
              <div className="profile-skeleton-text-group">
                <div className="profile-skeleton-line title"></div>
                <div className="profile-skeleton-line badge"></div>
              </div>
            </div>
            <div className="profile-skeleton-grid">
              <div className="profile-skeleton-box"></div>
              <div className="profile-skeleton-box"></div>
              <div className="profile-skeleton-box"></div>
              <div className="profile-skeleton-box"></div>
            </div>
            <div className="profile-loading-indicator">
              <div className="profile-spinner-sm"></div>
              <span>Connecting to RentEase profile service...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && !profile && (
          <div className="profile-card profile-state-card">
            <div className="profile-error-icon">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="profile-error-title">Unable to Load Profile</h2>
            <p className="profile-error-message">{error}</p>
            <button
              type="button"
              className="profile-btn-retry"
              onClick={() => loadProfile(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Try Again
            </button>
          </div>
        )}

        {/* TAB 1: Profile View (Read-Only) */}
        {activeTab === "profile" && profile && (
          <div
            className="profile-tab-panel"
            id="panel-profile"
            role="tabpanel"
            aria-labelledby="tab-profile-btn"
            key="tab-profile"
          >
            <div className="profile-card">
              {/* Top Identity Section */}
              <div className="profile-card-header">
                <div className="profile-avatar-wrap">
                  <div
                    className="profile-avatar-large"
                    aria-label={`Avatar for ${profile.name || "User"}`}
                  >
                    <span className="profile-avatar-initials">{initials}</span>
                  </div>
                  <div className="profile-identity">
                    <div className="profile-title-row">
                      <h2 className="profile-display-name">
                        {profile.name || "RentEase User"}
                      </h2>
                      <span
                        className={`profile-role-badge ${(profile.role || "").toLowerCase()}`}
                      >
                        <span className="profile-role-dot"></span>
                        {profile.role || "TENANT"}
                      </span>
                    </div>
                    <p className="profile-identity-email">
                      {profile.email || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Overview Notice */}
              <div className="profile-notice">
                <div className="profile-notice-icon">
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <p className="profile-notice-text">
                  Your profile credentials and verified contact information are
                  linked to your RentEase rental account.
                </p>
              </div>

              {/* Detailed Properties Grid */}
              <div className="profile-details-grid">
                {/* Full Name */}
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="profile-detail-info">
                    <span className="profile-detail-label">Full Name</span>
                    <span className="profile-detail-value">
                      {profile.name || "—"}
                    </span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="profile-detail-item readonly">
                  <div className="profile-detail-icon">
                    <svg
                      width="19"
                      height="19"
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
                  </div>
                  <div className="profile-detail-info">
                    <div className="profile-label-with-tag">
                      <span className="profile-detail-label">
                        Email Address
                      </span>
                      <span className="profile-readonly-tag">Read-only</span>
                    </div>
                    <span className="profile-detail-value readonly-val">
                      {profile.email || "—"}
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="profile-detail-info">
                    <span className="profile-detail-label">Phone Number</span>
                    <span className="profile-detail-value">
                      {profile.phone || "—"}
                    </span>
                  </div>
                </div>

                {/* Account Role */}
                <div className="profile-detail-item readonly">
                  <div className="profile-detail-icon">
                    <svg
                      width="19"
                      height="19"
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
                  <div className="profile-detail-info">
                    <div className="profile-label-with-tag">
                      <span className="profile-detail-label">Account Role</span>
                      <span className="profile-readonly-tag">Read-only</span>
                    </div>
                    <span className="profile-detail-value readonly-val">
                      {profile.role || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Footer Status */}
              <div className="profile-card-footer">
                <div className="profile-status-indicator">
                  <span className="profile-status-dot"></span>
                  <span>Account Active & Authenticated</span>
                </div>
                <span className="profile-security-badge">JWT Protected</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Edit Profile */}
        {activeTab === "edit" && profile && (
          <div
            className="profile-tab-panel"
            id="panel-edit"
            role="tabpanel"
            aria-labelledby="tab-edit-btn"
            key="tab-edit"
          >
            <div className="profile-card">
              <form onSubmit={handleSaveClick}>
                {/* Top Identity Section */}
                <div className="profile-card-header">
                  <div className="profile-avatar-wrap">
                    <div
                      className="profile-avatar-large"
                      aria-label={`Avatar for ${profile.name || "User"}`}
                    >
                      <span className="profile-avatar-initials">
                        {initials}
                      </span>
                    </div>
                    <div className="profile-identity">
                      <div className="profile-title-row">
                        <h2 className="profile-display-name">
                          {profile.name || "RentEase User"}
                        </h2>
                        <span
                          className={`profile-role-badge ${(profile.role || "").toLowerCase()}`}
                        >
                          <span className="profile-role-dot"></span>
                          {profile.role || "TENANT"}
                        </span>
                      </div>
                      <p className="profile-identity-email">
                        {profile.email || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Overview Notice */}
                <div className="profile-notice">
                  <div className="profile-notice-icon">
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <p className="profile-notice-text">
                    You are editing your profile. You can update your Full Name
                    and Phone Number. Email and Role cannot be changed.
                  </p>
                </div>

                {/* Detailed Properties Grid */}
                <div className="profile-details-grid">
                  {/* Full Name — Editable */}
                  <div className="profile-detail-item editing">
                    <div className="profile-detail-icon">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="profile-detail-info">
                      <label
                        htmlFor="profile-name-input"
                        className="profile-detail-label"
                      >
                        Full Name{" "}
                        <span className="profile-required-star">*</span>
                      </label>
                      <input
                        id="profile-name-input"
                        type="text"
                        name="name"
                        className="profile-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address — Read-Only */}
                  <div className="profile-detail-item readonly">
                    <div className="profile-detail-icon">
                      <svg
                        width="19"
                        height="19"
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
                    </div>
                    <div className="profile-detail-info">
                      <div className="profile-label-with-tag">
                        <span className="profile-detail-label">
                          Email Address
                        </span>
                        <span className="profile-readonly-tag">Read-only</span>
                      </div>
                      <span className="profile-detail-value readonly-val">
                        {profile.email || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Phone Number — Editable */}
                  <div className="profile-detail-item editing">
                    <div className="profile-detail-icon">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div className="profile-detail-info">
                      <label
                        htmlFor="profile-phone-input"
                        className="profile-detail-label"
                      >
                        Phone Number{" "}
                        <span className="profile-required-star">*</span>
                      </label>
                      <input
                        id="profile-phone-input"
                        type="text"
                        name="phone"
                        className="profile-input"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  {/* Account Role — Read-Only */}
                  <div className="profile-detail-item readonly">
                    <div className="profile-detail-icon">
                      <svg
                        width="19"
                        height="19"
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
                    <div className="profile-detail-info">
                      <div className="profile-label-with-tag">
                        <span className="profile-detail-label">
                          Account Role
                        </span>
                        <span className="profile-readonly-tag">Read-only</span>
                      </div>
                      <span className="profile-detail-value readonly-val">
                        {profile.role || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="profile-card-bottom-actions">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={handleCancelClick}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="profile-btn-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Profile Footer Status */}
              <div className="profile-card-footer">
                <div className="profile-status-indicator">
                  <span className="profile-status-dot"></span>
                  <span>Account Active & Authenticated</span>
                </div>
                <span className="profile-security-badge">JWT Protected</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Change Password */}
        {activeTab === "password" && profile && (
          <div
            className="profile-tab-panel"
            id="panel-password"
            role="tabpanel"
            aria-labelledby="tab-password-btn"
            key="tab-password"
          >
            <div
              className="profile-card profile-security-card"
              id="change-password-section"
            >
              <div className="profile-card-header">
                <div className="profile-section-title-wrap">
                  <div className="profile-security-icon-large">
                    <svg
                      width="22"
                      height="22"
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
                  <div>
                    <h2 className="profile-section-title">Change Password</h2>
                    <p className="profile-section-subtitle">
                      Ensure your account is using a secure password to stay
                      protected
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="profile-password-form"
              >
                <div className="profile-password-grid">
                  {/* Current Password */}
                  <div className="profile-password-field">
                    <label
                      htmlFor="currentPassword-input"
                      className="profile-detail-label"
                    >
                      Current Password{" "}
                      <span className="profile-required-star">*</span>
                    </label>
                    <div className="profile-password-input-wrap">
                      <input
                        id="currentPassword-input"
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        className="profile-input"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="profile-password-toggle-btn"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="profile-password-field">
                    <label
                      htmlFor="newPassword-input"
                      className="profile-detail-label"
                    >
                      New Password{" "}
                      <span className="profile-required-star">*</span>
                    </label>
                    <div className="profile-password-input-wrap">
                      <input
                        id="newPassword-input"
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        className="profile-input"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="profile-password-toggle-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        title={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="profile-password-field">
                    <label
                      htmlFor="confirmPassword-input"
                      className="profile-detail-label"
                    >
                      Confirm Password{" "}
                      <span className="profile-required-star">*</span>
                    </label>
                    <div className="profile-password-input-wrap">
                      <input
                        id="confirmPassword-input"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="profile-input"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="profile-password-toggle-btn"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Guidance Note */}
                <div className="profile-password-hint">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Make sure your new password is at least 8 characters long
                    and differs from your current password.
                  </span>
                </div>

                {/* Form Action Buttons */}
                <div className="profile-card-bottom-actions">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={handlePasswordClear}
                    disabled={
                      isChangingPassword ||
                      (!passwordData.currentPassword &&
                        !passwordData.newPassword &&
                        !passwordData.confirmPassword)
                    }
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <span className="profile-btn-spinner"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Card Footer Status */}
              <div className="profile-card-footer">
                <div className="profile-status-indicator">
                  <span className="profile-status-dot"></span>
                  <span>Encrypted & Authenticated</span>
                </div>
                <span className="profile-security-badge">Bearer JWT</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
