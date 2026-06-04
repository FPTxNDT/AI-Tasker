import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  User,
  MapPin,
  Calendar,
  Edit,
  Shield,
} from "lucide-react";
import { BackButton } from "../../components/shared/BackButton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getMockUserByEmail,
  getMockUserById,
} from "../../../mock-db/mockDbService.js";
import { DEMO_ADMIN_ID } from "../../lib/demoConfig.js";

/**
 * Resolve the full admin user object from auth email → mock DB.
 * Falls back to the demo admin ID.
 */
function resolveAdmin(userFromAuth) {
  if (userFromAuth?.email) {
    const mockUser = getMockUserByEmail(userFromAuth.email);
    if (mockUser) return mockUser;
  }
  return getMockUserById(DEMO_ADMIN_ID) || null;
}

export function AdminProfile() {
  const { user: authUser } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolved = resolveAdmin(authUser);
    setAdmin(resolved);
    setLoading(false);
  }, [authUser]);

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
        </div>
      </div>
    );
  }

  // ---- Not-found state ----
  if (!admin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/admin/dashboard" className="mb-4">Back to Dashboard</BackButton>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Profile not available</h2>
          <p className="text-sm text-gray-400 mb-4">Complete your profile to get started.</p>
          <Link
            to="/admin/profile/edit"
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-medium inline-flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>
    );
  }

  // ---- Main render ----
  const displayName = admin.fullName || admin.name || "Administrator";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton fallback="/admin/dashboard" className="mb-2">Back to Dashboard</BackButton>

      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Avatar + name info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-red-900">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  Admin
                </span>
              </div>
              {admin.profile?.title && (
                <p className="text-gray-700 font-medium">{admin.profile.title}</p>
              )}
              <p className="text-gray-500 text-sm">{admin.email}</p>
            </div>
          </div>

          <Link
            to="/admin/profile/edit"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2 transition-colors flex-shrink-0"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>

        {/* ── Meta details ── */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-gray-100">
          {admin.profile?.location && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              {admin.profile.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-gray-400" />
            Platform Administrator
          </span>
          {admin.createdAt && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400" />
              Joined{" "}
              {new Date(admin.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* ── About / bio ── */}
        {admin.profile?.bio && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{admin.profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
