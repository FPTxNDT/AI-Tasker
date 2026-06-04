// MOCK DB ONLY - delete this file/folder when real backend is connected

export { users, expertReviews } from "./users.js";
export { aiCategories } from "./categories.js";
export { projects } from "./projects.js";
export { proposals } from "./proposals.js";
export { timelines } from "./timeline.js";
export { wallets, transactions } from "./wallet.js";
export { notifications } from "./notifications.js";
export { conversations, messages } from "./messages.js";
export { disputes, adminStats, revenueSummary, activityLogs } from "./admin.js";
export { submissions, attachments } from "./submissions.js";

export {
  getMockUsers,
  getMockUserById,
  getMockUserByEmail,
  getMockCurrentUser,
  getMockAiCategories,
  getMockAiCategoryById,
  getMockProjects,
  getMockProjectsByClient,
  getMockOpenJobs,
  getMockProjectById,
  getMockProposals,
  getMockProposalsByProject,
  getMockProposalsByExpert,
  getMockTimelineByProject,
  getMockTasksByProject,
  getMockTaskById,
  getMockNotificationsByUser,
  getMockUnreadNotificationsByUser,
  getMockWalletByUser,
  getMockTransactionsByUser,
  getNormalizedWallet,
  getMockMessagesBetweenUsers,
  getMockConversationsByUser,
  getMockReviewsByExpert,
  getMockActivityLogsByProject,
  getMockAdminStats,
  getMockDisputes,
  getMockRevenueSummary,
  getMockSubmissions,
  getMockSubmissionById,
  getMockSubmissionsByTask,
  getMockSubmissionsByProject,
  getMockAttachmentsBySubmission,
  getMockAttachmentsByTask,
  getMockAttachmentsByProject,
  validateMockDbRelationships,
} from "./mockDbService.js";
