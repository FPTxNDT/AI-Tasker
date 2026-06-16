// =============================================================================
// TaskActionButtons — renders View/Submit/Review buttons for a task card.
//
// Props:
//   task             — task object { id, title }
//   derivedStatus    — display status string
//   role             — "client" | "expert"
//   canOpenSubmit    — whether the expert can submit
//   isSubmitDisabled — whether the submit button is disabled
//   submitButtonLabel — label for the submit button
//   goToTaskAction   — (task, action) => void
// =============================================================================

import { Link } from "react-router";
import { Eye, Send } from "lucide-react";

export function TaskActionButtons({
  task,
  derivedStatus,
  role,
  canOpenSubmit,
  isSubmitDisabled,
  submitButtonLabel,
  goToTaskAction,
}) {
  return (
    <div className="flex flex-row items-center gap-3 xl:w-[380px] xl:justify-end xl:-mt-1 flex-shrink-0">
      <Link
        to={`/tasks/${task.id}/update?role=${role}&action=view`}
        className="min-w-[165px] justify-center px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 inline-flex items-center gap-2 transition"
      >
        <Eye className="w-4 h-4" />
        View Task
      </Link>

      {role === "expert" && (
        <button
          type="button"
          disabled={isSubmitDisabled}
          onClick={() => {
            if (canOpenSubmit) {
              goToTaskAction(task, "submit");
            }
          }}
          className={`min-w-[165px] justify-center px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition ${
            isSubmitDisabled
              ? "bg-gray-300 text-white cursor-not-allowed opacity-70"
              : "bg-blue-900 text-white hover:bg-blue-800"
          }`}
        >
          <Send className="w-4 h-4" />
          {submitButtonLabel}
        </button>
      )}

      {role === "client" && derivedStatus === "Pending Review" && (
        <Link
          to={`/tasks/${task.id}/update?role=${role}&action=review`}
          className="min-w-[165px] justify-center px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 inline-flex items-center gap-2 transition"
        >
          <Eye className="w-4 h-4" />
          Review
        </Link>
      )}
    </div>
  );
}
