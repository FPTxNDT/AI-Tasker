import { Link, useLocation } from "react-router";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  PlusCircle,
  Calendar,
  DollarSign,
  User,
  Star,
  TrendingUp,
  FileText,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { SkillTags } from "../../components/shared/SkillTags.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProjectsByClient,
  getMockUserById,
  getMockUsers,
  getMockReviewsByExpert,
  getMockProposalsByProject,
} from "../../../mock-db/mockDbService.js";
import { getProjectProgress, deriveProjectStatusKey, getStatusLabel, getStatusBadgeClass, getClientButtonConfig } from "../../lib/projectTimelineStore.js";
import { DEMO_CLIENT_ID } from "../../lib/demoConfig.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute average rating for an expert from mock reviews. */
function computeExpertRating(expertId) {
  const reviews = getMockReviewsByExpert(expertId);
  if (!reviews.length) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return avg.toFixed(1);
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const SKILL_VISIBLE_COUNT = {
  project: 4,
  expert: 4,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientDashboard() {
  const location = useLocation();

  // ---- Mock DB data -------------------------------------------------------
  const clientProjects = getMockProjectsByClient(DEMO_CLIENT_ID);
  const allUsers = getMockUsers();
  const experts = allUsers.filter((u) => u.role === "expert");

  // ---- Sort experts by rating (highest first) for recommendations ---------
  const recommendedExperts = [...experts]
    .map((expert) => ({
      ...expert,
      avgRating: computeExpertRating(expert.id),
    }))
    .filter((e) => e.avgRating !== null)
    .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));

  // ---- Stats ---------------------------------------------------------------
  const inProgress = clientProjects.filter((p) => p.status === "in_progress").length;
  const completed = clientProjects.filter((p) => p.status === "completed").length;
  const openProjects = clientProjects.filter((p) => p.status === "open").length;
  const cancelledProjects = clientProjects.filter((p) => p.status === "cancelled").length;

  // ---- Render --------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Client Dashboard
          </h1>
          <p className="text-gray-500 mt-0.5">
            Manage your AI projects and find experts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/client/my-projects"
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" /> All Projects
          </Link>
          <Link
            to="/client/post-project"
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium text-sm inline-flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Post New Project
          </Link>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Stats Row                                                          */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Projects",
            value: inProgress,
            icon: Briefcase,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Open Proposals",
            value: openProjects,
            icon: FileText,
            color: "text-amber-600 bg-amber-100",
          },
          {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Cancelled",
            value: cancelledProjects,
            icon: Clock,
            color: "text-red-600 bg-red-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div
              className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center mb-2.5`}
            >
              <stat.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ================================================================== */}
      {/* Two-Column Dashboard                                               */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-6 items-stretch">
        {/* ================================================================ */}
        {/* LEFT PANEL — MY PROJECTS                                         */}
        {/* ================================================================ */}
        <section
          className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-w-0"
          style={{
            height: "calc(100vh - 180px)",
            minHeight: "620px",
          }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              My Projects
            </h2>
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {clientProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  No projects yet
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Post your first project to find the right AI expert.
                </p>
                <Link
                  to="/client/post-project"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                >
                  Post a Project
                </Link>
              </div>
            ) : (
              clientProjects.map((p) => {
                const assignedExpert = p.assignedExpertId
                  ? getMockUserById(p.assignedExpertId)
                  : null;
                const progress = getProjectProgress(p.id);
                const proposals = getMockProposalsByProject(p.id);
                const statusKey = deriveProjectStatusKey(p, {
                  proposalCount: proposals.length,
                });
                const displayStatus = getStatusLabel(statusKey);
                const badgeClass = getStatusBadgeClass(statusKey);
                const btnCfg = getClientButtonConfig(statusKey);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                  >
                    {/* ── Top row: title + status badge ── */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">
                        {p.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                      >
                        {displayStatus}
                      </span>
                    </div>

                    {/* ── Expert name (if assigned) ── */}
                    <p className="text-sm text-gray-500 mb-3">
                      {assignedExpert ? (
                        <>
                          with{" "}
                          <span className="font-medium text-gray-700">
                            {assignedExpert.fullName}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No expert assigned yet</span>
                      )}
                    </p>

                    {/* ── Skill tags ── */}
                    {p.requiredSkills?.length > 0 && (
                      <div className="mb-4">
                        <SkillTags
                          skills={p.requiredSkills}
                          maxVisible={SKILL_VISIBLE_COUNT.project}
                        />
                      </div>
                    )}

                    {/* ── Progress bar (always shown) ── */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-500">
                          Milestone Progress
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* ── Bottom row: due date, budget, action ── */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due{" "}
                          {p.deadline
                            ? new Date(p.deadline).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )
                            : "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <MoneyDisplay amount={p.budget} />
                        </span>
                      </div>
                      <Link
                        to={btnCfg.linkTo?.(p) || `/client/projects/${p.id}`}
                        state={{ from: location.pathname }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${btnCfg.className}`}
                      >
                        {btnCfg.label}
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* RIGHT PANEL — RECOMMENDED EXPERTS                                */}
        {/* ================================================================ */}
        <section
          className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-w-0"
          style={{
            height: "calc(100vh - 180px)",
            minHeight: "620px",
          }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Recommended Experts
            </h2>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {recommendedExperts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  No experts available
                </h3>
                <p className="text-sm text-gray-400">
                  Check back later for expert recommendations.
                </p>
              </div>
            ) : (
              recommendedExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                >
                  {/* ── Top: name + rating badge ── */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">
                      {expert.fullName}
                    </h3>
                    <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                      {expert.avgRating}
                    </span>
                  </div>

                  {/* ── Title + location ── */}
                  <p className="text-xs text-gray-500 mb-2.5">
                    {expert.profile?.title || "AI Expert"}
                    {expert.profile?.location ? (
                      <>
                        {" · "}
                        <span className="font-medium text-gray-600">
                          {expert.profile.location}
                        </span>
                      </>
                    ) : null}
                  </p>

                  {/* ── Bio ── */}
                  {expert.profile?.bio && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                      {expert.profile.bio}
                    </p>
                  )}

                  {/* ── Skill tags ── */}
                  {expert.profile?.skills?.length > 0 && (
                    <div className="mb-3">
                      <SkillTags
                        skills={expert.profile.skills}
                        maxVisible={SKILL_VISIBLE_COUNT.expert}
                      />
                    </div>
                  )}

                  {/* ── Stats ── */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-900">
                        {expert.profile?.completedProjects || 0}
                      </span>{" "}
                      projects
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-900">
                        ${expert.profile?.hourlyRate || 0}
                      </span>
                      /hr
                    </span>
                  </div>

                  {/* ── Action ── */}
                  <Link
                    to={`/client/experts/${expert.id}`}
                    className="block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
