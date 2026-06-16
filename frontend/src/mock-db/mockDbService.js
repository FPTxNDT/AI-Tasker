// MOCK DB ONLY - delete this file/folder when real backend is connected

import { users, expertReviews } from "./users.js";
import { aiCategories } from "./categories.js";
import { projects } from "./projects.js";
import { proposals } from "./proposals.js";
import { timelines } from "./timeline.js";
import { wallets, transactions, getNormalizedWallet } from "./wallet.js";
import { notifications } from "./notifications.js";
import { conversations, messages } from "./messages.js";
import { disputes, adminStats, revenueSummary, activityLogs } from "./admin.js";
import { submissions, attachments } from "./submissions.js";

// =============================================================================
// Users
// =============================================================================
export function getMockUsers() { return users; }
export function getMockUserById(userId) { return users.find((u) => u.id === userId) || null; }
export function getMockUserByEmail(email) { return users.find((u) => u.email === email) || null; }
export function getMockCurrentUser(role) { return users.find((u) => u.role === role) || users.find((u) => u.role === "client"); }

// =============================================================================
// Categories
// =============================================================================
export function getMockAiCategories() { return aiCategories; }
export function getMockAiCategoryById(categoryId) { return aiCategories.find((c) => c.id === categoryId) || null; }

// =============================================================================
// Projects
// =============================================================================
export function getMockProjects() { return projects; }
export function getMockProjectsByClient(clientId) { return projects.filter((p) => p.clientId === clientId); }
export function getMockOpenJobs() { return projects.filter((p) => p.status === "open"); }
export function getMockProjectById(projectId) { return projects.find((p) => p.id === projectId) || null; }

// =============================================================================
// Proposals
// =============================================================================
export function getMockProposals() { return proposals; }
export function getMockProposalsByProject(projectId) { return proposals.filter((p) => p.projectId === projectId); }
export function getMockProposalsByExpert(expertId) { return proposals.filter((p) => p.expertId === expertId); }

// =============================================================================
// Timeline / Tasks
// =============================================================================
export function getMockTimelineByProject(projectId) { return timelines.find((t) => t.projectId === projectId) || null; }
export function getMockTasksByProject(projectId) {
  const timeline = timelines.find((t) => t.projectId === projectId);
  return timeline ? timeline.tasks : [];
}
export function getMockTaskById(taskId) {
  for (const tl of timelines) {
    const task = tl.tasks.find((t) => t.id === taskId);
    if (task) return { task, timeline: tl };
  }
  return null;
}

// =============================================================================
// Notifications
// =============================================================================
export function getMockNotificationsByUser(userId) { return notifications.filter((n) => n.userId === userId); }
export function getMockUnreadNotificationsByUser(userId) {
  return notifications.filter((n) => n.userId === userId && !n.isRead);
}

// =============================================================================
// Wallet & Transactions
// =============================================================================
export function getMockWalletByUser(userId) { return wallets.find((w) => w.userId === userId) || null; }
export function getMockTransactionsByUser(userId) { return transactions.filter((t) => t.userId === userId); }
export { getNormalizedWallet } from "./wallet.js";

// =============================================================================
// Messages
// =============================================================================
export function getMockConversationsByUser(userId) {
  return conversations.filter((c) => c.participants.includes(userId));
}
export function getMockMessagesBetweenUsers(userAId, userBId) {
  const conv = conversations.find(
    (c) => c.participants.includes(userAId) && c.participants.includes(userBId),
  );
  return conv ? messages.filter((m) => m.conversationId === conv.id) : [];
}

// =============================================================================
// Reviews
// =============================================================================
export function getMockReviewsByExpert(expertId) { return expertReviews.filter((r) => r.expertId === expertId); }

