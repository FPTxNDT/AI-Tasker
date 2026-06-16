// =============================================================================
// AITasker API Service Layer
// =============================================================================
// Centralised HTTP client for all backend communication.
// Automatically attaches JWT tokens, parses JSON, and handles errors.
//
// When the ASP.NET Core backend is ready:
//   1. Set VITE_API_URL in your .env file to the backend base URL
//      (e.g. VITE_API_URL=http://localhost:5000/api)
//   2. The backend should validate JWT tokens and return 401 when expired
//   3. This client dispatches "auth:unauthorized" on 401 so AuthContext can react
// =============================================================================

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Must match the key used in AuthContext.jsx
const TOKEN_STORAGE_KEY = "aitasker_auth_token";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Read the JWT token from the same localStorage key AuthContext uses.
 */
function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Remove the stored token (called on forced logout).
 */
function clearToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// Low-level request helper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated (or unauthenticated) request to the backend.
 *
 * @param {string}  endpoint - API path relative to base URL (e.g. "/auth/login")
 * @param {object}  options  - Fetch options overrides
 * @param {boolean} options.authenticated - Attach JWT token (default true)
 * @param {object}  options.body - Request body (will be JSON-stringified)
 * @param {string}  options.method - HTTP method (default depends on body)
 * @returns {Promise<any>} Parsed JSON response body
 * @throws  {ApiError} On non-2xx responses
 */
