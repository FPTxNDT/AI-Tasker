import { createContext, useReducer, useEffect, useCallback, useMemo } from "react";
import { login as apiLogin, register as apiRegister } from "../../services/authService.js";

// ---------------------------------------------------------------------------
// JWT helpers (decode without verification — verification happens server-side)
// ---------------------------------------------------------------------------

/**
 * Decode the payload of a JWT without verifying the signature.
 * Returns the parsed payload object, or null if the token is invalid.
 *
 * Used ONLY to extract role / userId for client-side auth state.
 * Backend validates the token on every API call.
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Demo fallback JWT creation
// Used ONLY when the backend is unreachable.
// ---------------------------------------------------------------------------

function createDemoToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const body = {
    sub: payload.sub || `user-${Date.now()}`,
    email: payload.email,
    role: payload.role,
    name: payload.name || payload.email?.split("@")[0] || "",
    iat: nowInSeconds,
    exp: nowInSeconds + 24 * 60 * 60,
  };
  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode(header)}.${encode(body)}.demo-signature`;
}

function demoRoleFromEmail(email) {
  if (email.toLowerCase().includes("admin")) return "admin";
  if (email.toLowerCase().includes("expert")) return "expert";
  return "client";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_STORAGE_KEY = "aitasker_auth_token";

const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  RESTORE_SESSION: "RESTORE_SESSION",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  usingDemo: false, // true when backend is unavailable
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS: {
      const { token, user, usingDemo = false } = action.payload;
      return {
        ...state,
        token,
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        error: null,
        usingDemo,
      };
    }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        usingDemo: false,
      };

    case AUTH_ACTIONS.RESTORE_SESSION: {
      const { token, user } = action.payload;
      // If token has the demo signature, mark it
      const isDemo = token?.endsWith(".demo-signature") ?? false;
      return {
        ...state,
        token,
        user,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        error: null,
        usingDemo: isDemo,
      };
    }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // -----------------------------------------------------------------------
  // On mount: restore session from stored token
  // -----------------------------------------------------------------------
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      const payload = decodeJwtPayload(storedToken);
      if (!payload) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return;
      }

      const user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };

      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: { token: storedToken, user },
      });
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Listen for forced-logout events from the API layer (401 responses)
  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // -----------------------------------------------------------------------
  // Helper: store token + dispatch success
  // -----------------------------------------------------------------------
  const handleAuthSuccess = useCallback((token, user, usingDemo = false) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Extract user from JWT payload if not provided by backend
    let finalUser = user;
    if (!finalUser) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        finalUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        };
      }
    }

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { token, user: finalUser, usingDemo },
    });

    return finalUser;
  }, []);

  // -----------------------------------------------------------------------
  // login(email, password)
  // -----------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    // --- Attempt 1: Real backend API ---
    try {
      const { token, user } = await apiLogin(email, password);
      return handleAuthSuccess(token, user, false);
    } catch (apiError) {
      // If the error is a real server rejection (not a network failure),
      // don't fall back to demo — surface the error.
      if (apiError.status && apiError.status !== 0) {
        const message = apiError.message || "Login failed. Please check your credentials.";
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
        throw apiError;
      }
      // Otherwise (network error / connection refused) → fall through to demo
    }

    // --- Attempt 2: Demo fallback (backend unreachable) ---
    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 3) {
        throw new Error("Invalid email or password.");
      }

      const role = demoRoleFromEmail(email);
      const token = createDemoToken({ email, role, name: email.split("@")[0] });

      return handleAuthSuccess(token, null, true);
    } catch (demoError) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: demoError.message || "Login failed. Please try again.",
      });
      throw demoError;
    }
  }, [handleAuthSuccess]);

  // -----------------------------------------------------------------------
  // register({ name, email, password, confirmPassword, role })
  // -----------------------------------------------------------------------
  const register = useCallback(async ({ name, email, password, confirmPassword, role }) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    // --- Attempt 1: Real backend API ---
    try {
      const { token, user } = await apiRegister({
        name,
        email,
        password,
        confirmPassword,
        role,
      });
      return handleAuthSuccess(token, user, false);
    } catch (apiError) {
      if (apiError.status && apiError.status !== 0) {
        const message = apiError.message || "Registration failed.";
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
        throw apiError;
      }
    }

    // --- Attempt 2: Demo fallback (backend unreachable) ---
    try {
      if (!name || !email || !password) {
        throw new Error("All fields are required.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const token = createDemoToken({ email, role: role || "client", name });

      return handleAuthSuccess(token, null, true);
    } catch (demoError) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: demoError.message || "Registration failed. Please try again.",
      });
      throw demoError;
    }
  }, [handleAuthSuccess]);

  // -----------------------------------------------------------------------
  // logout()
  // -----------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  // -----------------------------------------------------------------------
  // clearError()
  // -----------------------------------------------------------------------
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // -----------------------------------------------------------------------
  // Memoised context value
  // -----------------------------------------------------------------------
  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
    }),
    [state, login, register, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
