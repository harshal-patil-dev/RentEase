import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  let [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await registerUser(formData);

    // 1. If backend returns an Error, display exact backend Error message as error toast
    if (response?.Error) {
      showToast("error", response.Error);
      return;
    }

    // 2. If registration succeeds and backend returns "Success":
    if (response?.Success) {
      console.log(response.Success);

      if (formData.name) {
        localStorage.setItem("rentease_user_name", formData.name);
      }
      if (formData.email) {
        localStorage.setItem("rentease_user_email", formData.email);
      }
      if (formData.phone) {
        localStorage.setItem("rentease_user_phone", formData.phone);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
      });

      // Pass backend Success message to Login page using React Router navigation state
      navigate("/login", {
        state: {
          successMessage: response.Success,
        },
      });
      return;
    }

    // Fallback if no explicit Error or Success
    if (response?.message) {
      showToast("error", response.message);
    } else {
      showToast(
        "error",
        "Registration could not be completed. Please try again.",
      );
    }
  };

  return (
    <div className="register-page">
      {/* Reusable Toast Notification */}
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

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">
          Join RentEase to rent or list verified properties
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group form-group-full">
            <label htmlFor="name-input" className="form-label">
              Full Name
            </label>
            <input
              id="name-input"
              className="form-input"
              type="text"
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-input" className="form-label">
              Email
            </label>
            <input
              id="email-input"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input" className="form-label">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="password-input"
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
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
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
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
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone-input" className="form-label">
              Phone
            </label>
            <input
              id="phone-input"
              className="form-input"
              type="text"
              name="phone"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="role-select" className="form-label">
              Account Role
            </label>
            <select
              id="role-select"
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                - Select a Role -
              </option>
              <option value="TENANT">TENANT</option>
              <option value="OWNER">OWNER</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
