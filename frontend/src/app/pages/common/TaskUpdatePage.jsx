import { useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { Clock, CheckCircle2, MessageSquare, User, ArrowLeft, Check, Loader2 } from "lucide-react";

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockTaskById, getMockProjectById, getMockUserById } from "../../../mock-db/mockDbService.js";
import {
  deriveTaskStatus,
  deriveTaskProgress,
  toggleMockMiniTask,
  updateMockMiniTaskNote,
  markTaskSubmitted,
  approveTaskInMockDb,
  requestTaskRevisionInMockDb,
  getTaskStatusClass,
} from "../../lib/projectTimelineStore.js";

function findTaskById(taskId) {
  return getMockTaskById(taskId);
}

export function TaskUpdatePage() {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "expert";
  const action = searchParams.get("action") || "view";

  // TEMP MOCK DB - replace with API call when backend is ready
  const result = findTaskById(taskId);
  const task = result?.task ?? null;
  const timeline = result?.timeline ?? null;
  const project = task ? getMockProjectById(task.projectId) : null;
  const assignedUser = task ? getMockUserById(task.assignedTo) : null;

  // ---- Derived values (recomputed on every render from mock DB) ----
  const { completed: completedMiniTasks, total: totalMiniTasks, percent: progress } =
    deriveTaskProgress(task);
  const derivedStatus = deriveTaskStatus(task);
  const allMiniTasksDone = totalMiniTasks > 0 && completedMiniTasks >= totalMiniTasks;

  // ---- Local state ----
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Controlled note inputs — seeded from mock DB on first render
  const [miniTaskNotes, setMiniTaskNotes] = useState(() => {
    const notes = {};
    task?.miniTasks?.forEach((mt) => {
      notes[mt.id] = mt.note || "";
    });
    return notes;
  });
  // Debounce timers for note auto-save
  const noteTimers = useRef({});

  // ---- Mini task checkbox toggle (immediate auto-save) ----
  const handleToggleMiniTask = useCallback((miniTaskId) => {
    const updated = toggleMockMiniTask(taskId, miniTaskId);
    if (updated) {
      // Force re-render — React reads fresh mock DB on next render
      setMiniTaskNotes((prev) => ({ ...prev }));
    }
  }, [taskId]);

  // ---- Mini task note change (debounced auto-save) ----
  const handleNoteChange = useCallback((miniTaskId, value) => {
    setMiniTaskNotes((prev) => ({ ...prev, [miniTaskId]: value }));

    // Debounce the mock-DB write (300ms after last keystroke)
    if (noteTimers.current[miniTaskId]) {
      clearTimeout(noteTimers.current[miniTaskId]);
    }
    noteTimers.current[miniTaskId] = setTimeout(() => {
      updateMockMiniTaskNote(taskId, miniTaskId, value);
    }, 300);
  }, [taskId]);

  // ---- Done button — mark task as submitted ----
  const handleDone = useCallback(() => {
    if (!allMiniTasksDone || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      const updated = markTaskSubmitted(taskId);
      if (updated) {
        setSubmitted(true);
        try { sessionStorage.setItem("lastSubmittedTaskId", taskId); } catch { /* noop */ }
        setTimeout(() => navigate(-1), 800);
      }
      setSubmitting(false);
    }, 400);
  }, [taskId, allMiniTasksDone, submitting, navigate]);

  // ---- Client approve ----
  const handleClientApprove = useCallback(() => {
    setSubmitting(true);
    setTimeout(() => {
      approveTaskInMockDb(taskId);
      setSubmitted(true);
      try { sessionStorage.setItem("lastSubmittedTaskId", taskId); } catch { /* noop */ }
      setTimeout(() => navigate(-1), 800);
      setSubmitting(false);
    }, 300);
  }, [taskId, navigate]);

  // ---- Client request changes ----
  const handleClientRequestChanges = useCallback(() => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      requestTaskRevisionInMockDb(taskId, feedbackText.trim());
      setSubmitted(true);
      try { sessionStorage.setItem("lastSubmittedTaskId", taskId); } catch { /* noop */ }
      setTimeout(() => navigate(-1), 800);
      setSubmitting(false);
    }, 300);
  }, [taskId, feedbackText, navigate]);

  // ---- Back button ----
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Task not found</h3>
          <p className="text-sm text-gray-400">The task you are looking for may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Header */}
        <div className="mb-6">
          {project && (
            <p className="text-sm text-blue-600 font-medium mb-1">{project.title}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
          <p className="text-gray-600">{task.description}</p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTaskStatusClass(derivedStatus)}`}>
            {derivedStatus}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Progress: {progress}%
          </span>
          {assignedUser && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {assignedUser.fullName}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-900 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Expert notes */}
        {task.expertNotes && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Expert Notes
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{task.expertNotes}</p>
          </div>
        )}

        {/* Client feedback */}
        {task.clientFeedback && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Client Feedback
            </h3>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-4">{task.clientFeedback}</p>
          </div>
        )}

        {/* Mini Tasks */}
        {task.miniTasks?.length > 0 && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Mini Tasks ({completedMiniTasks}/{totalMiniTasks})
            </h3>
            <div className="space-y-3">
              {task.miniTasks.map((mt) => {
                const isDone = mt.status === "done";
                return (
                  <div
                    key={mt.id}
                    className={`border rounded-xl p-4 transition ${
                      isDone
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Top row: checkbox + title + status badge */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleMiniTask(mt.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                          isDone
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-gray-300 hover:border-blue-500 text-transparent"
                        }`}
                        title={isDone ? "Mark as incomplete" : "Mark as done"}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-medium ${
                              isDone ? "line-through text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {mt.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDone
                                ? "bg-green-200 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isDone ? "Done" : "Todo"}
                          </span>
                        </div>

                        {/* Expert note textarea */}
                        <textarea
                          value={miniTaskNotes[mt.id] || ""}
                          onChange={(e) => handleNoteChange(mt.id, e.target.value)}
                          placeholder="Add a note..."
                          rows={2}
                          className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Action buttons: Back + Done ── */}
        {role === "expert" && (derivedStatus === "In Progress" || derivedStatus === "Needs Revision") && (
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleDone}
                disabled={!allMiniTasksDone || submitting}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition ${
                  allMiniTasksDone && !submitting
                    ? "bg-blue-900 text-white hover:bg-blue-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                  </>
                )}
              </button>
            </div>
            {!allMiniTasksDone && (
              <p className="text-xs text-gray-400 mt-2">
                Complete all mini tasks ({completedMiniTasks}/{totalMiniTasks}) to enable Done.
              </p>
            )}
          </div>
        )}

        {/* ── Submitted toast ── */}
        {submitted && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-bounce">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            Task submitted for client review!
          </div>
        )}

        {/* Feedback form (client reviewing) */}
        {role === "client" && action === "review" && derivedStatus === "Pending Review" && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Review Task</h3>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
              placeholder="Add feedback (required for requesting changes)..."
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleClientApprove}
                disabled={submitting}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "..." : "Approve"}
              </button>
              <button
                onClick={handleClientRequestChanges}
                disabled={!feedbackText.trim() || submitting}
                className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "..." : "Request Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
