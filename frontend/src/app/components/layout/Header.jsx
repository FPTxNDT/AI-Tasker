import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { getMockNotificationsByUser } from "../../../mock-db/mockDbService.js";
import { DEMO_CLIENT_ID, DEMO_EXPERT_ID, DEMO_ADMIN_ID } from "../../lib/demoConfig.js";
import { timeAgo } from "../../lib/dateUtils.js";

// ---------------------------------------------------------------------------
// Resolve header notifications from mock-db (centralized source of truth)
// ---------------------------------------------------------------------------

function getHeaderNotifications(role) {
  const userId =
    role === "expert" ? DEMO_EXPERT_ID :
    role === "admin" ? DEMO_ADMIN_ID :
    DEMO_CLIENT_ID;
  const all = getMockNotificationsByUser(userId);
  // Return the 5 most recent, enriched with display fields
  return all.slice(0, 5).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    isUnread: !n.isRead,
    time: timeAgo(n.createdAt),
    createdAt: n.createdAt,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Header — top navigation bar.
 *
 * Reads user & role from AuthContext (JWT), NOT from a prop or the URL.
 * Shows role-specific nav links, notification bell with mock data, profile link, and logout.
 */
export function Header() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { role, isAuthenticated, logout } = useAuth();

  // Load mock notifications (Phase 4)
  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Replace with api.notifications.list({ limit: 5 })
      setNotifications(getHeaderNotifications(role));
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, role]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-[22px] font-semibold text-gray-900">Tasker</span>
          </Link>

          {/* Navigation Link Items — only show when authenticated */}
          {isAuthenticated && role && (
            <nav className="hidden md:flex items-center gap-16">
              <Link
                to={`/${role}/dashboard`}
                className="text-lg text-gray-700 hover:text-gray-900 font-normal"
              >
                Dashboard
              </Link>
              {role === "client" && (
                <Link
                  to="/client/experts"
                  className="text-lg text-gray-700 hover:text-gray-900 font-normal"
                >
                  Find Experts
                </Link>
              )}
              {role === "expert" && (
                <Link
                  to="/expert/proposals"
                  className="text-lg text-gray-700 hover:text-gray-900 font-normal"
                >
                  My Proposals
                </Link>
              )}
              <Link
                to="/messenger"
                className="text-lg text-gray-700 hover:text-gray-900 font-normal"
              >
                Messages
              </Link>
            </nav>
          )}

          {/* Right Side Control Toolbar */}
          <div className="flex items-center gap-5">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div className="relative flex items-center justify-center" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all relative flex items-center justify-center ${
                      showNotifications ? "bg-gray-100 text-gray-900" : ""
                    }`}
                  >
                    <Bell className="w-5 h-5 stroke-[2.2]" />

                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-extrabold flex items-center justify-center animate-pulse border border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                      <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {role === "client" ? "Client Updates" : role === "expert" ? "Expert Updates" : "Admin Alerts"}
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 bg-white">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs font-medium text-slate-400">
                            No new workspace notifications.
                          </div>
                        ) : (
                          notifications.map((noti) => (
                            <div
                              key={noti.id}
                              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer relative ${
                                noti.isUnread
                                  ? "bg-blue-50/30 hover:bg-blue-50/60"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {noti.isUnread && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 truncate">
                                  {noti.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 font-medium leading-normal mt-0.5 break-words">
                                  {noti.description}
                                </p>
                                <span className="text-[9px] font-bold text-gray-400 block mt-1">
                                  {noti.time}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* View All link */}
                      <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to={`/${role}/profile`}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-[15px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-base text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold text-base shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
