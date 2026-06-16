// =============================================================================
// Project Timeline Store — API-ready with mock-db-powered demo fallback
// =============================================================================
//
// Phase 3: All functions now delegate to the API service layer first.
// When the backend is unavailable they fall back to mock-db timeline data
// (from src/mock-db/timeline.js), or a minimal hardcoded fallback if no
// matching project exists in mock-db.
//
// The mock-db fallback provides realistic per-project timelines with real
// task IDs, mini-tasks, and activity logs — no more generic demo data.
//
// Phase 6: Status derivation delegates to the centralized projectStatusConfig
// so both Client and Expert sides use the same logic and labels.
// =============================================================================

import { api } from "../../services/api.js";
import {
  getMockTimelineByProject,
  getMockProjectById,
  getMockActivityLogsByProject,
} from "../../mock-db/mockDbService.js";
import { timelines } from "../../mock-db/index.js";

// Re-export centralized status functions — all pages should import these from
// this file (or directly from projectStatusConfig.js) rather than defining
// their own status mappings.
export {
  deriveProjectStatusKey,
  deriveProjectDisplayStatus,
  getStatusLabel,
  getStatusBadgeClass,
  getExpertDisplayInfo,
  getClientButtonConfig,
  getExpertButtonConfig,
  getTaskStatusClass,
  getTaskStatusLabel,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  TASK_STATUS_CONFIG,
} from "./projectStatusConfig.js";

// ---------------------------------------------------------------------------
// Status mapping: mock-db format → ProjectTimelineManager format
// ---------------------------------------------------------------------------

const TASK_STATUS_MAP = {
  completed: "Completed",
  pending_review: "Pending Review",
  in_progress: "In Progress",
  pending: "Pending",
  needs_revision: "Needs Revision",
};

const MINI_TASK_STATUS_MAP = {
  done: "done",
  in_progress: "pending",
  pending: "pending",
};

const ACTOR_MAP = {
  proposal_submitted: "Expert",
  proposal_accepted: "Client",
  project_created: "Client",
  escrow_deposited: "Client",
  task_submitted: "Expert",
  task_approved: "Client",
  revision_requested: "Client",
  payment_released: "Admin",
  dispute_opened: "Client",
  dispute_resolved: "Admin",
};

// ---------------------------------------------------------------------------
// Runtime Activity Log — accumulates events at runtime so the Project
// Activity UI stays reactive. Merged with static mock-db logs on read.
// ---------------------------------------------------------------------------

/** @type {Map<string, Array<{id:string, actor:string, time:string, message:string}>>} */
const _runtimeActivityLogs = new Map();

/** @type {Map<string, {id:string, reason:string, requestedDays:number, status:string, requestedAt:string, responseNote?:string}>} */
const _runtimeExtensionRequests = new Map();

/**
 * Add a runtime activity entry for a project.
 * Automatically stamps id and createdAt.
 *
 * @param {string} projectId
 * @param {{ actor: string, message: string }} partial
 * @returns the full log entry
 */
