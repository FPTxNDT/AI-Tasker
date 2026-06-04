// =============================================================================
// AITasker Auth Service
// =============================================================================
// Thin wrapper around the API client for authentication endpoints.
// Matches the expected ASP.NET Core backend routes:
//
//   POST /auth/login            → { token, user }
//   POST /auth/register         → { token, user }
//   POST /auth/forgot-password  → { message }
//   POST /auth/reset-password   → { message }
//   POST /auth/refresh          → { token }
//
// Usage from AuthContext (or anywhere):
//   import { login, register } from "../services/authService.js";
//   const { token, user } = await login(email, password);
// =============================================================================

import { api } from "./api.js";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Authenticate with email and password.
 *
 * Expected backend response:
 *   { token: string, user: { id, email, name, role } }
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  const response = await api.auth.login(email, password);

  // Normalise the response shape regardless of how the backend names fields
  const token = response.token || response.accessToken || response.access_token;
  const user = response.user || response.profile || null;

  if (!token) {
    throw new Error("Server did not return an authentication token.");
  }

  return { token, user };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

/**
 * Create a new account.
 *
 * Expected request body:
 *   { name, email, password, confirmPassword, role }
 *
 * Expected backend response:
 *   { token: string, user: { id, email, name, role } }
 *
 * @param {object} data - { name, email, password, confirmPassword, role }
 * @returns {Promise<{token: string, user: object}>}
 */
export async function register(data) {
  const response = await api.auth.register(data);

  const token = response.token || response.accessToken || response.access_token;
  const user = response.user || response.profile || null;

  if (!token) {
    throw new Error("Server did not return an authentication token.");
  }

  return { token, user };
}

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------

/**
 * Request a password reset email.
 *
 * @param {string} email
 * @returns {Promise<{message: string}>}
 */
export async function forgotPassword(email) {
  return api.auth.forgotPassword(email);
}

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------

/**
 * Reset password using a token from the reset email.
 *
 * @param {string} token - Reset token from the email link
 * @param {string} newPassword - The new password
 * @returns {Promise<{message: string}>}
 */
export async function resetPassword(token, newPassword) {
  return api.auth.resetPassword(token, newPassword);
}

// ---------------------------------------------------------------------------
// Refresh Token
// ---------------------------------------------------------------------------

/**
 * Get a new access token using a refresh token.
 * The backend handles the refresh token via httpOnly cookie.
 *
 * @returns {Promise<{token: string}>}
 */
export async function refreshToken() {
  return api.auth.refreshToken();
}
