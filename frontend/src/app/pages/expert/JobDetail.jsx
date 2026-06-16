import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  DollarSign,
  Clock,
  MapPin,
  User,
  Tag,
  Send,
  Calendar,
} from "lucide-react";
import { BackButton } from "../../components/shared/BackButton.jsx";
// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProjectById,
  getMockAiCategoryById,
  getMockUserById,
} from "../../../mock-db/mockDbService.js";

/**
 * JobDetail — Expert views a job/project before deciding to apply.
 *
 * Route: /expert/jobs/:id
 * Flow: Expert clicks job → views details here → clicks "Apply Now" → proposal form
 */
export function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        // TEMP MOCK DB - replace with API call when backend is ready
        const project = getMockProjectById(id);
        if (!project) {
          if (!cancelled) setError("Project not found.");
          return;
        }
        const category = getMockAiCategoryById(project.category);
        const client = getMockUserById(project.clientId);
        if (!cancelled) {
          setJob({
            ...project,
            categoryLabel: category?.label || project.category,
            client: client
              ? {
                  name: client.fullName,
                  location: client.profile?.location || "",
                }
              : null,
          });
        }
      } catch (apiError) {
        if (!cancelled) setError("Failed to load job details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJob();
    return () => { cancelled = true; };
  }, [id]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/expert/jobs" className="mb-6">Back to Jobs</BackButton>
        <div className="bg-white rounded-xl border border-red-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load job</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // ---- Not found ----
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/expert/jobs" className="mb-6">Back to Jobs</BackButton>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Job not found</h3>
          <p className="text-sm text-gray-400">This job may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  // ---- Job detail ----
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <BackButton fallback="/expert/jobs" className="mb-6">Back to Jobs</BackButton>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget: ${job.budget != null ? job.budget.toLocaleString() : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {job.categoryLabel || job.category}
                </span>
              </div>
            </div>

            {/* Apply button */}
            <button
              type="button"
              onClick={() => navigate(`/expert/jobs/${id}/proposal`)}
              className="px-6 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 font-medium inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" /> Apply Now
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {job.description || "No description provided."}
            </p>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(job.requiredSkills) ? job.requiredSkills : []).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {typeof skill === "string" ? skill : skill.name || skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Client Info */}
          {job.client && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Client</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.client.name || "Client"}</p>
                  {job.client.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {job.client.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
