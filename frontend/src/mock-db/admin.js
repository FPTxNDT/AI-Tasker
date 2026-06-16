// MOCK DB ONLY - delete this file/folder when real backend is connected

export const disputes = [
  { id: "dsp-001", projectId: "proj-002", clientId: "client-001", expertId: "expert-001", raisedById: "client-001", title: "Deliverable quality concern on Chest X-Ray model", description: "Client claims the initial model accuracy was below agreed threshold. Expert says evaluation was done on a different test split.", status: "under_review", resolution: null, resolvedById: null, createdAt: "2026-05-20T10:00:00Z", updatedAt: "2026-05-28T14:00:00Z" },
  { id: "dsp-002", projectId: "proj-005", clientId: "client-001", expertId: "expert-002", raisedById: "expert-002", title: "Delayed milestone approval", description: "Expert completed the data pipeline milestone 2 weeks ago but client has not reviewed or approved it.", status: "open", resolution: null, resolvedById: null, createdAt: "2026-05-25T08:00:00Z", updatedAt: "2026-05-30T09:00:00Z" },
  { id: "dsp-003", projectId: "proj-012", clientId: "client-002", expertId: "expert-002", raisedById: "client-002", title: "Scope disagreement on KYC features", description: "Client expected liveness detection in initial scope. Expert says it was listed as optional enhancement.", status: "resolved", resolution: "Both parties agreed to add liveness detection as a paid scope extension. Expert will deliver within 2 additional weeks.", resolvedById: "admin-001", createdAt: "2026-05-10T11:00:00Z", updatedAt: "2026-05-20T15:00:00Z" },
  { id: "dsp-004", projectId: "proj-014", clientId: "client-002", expertId: "expert-001", raisedById: "expert-001", title: "Data access delay", description: "Expert cannot access required check image dataset due to client security restrictions not being resolved.", status: "open", resolution: null, resolvedById: null, createdAt: "2026-05-28T09:00:00Z", updatedAt: "2026-05-30T10:00:00Z" },
  { id: "dsp-005", projectId: "proj-006", clientId: "client-001", expertId: "expert-002", raisedById: "client-001", title: "Post-completion support dispute", description: "Client requests 2 weeks of free post-launch support. Expert's contract specified 1 week.", status: "resolved", resolution: "Compromise: expert provides 1 extra week at 50% rate. Admin mediated the agreement.", resolvedById: "admin-001", createdAt: "2026-03-10T08:00:00Z", updatedAt: "2026-03-15T16:00:00Z" },
  { id: "dsp-006", projectId: "proj-013", clientId: "client-002", expertId: "expert-001", raisedById: "client-002", title: "Performance in production below expectations", description: "RAG chatbot response time degraded after 2 weeks in production. Client wants performance fix at no cost.", status: "resolved", resolution: "Expert identified and fixed a vector DB indexing issue. No charge for the fix. Both parties satisfied.", resolvedById: "admin-001", createdAt: "2026-02-10T14:00:00Z", updatedAt: "2026-02-15T12:00:00Z" },
  { id: "dsp-007", projectId: "proj-017", clientId: "client-002", expertId: "expert-002", raisedById: "expert-002", title: "Payment delay for completed milestone", description: "RAG pipeline milestone was approved but escrow release has been pending for 5 business days.", status: "under_review", resolution: null, resolvedById: null, createdAt: "2026-05-29T10:00:00Z", updatedAt: "2026-06-01T08:00:00Z" },
  { id: "dsp-008", projectId: "proj-002", clientId: "client-001", expertId: "expert-001", raisedById: "client-001", title: "Timeline delay compensation", description: "Project is 1 week behind schedule. Client requests compensation for delay-related costs.", status: "open", resolution: null, resolvedById: null, createdAt: "2026-05-30T12:00:00Z", updatedAt: "2026-05-31T09:00:00Z" },
];

export const adminStats = {
  totalUsers: 5,
  activeClients: 2,
  activeExperts: 2,
  totalProjects: 20,
  openProjects: 7,
  inProgressProjects: 6,
  completedProjects: 5,
  cancelledProjects: 2,
  totalProposals: 35,
  acceptedProposals: 12,
  totalTransactions: 50,
  platformRevenue: 5500,
  escrowHeld: 63000,
  disputesOpen: 3,
  disputesResolved: 3,
  disputesUnderReview: 2,
  averageRating: 4.8,
  projectsByCategory: {
    "nlp-chatbots": 5,
    "computer-vision": 5,
    "ml-analytics": 5,
    "ai-automation-agents": 5,
  },
  monthlySignups: [
    { month: "2025-09", count: 1 }, { month: "2025-10", count: 1 }, { month: "2025-11", count: 2 },
    { month: "2025-12", count: 1 }, { month: "2026-01", count: 0 }, { month: "2026-02", count: 0 },
    { month: "2026-03", count: 0 }, { month: "2026-04", count: 0 }, { month: "2026-05", count: 0 },
  ],
};

