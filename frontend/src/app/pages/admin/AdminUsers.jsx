import { useState, useEffect } from "react";
import { Search, ShieldOff, Shield } from "lucide-react";
import { BackButton } from "../../components/shared/BackButton.jsx";

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockUsers } from "../../../mock-db/mockDbService.js";

const roleColors = {
  client: "bg-blue-100 text-blue-700",
  expert: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

const statusColors = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // TEMP MOCK DB - replace with API call when backend is ready
    const timer = setTimeout(() => {
      const rawUsers = getMockUsers();
      setUsers(
        rawUsers.map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: u.role,
          status: u.status,
          joinedAt: u.createdAt,
          projectsPosted: u.profile?.totalProjectsPosted || 0,
        })),
      );
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const filtered = users.filter(
    (u) =>
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSuspend = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
    const user = users.find((u) => u.id === userId);
    const newStatus = user?.status === "active" ? "suspended" : "active";
    setFeedback(`${user?.name} has been ${newStatus}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton fallback="/admin/dashboard" className="mb-4">Back to Dashboard</BackButton>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
      <p className="text-gray-600 mb-6">View and manage platform users.</p>

      {feedback && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {feedback}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-900"
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status] || "bg-gray-100 text-gray-700"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSuspend(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                        user.status === "active"
                          ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      }`}
                    >
                      {user.status === "active" ? (
                        <><ShieldOff className="w-3.5 h-3.5" /> Suspend</>
                      ) : (
                        <><Shield className="w-3.5 h-3.5" /> Unsuspend</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
