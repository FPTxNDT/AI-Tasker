// =============================================================================
// Proposal Store — in-memory session store for proposals submitted during
// the current session. Merges with mock-db proposals so newly submitted
// proposals appear in "My Proposals" and "Proposal Details" views.
//
// Also provides accept/decline mutation helpers that directly update the
// mock DB arrays so Client and Expert views stay synchronized.
// =============================================================================

import { proposals, projects } from "../../mock-db/index.js";

const _sessionProposals = [];

/** Add a proposal submitted during this session. */
export function addSessionProposal(proposal) {
  const record = {
    id: `session-prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...proposal,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  _sessionProposals.push(record);
  return record;
}

/** Return all proposals submitted during this session for the given expert. */
export function getSessionProposalsByExpert(expertId) {
  return _sessionProposals.filter((p) => p.expertId === expertId);
}

/** Return a single session proposal by ID, or null. */
export function getSessionProposalById(proposalId) {
  return _sessionProposals.find((p) => p.id === proposalId) || null;
}

// =============================================================================
// Accept / Decline mutations (mutate mock DB arrays so both sides stay in sync)
// =============================================================================

/**
 * Accept a proposal.
 * - Sets the proposal status to "accepted"
 * - Declines all other pending proposals for the same project
 * - Updates the project: assignedExpertId + status → "in_progress"
 *
 * @param {string} proposalId
 * @returns {{ success: boolean, error?: string }}
 */
export function acceptProposal(proposalId) {
  const proposal = proposals.find((p) => p.id === proposalId);
  if (!proposal) return { success: false, error: "Proposal not found." };

  // Update proposal status
  proposal.status = "accepted";

  // Decline all other pending proposals for this project
  proposals.forEach((p) => {
    if (p.projectId === proposal.projectId && p.id !== proposalId && p.status === "pending") {
      p.status = "declined";
    }
  });

  // Update project
  const project = projects.find((p) => p.id === proposal.projectId);
  if (project) {
    project.assignedExpertId = proposal.expertId;
    project.status = "in_progress";
  }

  return { success: true };
}

/**
 * Decline a proposal.
 * - Sets only that proposal's status to "declined"
 * - The project remains unchanged.
 *
 * @param {string} proposalId
 * @returns {{ success: boolean, error?: string }}
 */
export function declineProposal(proposalId) {
  const proposal = proposals.find((p) => p.id === proposalId);
  if (!proposal) return { success: false, error: "Proposal not found." };

  proposal.status = "declined";
  return { success: true };
}

/**
 * Get a deterministic match percentage for display purposes.
 * Uses a hash of the proposal ID so it stays stable across renders.
 */
export function getMatchPercentage(proposalId) {
  let hash = 0;
  for (let i = 0; i < proposalId.length; i++) {
    hash = (hash * 31 + proposalId.charCodeAt(i)) & 0x7fffffff;
  }
  // Return a value between 82 and 99
  return 82 + (hash % 18);
}
