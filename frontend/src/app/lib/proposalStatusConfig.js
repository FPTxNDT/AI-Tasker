// =============================================================================
// Proposal Status Configuration — single source of truth for proposal statuses.
//
// Import from this file instead of defining local STATUS_CONFIG objects.
// =============================================================================

import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export const PROPOSAL_STATUS = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700",
    icon: Clock,
    meaning: "Proposal has been submitted and is waiting for the client's decision.",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle,
    meaning: "The client accepted this proposal. The expert is now assigned to the project.",
  },
  declined: {
    label: "Declined",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
    meaning: "The client declined this proposal.",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-600",
    icon: XCircle,
    meaning: "The expert withdrew this proposal before a decision was made.",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-700",
    icon: AlertCircle,
    meaning: "The client is actively reviewing this proposal.",
  },
};

/** Get the full config object for a proposal status key, with fallback. */
export function getProposalStatusConfig(status) {
  return PROPOSAL_STATUS[status] || PROPOSAL_STATUS.pending;
}

/** Get the display label for a proposal status key. */
export function getProposalStatusLabel(status) {
  return PROPOSAL_STATUS[status]?.label || PROPOSAL_STATUS.pending.label;
}

/** Get the badge CSS class for a proposal status key. */
export function getProposalStatusClass(status) {
  return PROPOSAL_STATUS[status]?.className || PROPOSAL_STATUS.pending.className;
}
