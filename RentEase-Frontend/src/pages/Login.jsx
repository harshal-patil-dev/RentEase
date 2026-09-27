import React, { useState, useEffect } from "react";
import { loginUser } from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  // 1. Check for success message passed via React Router navigation state (e.g. from Register)
  useEffect(() => {
    if (location.state?.successMessage) {
      setToast({
        type: "success",
        message: location.state.successMessage,
      });

      // Clear navigation state in history so toast does not re-appear on normal browser refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await loginUser(formData);

    // 1. If backend returns an Error, display exact backend Error message as error toast on Login page
    if (response?.Error) {
      showToast("error", response.Error);
      return;
    }

    // 2. If login succeeds:
    if (response?.Success) {
      console.log(response.Success);

      // Save token and role
      localStorage.setItem("token", response.Token);
      localStorage.setItem("role", response.Role);
      if (formData.email) {
        localStorage.setItem("rentease_user_email", formData.email);
      }

      setFormData({
        email: "",
        password: "",
      });

      // Pass the backend Success message to Home using React Router navigation state
      // (Do not show login success toast on Login page because navigation happens immediately)
      navigate("/home", {
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
      showToast("error", "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-page">
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your property rental account</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label htmlFor="password-input" className="form-label">
                Password
              </label>
              <Link
                to="/forgot-password"
                 state={{ email: formData.email }}
                className="auth-link"
                style={{ fontSize: "12.5px", fontWeight: "600", marginLeft: 0 }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="password-wrapper">
              <input
                id="password-input"
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
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
          <button type="submit" className="btn-submit">
            Login
          </button>
        </form>
        <p className="auth-footer">
          No account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
