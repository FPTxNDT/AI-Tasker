import { Link, useParams } from "react-router";
import { Clock, DollarSign, User } from "lucide-react";
import { ProjectTimelineManager } from "../../components/project/ProjectTimelineManager.jsx";
import { BackButton } from "../../components/shared/BackButton.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProjectById,
  getMockUserById,
  getMockProposalsByProject,
} from "../../../mock-db/mockDbService.js";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import {
  deriveProjectStatusKey,
  getStatusLabel,
  getStatusBadgeClass,
} from "../../lib/projectTimelineStore.js";

export function ExpertProjectDetail() {
  const { id } = useParams();

  // TEMP MOCK DB - replace with API call when backend is ready
  const project = getMockProjectById(id);

  // Derived display status (consistent with dashboard cards)
  const statusKey = project
    ? deriveProjectStatusKey(project, {
        proposalCount: getMockProposalsByProject(project.id).length,
      })
    : null;
  const displayStatus = statusKey ? getStatusLabel(statusKey) : null;
  const badgeClass = statusKey ? getStatusBadgeClass(statusKey) : "bg-gray-100 text-gray-700";

  // Client info
  const client = project ? getMockUserById(project.clientId) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/expert/dashboard" className="mb-6">Back</BackButton>

      {!project ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Project not found</h3>
          <p className="text-sm text-gray-400 mt-1">
            The project you are looking for may have been removed.
          </p>
        </div>
      ) : (
        <div>
          {/* Project detail header — same data source as client ProjectDetail */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {project.title}
                </h1>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Budget: <MoneyDisplay amount={project.budget} />
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration: {project.durationValue} {project.durationUnit}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center ${badgeClass}`}
                  >
                    {displayStatus}
                  </span>
                </div>
                {/* Client info */}
                {client && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.fullName}
                      </p>
                      {client.profile?.company && (
                        <p className="text-sm text-gray-500">
                          {client.profile.company}
                          {client.profile?.location
                            ? ` · ${client.profile.location}`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Client button */}
              {client && (
                <Link
                  to="/messenger"
                  className="px-4 py-2.5 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-medium text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" /> Message Client
                </Link>
              )}
            </div>
          </div>

          {/* Shared timeline manager — same component used by both roles */}
          <ProjectTimelineManager role="expert" projectId={id} />
        </div>
      )}
    </div>
  );
}
