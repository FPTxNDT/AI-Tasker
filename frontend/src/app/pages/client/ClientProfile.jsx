import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  User,
  MapPin,
  Calendar,
  Edit,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { api } from "../../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getMockUserByEmail,
  getMockUserById,
  getMockProjectsByClient,
  getMockProposalsByProject,
} from "../../../mock-db/mockDbService.js";
import { MoneyDisplay } from "../../components/shared/MoneyDisplay.jsx";
import { DEMO_CLIENT_ID } from "../../lib/demoConfig.js";

/**
 * Resolve the full client user object from auth email → mock DB.
 * Falls back to the demo client ID.
 */
function resolveClient(userFromAuth) {
  if (userFromAuth?.email) {
    const mockUser = getMockUserByEmail(userFromAuth.email);
    if (mockUser) return mockUser;
  }
  return getMockUserById(DEMO_CLIENT_ID) || null;
}

export function ClientProfile() {
  const { user: authUser } = useAuth();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const apiUser = await api.users.getMe();
        if (!cancelled && apiUser) {
          // API returned data — construct a compatible shape
          const c = {
            fullName: apiUser.name || apiUser.fullName || apiUser.email?.split("@")[0] || "User",
            email: apiUser.email,
            profile: apiUser.profile || {},
          };
          setClient(c);
          setStats(computeStats(c));
          return;
        }
      } catch {
        // API unreachable — fall through to mock DB
      }

      if (!cancelled) {
        const resolved = resolveClient(authUser);
        setClient(resolved);
        if (resolved) setStats(computeStats(resolved));
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [authUser]);

  useEffect(() => {
    if (client !== null) setLoading(false);
  }, [client]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Not-found state ----
  if (!client) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Profile not available</h2>
          <p className="text-sm text-gray-400 mb-4">Complete your profile to get started.</p>
          <Link
            to="/client/profile/edit"
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium inline-flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>
    );
  }

  // ---- Main render ----
  const displayName = client.fullName || client.name || "Client";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Avatar + name info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-900">{initials}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {client.profile?.company && (
                <p className="text-gray-700 font-medium">{client.profile.company}</p>
              )}
              <p className="text-gray-500 text-sm">{client.email}</p>
            </div>
          </div>

          <Link
            to="/client/profile/edit"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2 transition-colors flex-shrink-0"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>

        {/* ── Meta details ── */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-gray-100">
          {client.profile?.location && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              {client.profile.location}
            </span>
          )}
          {client.profile?.industry && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Briefcase className="w-4 h-4 text-gray-400" />
              {client.profile.industry}
            </span>
          )}
          {client.createdAt && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400" />
              Joined{" "}
              {new Date(client.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* ── About / bio ── */}
        {client.profile?.bio && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{client.profile.bio}</p>
          </div>
        )}
      </div>

      {/* ── Statistics cards ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              label: "Projects Posted",
              value: stats.posted,
              icon: Briefcase,
              color: "text-blue-600 bg-blue-100",
            },
            {
              label: "Active Projects",
              value: stats.active,
              icon: Clock,
              color: "text-amber-600 bg-amber-100",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
              color: "text-green-600 bg-green-100",
            },
            {
              label: "Proposals Received",
              value: stats.proposals,
              icon: FileText,
              color: "text-purple-600 bg-purple-100",
            },
            {
              label: "Total Spent",
              value: <MoneyDisplay amount={stats.totalSpent} />,
              icon: DollarSign,
              color: "text-emerald-600 bg-emerald-100",
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
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats computation (pure function, runs against mock DB)
// ---------------------------------------------------------------------------

function computeStats(client) {
  if (!client) return null;

  const projects = getMockProjectsByClient(client.id);
  const posted = projects.length;
  const active = projects.filter((p) => p.status === "in_progress").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  let proposalCount = 0;
  projects.forEach((p) => {
    proposalCount += getMockProposalsByProject(p.id).length;
  });

  const totalSpent = client.profile?.totalSpent ?? 0;

  return { posted, active, completed, proposals: proposalCount, totalSpent };
}
