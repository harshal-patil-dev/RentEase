/**
 * RentEase User Identity & Profile Helper
 *
 * Centralized identity utilities to:
 * 1. Compute consistent user initials (e.g. "Gopal Patil" -> "GP", "Rahul" -> "RA")
 * 2. Fetch/cache profile data from Spring Boot backend without redundant duplicate requests
 * 3. Fallback gracefully if backend is temporarily disconnected or in cloud preview environment
 */

const PROFILE_API_URL = "http://localhost:8080/rentease-backend/profile";

let inFlightProfilePromise = null;
let cachedProfileData = null;

/**
 * Automatically generates 1-2 letter uppercase initials from any name.
 * Examples:
 *   "Gopal Patil" -> "GP"
 *   "Yash Patil"  -> "YP"
 *   "Rahul"       -> "RA"
 *   ""            -> "U"
 */
export function getInitials(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Derives a clean fallback profile from email/role when backend is unreachable
 */
function deriveFallbackProfile(token) {
  try {
    const savedRole = localStorage.getItem("role") || "TENANT";
    const savedEmail =
      localStorage.getItem("rentease_user_email") || "user@rentease.com";
    const username = savedEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = username
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      id: 1,
      name: formattedName || "RentEase User",
      email: savedEmail,
      phone: "+91 98765 43210",
      role: savedRole,
      isOfflineFallback: true,
    };
  } catch {
    return {
      id: 1,
      name: "RentEase User",
      email: "user@rentease.com",
      phone: "+91 98765 43210",
      role: "TENANT",
      isOfflineFallback: true,
    };
  }
}

/**
 * Gets cached profile from memory or localStorage if present
 */
export function getStoredProfile() {
  if (cachedProfileData) return cachedProfileData;
  try {
    const raw = localStorage.getItem("rentease_user_profile");
    if (raw) {
      cachedProfileData = JSON.parse(raw);
      return cachedProfileData;
    }
  } catch {
    // Ignore JSON parse error
  }
  return null;
}

/**
 * Saves profile data to cache and notifies all listeners (Navbar, Profile, etc.)
 */
export function setStoredProfile(data) {
  cachedProfileData = data;
  if (data) {
    localStorage.setItem("rentease_user_profile", JSON.stringify(data));
  } else {
    localStorage.removeItem("rentease_user_profile");
  }
  window.dispatchEvent(
    new CustomEvent("rentease-profile-update", { detail: data }),
  );
}

/**
 * Clears profile and auth cache
 */
export function clearStoredProfile() {
  cachedProfileData = null;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("rentease_user_profile");
  window.dispatchEvent(new CustomEvent("rentease-auth-change"));
  window.dispatchEvent(
    new CustomEvent("rentease-profile-update", { detail: null }),
  );
}

/**
 * Fetches user profile from backend API with automatic deduplication.
 * If backend is offline (Failed to fetch), provides a smooth fallback so the app
 * doesn't crash or show a broken screen.
 */
export async function fetchUserProfile(forceRefresh = false) {
  const token = localStorage.getItem("token");
  if (!token) {
    clearStoredProfile();
    return { data: null, error: "No token found", unauthorized: true };
  }

  if (!forceRefresh && cachedProfileData) {
    return { data: cachedProfileData, error: null, unauthorized: false };
  }

  if (inFlightProfilePromise) {
    return inFlightProfilePromise;
  }

  inFlightProfilePromise = (async () => {
    try {
      // Create an abort controller with timeout so requests don't hang indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(PROFILE_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        clearStoredProfile();
        return {
          data: null,
          error: "Session expired. Please log in again.",
          unauthorized: true,
        };
      }

      if (!response.ok) {
        throw new Error(`Profile fetch failed (Status ${response.status})`);
      }

      const data = await response.json();
      setStoredProfile(data);
      return { data, error: null, unauthorized: false };
    } catch (err) {
      // When Spring Boot backend is not running locally (Failed to fetch / connection refused)
      const existing = getStoredProfile();
      if (existing) {
        return { data: existing, error: null, unauthorized: false };
      }

      // If no cached profile is available yet, derive fallback profile from login state
      // so user can continue viewing their UI without a red console break
      const fallback = deriveFallbackProfile(token);
      setStoredProfile(fallback);

      return {
        data: fallback,
        error:
          "Backend API (http://localhost:8080/rentease-backend/profile) is currently unreachable. Displaying cached profile.",
        unauthorized: false,
      };
    } finally {
      inFlightProfilePromise = null;
    }
  })();

  return inFlightProfilePromise;
}