export const revenueSummary = {
  totalPlatformFees: 5500,
  totalEscrowProcessed: 210500,
  totalWithdrawals: 61000,
  monthlyBreakdown: [
    { month: "2026-01", fees: 0, escrowProcessed: 48000, withdrawals: 0 },
    { month: "2026-02", fees: 2000, escrowProcessed: 46000, withdrawals: 0 },
    { month: "2026-03", fees: 500, escrowProcessed: 17500, withdrawals: 27000 },
    { month: "2026-04", fees: 1000, escrowProcessed: 24000, withdrawals: 19000 },
    { month: "2026-05", fees: 2000, escrowProcessed: 75000, withdrawals: 15000 },
  ],
  byCategory: [
    { category: "nlp-chatbots", projectCount: 5, totalValue: 75000 },
    { category: "computer-vision", projectCount: 5, totalValue: 112000 },
    { category: "ml-analytics", projectCount: 5, totalValue: 124000 },
    { category: "ai-automation-agents", projectCount: 5, totalValue: 135000 },
  ],
};

export const activityLogs = [
  // --- Project creation logs ---
  { id: "log-001", actorId: "client-001", action: "project_created", projectId: "proj-001", description: "Created project 'AI-Powered Medical Chatbot for Patient Triage'", createdAt: "2026-05-01T10:00:00Z" },
  { id: "log-002", actorId: "client-001", action: "project_created", projectId: "proj-002", description: "Created project 'Chest X-Ray Classification Model'", createdAt: "2026-03-15T08:00:00Z" },
  { id: "log-003", actorId: "client-001", action: "project_created", projectId: "proj-003", description: "Created project 'Patient Readmission Risk Prediction'", createdAt: "2026-01-10T12:00:00Z" },
  { id: "log-004", actorId: "client-001", action: "project_created", projectId: "proj-004", description: "Created project 'Automated Insurance Claim Processing Agent'", createdAt: "2026-05-10T09:00:00Z" },
  { id: "log-005", actorId: "client-001", action: "project_created", projectId: "proj-005", description: "Created project 'Clinical Notes NLP Pipeline'", createdAt: "2026-04-01T07:00:00Z" },
  { id: "log-006", actorId: "client-001", action: "project_created", projectId: "proj-006", description: "Created project 'Medical Image Segmentation Tool'", createdAt: "2026-02-01T10:00:00Z" },
  { id: "log-007", actorId: "client-001", action: "project_created", projectId: "proj-007", description: "Created project 'Healthcare Analytics Dashboard'", createdAt: "2026-05-20T11:00:00Z" },
  { id: "log-008", actorId: "client-001", action: "project_created", projectId: "proj-008", description: "Created project 'AI-Powered Appointment Scheduling Agent'", createdAt: "2026-04-20T08:00:00Z" },
  { id: "log-009", actorId: "client-002", action: "project_created", projectId: "proj-011", description: "Created project 'Fraud Detection Model for Credit Card Transactions'", createdAt: "2026-05-05T08:00:00Z" },
  { id: "log-010", actorId: "client-002", action: "project_created", projectId: "proj-012", description: "Created project 'Automated KYC Document Verification Agent'", createdAt: "2026-04-01T10:00:00Z" },
  { id: "log-011", actorId: "client-002", action: "project_created", projectId: "proj-013", description: "Created project 'Customer Support RAG Chatbot'", createdAt: "2025-12-01T09:00:00Z" },
  { id: "log-012", actorId: "client-002", action: "project_created", projectId: "proj-014", description: "Created project 'Check Fraud Detection with Computer Vision'", createdAt: "2026-04-15T08:00:00Z" },
  { id: "log-013", actorId: "client-002", action: "project_created", projectId: "proj-015", description: "Created project 'Credit Risk Scoring Model'", createdAt: "2026-05-15T07:00:00Z" },
  { id: "log-014", actorId: "client-002", action: "project_created", projectId: "proj-016", description: "Created project 'Automated Trading Signal Agent'", createdAt: "2026-01-15T11:00:00Z" },
  { id: "log-015", actorId: "client-002", action: "project_created", projectId: "proj-017", description: "Created project 'Financial Document Q&A Chatbot'", createdAt: "2026-05-01T09:00:00Z" },
  { id: "log-016", actorId: "client-002", action: "project_created", projectId: "proj-020", description: "Created project 'Algorithmic Trading Backtesting Platform'", createdAt: "2025-11-01T10:00:00Z" },

  // --- Proposal logs ---
  { id: "log-017", actorId: "expert-001", action: "proposal_submitted", projectId: "proj-002", description: "Submitted proposal for Chest X-Ray Classification", createdAt: "2026-03-17T10:00:00Z" },
  { id: "log-018", actorId: "expert-001", action: "proposal_submitted", projectId: "proj-003", description: "Submitted proposal for Patient Readmission Risk Prediction", createdAt: "2026-01-12T09:00:00Z" },
  { id: "log-019", actorId: "expert-002", action: "proposal_submitted", projectId: "proj-005", description: "Submitted proposal for Clinical Notes NLP Pipeline", createdAt: "2026-04-03T08:00:00Z" },
  { id: "log-020", actorId: "expert-002", action: "proposal_submitted", projectId: "proj-006", description: "Submitted proposal for Medical Image Segmentation", createdAt: "2026-02-03T10:00:00Z" },
  { id: "log-021", actorId: "expert-001", action: "proposal_submitted", projectId: "proj-013", description: "Submitted proposal for Customer Support RAG Chatbot", createdAt: "2025-12-03T10:00:00Z" },
  { id: "log-022", actorId: "expert-001", action: "proposal_submitted", projectId: "proj-014", description: "Submitted proposal for Check Fraud Detection", createdAt: "2026-04-17T09:00:00Z" },
  { id: "log-023", actorId: "expert-002", action: "proposal_submitted", projectId: "proj-012", description: "Submitted proposal for KYC Verification Agent", createdAt: "2026-04-03T09:00:00Z" },
  { id: "log-024", actorId: "expert-002", action: "proposal_submitted", projectId: "proj-016", description: "Submitted proposal for Trading Signal Agent", createdAt: "2026-01-17T09:00:00Z" },
  { id: "log-025", actorId: "expert-002", action: "proposal_submitted", projectId: "proj-017", description: "Submitted proposal for Financial Document Q&A", createdAt: "2026-05-02T10:00:00Z" },
  { id: "log-026", actorId: "expert-001", action: "proposal_submitted", projectId: "proj-020", description: "Submitted proposal for Backtesting Platform", createdAt: "2025-11-03T09:00:00Z" },

  // --- Proposal acceptance logs ---
  { id: "log-027", actorId: "client-001", action: "proposal_accepted", projectId: "proj-002", description: "Accepted Alex Johnson's proposal for Chest X-Ray Classification", createdAt: "2026-03-19T14:00:00Z" },
  { id: "log-028", actorId: "client-001", action: "proposal_accepted", projectId: "proj-003", description: "Accepted Alex Johnson's proposal for Readmission Risk Prediction", createdAt: "2026-01-14T10:00:00Z" },
  { id: "log-029", actorId: "client-001", action: "proposal_accepted", projectId: "proj-005", description: "Accepted Priya Sharma's proposal for Clinical Notes NLP", createdAt: "2026-04-05T14:00:00Z" },
  { id: "log-030", actorId: "client-001", action: "proposal_accepted", projectId: "proj-006", description: "Accepted Priya Sharma's proposal for Image Segmentation", createdAt: "2026-02-05T11:00:00Z" },
  { id: "log-031", actorId: "client-002", action: "proposal_accepted", projectId: "proj-012", description: "Accepted Priya Sharma's proposal for KYC Verification", createdAt: "2026-04-05T10:00:00Z" },
  { id: "log-032", actorId: "client-002", action: "proposal_accepted", projectId: "proj-013", description: "Accepted Alex Johnson's proposal for RAG Chatbot", createdAt: "2025-12-05T14:00:00Z" },
  { id: "log-033", actorId: "client-002", action: "proposal_accepted", projectId: "proj-014", description: "Accepted Alex Johnson's proposal for Check Fraud Detection", createdAt: "2026-04-19T10:00:00Z" },
  { id: "log-034", actorId: "client-002", action: "proposal_accepted", projectId: "proj-016", description: "Accepted Priya Sharma's proposal for Trading Signal Agent", createdAt: "2026-01-19T14:00:00Z" },
  { id: "log-035", actorId: "client-002", action: "proposal_accepted", projectId: "proj-017", description: "Accepted Priya Sharma's proposal for Financial Document Q&A", createdAt: "2026-05-04T11:00:00Z" },
  { id: "log-036", actorId: "client-002", action: "proposal_accepted", projectId: "proj-020", description: "Accepted Alex Johnson's proposal for Backtesting Platform", createdAt: "2025-11-05T10:00:00Z" },

  // --- Escrow logs ---
  { id: "log-037", actorId: "client-001", action: "escrow_deposited", projectId: "proj-002", description: "Deposited $22,000 in escrow for Chest X-Ray Classification", createdAt: "2026-03-18T14:00:00Z" },
  { id: "log-038", actorId: "client-001", action: "escrow_deposited", projectId: "proj-003", description: "Deposited $18,000 in escrow for Readmission Risk Prediction", createdAt: "2026-01-12T10:00:00Z" },
  { id: "log-039", actorId: "client-002", action: "escrow_deposited", projectId: "proj-012", description: "Deposited $25,000 in escrow for KYC Verification Agent", createdAt: "2026-04-03T10:00:00Z" },
  { id: "log-040", actorId: "client-002", action: "escrow_deposited", projectId: "proj-016", description: "Deposited $35,000 in escrow for Trading Signal Agent", createdAt: "2026-01-17T11:00:00Z" },

  // --- Task logs ---
  { id: "log-041", actorId: "expert-001", action: "task_submitted", projectId: "proj-002", description: "Submitted 'Model Architecture Design' for review", createdAt: "2026-05-15T08:00:00Z" },
  { id: "log-042", actorId: "expert-001", action: "task_submitted", projectId: "proj-003", description: "Submitted 'Initial Model Training' for review", createdAt: "2026-02-10T09:00:00Z" },
  { id: "log-043", actorId: "expert-002", action: "task_submitted", projectId: "proj-005", description: "Submitted 'Data Collection & Preparation' for review", createdAt: "2026-05-10T10:00:00Z" },
  { id: "log-044", actorId: "expert-002", action: "task_submitted", projectId: "proj-012", description: "Submitted 'OCR Pipeline Implementation' for review", createdAt: "2026-05-18T14:00:00Z" },
  { id: "log-045", actorId: "client-001", action: "task_approved", projectId: "proj-003", description: "Approved 'Initial Model Training' for Readmission Model", createdAt: "2026-02-12T14:00:00Z" },
  { id: "log-046", actorId: "client-001", action: "revision_requested", projectId: "proj-008", description: "Requested revisions on 'API Integration' for Scheduling Agent", createdAt: "2026-05-22T10:00:00Z" },

  // --- Payment logs ---
  { id: "log-047", actorId: "admin-001", action: "payment_released", projectId: "proj-003", description: "Released $17,500 escrow to Alex Johnson", createdAt: "2026-03-22T15:00:00Z" },
  { id: "log-048", actorId: "admin-001", action: "payment_released", projectId: "proj-006", description: "Released $24,000 escrow to Priya Sharma", createdAt: "2026-04-30T12:00:00Z" },
  { id: "log-049", actorId: "admin-001", action: "payment_released", projectId: "proj-013", description: "Released $19,000 escrow to Alex Johnson", createdAt: "2026-02-01T14:00:00Z" },
  { id: "log-050", actorId: "admin-001", action: "payment_released", projectId: "proj-016", description: "Released $33,000 escrow to Priya Sharma", createdAt: "2026-05-01T12:00:00Z" },

  // --- Dispute logs ---
  { id: "log-051", actorId: "client-001", action: "dispute_opened", projectId: "proj-002", description: "Opened dispute about deliverable quality", createdAt: "2026-05-20T10:00:00Z" },
  { id: "log-052", actorId: "expert-002", action: "dispute_opened", projectId: "proj-005", description: "Opened dispute about delayed milestone approval", createdAt: "2026-05-25T08:00:00Z" },
  { id: "log-053", actorId: "admin-001", action: "dispute_resolved", projectId: "proj-012", description: "Resolved scope disagreement on KYC Verification", createdAt: "2026-05-20T15:00:00Z" },
  { id: "log-054", actorId: "admin-001", action: "dispute_resolved", projectId: "proj-006", description: "Resolved post-completion support dispute", createdAt: "2026-03-15T16:00:00Z" },
  { id: "log-055", actorId: "admin-001", action: "dispute_resolved", projectId: "proj-013", description: "Resolved production performance issue", createdAt: "2026-02-15T12:00:00Z" },
];
