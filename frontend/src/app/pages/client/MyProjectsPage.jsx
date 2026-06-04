import { Link, useLocation } from "react-router";
import {
  Briefcase,
  PlusCircle,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProjectsByClient,
  getMockUserById,
  getMockProposalsByProject,
  getMockAiCategoryById,
} from "../../../mock-db/mockDbService.js";
import { getProjectProgress, deriveProjectStatusKey, getStatusLabel, getStatusBadgeClass, getClientButtonConfig } from "../../lib/projectTimelineStore.js";
import { DEMO_CLIENT_ID } from "../../lib/demoConfig.js";

// ---------------------------------------------------------------------------
// Status-specific helper: what button label + route for a status key
// ---------------------------------------------------------------------------
function getActionInfo(statusKey, projectId, proposalCount) {
  // Projects that are reviewing proposals → show "Review Proposals" button
  // that goes to the proposal review page (if there are proposals)
  if (statusKey === "reviewing_proposals" && proposalCount > 0) {
    return {
      label: `Review Proposals (${proposalCount})`,
      to: `/client/projects/${projectId}/proposals`,
      variant: "primary", // dark bg
    };
  }
  // Projects that are in_progress, waiting_review, or needs_revision
  // → show "Manage Project" that goes to project detail
  if (
    statusKey === "in_progress" ||
    statusKey === "waiting_review" ||
    statusKey === "needs_revision"
  ) {
    return {
      label: "Manage Project",
      to: `/client/projects/${projectId}`,
      variant: "primary",
    };
  }
  // Completed
  if (statusKey === "completed") {
    return {
      label: "View Summary",
      to: `/client/projects/${projectId}`,
      variant: "outline",
    };
  }
  // Fallback (cancelled, unknown)
  return {
    label: "View Details",
    to: `/client/projects/${projectId}`,
    variant: "outline",
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MyProjectsList() {
  const location = useLocation();

  // TEMP MOCK DB - replace with API call when backend is ready
  const projects = getMockProjectsByClient(DEMO_CLIENT_ID);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
          <p className="text-gray-600 mt-1">Manage your posted projects</p>
        </div>
        <Link
          to="/client/post-project"
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Post New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            No projects yet
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Post your first project to find the right AI expert.
          </p>
          <Link
            to="/client/post-project"
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium"
          >
            Post a Project
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const proposals = getMockProposalsByProject(project.id);
            const proposalCount = proposals.length;
            const statusKey = deriveProjectStatusKey(project, { proposalCount });
            const displayStatus = getStatusLabel(statusKey);
            const badgeClass = getStatusBadgeClass(statusKey);
            const progress = getProjectProgress(project.id);
            const assignedExpert = project.assignedExpertId
              ? getMockUserById(project.assignedExpertId)
              : null;
            const category = getMockAiCategoryById(project.category);
            const action = getActionInfo(statusKey, project.id, proposalCount);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                {/* ── Top row: title + status badge ── */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-snug">
                    {project.title}
                  </h3>
                  <span
                    className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                  >
                    {displayStatus}
                  </span>
                </div>

                {/* ── Description ── */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* ── Meta row: category, posted date ── */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                  {category && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Tag className="w-3.5 h-3.5" />
                      {category.label}
                    </span>
                  )}
                  {project.createdAt && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Posted{" "}
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      <MoneyDisplay amount={project.budget} />
                    </span>
                  </span>
                  {project.durationValue && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.durationValue} {project.durationUnit}
                    </span>
                  )}
                  {proposalCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3" />
                      {proposalCount} proposal{proposalCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* ── Required skills ── */}
                {project.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Progress bar (for in_progress/completed projects) ── */}
                {(statusKey === "in_progress" ||
                  statusKey === "waiting_review" ||
                  statusKey === "needs_revision" ||
                  statusKey === "completed") && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-bold text-gray-900">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-900 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── Bottom row: expert info + action button ── */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {assignedExpert ? (
                      <span className="text-sm text-gray-500">
                        Expert:{" "}
                        <span className="font-medium text-gray-700">
                          {assignedExpert.fullName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No expert assigned yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Secondary: always link to detail page */}
                    <Link
                      to={`/client/projects/${project.id}`}
                      state={{ from: location.pathname }}
                      className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {/* Primary: status-dependent action */}
                    <Link
                      to={action.to}
                      state={{ from: location.pathname }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                        action.variant === "primary"
                          ? "bg-blue-900 text-white hover:bg-blue-800"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
