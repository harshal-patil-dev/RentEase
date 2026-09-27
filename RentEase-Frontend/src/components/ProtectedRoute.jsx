import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * RentEase Reusable Protected Route Component
 * 
 * Verifies JWT token existence in localStorage:
 * - If "token" exists: Renders child route components via <Outlet />.
 * - If "token" does not exist: Redirects immediately to /login with replace & state.
 * 
 * Designed for reuse across:
 * - /home
 * - /profile
 * - /properties
 * - Owner/Tenant Dashboards
 * - Favorites, etc.
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // If token is missing, redirect immediately to login with zero page flash
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Token exists -> render protected child routes
  return <Outlet />;
}