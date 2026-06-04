import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Edit,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { api } from "../../../services/api.js";
import {
  getMockUserById,
  getMockReviewsByExpert,
} from "../../../mock-db/mockDbService.js";

/**
 * PublicExpertProfile — unified expert profile component.
 *
 * Supports three viewer roles:
 *   "client"  — shows Hire/Invite + Send Message buttons
 *   "expert"  — shows Edit Profile button (own profile)
 *   "public"  — no private actions (read-only)
 *
 * Props:
 *   viewerRole   — "client" | "expert" | "public"
 *   expertId     — optional expert ID (for client/public views)
 *
 * API-first: tries the real API, falls back to centralized mock DB.
 */

// ---------------------------------------------------------------------------
// Build expert profile data from centralized mock DB
// ---------------------------------------------------------------------------

function getExpertProfileData(expertId) {
  const id = expertId || "expert-001";
  const user = getMockUserById(id);
  if (!user) return null;

  const reviews = getMockReviewsByExpert(user.id);

  return {
    id: user.id,
    name: user.fullName,
    title: user.profile?.title,
    specialization: user.profile?.specialization,
    location: user.profile?.location,
    rating: user.profile?.rating,
    reviews: user.profile?.reviewCount,
    completedProjects: user.profile?.completedProjects,
    hourlyRate: user.profile?.hourlyRate,
    bio: user.profile?.bio,
    skills: user.profile?.skills || [],
    portfolio: user.profile?.portfolio || [],
    clientReviews: reviews.map((r) => ({
      clientName: getMockUserById(r.clientId)?.fullName || "Unknown",
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    })),
  };
}

export function PublicExpertProfile({ viewerRole = "public", expertId }) {
  // Resolve expertId from props or URL params
  const { id } = useParams();
  const resolvedId = expertId || id;

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchExpert() {
      try {
        // API-first: try real backend
        if (resolvedId) {
          const apiExpert = await api.experts.getById(resolvedId);
          if (!cancelled && apiExpert) {
            // Map API response shape to expected UI shape
            setExpert({
              id: apiExpert.id || resolvedId,
              name: apiExpert.name || apiExpert.fullName,
              title: apiExpert.title || apiExpert.specialization,
              specialization: apiExpert.specialization,
              location: apiExpert.location,
              rating: apiExpert.rating,
              reviews: apiExpert.reviews || apiExpert.reviewCount,
              completedProjects: apiExpert.completedProjects,
              hourlyRate: apiExpert.hourlyRate,
              bio: apiExpert.bio,
              skills: apiExpert.skills || [],
              portfolio: apiExpert.portfolio || [],
              clientReviews: (apiExpert.clientReviews || []).map((r) => ({
                clientName: r.clientName || r.name || "Client",
                rating: r.rating,
                comment: r.comment || r.review,
                date: r.date,
              })),
            });
            return;
          }
        }
      } catch {
        // API unreachable — fall through to mock DB
      }

      if (!cancelled) {
        setExpert(getExpertProfileData(resolvedId));
      }
    }

    fetchExpert().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [resolvedId]);

  // Derive back-link destination from viewer role
  const getBackLink = () => {
    switch (viewerRole) {
      case "client":
        return { to: "/client/experts", label: "Back to Experts" };
      case "expert":
        return { to: "/expert/dashboard", label: "Back to Dashboard" };
      default:
        return { to: "/", label: "Back" };
    }
  };

  const backLink = getBackLink();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={backLink.to}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {backLink.label}
        </Link>
        <div className="animate-pulse bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-white/20 rounded w-48" />
                <div className="h-4 bg-white/20 rounded w-32" />
              </div>
            </div>
          </div>
          <div className="p-8 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={backLink.to}
          className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {backLink.label}
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">
            Expert not found
          </h3>
          <p className="text-sm text-gray-400">
            This profile may have been removed or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to={backLink.to}
        className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {backLink.label}
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur">
              <span className="text-3xl font-bold">
                {expert.name?.[0] || "?"}
              </span>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{expert.name}</h1>
              <p className="text-blue-100">{expert.title || expert.specialization}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {expert.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {" "}
                  {expert.rating} ({expert.reviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {expert.completedProjects}{" "}
                  projects
                </span>
                {expert.hourlyRate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> ${expert.hourlyRate}/hr
                  </span>
                )}
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {viewerRole === "client" && (
                <>
                  <button className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Hire / Invite
                  </button>
                  <Link
                    to={`/messenger/${expert.id || resolvedId}`}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Message
                  </Link>
                </>
              )}

              {viewerRole === "expert" && (
                <Link
                  to="/expert/profile/edit"
                  className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </Link>
              )}

              {/* public viewerRole → no action buttons */}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-8 space-y-6">
          {/* Bio / About */}
          {expert.bio && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
            </section>
          )}

          {/* Skills */}
          {expert.skills?.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {expert.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio / Projects */}
          {expert.portfolio?.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">Portfolio</h3>
              <div className="grid gap-3">
                {expert.portfolio.map((item, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Reviews */}
          {expert.clientReviews?.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-3">
                Client Reviews ({expert.clientReviews.length})
              </h3>
              <div className="space-y-3">
                {expert.clientReviews.map((review, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {review.clientName}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating || 0 }, (_, j) => (
                          <Star
                            key={j}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    {review.date && (
                      <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
