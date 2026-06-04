// MOCK DB ONLY - delete this file/folder when real backend is connected

// Each timeline belongs to an in_progress or completed project
// Tasks belong to timelines, miniTasks belong to tasks

const makeTasks = (projectId, expertId, clientId, baseId, count) =>
  Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    const statuses = ["completed", "completed", "pending_review", "in_progress", "pending", "completed", "needs_revision", "pending_review"];
    const status = statuses[(num - 1) % statuses.length];
    return {
      id: `${baseId}-task-${String(num).padStart(2, "0")}`,
      timelineId: `${baseId}`,
      projectId,
      title: [
        "Requirements Analysis & Planning",
        "Data Collection & Preparation",
        "Model Architecture Design",
        "Initial Model Training",
        "Model Evaluation & Validation",
        "API Integration & Deployment",
        "Performance Optimization",
        "Documentation & Handoff",
      ][num - 1] || `Task Phase ${num}`,
      description: `Complete phase ${num} of the project with all deliverables and quality checks.`,
      status,
      assignedTo: expertId,
      createdAt: `2026-0${Math.ceil(num / 3)}-${String(10 + num * 3).padStart(2, "0")}T00:00:00Z`,
      dueDate: `2026-0${Math.ceil((num + 1) / 3)}-${String(15 + num * 2).padStart(2, "0")}T00:00:00Z`,
      completedAt: status === "completed" ? `2026-0${Math.ceil(num / 3)}-${String(20 + num).padStart(2, "0")}T00:00:00Z` : null,
      expertNotes: status !== "pending" ? `Completed phase ${num} work. All tests passing. Ready for review.` : null,
      clientFeedback: status === "needs_revision" ? "Please update the error handling for edge cases." : status === "pending_review" ? null : "Looks great, approved!",
      attachments: [],
    };
  });

const makeMiniTasks = (taskId, projectId, count, startNum) =>
  Array.from({ length: count }, (_, i) => {
    const num = startNum + i;
    const statuses = ["done", "done", "done", "in_progress", "pending"];
    const status = statuses[num % statuses.length];
    return {
      id: `${taskId}-mini-${String(num + 1).padStart(2, "0")}`,
      taskId,
      projectId,
      title: [
        "Set up development environment",
        "Write unit tests",
        "Create data preprocessing script",
        "Configure CI/CD pipeline",
        "Implement API endpoints",
        "Add logging and monitoring",
        "Write integration tests",
        "Create Docker container",
        "Run performance benchmarks",
        "Add error handling",
        "Create data validation",
        "Set up model monitoring",
        "Write API documentation",
        "Configure auto-scaling",
        "Implement caching layer",
      ][num % 15] || `Sub-task ${num + 1}`,
      status,
      note: null,
      completedAt: status === "done" ? `2026-0${Math.ceil((startNum + i) / 10)}-${String(15 + i).padStart(2, "0")}T00:00:00Z` : null,
    };
  });

