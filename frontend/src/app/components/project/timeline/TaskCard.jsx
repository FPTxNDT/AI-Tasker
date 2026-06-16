// =============================================================================
// TaskCard — single task card with progress bar, status, and action buttons.
//
// Props:
//   task              — task object
//   derivedStatus     — display status string
//   role              — "client" | "expert"
//   completedMiniTasks — number
//   totalMiniTasks    — number
//   progress          — 0-100 number
//   latestLog         — { message } | null
//   canOpenSubmit     — boolean
//   isSubmitDisabled  — boolean
//   submitButtonLabel — string
//   goToTaskAction    — (task, action) => void
//   getTaskStatusClass — (status) => string
//   getTaskStatusLabel — (status) => string
// =============================================================================

import { CheckCircle2, Clock3 } from "lucide-react";
import { TaskActionButtons } from "./TaskActionButtons.jsx";

export function TaskCard({
  task,
  derivedStatus,
  role,
  completedMiniTasks,
  totalMiniTasks,
  progress,
  latestLog,
  canOpenSubmit,
  isSubmitDisabled,
  submitButtonLabel,
  goToTaskAction,
  getTaskStatusClass,
  getTaskStatusLabel,
}) {
  return (
    <div
      id={task.id}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
    >
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div className="flex-1 pr-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-blue-900 text-white rounded-xl flex items-center justify-center font-semibold flex-shrink-0">
              {task.id || "?"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getTaskStatusClass(
                    derivedStatus,
                  )}`}
                >
                  {getTaskStatusLabel(derivedStatus)}
                </span>
              </div>
              <p className="text-gray-500 mt-2">{task.description}</p>
              <div className="flex flex-wrap items-center gap-5 mt-5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {completedMiniTasks}/{totalMiniTasks}{" "}
                  mini tasks
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock3 className="w-4 h-4" />
                  {progress}% completed
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full max-w-[1280px] bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {latestLog && (
                <div className="mt-4 text-sm text-gray-500">
                  Latest update:{" "}
                  <span className="text-gray-700 font-medium">
                    {latestLog.message}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <TaskActionButtons
          task={task}
          derivedStatus={derivedStatus}
          role={role}
          canOpenSubmit={canOpenSubmit}
          isSubmitDisabled={isSubmitDisabled}
          submitButtonLabel={submitButtonLabel}
          goToTaskAction={goToTaskAction}
        />
      </div>
    </div>
  );
}