// =============================================================================
// Submissions & Attachments
// =============================================================================
export function getMockSubmissions() { return submissions; }
export function getMockSubmissionById(submissionId) { return submissions.find((s) => s.id === submissionId) || null; }
export function getMockSubmissionsByTask(taskId) { return submissions.filter((s) => s.taskId === taskId); }
export function getMockSubmissionsByProject(projectId) { return submissions.filter((s) => s.projectId === projectId); }
export function getMockAttachmentsBySubmission(submissionId) { return attachments.filter((a) => a.submissionId === submissionId); }
export function getMockAttachmentsByTask(taskId) { return attachments.filter((a) => a.taskId === taskId); }
export function getMockAttachmentsByProject(projectId) { return attachments.filter((a) => a.projectId === projectId); }

// =============================================================================
// Admin
// =============================================================================
export function getMockAdminStats() { return adminStats; }
export function getMockDisputes() { return disputes; }
export function getMockRevenueSummary() { return revenueSummary; }
export function getMockActivityLogsByProject(projectId) {
  return activityLogs.filter((log) => log.projectId === projectId);
}

// =============================================================================
// Validation
// =============================================================================
export function validateMockDbRelationships() {
  const errors = [];
  const userIds = new Set(users.map((u) => u.id));
  const projectIds = new Set(projects.map((p) => p.id));
  const categoryIds = new Set(aiCategories.map((c) => c.id));
  const timelineProjectIds = new Set(timelines.map((t) => t.projectId));
  const proposalIds = new Set(proposals.map((p) => p.id));
  const taskIds = new Set();
  const miniTaskIds = new Set();

  timelines.forEach((tl) => {
    tl.tasks.forEach((task) => {
      taskIds.add(task.id);
      if (task.miniTasks) {
        task.miniTasks.forEach((mt) => miniTaskIds.add(mt.id));
      }
    });
  });

  // Projects
  projects.forEach((p) => {
    if (!userIds.has(p.clientId)) errors.push(`Project ${p.id}: invalid clientId "${p.clientId}"`);
    if (p.assignedExpertId && !userIds.has(p.assignedExpertId))
      errors.push(`Project ${p.id}: invalid assignedExpertId "${p.assignedExpertId}"`);
    if (!categoryIds.has(p.category))
      errors.push(`Project ${p.id}: invalid category "${p.category}"`);
  });

  // Proposals
  proposals.forEach((p) => {
    if (!projectIds.has(p.projectId)) errors.push(`Proposal ${p.id}: invalid projectId "${p.projectId}"`);
    if (!userIds.has(p.expertId)) errors.push(`Proposal ${p.id}: invalid expertId "${p.expertId}"`);
    if (p.status === "accepted") {
      const project = projects.find((pr) => pr.id === p.projectId);
      if (project && project.assignedExpertId !== p.expertId)
        errors.push(`Proposal ${p.id}: accepted but project ${p.projectId} assignedExpertId is "${project.assignedExpertId}", not "${p.expertId}"`);
    }
  });

  // Timelines
  timelines.forEach((tl) => {
    if (!projectIds.has(tl.projectId)) errors.push(`Timeline ${tl.id}: invalid projectId "${tl.projectId}"`);
    if (!userIds.has(tl.clientId)) errors.push(`Timeline ${tl.id}: invalid clientId "${tl.clientId}"`);
    if (!userIds.has(tl.expertId)) errors.push(`Timeline ${tl.id}: invalid expertId "${tl.expertId}"`);
  });

  // Tasks & miniTasks
  timelines.forEach((tl) => {
    tl.tasks.forEach((task) => {
      if (!projectIds.has(task.projectId)) errors.push(`Task ${task.id}: invalid projectId "${task.projectId}"`);
      if (!userIds.has(task.assignedTo)) errors.push(`Task ${task.id}: invalid assignedTo "${task.assignedTo}"`);
      if (task.miniTasks) {
        task.miniTasks.forEach((mt) => {
          if (!taskIds.has(mt.taskId)) errors.push(`MiniTask ${mt.id}: invalid taskId "${mt.taskId}"`);
          if (!projectIds.has(mt.projectId)) errors.push(`MiniTask ${mt.id}: invalid projectId "${mt.projectId}"`);
        });
      }
    });
  });

  // Transactions
  transactions.forEach((tx) => {
    if (!userIds.has(tx.userId)) errors.push(`Transaction ${tx.id}: invalid userId "${tx.userId}"`);
    if (tx.projectId && !projectIds.has(tx.projectId))
      errors.push(`Transaction ${tx.id}: invalid projectId "${tx.projectId}"`);
  });

  // Notifications
  notifications.forEach((n) => {
    if (!userIds.has(n.userId)) errors.push(`Notification ${n.id}: invalid userId "${n.userId}"`);
  });

  // Messages
  messages.forEach((m) => {
    if (!userIds.has(m.senderId)) errors.push(`Message ${m.id}: invalid senderId "${m.senderId}"`);
    if (!userIds.has(m.receiverId)) errors.push(`Message ${m.id}: invalid receiverId "${m.receiverId}"`);
    const conv = conversations.find((c) => c.id === m.conversationId);
    if (!conv) errors.push(`Message ${m.id}: invalid conversationId "${m.conversationId}"`);
  });
  conversations.forEach((c) => {
    c.participants.forEach((pid) => {
      if (!userIds.has(pid)) errors.push(`Conversation ${c.id}: invalid participant "${pid}"`);
    });
  });

  // Disputes
  disputes.forEach((d) => {
    if (!projectIds.has(d.projectId)) errors.push(`Dispute ${d.id}: invalid projectId "${d.projectId}"`);
    if (!userIds.has(d.clientId)) errors.push(`Dispute ${d.id}: invalid clientId "${d.clientId}"`);
    if (!userIds.has(d.expertId)) errors.push(`Dispute ${d.id}: invalid expertId "${d.expertId}"`);
    if (!userIds.has(d.raisedById)) errors.push(`Dispute ${d.id}: invalid raisedById "${d.raisedById}"`);
    if (d.resolvedById && !userIds.has(d.resolvedById))
      errors.push(`Dispute ${d.id}: invalid resolvedById "${d.resolvedById}"`);
  });

  // Reviews
  expertReviews.forEach((r) => {
    if (!userIds.has(r.clientId)) errors.push(`Review ${r.id}: invalid clientId "${r.clientId}"`);
    if (!userIds.has(r.expertId)) errors.push(`Review ${r.id}: invalid expertId "${r.expertId}"`);
    if (!projectIds.has(r.projectId)) errors.push(`Review ${r.id}: invalid projectId "${r.projectId}"`);
    const project = projects.find((p) => p.id === r.projectId);
    if (project && project.status !== "completed")
      errors.push(`Review ${r.id}: project ${r.projectId} is not completed (status: ${project.status})`);
  });

  // Activity logs
  activityLogs.forEach((log) => {
    if (!userIds.has(log.actorId)) errors.push(`ActivityLog ${log.id}: invalid actorId "${log.actorId}"`);
    if (log.projectId && !projectIds.has(log.projectId))
      errors.push(`ActivityLog ${log.id}: invalid projectId "${log.projectId}"`);
  });

  // Count totals
  let totalTasks = 0;
  let totalMiniTasks = 0;
  timelines.forEach((tl) => {
    tl.tasks.forEach((task) => {
      totalTasks++;
      if (task.miniTasks) totalMiniTasks += task.miniTasks.length;
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      users: users.length,
      categories: aiCategories.length,
      projects: projects.length,
      proposals: proposals.length,
      timelines: timelines.length,
      tasks: totalTasks,
      miniTasks: totalMiniTasks,
      transactions: transactions.length,
      notifications: notifications.length,
      conversations: conversations.length,
      messages: messages.length,
      disputes: disputes.length,
      reviews: expertReviews.length,
      activityLogs: activityLogs.length,
    },
  };
}