export const timelines = [
  // proj-002: in_progress, expert-001, 7 tasks
  {
    id: "timeline-proj-002", projectId: "proj-002", clientId: "client-001", expertId: "expert-001",
    createdAt: "2026-03-20T08:00:00Z", updatedAt: "2026-05-28T10:00:00Z",
    tasks: makeTasks("proj-002", "expert-001", "client-001", "timeline-proj-002", 7),
  },
  // proj-003: completed, expert-001, 5 tasks
  {
    id: "timeline-proj-003", projectId: "proj-003", clientId: "client-001", expertId: "expert-001",
    createdAt: "2026-01-15T09:00:00Z", updatedAt: "2026-03-20T12:00:00Z",
    tasks: makeTasks("proj-003", "expert-001", "client-001", "timeline-proj-003", 5),
  },
  // proj-005: in_progress, expert-002, 6 tasks
  {
    id: "timeline-proj-005", projectId: "proj-005", clientId: "client-001", expertId: "expert-002",
    createdAt: "2026-04-07T10:00:00Z", updatedAt: "2026-05-30T08:00:00Z",
    tasks: makeTasks("proj-005", "expert-002", "client-001", "timeline-proj-005", 6),
  },
  // proj-006: completed, expert-002, 5 tasks
  {
    id: "timeline-proj-006", projectId: "proj-006", clientId: "client-001", expertId: "expert-002",
    createdAt: "2026-02-08T11:00:00Z", updatedAt: "2026-04-28T09:00:00Z",
    tasks: makeTasks("proj-006", "expert-002", "client-001", "timeline-proj-006", 5),
  },
  // proj-008: in_progress, expert-001, 6 tasks
  {
    id: "timeline-proj-008", projectId: "proj-008", clientId: "client-001", expertId: "expert-001",
    createdAt: "2026-04-25T08:00:00Z", updatedAt: "2026-05-29T14:00:00Z",
    tasks: makeTasks("proj-008", "expert-001", "client-001", "timeline-proj-008", 6),
  },
  // proj-012: in_progress, expert-002, 7 tasks
  {
    id: "timeline-proj-012", projectId: "proj-012", clientId: "client-002", expertId: "expert-002",
    createdAt: "2026-04-08T09:00:00Z", updatedAt: "2026-05-30T11:00:00Z",
    tasks: makeTasks("proj-012", "expert-002", "client-002", "timeline-proj-012", 7),
  },
  // proj-013: completed, expert-001, 6 tasks
  {
    id: "timeline-proj-013", projectId: "proj-013", clientId: "client-002", expertId: "expert-001",
    createdAt: "2025-12-08T10:00:00Z", updatedAt: "2026-01-28T15:00:00Z",
    tasks: makeTasks("proj-013", "expert-001", "client-002", "timeline-proj-013", 6),
  },
  // proj-014: in_progress, expert-001, 6 tasks
  {
    id: "timeline-proj-014", projectId: "proj-014", clientId: "client-002", expertId: "expert-001",
    createdAt: "2026-04-20T08:00:00Z", updatedAt: "2026-05-28T12:00:00Z",
    tasks: makeTasks("proj-014", "expert-001", "client-002", "timeline-proj-014", 6),
  },
  // proj-016: completed, expert-002, 6 tasks
  {
    id: "timeline-proj-016", projectId: "proj-016", clientId: "client-002", expertId: "expert-002",
    createdAt: "2026-01-22T11:00:00Z", updatedAt: "2026-04-28T10:00:00Z",
    tasks: makeTasks("proj-016", "expert-002", "client-002", "timeline-proj-016", 6),
  },
  // proj-017: in_progress, expert-002, 6 tasks
  {
    id: "timeline-proj-017", projectId: "proj-017", clientId: "client-002", expertId: "expert-002",
    createdAt: "2026-05-05T09:00:00Z", updatedAt: "2026-05-31T08:00:00Z",
    tasks: makeTasks("proj-017", "expert-002", "client-002", "timeline-proj-017", 6),
  },
  // proj-020: completed, expert-001, 6 tasks
  {
    id: "timeline-proj-020", projectId: "proj-020", clientId: "client-002", expertId: "expert-001",
    createdAt: "2025-11-07T08:00:00Z", updatedAt: "2026-02-01T14:00:00Z",
    tasks: makeTasks("proj-020", "expert-001", "client-002", "timeline-proj-020", 6),
  },
];

// Populate miniTasks on each task (2-5 per task)
timelines.forEach((tl) => {
  let miniCounter = 0;
  tl.tasks.forEach((task) => {
    const count = 2 + (miniCounter % 4); // 2-5 miniTasks
    task.miniTasks = makeMiniTasks(task.id, task.projectId, count, miniCounter);
    miniCounter += count;
  });
});

// ---------------------------------------------------------------------------
// Post-process: ensure task status is consistent with mini-task completion.
// The raw status from makeTasks() is only a hint — this step corrects it so
// the mock DB never contains impossible states like "completed" with 2/4
// mini tasks still pending.
// ---------------------------------------------------------------------------
timelines.forEach((tl) => {
  tl.tasks.forEach((task) => {
    const miniTasks = task.miniTasks || [];
    const totalMini = miniTasks.length;
    const doneMini = miniTasks.filter((mt) => mt.status === "done").length;

    if (totalMini === 0) return; // no mini tasks = nothing to correct

    const allDone = doneMini >= totalMini;

    if (!allDone) {
      // Not all mini tasks done → must be in_progress (cannot be completed / pending_review)
      task.status = "in_progress";
      task.completedAt = null;
    } else if (allDone && task.status === "pending_review") {
      // All mini tasks done + already submitted → keep pending_review
      // completedAt stays null until client approves
      task.completedAt = null;
    } else if (allDone && task.status === "needs_revision") {
      // All done but client wants changes → keep needs_revision
      task.completedAt = null;
    } else if (allDone && task.status === "completed") {
      // All done + approved → keep completed, completedAt is already set
    } else if (allDone) {
      // All mini tasks done but status was in_progress/pending
      // For completed projects these are fully done; for in_progress ones they
      // become pending_review (ready for client to review)
      const project = tl.projectId; // reference for context
      task.status = "pending_review";
      task.completedAt = null;
    }
  });
});
