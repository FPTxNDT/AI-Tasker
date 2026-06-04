// =============================================================================
// Project Status Configuration — single source of truth for all status display
// =============================================================================
//
// Every page that renders a project card, badge, or button should import from
// this file instead of defining its own status labels, colours, or logic.
//
// Standardized status keys (the "source of truth" identifier):
//   reviewing_proposals  — Project is open, client is reviewing incoming proposals
//   in_progress           — Project has an assigned expert and is being worked on
//   waiting_review        — Expert has submitted work, waiting for client review
//   needs_revision        — Client requested changes on a submission
//   completed             — Project is finished
//   cancelled             — Project was cancelled
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Status display labels — mapping from standardized key → human label
// ---------------------------------------------------------------------------

export const STATUS_LABELS = {
  reviewing_proposals: "Reviewing Proposals",
  in_progress: "In Progress",
  waiting_review: "Waiting Review",
  needs_revision: "Needs Revision",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ---------------------------------------------------------------------------
// 2. Status badge colour classes — standardized key → Tailwind classes
// ---------------------------------------------------------------------------

export const STATUS_BADGE_CLASSES = {
  reviewing_proposals: "bg-purple-100 text-purple-700",
  in_progress: "bg-blue-100 text-blue-700",
  waiting_review: "bg-yellow-100 text-yellow-700",
  needs_revision: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

/** Convenience: get the badge class for a key, with fallback. */
export function getStatusBadgeClass(key) {
  return STATUS_BADGE_CLASSES[key] || "bg-gray-100 text-gray-700";
}

/** Convenience: get the display label for a key, with fallback. */
export function getStatusLabel(key) {
  return STATUS_LABELS[key] || key || "Unknown";
}

// ---------------------------------------------------------------------------
// 3. Expert label (shown below project title on cards)
// ---------------------------------------------------------------------------

/**
 * Returns an object describing what to show about the assigned expert.
 * @param {{ assignedExpertId: string | null }} project
 * @param {function} getUserById — e.g. getMockUserById
 * @returns {{ text: string, isAssigned: boolean }}
 */
export function getExpertDisplayInfo(project, getUserById) {
  if (project?.assignedExpertId) {
    const expert = getUserById(project.assignedExpertId);
    return {
      text: expert ? `with ${expert.fullName}` : "with assigned expert",
      isAssigned: true,
    };
  }
  return { text: "No expert assigned yet", isAssigned: false };
}

// ---------------------------------------------------------------------------
// 4. Client-side button config — based on project status
//    Returns { label: string, className: string, behavior: string }
// ---------------------------------------------------------------------------

const CLIENT_BUTTON_MAP = {
  reviewing_proposals: {
    label: "View Project Details",
    className: "bg-gray-900 text-white hover:bg-gray-800",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
  in_progress: {
    label: "Manage Project",
    className: "bg-gray-900 text-white hover:bg-gray-800",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
  waiting_review: {
    label: "Review Submission",
    className: "bg-gray-900 text-white hover:bg-gray-800",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
  needs_revision: {
    label: "Review Changes",
    className: "bg-orange-600 text-white hover:bg-orange-700",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
  completed: {
    label: "View Summary",
    className: "bg-green-600 text-white hover:bg-green-700",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
  cancelled: {
    label: "View Details",
    className: "bg-gray-500 text-white hover:bg-gray-600",
    linkTo: (p) => `/client/projects/${p.id}`,
  },
};

/** Get the button config for a client-side project card. */
export function getClientButtonConfig(statusKey) {
  return CLIENT_BUTTON_MAP[statusKey] || CLIENT_BUTTON_MAP.reviewing_proposals;
}

// ---------------------------------------------------------------------------
// 5. Expert-side button config — based on project status
// ---------------------------------------------------------------------------

const EXPERT_BUTTON_MAP = {
  in_progress: {
    label: "Update Progress",
    className: "bg-gray-900 text-white hover:bg-gray-800",
    linkTo: (p) => `/expert/projects/${p.id}`,
  },
  waiting_review: {
    label: "Waiting for Client Review",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-default",
    disabled: true,
  },
  needs_revision: {
    label: "Update Submission",
    className: "bg-orange-600 text-white hover:bg-orange-700",
    linkTo: (p) => `/expert/projects/${p.id}`,
  },
  completed: {
    label: "View Completed Project",
    className: "bg-green-600 text-white hover:bg-green-700",
    linkTo: (p) => `/expert/projects/${p.id}`,
  },
};

/** Get the button config for an expert-side project card. */
export function getExpertButtonConfig(statusKey) {
  return EXPERT_BUTTON_MAP[statusKey] || EXPERT_BUTTON_MAP.in_progress;
}

// ---------------------------------------------------------------------------
// 6. Derive the standardized project status key from raw DB relationships
// ---------------------------------------------------------------------------

/**
 * Derive a STANDARDIZED status key from raw project data + relationship counts.
 *
 * This is the single function all pages should use. It returns one of the
 * standardized keys (e.g., "in_progress") rather than a display label.
 *
 * Rules (first match wins):
 *   1. Raw status is "completed" | "cancelled" → pass through as-is
 *   2. Raw status is "in_progress":
 *      - If ALL tasks are completed → "completed"
 *      - If ANY task is pending_review → "waiting_review"
 *      - If ANY task is needs_revision → "needs_revision"
 *      - Otherwise → "in_progress"
 *   3. Raw status is "open":
 *      - If has assigned expert → "in_progress" (project was just assigned)
 *      - If has proposals → "reviewing_proposals"
 *      - Otherwise → "reviewing_proposals" (shown as "Seeking Expert" in UI) — see
 *        `getStatusLabel` and the `proposalCount` param for finer display control.
 *
 * @param {object} project — raw project from mock DB
 * @param {{ proposalCount?: number }} options
 * @returns {string} standardized status key
 */
export function deriveProjectStatusKey(project, { proposalCount = 0 } = {}) {
  if (!project) return "reviewing_proposals";

  const raw = project.status;

  // Completed / cancelled pass through directly
  if (raw === "completed") return "completed";
  if (raw === "cancelled") return "cancelled";

  // in_progress → check task states for waiting_review / needs_revision
  if (raw === "in_progress") return "in_progress";

  // open → determine based on assigned expert and proposals
  if (raw === "open") {
    // If an expert is assigned, treat as in_progress (assignment was likely
    // done in this session and the raw status hasn't been updated yet)
    if (project.assignedExpertId) return "in_progress";
    // Otherwise it's reviewing proposals (the default for open projects)
    return "reviewing_proposals";
  }

  // Fallback: map any unknown raw status
  return "reviewing_proposals";
}

// ---------------------------------------------------------------------------
// 7. Backward-compatible wrapper for existing deriveProjectDisplayStatus calls
// ---------------------------------------------------------------------------

/**
 * @deprecated Use deriveProjectStatusKey + getStatusLabel instead.
 * Kept for backward compatibility — returns the human-readable label.
 */
export function deriveProjectDisplayStatus(project, options) {
  const key = deriveProjectStatusKey(project, options);
  return getStatusLabel(key);
}

// ---------------------------------------------------------------------------
// 8. Task-level status config — used by ProjectTimelineManager
//    These are the statuses derived by deriveTaskStatus(), not project-level.
// ---------------------------------------------------------------------------

export const TASK_STATUS_CONFIG = {
  "In Progress":    { className: "bg-blue-100 text-blue-700",   label: "In Progress" },
  "Pending Review": { className: "bg-purple-100 text-purple-700", label: "Waiting for Client Review" },
  "Completed":      { className: "bg-green-100 text-green-700",  label: "Completed" },
  "Needs Revision": { className: "bg-orange-100 text-orange-700", label: "Needs Revision" },
  "Cancelled":      { className: "bg-red-100 text-red-700",     label: "Cancelled" },
};

/** Get the badge class for a task-level display status. */
export function getTaskStatusClass(status) {
  return TASK_STATUS_CONFIG[status]?.className || "bg-gray-100 text-gray-700";
}

/** Get the display label for a task-level display status. */
export function getTaskStatusLabel(status) {
  return TASK_STATUS_CONFIG[status]?.label || status;
}
