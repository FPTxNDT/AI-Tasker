import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Bot, MessageSquare } from "lucide-react";

import {
  getDeadlineInfo,
  getOverallProgress,
  getProjectTimeline,
  requestExtension,
  resolveExtension,
  resetProjectTimeline,
  deriveTaskStatus,
  deriveTaskProgress,
  getTaskStatusClass,
  getTaskStatusLabel,
} from "../../lib/projectTimelineStore.js";

import {
  getMockProjectById,
  getMockConversationsByUser,
} from "../../../mock-db/mockDbService.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";

import { ExtensionRequestPanel } from "./timeline/ExtensionRequestPanel.jsx";
import { ActivityLogPanel } from "./timeline/ActivityLogPanel.jsx";
import { TaskCard } from "./timeline/TaskCard.jsx";

// =============================================================================
// ProjectTimelineManager — main container for project timeline view.
//
// Responsibilities: data fetching, state management, extension request logic,
// task navigation, activity polling.
//
// Rendering delegates to extracted sub-components:
//   - ExtensionRequestPanel  (extension form + status banner)
//   - TaskCard               (individual task card with progress)
//   - ActivityLogPanel       (activity log feed)
// =============================================================================

export function ProjectTimelineManager({ role, projectId }) {
  const navigate = useNavigate();

  // ---- State ----
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [extensionDays, setExtensionDays] = useState("2");
  const [extensionReason, setExtensionReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Track activity version so we re-fetch timeline after navigation-back
  const [activityVersion, setActivityVersion] = useState(0);

  // ---- Fetch timeline on mount and when activity version changes ----
  useEffect(() => {
    let cancelled = false;

    async function loadTimeline() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjectTimeline(projectId ?? null);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load project timeline.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTimeline();
    return () => { cancelled = true; };
  }, [projectId, activityVersion]);

  // ---- Poll sessionStorage for activity version changes (navigation-back detection) ----
  useEffect(() => {
    const check = () => {
      try {
        const stored = parseInt(sessionStorage.getItem("timelineActivityVersion") || "0", 10);
        setActivityVersion((prev) => (stored !== prev ? stored : prev));
      } catch { /* noop */ }
    };
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  // ---- Derived values ----
  const tasks = project?.tasks || [];
  const overallProgress = getOverallProgress(tasks);

  const completedTasks = tasks.filter(
    (task) => deriveTaskStatus(task) === "Completed",
  ).length;

  const deadlineInfo = getDeadlineInfo(project?.projectDeadlineDate);

  // ---- Scroll to last opened / submitted task after data loads ----
  useEffect(() => {
    if (loading || tasks.length === 0) return;

    const targetId =
      sessionStorage.getItem("lastSubmittedTaskId") ||
      sessionStorage.getItem("lastOpenedTaskId");

    if (!targetId) return;

    try {
      sessionStorage.removeItem("lastOpenedTaskId");
      sessionStorage.removeItem("lastSubmittedTaskId");
    } catch { /* noop */ }

    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [loading, tasks.length]);

  // ---- Actions ----

  const handleResetDemo = () => {
    resetProjectTimeline();
    getProjectTimeline(projectId ?? null).then(setProject).catch(() => {});
    setShowExtensionForm(false);
    setExtensionReason("");
    setExtensionDays("2");
    setRejectReason("");
  };

  const goToTaskAction = (task, action) => {
    try { sessionStorage.setItem("lastOpenedTaskId", task.id); } catch { /* noop */ }
    navigate(`/tasks/${task.id}/update?role=${role}&action=${action}`);
  };

  const handleRequestExtension = async () => {
    const days = Number(extensionDays);
    if (!days || days <= 0 || !extensionReason.trim()) return;

    setSubmitting(true);
    try {
      const updated = await requestExtension(projectId ?? null, {
        reason: extensionReason.trim(),
        additionalDays: days,
      });
      setProject(updated);
      setShowExtensionForm(false);
      setExtensionReason("");
      setExtensionDays("2");
    } catch {
      // Error handling could use a toast here
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveExtension = async () => {
    setSubmitting(true);
    try {
      const updated = await resolveExtension(projectId ?? null, project?.extensionRequest?.id, {
        status: "approved",
        responseNote: "Extension approved by client.",
      });
      setProject(updated);
    } catch {
      // fallback handled in store
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectExtension = async () => {
    setSubmitting(true);
    try {
      const updated = await resolveExtension(projectId ?? null, project?.extensionRequest?.id, {
        status: "rejected",
        responseNote: rejectReason.trim() || "Extension rejected by client.",
      });
      setProject(updated);
      setRejectReason("");
    } catch {
      // fallback handled in store
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingExtension = project?.extensionRequest?.status === "pending";

  // ---- Compute chat link for messaging the project client ----
  const projectData = projectId ? getMockProjectById(projectId) : null;
  const clientId = projectData?.clientId;
  let chatUrl = "/messenger";
  if (projectId && clientId) {
    const expertConvs = getMockConversationsByUser(DEMO_EXPERT_ID);
    const projectConv = expertConvs.find((c) => c.projectId === projectId);
    if (projectConv) chatUrl = `/messenger/${projectConv.id}`;
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-full max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 shadow-sm text-center">
        <Bot className="w-12 h-12 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Failed to load timeline
        </h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            getProjectTimeline(projectId ?? null)
              .then(setProject)
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---- Empty state ----
  if (!project || tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
        <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">
          No project timeline available
        </h3>
        <p className="text-sm text-gray-400">
          Project timeline data has not been loaded yet.
        </p>
      </div>
    );
  }

  // ---- Main render ----
  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              AI Project Timeline Manager
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {project.projectTitle || "Project"}
            </h1>

            <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
              AI divides the project into main tasks and mini tasks. Overall
              progress is calculated from average mini task completion.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              {deadlineInfo && (
                <>
                  <div className="bg-gray-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Project Deadline</p>
                    <p className="font-semibold text-gray-900">
                      {deadlineInfo.formattedDate || "N/A"}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl px-4 py-3 ${
                      deadlineInfo.isOverdue ? "bg-red-50" : "bg-blue-50"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        deadlineInfo.isOverdue ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      Countdown
                    </p>
                    <p
                      className={`font-semibold ${
                        deadlineInfo.isOverdue ? "text-red-700" : "text-blue-700"
                      }`}
                    >
                      {deadlineInfo.remainingText || "N/A"}
                    </p>
                  </div>
                </>
              )}

              <div className="bg-green-50 rounded-xl px-4 py-3">
                <p className="text-xs text-green-600 mb-1">Completed Tasks</p>
                <p className="font-semibold text-green-700">
                  {completedTasks}/{tasks.length}
                </p>
              </div>
            </div>
          </div>

          {/* Expert action buttons — right side */}
          {role === "expert" && (
            <div className="flex flex-row xl:flex-col gap-3 xl:flex-shrink-0">
              <button
                type="button"
                disabled={hasPendingExtension || submitting}
                onClick={() => setShowExtensionForm((current) => !current)}
                className="w-full px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium inline-flex items-center justify-center disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap"
              >
                {hasPendingExtension
                  ? "Extension Request Pending"
                  : "Request Project Extension"}
              </button>

              <Link
                to={chatUrl}
                className="w-full px-5 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 text-sm font-medium inline-flex items-center justify-center gap-2 transition whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                Message Client
              </Link>
            </div>
          )}
        </div>

        {/* Extension request panel — extracted component */}
        <ExtensionRequestPanel
          role={role}
          extensionRequest={project?.extensionRequest}
          showExtensionForm={showExtensionForm}
          extensionDays={extensionDays}
          extensionReason={extensionReason}
          rejectReason={rejectReason}
          submitting={submitting}
          hasPendingExtension={hasPendingExtension}
          onToggleForm={() => setShowExtensionForm(false)}
          onExtensionDaysChange={setExtensionDays}
          onExtensionReasonChange={setExtensionReason}
          onRejectReasonChange={setRejectReason}
          onSubmitRequest={handleRequestExtension}
          onApproveExtension={handleApproveExtension}
          onRejectExtension={handleRejectExtension}
        />

        {/* Overall progress bar */}
        <div>
          <div className="flex justify-between mb-3">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="font-semibold text-gray-900">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full max-w-[1280px] bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-900 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Overall progress = average mini task completion.
          </p>
        </div>
      </div>

      {/* Task list — uses extracted TaskCard component */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const taskProgress = deriveTaskProgress(task);
          const derivedStatus = deriveTaskStatus(task);
          const latestLog = project.taskLogs?.[task.id]?.[0];

          const canOpenSubmit =
            role === "expert" &&
            derivedStatus !== "Pending Review" &&
            derivedStatus !== "Completed";

          const isSubmitDisabled = !canOpenSubmit;

          const submitButtonLabel =
            derivedStatus === "Pending Review"
              ? "Waiting"
              : derivedStatus === "Completed"
                ? "Done"
                : "Submit Task";

          return (
            <TaskCard
              key={task.id}
              task={task}
              derivedStatus={derivedStatus}
              role={role}
              completedMiniTasks={taskProgress.completed}
              totalMiniTasks={taskProgress.total}
              progress={taskProgress.percent}
              latestLog={latestLog}
              canOpenSubmit={canOpenSubmit}
              isSubmitDisabled={isSubmitDisabled}
              submitButtonLabel={submitButtonLabel}
              goToTaskAction={goToTaskAction}
              getTaskStatusClass={getTaskStatusClass}
              getTaskStatusLabel={getTaskStatusLabel}
            />
          );
        })}
      </div>

      {/* Activity log — extracted component */}
      <ActivityLogPanel projectLogs={project?.projectLogs} />
    </div>
  );
}
