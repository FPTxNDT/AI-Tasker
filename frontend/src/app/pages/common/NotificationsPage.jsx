import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Bell,
  CheckCheck,
  FileText,
  MessageSquare,
  DollarSign,
  RefreshCcw,
  AlertCircle,
  Clock,
} from "lucide-react";

// TEMP MOCK DB - replace with API call when backend is ready
import { getMockNotificationsByUser } from "../../../mock-db/mockDbService.js";
import { DEMO_CLIENT_ID } from "../../lib/demoConfig.js";
import { timeAgo } from "../../lib/dateUtils.js";

// ---------------------------------------------------------------------------
// Icons and formatting
// ---------------------------------------------------------------------------

const typeIcons = {
  proposal: FileText,
  task: CheckCheck,
  payment: DollarSign,
  extension: RefreshCcw,
  message: MessageSquare,
  system: AlertCircle,
  dispute: AlertCircle,
};

const typeColors = {
  proposal: "bg-purple-100 text-purple-700",
  task: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  extension: "bg-orange-100 text-orange-700",
  message: "bg-indigo-100 text-indigo-700",
  system: "bg-gray-100 text-gray-700",
  dispute: "bg-red-100 text-red-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      // TEMP MOCK DB - replace with API call when backend is ready
      const data = getMockNotificationsByUser(DEMO_CLIENT_ID);
      if (!cancelled && Array.isArray(data)) {
        setNotifications(data);
      }
      if (!cancelled) setLoading(false);
    }

    fetchNotifications();
    return () => { cancelled = true; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    // TEMP MOCK DB - optimistic only; replace with API call when backend is ready
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setActionFeedback("All notifications marked as read.");
    setTimeout(() => setActionFeedback(null), 3000);
    // TEMP MOCK DB - optimistic only; replace with API call when backend is ready
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Feedback */}
      {actionFeedback && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {actionFeedback}
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No notifications</h3>
          <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || "bg-gray-100 text-gray-700";

            const content = (
              <div
                className={`flex items-start gap-4 p-5 rounded-xl border transition cursor-pointer ${
                  notif.isRead
                    ? "bg-white border-gray-200 hover:border-gray-300"
                    : "bg-blue-50/40 border-blue-200 hover:border-blue-300"
                }`}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${notif.isRead ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>
                      {notif.title}
                      {!notif.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-2 align-middle" />
                      )}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${notif.isRead ? "text-gray-500" : "text-gray-700"}`}>
                    {notif.description || notif.message}
                  </p>
                </div>
              </div>
            );

            // Wrap in Link if there's an actionUrl, otherwise plain div
            if (notif.actionUrl) {
              return (
                <Link key={notif.id} to={notif.actionUrl} className="block">
                  {content}
                </Link>
              );
            }
            return <div key={notif.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
