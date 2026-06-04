import { Link } from "react-router";
import {
  FileText,
  MessageSquare,
  Eye,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";

import {
  getMockProposalsByExpert,
  getMockProjectById,
  getMockUserById,
  getMockConversationsByUser,
} from "../../../mock-db/mockDbService.js";
import { getSessionProposalsByExpert } from "../../lib/proposalStore.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";
import { getProposalStatusConfig } from "../../lib/proposalStatusConfig.js";

// Status helpers — delegated to shared proposalStatusConfig.js
function getStatusConfig(status) { return getProposalStatusConfig(status); }

/**
 * Find the conversation ID for a given project + expert combo.
 */
function findConversationId(projectId, expertId) {
  const expertConvs = getMockConversationsByUser(expertId);
  const conv = expertConvs.find((c) => c.projectId === projectId);
  return conv ? conv.id : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProposalStatus() {
  // ---- Mock DB proposals ----
  const mockProposals = getMockProposalsByExpert(DEMO_EXPERT_ID).map((proposal) => {
    const project = getMockProjectById(proposal.projectId);
    const client = project ? getMockUserById(project.clientId) : null;
    return {
      ...proposal,
      proposalTitle: proposal.proposalTitle || project?.title || proposal.projectId,
      projectTitle: project?.title || proposal.projectId,
      clientName: client?.fullName || "Client",
      clientCompany: client?.profile?.company || "",
      project,
    };
  });

  // ---- Session proposals ----
  const sessionProposals = getSessionProposalsByExpert(DEMO_EXPERT_ID).map((proposal) => {
    const project = getMockProjectById(proposal.projectId);
    const client = project ? getMockUserById(project.clientId) : null;
    return {
      ...proposal,
      proposalTitle: proposal.proposalTitle || project?.title || proposal.projectId,
      projectTitle: project?.title || proposal.projectId,
      clientName: client?.fullName || "Client",
      clientCompany: client?.profile?.company || "",
      project,
    };
  });

  // Merge — session proposals first (newest on top)
  const proposals = [...sessionProposals, ...mockProposals];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Track your submitted proposals and their status
          </p>
        </div>
        <Link
          to="/expert/find-jobs"
          className="px-4 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-medium text-sm inline-flex items-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" /> Browse Jobs
        </Link>
      </div>

      {/* Empty state */}
      {proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            No proposals submitted
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Browse available jobs and submit your first proposal.
          </p>
          <Link
            to="/expert/find-jobs"
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
          >
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const statusCfg = getStatusConfig(proposal.status);
            const StatusIcon = statusCfg.icon;
            const convId = findConversationId(proposal.projectId, DEMO_EXPERT_ID);

            return (
              <div
                key={proposal.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status badge side by side */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mb-2">
                      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">
                        {proposal.proposalTitle}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${statusCfg.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>
                        Client:{" "}
                        <span className="font-medium text-gray-700">
                          {proposal.clientName}
                          {proposal.clientCompany ? ` · ${proposal.clientCompany}` : ""}
                        </span>
                      </span>
                      <span>
                        Bid:{" "}
                        <span className="font-semibold text-gray-900">
                          <MoneyDisplay amount={proposal.bidAmount} />
                        </span>
                      </span>
                      <span>
                        Duration:{" "}
                        <span className="font-medium text-gray-700">
                          {proposal.durationDays} days
                        </span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      Submitted{" "}
                      {proposal.createdAt
                        ? new Date(proposal.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row sm:flex-col gap-2.5 sm:min-w-[140px] sm:items-stretch">
                    <Link
                      to={`/expert/proposals/${proposal.id}`}
                      className="px-4 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 text-sm font-medium text-center transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>

                    {/* Contact — only for accepted proposals */}
                    {proposal.status === "accepted" && (
                      convId ? (
                        <Link
                          to={`/messenger/${convId}`}
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium text-center transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contact
                        </Link>
                      ) : (
                        <Link
                          to="/messenger"
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium text-center transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Contact
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
