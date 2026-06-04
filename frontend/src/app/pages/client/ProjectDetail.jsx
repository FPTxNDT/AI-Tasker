import { useParams } from "react-router";
import { Clock, DollarSign, User } from "lucide-react";
import { ProjectTimelineManager } from "../../components/project/ProjectTimelineManager.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockProjectById, getMockProposalsByProject } from "../../../mock-db/mockDbService.js";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { deriveProjectDisplayStatus } from "../../lib/projectTimelineStore.js";
import { BackButton } from "../../components/shared/BackButton.jsx";

export function ProjectDetail() {
  const { id } = useParams();

  // TEMP MOCK DB - replace with API call when backend is ready
  const project = getMockProjectById(id);

  // Derived display status (consistent with dashboard cards)
  const displayStatus = project
    ? deriveProjectDisplayStatus(project, {
        proposalCount: getMockProposalsByProject(project.id).length,
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/client/dashboard" className="mb-6">Back</BackButton>

      {!project ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Project not found</h3>
          <p className="text-sm text-gray-400 mt-1">The project you are looking for may have been removed.</p>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Budget: <MoneyDisplay amount={project.budget} />
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Status: {displayStatus}
              </span>
              {project.assignedExpertId && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Expert assigned
                </span>
              )}
            </div>
          </div>

          <ProjectTimelineManager role="client" projectId={id} />
        </div>
      )}
    </div>
  );
}