export function addProjectActivity(projectId, { actor, message }) {
  const entry = {
    id: `runtime-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor,
    time: new Date().toISOString(),
    message,
  };
  if (!_runtimeActivityLogs.has(projectId)) {
    _runtimeActivityLogs.set(projectId, []);
  }
  _runtimeActivityLogs.get(projectId).push(entry);

  // Bump a sessionStorage version so ProjectTimelineManager can detect
  // that it needs to re-fetch after a navigation-back.
  try {
    const prev = parseInt(sessionStorage.getItem("timelineActivityVersion") || "0", 10);
    sessionStorage.setItem("timelineActivityVersion", String(prev + 1));
  } catch { /* noop */ }

  return entry;
}

/** Get merged static + runtime activity logs for a project, newest first. */
function getMergedActivityLogs(projectId) {
  const staticLogs = getMockActivityLogsByProject(projectId).map((log) => ({
    id: log.id,
    actor: ACTOR_MAP[log.action] || "System",
    time: log.createdAt,
    message: log.description,
  }));
  const runtimeLogs = _runtimeActivityLogs.get(projectId) || [];
  // Concat with runtime after static, so newest runtime entries appear last
  return [...staticLogs, ...runtimeLogs];
}

// Clear runtime logs (used by Reset Demo)
function clearRuntimeActivityLogs() {
  _runtimeActivityLogs.clear();
  _runtimeExtensionRequests.clear();
}

function buildTimelineFromMockDb(projectId) {
  const timeline = getMockTimelineByProject(projectId);
  const project = getMockProjectById(projectId);

  if (!project) return null; // project doesn't exist at all

  const projectLogs = getMergedActivityLogs(projectId);

  // Projects without a timeline (open, cancelled, etc.) get an empty task list
  const rawTasks = timeline?.tasks || [];

  const tasks = rawTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: TASK_STATUS_MAP[task.status] || task.status,
    approval: task.status === "completed" ? "Approved" : null,
    miniTasks: (task.miniTasks || []).map((mt) => ({
      id: mt.id,
      title: mt.title,
      status: MINI_TASK_STATUS_MAP[mt.status] || mt.status,
    })),
  }));

  const taskLogs = {};
  rawTasks.forEach((task) => {
    const logs = [];
    if (task.expertNotes) {
      logs.push({
        id: `${task.id}-expert-note`,
        message: `[Expert] ${task.expertNotes}`,
      });
    }
    if (task.clientFeedback) {
      logs.push({
        id: `${task.id}-client-feedback`,
        message: `[Client] ${task.clientFeedback}`,
      });
    }
    if (logs.length > 0) taskLogs[task.id] = logs;
  });

  // Preserve any runtime extension request stored for this project
  const runtimeExt = _runtimeExtensionRequests.get(projectId) || null;

  return {
    projectTitle: project.title,
    status: project.status,
    currentDay: 1,
    totalDays: project.durationValue * (project.durationUnit === "weeks" ? 7 : project.durationUnit === "months" ? 30 : 1),
    startDate: project.createdAt,
    endDate: project.deadline,
    projectDeadlineDate: project.deadline,
    projectLogs,
    tasks,
    taskLogs,
    extensionRequests: [],
    extensionRequest: runtimeExt,
  };
}

// ---------------------------------------------------------------------------
// In-memory mock store (minimal hardcoded fallback — only used when mock-db
// has no data for the requested projectId)
// ---------------------------------------------------------------------------

let _mockTimeline = null;

function getHardcodedTimeline() {
  if (!_mockTimeline) {
    _mockTimeline = createDefaultTimeline();
  }
  return _mockTimeline;
}

function resetMockTimeline() {
  _mockTimeline = null;
}

function createDefaultTimeline() {
  const now = Date.now();
  return {
    projectTitle: "AI Chatbot Development",
    status: "in_progress",
    currentDay: 1,
    totalDays: 30,
    startDate: new Date(now).toISOString(),
    endDate: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
    projectDeadlineDate: new Date(now + 25 * 24 * 60 * 60 * 1000).toISOString(),
    projectLogs: [
      {
        id: "log-1",
        actor: "AI",
        time: new Date(now - 86400000).toISOString(),
        message: "Project timeline generated — 3 main tasks identified.",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "System Architecture Design",
        description: "Design the overall system architecture, data flow, and component diagram.",
        status: "Completed",
        approval: "Approved",
        miniTasks: [
          { id: "mt-1-1", title: "Requirements analysis", status: "done" },
          { id: "mt-1-2", title: "Create component diagram", status: "done" },
          { id: "mt-1-3", title: "Define data models", status: "done" },
        ],
      },
      {
        id: "task-2",
        title: "Core API Development",
        description: "Implement REST API endpoints for user management and project operations.",
        status: "In Progress",
        miniTasks: [
          { id: "mt-2-1", title: "Set up project structure", status: "done" },
          { id: "mt-2-2", title: "Implement auth endpoints", status: "done" },
          { id: "mt-2-3", title: "Implement CRUD for projects", status: "done" },
          { id: "mt-2-4", title: "Add input validation", status: "pending" },
          { id: "mt-2-5", title: "Write API documentation", status: "pending" },
        ],
      },
      {
        id: "task-3",
        title: "Frontend Integration",
        description: "Build React frontend and integrate with backend APIs.",
        status: "In Progress",
        miniTasks: [
          { id: "mt-3-1", title: "Login/signup pages", status: "done" },
          { id: "mt-3-2", title: "Dashboard UI", status: "done" },
          { id: "mt-3-3", title: "Project posting form", status: "done" },
          { id: "mt-3-4", title: "Proposal workflow", status: "pending" },
        ],
      },
    ],
    taskLogs: {
      "task-1": [{ id: "tlog-1", message: "All mini tasks completed — waiting for review." }],
      "task-2": [{ id: "tlog-2", message: "3 of 5 mini tasks done. Progressing well." }],
    },
    extensionRequests: [],
    extensionRequest: null,
  };
}

// ---------------------------------------------------------------------------
// Public API — all functions return Promises
// ---------------------------------------------------------------------------

/**
 * Fetch the full project timeline.
 *
 * @param {string|number} projectId
 * @returns {Promise<object>} Timeline object
 */
export async function getProjectTimeline(projectId) {
  try {
    const data = await api.timeline.get(projectId);
    return data;
  } catch {
    // Backend unavailable — try mock-db first, then hardcoded fallback
    if (projectId) {
      const mockTimeline = buildTimelineFromMockDb(projectId);
      if (mockTimeline) return mockTimeline;
    }
    return getHardcodedTimeline();
  }
}

/**
 * Submit a completed task for client review.
 */
export async function submitTask(taskId, data) {
  try {
    await api.tasks.submit(taskId, data);
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    const task = timeline.tasks.find((t) => t.id === taskId);
    if (task) {
      const prevStatus = task.status;
      task.status = "Pending Review";
      if (!timeline.taskLogs[taskId]) timeline.taskLogs[taskId] = [];
      timeline.taskLogs[taskId].push({
        id: `tlog-${Date.now()}`,
        message: data?.description || "Task submitted for review.",
      });
      timeline.projectLogs.push({
        id: `log-${Date.now()}`,
        actor: "Expert",
        time: new Date().toISOString(),
        message: `[Expert] submitted "${task.title}" for client review.`,
      });
      if (prevStatus !== "Pending Review") {
        timeline.projectLogs.push({
          id: `log-${Date.now() + 1}`,
          actor: "System",
          time: new Date().toISOString(),
          message: `Task "${task.title}" changed from ${prevStatus} to Waiting for Client Review.`,
        });
      }
    }
    return timeline;
  }
}

/**
 * Approve a task submission.
 */
export async function approveSubmission(submissionId, data) {
  try {
    await api.tasks.reviewSubmission(submissionId, {
      status: "approved",
      feedback: data?.feedback || "",
    });
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    // Find the task from the submission context (hardcoded fallback only)
    const task = timeline.tasks.find((t) => t.id === data?.taskId);
    if (task) {
      const prevStatus = task.status;
      task.status = "Completed";
      task.approval = "Approved";
      timeline.projectLogs.push({
        id: `log-${Date.now()}`,
        actor: "Client",
        time: new Date().toISOString(),
        message: `[Client] approved "${task.title}". Task is now Completed.`,
      });
      if (prevStatus !== "Completed") {
        timeline.projectLogs.push({
          id: `log-${Date.now() + 1}`,
          actor: "System",
          time: new Date().toISOString(),
          message: `Task "${task.title}" changed from ${prevStatus} to Completed.`,
        });
      }
    }
    return timeline;
  }
}

/**
 * Request a revision on a task submission.
 */
export async function requestRevision(submissionId, data) {
  try {
    await api.tasks.reviewSubmission(submissionId, {
      status: "needs_revision",
      feedback: data?.feedback || "",
    });
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    const task = timeline.tasks.find((t) => t.id === data?.taskId);
    if (task) {
      const prevStatus = task.status;
      task.status = "Needs Revision";
      task.approval = null;
      timeline.projectLogs.push({
        id: `log-${Date.now()}`,
        actor: "Client",
        time: new Date().toISOString(),
        message: `[Client] requested changes for "${task.title}". Task is now Needs Revision.`,
      });
      if (prevStatus !== "Needs Revision") {
        timeline.projectLogs.push({
          id: `log-${Date.now() + 1}`,
          actor: "System",
          time: new Date().toISOString(),
          message: `Task "${task.title}" changed from ${prevStatus} to Needs Revision.`,
        });
      }
    }
    return timeline;
  }
}

/**
 * Request a project deadline extension.
 */
export async function requestExtension(projectId, data) {
  try {
    return await api.extensions.request(projectId, data);
  } catch {
    if (projectId) {
      const mockTimeline = buildTimelineFromMockDb(projectId);
      if (mockTimeline) {
        const ext = {
          id: `ext-${Date.now()}`,
          reason: data.reason,
          requestedDays: data.additionalDays,
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        mockTimeline.extensionRequest = ext;
        _runtimeExtensionRequests.set(projectId, ext);
        addProjectActivity(projectId, {
          actor: "Expert",
          message: `[Expert] requested a ${data.additionalDays}-day extension: "${data.reason}"`,
        });
        return mockTimeline;
      }
    }
    // Last resort — hardcoded demo timeline
    const timeline = getHardcodedTimeline();
    timeline.extensionRequest = {
      id: `ext-${Date.now()}`,
      reason: data.reason,
      requestedDays: data.additionalDays,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    return timeline;
  }
}

/**
 * Approve or reject an extension request.
 */
export async function resolveExtension(projectId, extensionId, data) {
  try {
    return await api.extensions.resolve(projectId, extensionId, data);
  } catch {
    if (projectId) {
      const mockTimeline = buildTimelineFromMockDb(projectId);
      if (mockTimeline) {
        const ext = _runtimeExtensionRequests.get(projectId);
        if (ext) {
          ext.status = data.status;
          ext.responseNote =
            data.responseNote ||
            (data.status === "approved"
              ? "Extension approved by client."
              : "Extension rejected by client.");
          mockTimeline.extensionRequest = ext;
          _runtimeExtensionRequests.set(projectId, ext);
        }
        const verb = data.status === "approved" ? "approved" : "rejected";
        addProjectActivity(projectId, {
          actor: "Client",
          message: `[Client] ${verb} the ${ext?.requestedDays || ""}-day extension request.`,
        });
        return mockTimeline;
      }
    }
    // Last resort — hardcoded demo timeline
    const timeline = getHardcodedTimeline();
    if (timeline.extensionRequest) {
      timeline.extensionRequest.status = data.status;
      timeline.extensionRequest.responseNote =
        data.responseNote ||
        (data.status === "approved"
          ? "Extension approved by client."
          : "Extension rejected by client.");
    }
    return timeline;
  }
}

/**
 * Update a task's state (for internal use by the timeline manager).
 */
export async function updateTask(taskId, updates) {
  try {
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    const task = timeline.tasks.find((t) => t.id === taskId);
    if (task) {
      Object.assign(task, updates);
    }
    return timeline;
  }
}

/**
 * Update a mini-task state.
 */
export async function updateMiniTask(taskId, miniTaskId, updates) {
  try {
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    const task = timeline.tasks.find((t) => t.id === taskId);
    if (task?.miniTasks) {
      const mt = task.miniTasks.find((mt) => mt.id === miniTaskId);
      if (mt) Object.assign(mt, updates);
    }
    return timeline;
  }
}

/**
 * Add a log entry to a task.
 */
export async function addTaskLog(taskId, log) {
  try {
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    if (!timeline.taskLogs[taskId]) timeline.taskLogs[taskId] = [];
    timeline.taskLogs[taskId].push({
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    return timeline;
  }
}

/**
 * Add feedback to a task.
 */
export async function addTaskFeedback(taskId, feedback) {
  try {
    return getProjectTimeline();
  } catch {
    const timeline = getHardcodedTimeline();
    const task = timeline.tasks.find((t) => t.id === taskId);
    if (task) {
      if (!task.feedbackHistory) task.feedbackHistory = [];
      task.feedbackHistory.push({
        ...feedback,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
    }
    return timeline;
  }
}

// ---------------------------------------------------------------------------
// Demo helpers (kept for the Reset Demo button)
// ---------------------------------------------------------------------------

export function resetProjectTimeline() {
  resetMockTimeline();
  clearRuntimeActivityLogs();
  try { sessionStorage.removeItem("timelineActivityVersion"); } catch { /* noop */ }
}

// ---------------------------------------------------------------------------
// Project-level progress from timeline
// ---------------------------------------------------------------------------

/**
 * Compute the overall progress for a project from its timeline's mini tasks.
 * Returns 0 if the project has no timeline or no tasks.
 *
 * @param {string} projectId
 * @returns {number} 0–100
 */
export function getProjectProgress(projectId) {
  const timeline = getMockTimelineByProject(projectId);
  if (!timeline || !timeline.tasks || timeline.tasks.length === 0) return 0;
  return getOverallProgress(timeline.tasks);
}

// ---------------------------------------------------------------------------
// Pure computation helpers (no API needed)
// ---------------------------------------------------------------------------

/**
 * Derive the display status for a single task from mini-task completion
 * and submission/review state — the single source of truth for all UI.
 *
 * Rules (first match wins):
 *   1. All mini tasks done AND a submission was approved  → "Completed"
 *   2. All mini tasks done AND submitted for review      → "Pending Review"
 *   3. Client requested changes on a submission          → "Needs Revision"
 *   4. Not all mini tasks done                           → "In Progress"
 *   5. Fallback (no mini tasks, no submission info)      → keep existing status
 *
 * @param {{ miniTasks?: Array<{status: string}>, status?: string, approval?: string|null }} task
 * @returns {string} display status
 */
export function deriveTaskStatus(task) {
  if (!task) return "In Progress";

  const miniTasks = task.miniTasks || [];
  const total = miniTasks.length;
  const completed = miniTasks.filter(
    (mt) => mt.status === "done" || mt.status === "completed",
  ).length;

  // Check submission-related state
  const isSubmitted = task.status === "Pending Review" || task.status === "pending_review";
  const isApproved = task.approval === "Approved" || task.status === "completed";
  const needsRevision = task.status === "Needs Revision" || task.status === "needs_revision";

  // If there are no mini tasks, trust the raw status as-is
  if (total === 0) {
    return task.status || "In Progress";
  }

  const allDone = completed >= total;

  // Rule 1: All mini tasks done + client approved → Completed
  if (allDone && isApproved) return "Completed";

  // Rule 2: All mini tasks done + submitted for review → Waiting for Client Review
  if (allDone && isSubmitted) return "Pending Review";

  // Rule 3: Client requested changes
  if (allDone && needsRevision) return "Needs Revision";

  // Rule 4: Not all mini tasks done → always In Progress
  if (!allDone) return "In Progress";

  // Rule 5: All mini tasks done but not yet submitted → In Progress (expert still working)
  return "In Progress";
}

/**
 * Compute mini-task progress for a single task.
 *
 * @param {{ miniTasks?: Array<{status: string}> }} task
 * @returns {{ completed: number, total: number, percent: number }}
 */
export function deriveTaskProgress(task) {
  const miniTasks = task?.miniTasks || [];
  const total = miniTasks.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const completed = miniTasks.filter(
    (mt) => mt.status === "done" || mt.status === "completed",
  ).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export function getTaskMiniTaskProgress(taskId) {
  const timeline = getHardcodedTimeline();
  const task = timeline.tasks.find((t) => t.id === taskId);
  return deriveTaskProgress(task).percent;
}

export function getOverallProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  let totalProgress = 0;
  tasks.forEach((task) => {
    totalProgress += deriveTaskProgress(task).percent;
  });
  return Math.round(totalProgress / tasks.length);
}

export function getDeadlineInfo(deadlineDate) {
  if (!deadlineDate) {
    return { formattedDate: "N/A", remainingText: "N/A", isOverdue: false };
  }
  const deadline = new Date(deadlineDate);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffMs < 0;

  return {
    formattedDate: deadline.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    remainingText: isOverdue
      ? `${Math.abs(diffDays)} days overdue`
      : `${diffDays} days remaining`,
    isOverdue,
  };
}

// ---------------------------------------------------------------------------
// Mock-DB mutation helpers — operate directly on the timelines mock array
// so changes persist across page navigations within the session.
// ---------------------------------------------------------------------------

/**
 * Find a task and its parent timeline by task ID in the mock DB.
 * @returns {{ task: object, timeline: object } | null}
 */
function findTaskInMockDb(taskId) {
  for (const tl of timelines) {
    const task = tl.tasks.find((t) => t.id === taskId);
    if (task) return { task, timeline: tl };
  }
  return null;
}

/**
 * Toggle a mini task's done/pending status in the mock DB.
 * Returns the updated task object, or null if not found.
 */
export function toggleMockMiniTask(taskId, miniTaskId) {
  const found = findTaskInMockDb(taskId);
  if (!found) return null;

  const mt = found.task.miniTasks?.find((m) => m.id === miniTaskId);
  if (!mt) return null;

  const wasDone = mt.status === "done";
  mt.status = wasDone ? "pending" : "done";
  mt.completedAt = wasDone ? null : new Date().toISOString();

  // Activity log
  const taskTitle = found.task.title;
  addProjectActivity(found.task.projectId, {
    actor: "Expert",
    message: wasDone
      ? `[Expert] reopened mini task "${mt.title}" in "${taskTitle}".`
      : `[Expert] completed mini task "${mt.title}" in "${taskTitle}".`,
  });

  return found.task;
}

/**
 * Update a mini task's expert note in the mock DB.
 * Returns the updated task object, or null if not found.
 */
export function updateMockMiniTaskNote(taskId, miniTaskId, note) {
  const found = findTaskInMockDb(taskId);
  if (!found) return null;

  const mt = found.task.miniTasks?.find((m) => m.id === miniTaskId);
  if (!mt) return null;

  mt.note = note || null;
  return found.task;
}

/**
 * Mark a task as submitted (pending_review) in the mock DB.
 * Only succeeds if all mini tasks are done.
 * Returns the updated task, or null if blocked.
 */
export function markTaskSubmitted(taskId) {
  const found = findTaskInMockDb(taskId);
  if (!found) return null;

  const task = found.task;
  const miniTasks = task.miniTasks || [];
  const allDone = miniTasks.length > 0 && miniTasks.every((mt) => mt.status === "done");

  if (!allDone) return null; // blocked — not all mini tasks done

  const previousStatus = task.status;
  task.status = "pending_review";
  task.completedAt = null;
  task.expertNotes = task.expertNotes || "Task submitted for client review.";

  // Activity log — only add status-change if status actually changed
  const taskTitle = task.title;
  const projectId = task.projectId;

  addProjectActivity(projectId, {
    actor: "Expert",
    message: `[Expert] submitted "${taskTitle}" for client review.`,
  });

  if (previousStatus !== "pending_review") {
    const prevLabel = TASK_STATUS_MAP[previousStatus] || previousStatus;
    addProjectActivity(projectId, {
      actor: "System",
      message: `Task "${taskTitle}" changed from ${prevLabel} to Waiting for Client Review.`,
    });
  }

  return task;
}

/**
 * Client approves a submitted task in the mock DB.
 * Only works when task is in pending_review state.
 */
export function approveTaskInMockDb(taskId) {
  const found = findTaskInMockDb(taskId);
  if (!found) return null;

  const task = found.task;
  if (task.status !== "pending_review") return null;

  const previousStatus = task.status;
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  task.clientFeedback = task.clientFeedback || "Approved. Great work!";

  const taskTitle = task.title;
  const projectId = task.projectId;

  addProjectActivity(projectId, {
    actor: "Client",
    message: `[Client] approved "${taskTitle}". Task is now Completed.`,
  });

  if (previousStatus !== "completed") {
    addProjectActivity(projectId, {
      actor: "System",
      message: `Task "${taskTitle}" changed from Waiting for Client Review to Completed.`,
    });
  }

  return task;
}

/**
 * Client requests changes on a submitted task in the mock DB.
 * Only works when task is in pending_review state.
 */
export function requestTaskRevisionInMockDb(taskId, feedback) {
  const found = findTaskInMockDb(taskId);
  if (!found) return null;

  const task = found.task;
  if (task.status !== "pending_review") return null;

  const previousStatus = task.status;
  task.status = "needs_revision";
  task.completedAt = null;
  task.clientFeedback = feedback || "Please revise and resubmit.";

  const taskTitle = task.title;
  const projectId = task.projectId;

  addProjectActivity(projectId, {
    actor: "Client",
    message: `[Client] requested changes for "${taskTitle}". Task is now Needs Revision.`,
  });

  if (previousStatus !== "needs_revision") {
    addProjectActivity(projectId, {
      actor: "System",
      message: `Task "${taskTitle}" changed from Waiting for Client Review to Needs Revision.`,
    });
  }

  return task;
}