async function request(endpoint, options = {}) {
  const {
    authenticated = true,
    body,
    method,
    headers: extraHeaders = {},
    ...rest
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extraHeaders,
  };

  // Attach JWT if this endpoint requires auth
  if (authenticated) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Determine HTTP method
  const httpMethod = method || (body ? "POST" : "GET");

  // Build fetch init
  const init = {
    method: httpMethod,
    headers,
    ...rest,
  };

  if (body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  // Execute request
  let response;
  try {
    response = await fetch(url, init);
  } catch (networkError) {
    throw new ApiError(
      "Network error — please check your connection and try again.",
      0,
      networkError,
    );
  }

  // Handle 401 Unauthorized — clear token and notify app
  if (response.status === 401) {
    clearToken();

    // Dispatch a custom event so AuthContext (or any component) can react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    throw new ApiError(
      "Your session has expired. Please log in again.",
      401,
    );
  }

  // Handle 204 No Content (common for DELETE / reset-password)
  if (response.status === 204) {
    return null;
  }

  // Parse response body
  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  // Handle non-2xx
  if (!response.ok) {
    const message =
      (data && (data.message || data.title || data.error)) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}

// ---------------------------------------------------------------------------
// ApiError class
// ---------------------------------------------------------------------------

/**
 * Structured error that carries HTTP status and server response data.
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Convenience HTTP method wrappers
// ---------------------------------------------------------------------------

function get(endpoint, options = {}) {
  return request(endpoint, { ...options, method: "GET" });
}

function post(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: "POST", body });
}

function put(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: "PUT", body });
}

function patch(endpoint, body, options = {}) {
  return request(endpoint, { ...options, method: "PATCH", body });
}

function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Public API — grouped by resource
// ---------------------------------------------------------------------------

export const api = {
  // ---- Auth (unauthenticated) ----
  auth: {
    login: (email, password) =>
      post("/auth/login", { email, password }, { authenticated: false }),

    register: (data) =>
      post("/auth/register", data, { authenticated: false }),

    forgotPassword: (email) =>
      post("/auth/forgot-password", { email }, { authenticated: false }),

    resetPassword: (token, newPassword) =>
      post(
        "/auth/reset-password",
        { token, newPassword },
        { authenticated: false },
      ),

    refreshToken: () =>
      post("/auth/refresh", {}, { authenticated: false }),
  },

  // ---- Users / Profile ----
  users: {
    getMe: () => get("/users/me"),

    updateMe: (data) => put("/users/me", data),

    getPublic: (userId) => get(`/users/${userId}`),
  },

  // ---- Experts ----
  experts: {
    list: (params) => {
      const query = buildQuery(params);
      return get(`/experts${query}`);
    },

    getById: (id) => get(`/experts/${id}`),
  },

  // ---- Projects ----
  projects: {
    create: (data) => post("/projects", data),

    list: (params) => {
      const query = buildQuery(params);
      return get(`/projects${query}`);
    },

    getMine: () => get("/projects/my"),

    getById: (id) => get(`/projects/${id}`),

    update: (id, data) => put(`/projects/${id}`, data),

    delete: (id) => del(`/projects/${id}`),
  },

  // ---- Proposals ----
  proposals: {
    create: (projectId, data) =>
      post(`/projects/${projectId}/proposals`, data),

    listForProject: (projectId) =>
      get(`/projects/${projectId}/proposals`),

    getMine: () => get("/proposals/my"),

    getById: (id) => get(`/proposals/${id}`),

    update: (id, data) => put(`/proposals/${id}`, data),
  },

  // ---- Timeline / Tasks ----
  timeline: {
    get: (projectId) => get(`/projects/${projectId}/timeline`),

    create: (projectId, data) =>
      post(`/projects/${projectId}/timeline`, data),

    getActivity: (projectId) =>
      get(`/projects/${projectId}/activity`),
  },

  tasks: {
    getById: (taskId) => get(`/tasks/${taskId}`),

    submit: (taskId, data) =>
      post(`/tasks/${taskId}/submissions`, data),

    listSubmissions: (taskId) =>
      get(`/tasks/${taskId}/submissions`),

    reviewSubmission: (submissionId, data) =>
      put(`/submissions/${submissionId}`, data),
  },

  extensions: {
    request: (projectId, data) =>
      post(`/projects/${projectId}/extensions`, data),

    resolve: (projectId, extensionId, data) =>
      put(`/projects/${projectId}/extensions/${extensionId}`, data),
  },

  // ---- Payments / Wallet ----
  payments: {
    getWallet: () => get("/wallet"),

    depositEscrow: (data) => post("/payments/escrow/deposit", data),

    releaseEscrow: (data) => post("/payments/escrow/release", data),

    refundEscrow: (data) => post("/payments/escrow/refund", data),

    withdraw: (data) => post("/payments/withdraw", data),

    getTransactions: (params) => {
      const query = buildQuery(params);
      return get(`/transactions${query}`);
    },
  },

  // ---- Notifications ----
  notifications: {
    list: (params) => {
      const query = buildQuery(params);
      return get(`/notifications${query}`);
    },

    getUnreadCount: () => get("/notifications/unread-count"),

    markRead: (id) => put(`/notifications/${id}/read`),

    markAllRead: () => put("/notifications/read-all"),
  },

  // ---- Messages ----
  messages: {
    getConversations: () => get("/messages/conversations"),

    getMessages: (conversationId) =>
      get(`/messages/conversations/${conversationId}`),

    send: (data) => post("/messages", data),
  },

  // ---- Admin ----
  admin: {
    getStats: () => get("/admin/stats"),

    listUsers: (params) => {
      const query = buildQuery(params);
      return get(`/admin/users${query}`);
    },

    suspendUser: (userId) => put(`/admin/users/${userId}/suspend`),

    unsuspendUser: (userId) => put(`/admin/users/${userId}/unsuspend`),

    listDisputes: () => get("/admin/disputes"),

    resolveDispute: (id, data) =>
      post(`/admin/disputes/${id}/resolve`, data),
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a URL query string from a plain object.
 * Skips null/undefined/empty values.
 *
 *   buildQuery({ skills: "AI,ML", minRate: 50 })
 *   → "?skills=AI%2CML&minRate=50"
 */
function buildQuery(params) {
  if (!params || typeof params !== "object") return "";

  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );

  if (entries.length === 0) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.append(key, String(value));
  }

  return `?${searchParams.toString()}`;
}

export default api;
