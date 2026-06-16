import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockDisputes,
  getMockUserById,
  getMockProjectById,
} from "../../../mock-db/mockDbService.js";

const statusColors = {
  open: "bg-red-100 text-red-700",
  under_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [resolveForm, setResolveForm] = useState(null); // { id, outcome }

  useEffect(() => {
    // TEMP MOCK DB - replace with API call when backend is ready
    const timer = setTimeout(() => {
      const rawDisputes = getMockDisputes();
      setDisputes(
        rawDisputes.map((d) => {
          const project = getMockProjectById(d.projectId);
          const client = getMockUserById(d.clientId);
          const expert = getMockUserById(d.expertId);
          return {
            id: d.id,
            projectTitle: project?.title || d.projectId,
            clientName: client?.fullName || d.clientId,
            expertName: expert?.fullName || d.expertId,
            reason: d.description,
            amount: project?.budget || 0,
            status: d.status,
            openedAt: d.createdAt,
            outcome: d.resolution,
          };
        }),
      );
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResolve = (disputeId, outcome) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: "resolved", outcome }
          : d,
      ),
    );
    setResolveForm(null);
    setFeedback(`Dispute resolved — ${outcome === "refund" ? "refunded to client" : outcome === "release" ? "released to expert" : "split between parties"}.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin/dashboard" className="mb-4">Back to Dashboard</BackButton>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dispute Resolution</h1>
      <p className="text-gray-600 mb-6">Review and resolve disputes between clients and experts.</p>

      {feedback && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {feedback}
        </div>
      )}

      {disputes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No open disputes</h3>
          <p className="text-sm text-gray-400">All clear!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                dispute.status === "resolved" ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{dispute.projectTitle}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[dispute.status] || "bg-gray-100 text-gray-700"}`}>
                        {dispute.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{dispute.reason}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Client: <strong>{dispute.clientName}</strong></span>
                      <span>Expert: <strong>{dispute.expertName}</strong></span>
                      <span>Amount: <MoneyDisplay amount={dispute.amount} /></span>
                      <span>Opened: {new Date(dispute.openedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {dispute.status !== "resolved" && (
                    <div className="flex gap-2">
                      {!resolveForm || resolveForm.id !== dispute.id ? (
                        <button
                          type="button"
                          onClick={() => setResolveForm({ id: dispute.id })}
                          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium inline-flex items-center gap-2"
                        >
                          Resolve <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <p className="text-xs font-semibold text-gray-700">Choose outcome:</p>
                          <button
                            type="button"
                            onClick={() => handleResolve(dispute.id, "refund")}
                            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium border border-red-200"
                          >
                            Refund Client
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolve(dispute.id, "release")}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium border border-green-200"
                          >
                            Release to Expert
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolve(dispute.id, "split")}
                            className="px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-xs font-medium border border-yellow-200"
                          >
                            50/50 Split
                          </button>
                          <button
                            type="button"
                            onClick={() => setResolveForm(null)}
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {dispute.status === "resolved" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Resolved — {dispute.outcome === "refund" ? "Refunded to client" : dispute.outcome === "release" ? "Released to expert" : "50/50 split"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
