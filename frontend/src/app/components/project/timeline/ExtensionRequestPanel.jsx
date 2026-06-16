// =============================================================================
// ExtensionRequestPanel — extension request form + status banner.
//
// Props (all optional — only relevant sections render):
//   role                  — "client" | "expert"
//   extensionRequest      — { status, requestedDays, reason, responseNote }
//   showExtensionForm     — boolean
//   extensionDays         — string
//   extensionReason       — string
//   rejectReason          — string
//   submitting            — boolean
//   hasPendingExtension   — boolean
//   onToggleForm          — () => void
//   onExtensionDaysChange — (value: string) => void
//   onExtensionReasonChange — (value: string) => void
//   onRejectReasonChange  — (value: string) => void
//   onSubmitRequest       — () => void
//   onApproveExtension    — () => void
//   onRejectExtension     — () => void
// =============================================================================

export function ExtensionRequestPanel({
  role,
  extensionRequest,
  showExtensionForm,
  extensionDays,
  extensionReason,
  rejectReason,
  submitting,
  hasPendingExtension,
  onToggleForm,
  onExtensionDaysChange,
  onExtensionReasonChange,
  onRejectReasonChange,
  onSubmitRequest,
  onApproveExtension,
  onRejectExtension,
}) {
  // Show nothing if there's no active extension and the form isn't open
  const hasActiveExtension =
    extensionRequest && extensionRequest.status !== "none";

  if (!showExtensionForm && !hasActiveExtension) return null;

  return (
    <>
      {/* Expert: extension request form */}
      {role === "expert" && showExtensionForm && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 text-lg">
            Request Project Extension
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Days
              </label>
              <input
                type="number"
                min={1}
                value={extensionDays}
                onChange={(event) => onExtensionDaysChange(event.target.value)}
                className="w-full border border-blue-200 rounded-xl px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Reason
              </label>
              <input
                value={extensionReason}
                onChange={(event) => onExtensionReasonChange(event.target.value)}
                placeholder="Explain why you need more time..."
                className="w-full border border-blue-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              disabled={
                !extensionReason.trim() ||
                Number(extensionDays) <= 0 ||
                submitting
              }
              onClick={onSubmitRequest}
              className="px-5 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={onToggleForm}
              className="px-5 py-2 border border-blue-200 rounded-xl hover:bg-blue-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Extension status banner */}
      {hasActiveExtension && (
        <div
          className={`mb-8 border rounded-2xl p-6 ${
            extensionRequest.status === "pending"
              ? "bg-yellow-50 border-yellow-200"
              : extensionRequest.status === "approved"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <h3 className="font-semibold text-gray-900 text-lg">
            Project Extension Request
          </h3>
          <p className="text-sm text-gray-700 mt-3">
            Expert requested +{extensionRequest.requestedDays || 0}{" "}
            days
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Reason: {extensionRequest.reason}
          </p>
          <p className="text-sm font-medium text-gray-900 mt-3 capitalize">
            Status: {extensionRequest.status}
          </p>

          {extensionRequest.responseNote && (
            <p className="text-sm text-gray-700 mt-2">
              Response: {extensionRequest.responseNote}
            </p>
          )}

          {role === "client" &&
            extensionRequest.status === "pending" && (
              <div className="mt-5">
                <textarea
                  value={rejectReason}
                  onChange={(event) => onRejectReasonChange(event.target.value)}
                  placeholder="Optional reject reason..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 min-h-[90px]"
                />
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onApproveExtension}
                    disabled={submitting}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? "..." : "Approve Extension"}
                  </button>
                  <button
                    type="button"
                    onClick={onRejectExtension}
                    disabled={submitting}
                    className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? "..." : "Reject Extension"}
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </>
  );
}
