import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  User,
  Briefcase,
  Paperclip,
  Image,
  File,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";

import {
  getMockProposalsByExpert,
  getMockProjectById,
  getMockUserById,
  getMockConversationsByUser,
} from "../../../mock-db/mockDbService.js";
import { getSessionProposalById } from "../../lib/proposalStore.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";
import { getProposalStatusConfig } from "../../lib/proposalStatusConfig.js";

// Status helpers — delegated to shared proposalStatusConfig.js
function getStatusConfig(status) { return getProposalStatusConfig(status); }

// ---------------------------------------------------------------------------
// Section wrapper — keeps visual consistency
// ---------------------------------------------------------------------------

function DetailSection({ title, children, className = "" }) {
  return (
    <div className={`border-b border-gray-100 last:border-b-0 py-6 first:pt-0 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProposalDetail() {
  const { id } = useParams();

  const [proposal, setProposal] = useState(null);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session store first, then mock DB
    let found = getSessionProposalById(id);

    if (!found) {
      // Search mock DB
      const mockProposals = getMockProposalsByExpert(DEMO_EXPERT_ID);
      found = mockProposals.find((p) => p.id === id) || null;
    }

    if (found) {
      setProposal(found);
      // Enrich with project + client data
      const proj = getMockProjectById(found.projectId);
      if (proj) {
        setProject(proj);
        const cli = getMockUserById(proj.clientId);
        if (cli) setClient(cli);
      }
    }

    setLoading(false);
  }, [id]);

  // ---- Find conversation for Contact button ----
  function getConversationId() {
    if (!proposal) return null;
    const expertConvs = getMockConversationsByUser(DEMO_EXPERT_ID);
    const conv = expertConvs.find((c) => c.projectId === proposal.projectId);
    return conv ? conv.id : null;
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ---- Not found ----
  if (!proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/expert/proposals" className="mb-6">Back to My Proposals</BackButton>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Proposal not found</h3>
          <p className="text-sm text-gray-400">
            This proposal may have been removed or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  // ---- Helpers ----
  const statusCfg = getStatusConfig(proposal.status);
  const StatusIcon = statusCfg.icon;
  const convId = getConversationId();
  const isSessionProposal = proposal.id?.startsWith("session-prop-");
  const hasFullFields = isSessionProposal || !!proposal.proposalTitle;

  const attachments = proposal.attachments || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <BackButton fallback="/expert/proposals" className="mb-6">Back to My Proposals</BackButton>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ================================================================ */}
        {/* Header — Project + Status                                         */}
        {/* ================================================================ */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-3">
                <FileText className="w-4 h-4" />
                Proposal Details
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                {proposal.proposalTitle || project?.title || "Proposal"}
              </h1>

              {/* Project + Client info */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-500">
                {project && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Project: <span className="font-medium text-gray-700">{project.title}</span>
                  </span>
                )}
                {client && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    Client:{" "}
                    <span className="font-medium text-gray-700">
                      {client.fullName}
                      {client.profile?.company ? ` · ${client.profile.company}` : ""}
                    </span>
                  </span>
                )}
                {project?.budget != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    Budget:{" "}
                    <span className="font-medium text-gray-700">
                      <MoneyDisplay amount={project.budget} />
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Status + Submitted date */}
            <div className="text-right flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.className}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusCfg.label}
              </span>
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
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-5">
            <div className="bg-white rounded-xl px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Bid Amount</p>
              <p className="font-semibold text-gray-900">
                <MoneyDisplay amount={proposal.bidAmount} />
              </p>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Duration</p>
              <p className="font-semibold text-gray-900">{proposal.durationDays} days</p>
            </div>
            <div className="bg-white rounded-xl px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
              <p className="font-semibold text-gray-900">
                {proposal.createdAt
                  ? new Date(proposal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Detail Sections                                                   */}
        {/* ================================================================ */}
        <div className="p-8">
          {/* Professional Introduction */}
          <DetailSection title="Professional Introduction">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {proposal.professionalIntro ||
                proposal.coverLetter ||
                "No introduction provided."}
            </p>
          </DetailSection>

          {/* Technical Approach & Methodology */}
          {hasFullFields && (
            <DetailSection title="Technical Approach & Methodology">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.technicalApproach || "No technical approach specified."}
              </p>
            </DetailSection>
          )}

          {/* Implementation Timeline & Milestones */}
          {hasFullFields && (
            <DetailSection title="Implementation Timeline & Milestones">
              <pre className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {proposal.timelineMilestones || "No timeline specified."}
              </pre>
            </DetailSection>
          )}

          {/* Dependencies & Client Requirements */}
          {hasFullFields && (
            <DetailSection title="Dependencies & Client Requirements">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.dependencies || "No dependencies specified."}
              </p>
            </DetailSection>
          )}

          {/* Attachments */}
          <DetailSection
            title={`Attached Assets ${attachments.length > 0 ? `(${attachments.length})` : ""}`}
            className={attachments.length === 0 ? "last:border-b-0" : ""}
          >
            {attachments.length === 0 ? (
              <p className="text-sm text-gray-400">No attachments included.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  >
                    {att.type === "image/png" || att.fileType === "image/png" ? (
                      <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    ) : att.type === "folder" ? (
                      <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {att.name || att.fileName || "Attachment"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {att.type || att.fileType || "file"}
                        {att.size || att.fileSize ? ` · ${att.size || att.fileSize}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>

        {/* ================================================================ */}
        {/* Footer — Actions                                                  */}
        {/* ================================================================ */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
          {convId ? (
            <Link
              to={`/messenger/${convId}`}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Client
            </Link>
          ) : (
            <Link
              to="/messenger"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Client
            </Link>
          )}

          <Link
            to="/expert/proposals"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Proposals
          </Link>
        </div>
      </div>
    </div>
  );
}
