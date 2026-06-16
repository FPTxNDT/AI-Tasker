import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Tag,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Users,
  FileText,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";
import {
  acceptProposal,
  declineProposal,
  getMatchPercentage,
} from "../../lib/proposalStore.js";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProposalsByProject,
  getMockUserById,
  getMockProjectById,
  getMockAiCategoryById,
} from "../../../mock-db/mockDbService.js";

/**
 * ProposalReview — Client views all proposals for a specific project.
 *
 * Route: /client/projects/:projectId/proposals
 */
export function ProposalReview() {
  const { projectId, id: legacyId } = useParams();
  const activeProjectId = projectId || legacyId;

  // ---- Mock DB data ----
  const proposals = getMockProposalsByProject(activeProjectId);
  const project = getMockProjectById(activeProjectId);
  const category = project ? getMockAiCategoryById(project.category) : null;

  // Track which proposals have been acted on (accepted/declined) locally
  // for immediate UI feedback without re-fetching
  const [actedIds, setActedIds] = useState(new Set());
  const [feedback, setFeedback] = useState(null); // { type, message }

  // Enrich proposals with expert data + match %
  const enrichedProposals = proposals.map((proposal) => {
    const expert = getMockUserById(proposal.expertId);
    return {
      ...proposal,
      matchPct: getMatchPercentage(proposal.id),
      expert: expert
        ? {
            name: expert.fullName,
            title: expert.profile?.title || expert.profile?.specialization || "",
            initials: expert.fullName
              ? expert.fullName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
              : "?",
            skills: expert.profile?.skills || [],
          }
        : {
            name: "Unknown Expert",
            title: "",
            initials: "?",
            skills: [],
          },
    };
  });

  // Filter out declined proposals (unless already acted on this session)
  const visibleProposals = enrichedProposals.filter(
    (p) => p.status !== "declined" || actedIds.has(p.id),
  );

  const handleAccept = (proposalId, expertName) => {
    const result = acceptProposal(proposalId);
    if (result.success) {
      setActedIds((prev) => new Set([...prev, proposalId]));
      setFeedback({
        type: "success",
        message: `You accepted ${expertName}'s proposal. The project is now in progress.`,
      });
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to accept." });
    }
    // Clear feedback after 5s
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleDecline = (proposalId, expertName) => {
    const result = declineProposal(proposalId);
    if (result.success) {
      setActedIds((prev) => new Set([...prev, proposalId]));
      setFeedback({
        type: "info",
        message: `You declined ${expertName}'s proposal.`,
      });
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to decline." });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  // ---- Project not found ----
  if (!project) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/client/my-projects" className="mb-6">Back</BackButton>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Project not found</h3>
          <p className="text-sm text-gray-400 mt-1">
            This project may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <BackButton fallback="/client/my-projects" className="mb-6">Back to All Projects</BackButton>

      {/* ── Feedback banner ── */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : feedback.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* ================================================================== */}
      {/* PROJECT INFO SECTION                                               */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mb-3">
                  <Tag className="w-3.5 h-3.5" />
                  {category.label}
                </span>
              )}
            </div>

            {/* Proposal count badge */}
            <span className="flex-shrink-0 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              {visibleProposals.length} proposal{visibleProposals.length !== 1 ? "s" : ""} received
            </span>
          </div>
        </div>

        {/* Project details body */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Budget</p>
              <p className="font-semibold text-gray-900">
                <MoneyDisplay amount={project.budget} />
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Timeline</p>
              <p className="font-semibold text-gray-900">
                {project.durationValue} {project.durationUnit}
              </p>
            </div>
            {project.deadline && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <p className="font-semibold text-gray-900">
                  {new Date(project.deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {project.createdAt && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Posted</p>
                <p className="font-semibold text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Required skills */}
          {project.requiredSkills?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* PROPOSALS SECTION                                                  */}
      {/* ================================================================== */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Proposals Received
      </h2>

      {visibleProposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            No proposals yet
          </h3>
          <p className="text-sm text-gray-400">
            Proposals will appear here once experts submit them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleProposals.map((proposal) => {
            const isAccepted = proposal.status === "accepted";
            const isDeclined = proposal.status === "declined";
            const hasBeenActed = isAccepted || isDeclined || actedIds.has(proposal.id);

            return (
              <div
                key={proposal.id}
                className={`bg-white rounded-xl border p-6 transition ${
                  isAccepted
                    ? "border-green-300 bg-green-50/30"
                    : isDeclined
                      ? "border-red-200 bg-red-50/20 opacity-75"
                      : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* ── Expert info ── */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar initials */}
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-purple-700">
                        {proposal.expert?.initials}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + match % */}
                      <div className="flex items-center flex-wrap gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {proposal.expert?.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                          {proposal.matchPct}% match
                        </span>
                        {isAccepted && (
                          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Accepted
                          </span>
                        )}
                        {isDeclined && (
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Declined
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      {proposal.expert?.title && (
                        <p className="text-sm text-gray-500 mb-2">
                          {proposal.expert.title}
                        </p>
                      )}

                      {/* Cover letter / message */}
                      {(proposal.coverLetter || proposal.message) && (
                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                          {proposal.coverLetter || proposal.message}
                        </p>
                      )}

                      {/* Expert skills */}
                      {proposal.expert?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {proposal.expert.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {proposal.expert.skills.length > 5 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md text-xs">
                              +{proposal.expert.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Right: bid amount + actions ── */}
                  <div className="flex flex-col items-start md:items-end gap-3 md:min-w-[180px] flex-shrink-0">
                    {/* Bid amount */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        <MoneyDisplay amount={proposal.bidAmount} />
                      </p>
                      <p className="text-xs text-gray-400">
                        {proposal.durationDays
                          ? `${proposal.durationDays} days`
                          : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    {!hasBeenActed && (
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Link
                          to="/messenger"
                          className="px-3.5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                          title="Message expert"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDecline(
                              proposal.id,
                              proposal.expert?.name,
                            )
                          }
                          className="px-3.5 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAccept(
                              proposal.id,
                              proposal.expert?.name,
                            )
                          }
                          className="px-3.5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      </div>
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
