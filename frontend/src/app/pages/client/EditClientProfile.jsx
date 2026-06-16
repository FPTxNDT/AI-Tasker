import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getMockUserByEmail,
  getMockUserById,
} from "../../../mock-db/mockDbService.js";
import { DEMO_CLIENT_ID } from "../../lib/demoConfig.js";

// ---------------------------------------------------------------------------
// Resolve client user from mock DB
// ---------------------------------------------------------------------------
function resolveClient(userFromAuth) {
  if (userFromAuth?.email) {
    const mockUser = getMockUserByEmail(userFromAuth.email);
    if (mockUser) return mockUser;
  }
  return getMockUserById(DEMO_CLIENT_ID) || null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function EditClientProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [clientId, setClientId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    industry: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);

  // ---- Load profile from mock DB on mount ----
  useEffect(() => {
    const client = resolveClient(authUser);
    if (!client) {
      setLoading(false);
      return;
    }

    setClientId(client.id);
    setFormData({
      companyName: client.profile?.company || "",
      fullName: client.fullName || "",
      email: client.email || "",
      phone: client.profile?.phone || "",
      location: client.profile?.location || "",
      website: client.profile?.website || "",
      industry: client.profile?.industry || "",
      bio: client.profile?.bio || "",
    });
    setLoading(false);
  }, [authUser]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = resolveClient(authUser);
    if (!client) return;

    // Mutate the mock DB object in-place so ClientProfile sees updates
    client.fullName = formData.fullName.trim() || client.fullName;
    client.email = formData.email.trim() || client.email;
    if (!client.profile) client.profile = {};
    client.profile.company = formData.companyName.trim();
    client.profile.phone = formData.phone.trim();
    client.profile.location = formData.location.trim();
    client.profile.website = formData.website.trim();
    client.profile.industry = formData.industry.trim();
    client.profile.bio = formData.bio.trim();

    navigate("/client/profile");
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/client/profile" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6"
      >
        {[
          { key: "companyName", label: "Company Name", type: "text" },
          { key: "fullName", label: "Contact Person", type: "text" },
          { key: "email", label: "Email Address", type: "email" },
          { key: "phone", label: "Phone Number", type: "tel" },
          { key: "location", label: "Location", type: "text" },
          { key: "website", label: "Website", type: "url" },
          { key: "industry", label: "Industry", type: "text" },
        ].map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
            <input
              type={type}
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio / About
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-900"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
          <Link
            to="/client/profile"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
