// MOCK DB ONLY - delete this file/folder when real backend is connected

export const wallets = [
  { id: "wallet-client-001", userId: "client-001", balance: 12500.00, escrowBalance: 28000.00, currency: "USD" },
  { id: "wallet-client-002", userId: "client-002", balance: 18000.00, escrowBalance: 35000.00, currency: "USD" },
  { id: "wallet-expert-001", userId: "expert-001", balance: 42300.00, escrowBalance: 0, currency: "USD" },
  { id: "wallet-expert-002", userId: "expert-002", balance: 35600.00, escrowBalance: 0, currency: "USD" },
  { id: "wallet-admin-001", userId: "admin-001", balance: 0, escrowBalance: 0, currency: "USD" },
];

export const transactions = [
  // Client-001 escrow deposits
  { id: "tx-001", userId: "client-001", projectId: "proj-002", type: "escrow_deposit", amount: 22000, description: "Escrow deposit for Chest X-Ray Classification", status: "completed", createdAt: "2026-03-18T14:00:00Z" },
  { id: "tx-002", userId: "client-001", projectId: "proj-003", type: "escrow_deposit", amount: 18000, description: "Escrow deposit for Patient Readmission Model", status: "completed", createdAt: "2026-01-12T10:00:00Z" },
  { id: "tx-003", userId: "client-001", projectId: "proj-005", type: "escrow_deposit", amount: 20000, description: "Escrow deposit for Clinical Notes NLP Pipeline", status: "completed", createdAt: "2026-04-03T09:00:00Z" },
  { id: "tx-004", userId: "client-001", projectId: "proj-006", type: "escrow_deposit", amount: 25000, description: "Escrow deposit for Medical Image Segmentation", status: "completed", createdAt: "2026-02-03T11:00:00Z" },
  { id: "tx-005", userId: "client-001", projectId: "proj-008", type: "escrow_deposit", amount: 12000, description: "Escrow deposit for Appointment Scheduling Agent", status: "completed", createdAt: "2026-04-22T08:00:00Z" },
  // Client-001 escrow releases
  { id: "tx-006", userId: "expert-001", projectId: "proj-003", type: "escrow_release", amount: 17500, description: "Milestone payment - Readmission Model completed", status: "completed", createdAt: "2026-03-22T15:00:00Z" },
  { id: "tx-007", userId: "expert-002", projectId: "proj-006", type: "escrow_release", amount: 24000, description: "Milestone payment - Image Segmentation completed", status: "completed", createdAt: "2026-04-30T12:00:00Z" },
  { id: "tx-008", userId: "expert-001", projectId: "proj-002", type: "escrow_release", amount: 11000, description: "Partial milestone - Model architecture complete", status: "completed", createdAt: "2026-05-15T10:00:00Z" },
  { id: "tx-009", userId: "expert-002", projectId: "proj-005", type: "escrow_release", amount: 10000, description: "Partial milestone - Data pipeline complete", status: "completed", createdAt: "2026-05-20T09:00:00Z" },
  { id: "tx-010", userId: "expert-001", projectId: "proj-008", type: "escrow_release", amount: 6000, description: "Partial milestone - Agent core built", status: "completed", createdAt: "2026-05-25T14:00:00Z" },

  // Client-002 escrow deposits
  { id: "tx-011", userId: "client-002", projectId: "proj-012", type: "escrow_deposit", amount: 25000, description: "Escrow deposit for KYC Verification Agent", status: "completed", createdAt: "2026-04-03T10:00:00Z" },
  { id: "tx-012", userId: "client-002", projectId: "proj-013", type: "escrow_deposit", amount: 20000, description: "Escrow deposit for RAG Chatbot", status: "completed", createdAt: "2025-12-03T09:00:00Z" },
  { id: "tx-013", userId: "client-002", projectId: "proj-014", type: "escrow_deposit", amount: 18000, description: "Escrow deposit for Check Fraud Detection", status: "completed", createdAt: "2026-04-17T08:00:00Z" },
  { id: "tx-014", userId: "client-002", projectId: "proj-016", type: "escrow_deposit", amount: 35000, description: "Escrow deposit for Trading Signal Agent", status: "completed", createdAt: "2026-01-17T11:00:00Z" },
  { id: "tx-015", userId: "client-002", projectId: "proj-017", type: "escrow_deposit", amount: 15000, description: "Escrow deposit for Financial Doc Q&A", status: "completed", createdAt: "2026-05-02T09:00:00Z" },
  { id: "tx-016", userId: "client-002", projectId: "proj-020", type: "escrow_deposit", amount: 28000, description: "Escrow deposit for Backtesting Platform", status: "completed", createdAt: "2025-11-03T10:00:00Z" },
  // Client-002 escrow releases
  { id: "tx-017", userId: "expert-001", projectId: "proj-013", type: "escrow_release", amount: 19000, description: "Milestone payment - RAG Chatbot completed", status: "completed", createdAt: "2026-02-01T14:00:00Z" },
  { id: "tx-018", userId: "expert-002", projectId: "proj-016", type: "escrow_release", amount: 33000, description: "Milestone payment - Trading Signal Agent completed", status: "completed", createdAt: "2026-05-01T12:00:00Z" },
  { id: "tx-019", userId: "expert-001", projectId: "proj-020", type: "escrow_release", amount: 27000, description: "Milestone payment - Backtesting Platform completed", status: "completed", createdAt: "2026-02-03T11:00:00Z" },
  { id: "tx-020", userId: "expert-002", projectId: "proj-012", type: "escrow_release", amount: 12000, description: "Partial milestone - OCR pipeline complete", status: "completed", createdAt: "2026-05-18T15:00:00Z" },
  { id: "tx-021", userId: "expert-001", projectId: "proj-014", type: "escrow_release", amount: 9000, description: "Partial milestone - Model training done", status: "completed", createdAt: "2026-05-22T10:00:00Z" },
  { id: "tx-022", userId: "expert-002", projectId: "proj-017", type: "escrow_release", amount: 7500, description: "Partial milestone - RAG pipeline built", status: "completed", createdAt: "2026-05-28T13:00:00Z" },

  // Escrow refunds (cancelled projects)
  { id: "tx-023", userId: "client-001", projectId: "proj-009", type: "escrow_refund", amount: 5000, description: "Refund for cancelled Symptom Checker project", status: "completed", createdAt: "2026-04-01T10:00:00Z" },
  { id: "tx-024", userId: "client-002", projectId: "proj-018", type: "escrow_refund", amount: 6000, description: "Refund for cancelled Receipt Scanner project", status: "completed", createdAt: "2026-03-15T09:00:00Z" },

  // Expert withdrawals
  { id: "tx-025", userId: "expert-001", type: "withdrawal", amount: 15000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-03-01T08:00:00Z" },
  { id: "tx-026", userId: "expert-001", type: "withdrawal", amount: 10000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-04-15T09:00:00Z" },
  { id: "tx-027", userId: "expert-001", type: "withdrawal", amount: 8000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-05-20T10:00:00Z" },
  { id: "tx-028", userId: "expert-002", type: "withdrawal", amount: 12000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-03-10T11:00:00Z" },
  { id: "tx-029", userId: "expert-002", type: "withdrawal", amount: 9000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-04-20T08:00:00Z" },
  { id: "tx-030", userId: "expert-002", type: "withdrawal", amount: 7000, description: "Withdrawal to bank account", status: "completed", createdAt: "2026-05-25T14:00:00Z" },

  // Platform fees
  { id: "tx-031", userId: "admin-001", projectId: "proj-003", type: "platform_fee", amount: 500, description: "Platform fee - Readmission Model", status: "completed", createdAt: "2026-03-22T15:05:00Z" },
  { id: "tx-032", userId: "admin-001", projectId: "proj-006", type: "platform_fee", amount: 1000, description: "Platform fee - Image Segmentation", status: "completed", createdAt: "2026-04-30T12:05:00Z" },
  { id: "tx-033", userId: "admin-001", projectId: "proj-013", type: "platform_fee", amount: 1000, description: "Platform fee - RAG Chatbot", status: "completed", createdAt: "2026-02-01T14:05:00Z" },
  { id: "tx-034", userId: "admin-001", projectId: "proj-016", type: "platform_fee", amount: 2000, description: "Platform fee - Trading Signal Agent", status: "completed", createdAt: "2026-05-01T12:05:00Z" },
  { id: "tx-035", userId: "admin-001", projectId: "proj-020", type: "platform_fee", amount: 1000, description: "Platform fee - Backtesting Platform", status: "completed", createdAt: "2026-02-03T11:05:00Z" },

  // Client-001 deposits to wallet
  { id: "tx-036", userId: "client-001", type: "deposit", amount: 30000, description: "Fund wallet for upcoming projects", status: "completed", createdAt: "2026-03-01T08:00:00Z" },
  { id: "tx-037", userId: "client-001", type: "deposit", amount: 20000, description: "Fund wallet for upcoming projects", status: "completed", createdAt: "2026-04-01T09:00:00Z" },
  // Client-002 deposits to wallet
  { id: "tx-038", userId: "client-002", type: "deposit", amount: 40000, description: "Fund wallet for upcoming projects", status: "completed", createdAt: "2026-01-01T10:00:00Z" },
  { id: "tx-039", userId: "client-002", type: "deposit", amount: 25000, description: "Fund wallet for upcoming projects", status: "completed", createdAt: "2026-03-01T08:00:00Z" },
  { id: "tx-040", userId: "client-002", type: "deposit", amount: 20000, description: "Fund wallet for upcoming projects", status: "completed", createdAt: "2026-05-01T11:00:00Z" },

  // More escrow releases for client-001
  { id: "tx-041", userId: "expert-001", projectId: "proj-002", type: "escrow_release", amount: 10000, description: "Final milestone - Chest X-Ray model delivered", status: "completed", createdAt: "2026-05-30T10:00:00Z" },
  { id: "tx-042", userId: "expert-001", projectId: "proj-008", type: "escrow_release", amount: 6000, description: "Final milestone - Scheduling agent deployed", status: "pending", createdAt: "2026-06-01T08:00:00Z" },
  { id: "tx-043", userId: "expert-002", projectId: "proj-005", type: "escrow_release", amount: 9500, description: "Final milestone - NLP pipeline production-ready", status: "pending", createdAt: "2026-06-01T09:00:00Z" },

  // More escrow releases for client-002
  { id: "tx-044", userId: "expert-002", projectId: "proj-012", type: "escrow_release", amount: 12000, description: "Final milestone - KYC agent delivered", status: "pending", createdAt: "2026-06-01T10:00:00Z" },
  { id: "tx-045", userId: "expert-001", projectId: "proj-014", type: "escrow_release", amount: 9000, description: "Final milestone - Check fraud system live", status: "pending", createdAt: "2026-06-01T11:00:00Z" },
  { id: "tx-046", userId: "expert-002", projectId: "proj-017", type: "escrow_release", amount: 7500, description: "Final milestone - Financial Q&A bot deployed", status: "pending", createdAt: "2026-06-01T12:00:00Z" },

  // Additional platform fees
  { id: "tx-047", userId: "admin-001", projectId: "proj-002", type: "platform_fee", amount: 1000, description: "Platform fee - Chest X-Ray Model", status: "pending", createdAt: "2026-05-30T10:05:00Z" },
  { id: "tx-048", userId: "admin-001", projectId: "proj-008", type: "platform_fee", amount: 0, description: "Platform fee - Scheduling Agent", status: "pending", createdAt: "2026-06-01T08:05:00Z" },
  { id: "tx-049", userId: "admin-001", projectId: "proj-014", type: "platform_fee", amount: 0, description: "Platform fee - Check Fraud Detection", status: "pending", createdAt: "2026-06-01T11:05:00Z" },
  { id: "tx-050", userId: "client-002", type: "deposit", amount: 15000, description: "Additional funds for AML project bidding", status: "completed", createdAt: "2026-05-28T14:00:00Z" },
];

// ---------------------------------------------------------------------------
// Wallet normalization — compute wallet state from transaction history
// ---------------------------------------------------------------------------

/**
 * Compute a normalized wallet for a user by summing relevant transactions.
 * Falls back to the static wallet values if no transactions are found.
 *
 * Client wallet shape: { balance, escrowBalance }
 * Expert wallet shape: { balance, pendingBalance, totalEarned }
 */
export function getNormalizedWallet(userId) {
  const userTxs = transactions.filter((t) => t.userId === userId);
  if (userTxs.length === 0) return null;

  // Determine role: if user receives escrow_release, they're an expert
  const isExpert = userTxs.some((t) => t.type === "escrow_release");

  if (isExpert) {
    const completedReleases = userTxs
      .filter((t) => t.type === "escrow_release" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingReleases = userTxs
      .filter((t) => t.type === "escrow_release" && t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = userTxs
      .filter((t) => t.type === "withdrawal" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: completedReleases - withdrawals,
      pendingBalance: pendingReleases,
      totalEarned: completedReleases,
    };
  }

  // Client wallet
  const deposits = userTxs
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const escrowDeposits = userTxs
    .filter((t) => t.type === "escrow_deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const refunds = userTxs
    .filter((t) => t.type === "escrow_refund" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  // Releases from the client's escrow (to experts) — these reduce escrow
  const allReleases = userTxs
    .filter((t) => t.type === "escrow_release")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    balance: Math.max(0, deposits - escrowDeposits + refunds),
    escrowBalance: Math.max(0, escrowDeposits - allReleases - refunds),
  };
}
