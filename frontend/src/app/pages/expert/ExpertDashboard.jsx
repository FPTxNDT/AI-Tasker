import { Link } from "react-router";
import {
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Calendar,
  DollarSign,
} from "lucide-react";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { SkillTags } from "../../components/shared/SkillTags.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import {
  getMockProjects,
  getMockProposalsByExpert,
  getMockUserById,
  getMockOpenJobs,
} from "../../../mock-db/mockDbService.js";
import {
  getProjectProgress,
  deriveProjectStatusKey,
  getStatusLabel,
  getStatusBadgeClass,
  getExpertButtonConfig,
} from "../../lib/projectTimelineStore.js";
import { DEMO_EXPERT_ID } from "../../lib/demoConfig.js";
import { timeAgo } from "../../lib/dateUtils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a display-only match percentage from the index. */
function getMatchPct(index) {
  return [96, 89, 84, 78, 92, 88, 81][index % 7];
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

// Number of visible skill tags before the "+N" overflow badge
const SKILL_VISIBLE_COUNT = {
  active: 4,
  recommended: 3,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExpertDashboard() {
  // ---- Mock DB data -------------------------------------------------------
  const allProjects = getMockProjects();
  const expertProposals = getMockProposalsByExpert(DEMO_EXPERT_ID);
  const expert = getMockUserById(DEMO_EXPERT_ID);

  // Active contracts: in_progress projects assigned to this expert
  const activeContracts = allProjects.filter(
    (p) => p.assignedExpertId === DEMO_EXPERT_ID && p.status === "in_progress",
  );

  // Completed projects
  const completedProjects = allProjects.filter(
    (p) => p.assignedExpertId === DEMO_EXPERT_ID && p.status === "completed",
  );

  // ---- Stats ---------------------------------------------------------------
  const earningsDisplay = expert?.profile?.hourlyRate
    ? expert.profile.hourlyRate * (expert.profile.completedProjects || 0) * 40
    : 0;
  const totalAssigned = completedProjects.length + activeContracts.length;
  const successRate =
    totalAssigned > 0
      ? Math.round((completedProjects.length / totalAssigned) * 100)
      : 0;
  const pendingOffers = expertProposals.filter(
    (p) => p.status === "pending",
  ).length;

  // ---- Recommended projects ------------------------------------------------
  const openJobs = getMockOpenJobs();
  const recommendedProjects = openJobs.slice(0, 5);

  // ---- Render --------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Expert Dashboard
          </h1>
          <p className="text-gray-500 mt-0.5">
            Manage your contracts and discover new opportunities
          </p>
        </div>
        <Link
          to="/expert/find-jobs"
          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium text-sm inline-flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" /> Browse All Jobs
        </Link>
      </div>

      {/* ================================================================== */}
      {/* Stats Row                                                          */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Active Contracts",
            value: activeContracts.length,
            icon: Briefcase,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Total Earned",
            value: <MoneyDisplay amount={earningsDisplay} />,
            icon: TrendingUp,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            icon: CheckCircle,
            color: "text-emerald-600 bg-emerald-100",
          },
          {
            label: "Open Proposals",
            value: pendingOffers,
            icon: Clock,
            color: "text-amber-600 bg-amber-100",
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
      <div className="expert-dashboard-grid grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-6 items-stretch">
        {/* ================================================================ */}
        {/* LEFT PANEL — MY ACTIVE CONTRACTS                                 */}
        {/* ================================================================ */}
        <section
          className="expert-dashboard-panel bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-w-0"
          style={{
            height: "calc(100vh - 180px)",
            minHeight: "620px",
          }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              My Active Contracts
            </h2>
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {activeContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  No active contracts
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Browse available jobs and submit proposals.
                </p>
                <Link
                  to="/expert/find-jobs"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                >
                  Find Jobs
                </Link>
              </div>
            ) : (
              activeContracts.map((p) => {
                const client = getMockUserById(p.clientId);
                const progress = getProjectProgress(p.id);
                const statusKey = deriveProjectStatusKey(p);
                const displayStatus = getStatusLabel(statusKey);
                const badgeClass = getStatusBadgeClass(statusKey);
                const btnCfg = getExpertButtonConfig(statusKey);

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

                    {/* ── Client name ── */}
                    <p className="text-sm text-gray-500 mb-3">
                      with{" "}
                      <span className="font-medium text-gray-700">
                        {client?.fullName || "Client"}
                      </span>
                    </p>

                    {/* ── Skill tags ── */}
                    <div className="mb-4">
                      <SkillTags
                        skills={p.requiredSkills}
                        maxVisible={SKILL_VISIBLE_COUNT.active}
                      />
                    </div>

                    {/* ── Progress bar ── */}
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

                    {/* ── Bottom row: due date, value, action ── */}
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
                      {btnCfg.disabled ? (
                        <span
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${btnCfg.className}`}
                        >
                          {btnCfg.label}
                        </span>
                      ) : (
                        <Link
                          to={btnCfg.linkTo?.(p) || `/expert/projects/${p.id}`}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${btnCfg.className}`}
                        >
                          {btnCfg.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* RIGHT PANEL — RECOMMENDED PROJECTS                               */}
        {/* ================================================================ */}
        <section
          className="expert-dashboard-panel bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-w-0"
          style={{
            height: "calc(100vh - 180px)",
            minHeight: "620px",
          }}
        >
          {/* Panel header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Recommended Projects
            </h2>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          {/* Scrollable card list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {recommendedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">
                  No recommendations yet
                </h3>
                <p className="text-sm text-gray-400">
                  Complete your profile to get personalized recommendations.
                </p>
              </div>
            ) : (
              recommendedProjects.map((p, idx) => {
                const client = getMockUserById(p.clientId);
                const matchPct = getMatchPct(idx);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                  >
                    {/* ── Top: title + match badge ── */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">
                        {p.title}
                      </h3>
                      <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                        {matchPct}% match
                      </span>
                    </div>

                    {/* ── Posted by + time ── */}
                    <p className="text-xs text-gray-500 mb-2.5">
                      Posted by{" "}
                      <span className="font-medium text-gray-600">
                        {client?.fullName || "Client"}
                      </span>
                      {" · "}
                      {timeAgo(p.createdAt)}
                    </p>

                    {/* ── Description ── */}
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* ── Skill tags ── */}
                    <div className="mb-3">
                      <SkillTags
                        skills={p.requiredSkills}
                        maxVisible={SKILL_VISIBLE_COUNT.recommended}
                      />
                    </div>

                    {/* ── Budget + Duration ── */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-semibold text-gray-900 text-sm">
                        <MoneyDisplay amount={p.budget} />
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500 text-xs">
                        {p.durationValue} {p.durationUnit}
                      </span>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/expert/jobs/${p.id}/proposal`}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium text-center transition-colors"
                      >
                        Apply Now
                      </Link>
                      <Link
                        to={`/expert/jobs/${p.id}`}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center transition-colors"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
