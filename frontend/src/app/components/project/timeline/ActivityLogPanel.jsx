// =============================================================================
// ActivityLogPanel — renders the project activity log feed.
//
// Props:
//   projectLogs — Array<{ time, id, actor, message }>
//   getActorIcon — (actor: string) => ReactNode
// =============================================================================

import { getActorIcon as defaultGetActorIcon } from "./timelineHelpers.jsx";

export function ActivityLogPanel({ projectLogs, getActorIcon }) {
  const iconFn = getActorIcon || defaultGetActorIcon;

  if (!projectLogs || projectLogs.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-5">
        Project Activity
      </h2>
      <div className="space-y-4">
        {projectLogs.map((log, index) => (
          <div
            key={`${log.time || log.id}-${index}`}
            className="flex gap-4 border border-gray-200 rounded-2xl p-4"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              {iconFn(log.actor)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{log.actor}</p>
                <p className="text-sm text-gray-500">
                  {log.time
                    ? new Date(log.time).toLocaleString()
                    : ""}
                </p>
              </div>
              <p className="text-gray-700 mt-1">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
