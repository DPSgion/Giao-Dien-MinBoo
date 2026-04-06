import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationService } from "../../services/apiServices";

const NOTI_ICONS = {
  friend_request: "👋",
  friend_accepted: "🤝",
  new_post: "📸",
  new_comment: "💬",
  new_reaction: "❤️",
  new_message: "✉️",
};

const NOTI_LABELS = {
  friend_request: "đã gửi lời mời kết bạn cho bạn",
  friend_accepted: "đã chấp nhận lời mời kết bạn của bạn",
  new_post: "đã đăng một bài viết mới",
  new_comment: "đã bình luận trên bài viết của bạn",
  new_reaction: "đã thích bài viết của bạn",
  new_message: "đã gửi cho bạn một tin nhắn",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // ============================================================
  // [API 11.1] GET /notifications - Danh sách thông báo
  // Backend Java: NotificationController.getNotifications()
  // Query: { page: 1, limit: 50, is_read?: boolean }
  // ============================================================
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50 };
      if (filter === "unread") params.is_read = false;
      if (filter === "read") params.is_read = true;
      const res = await notificationService.getNotifications(params);
      setNotifications(res.data.notifications || []);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  // ============================================================
  // [API 11.2] PATCH /notifications/{id}/read - Đánh dấu đã đọc
  // Backend Java: NotificationController.markRead()
  // ============================================================
  const handleMarkRead = async (notificationId) => {
    try {
      await notificationService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (_) {}
  };

  // ============================================================
  // [API 11.3] PATCH /notifications/read-all - Đánh dấu tất cả đã đọc
  // Backend Java: NotificationController.markAllRead()
  // ============================================================
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  // Navigate đến entity khi click thông báo
  const getNotificationLink = (noti) => {
    switch (noti.entity_type) {
      case "post": return `/post/${noti.entity_id}`;
      case "user": return `/profile/${noti.entity_id}`;
      case "conversation": return `/messages/${noti.entity_id}`;
      case "friend_request": return `/friends`;
      default: return "#";
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Vừa xong";
    if (m < 60) return `${m} phút`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ`;
    return `${Math.floor(h / 24)} ngày`;
  };

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Thông báo</h1>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead}
            className="text-sm text-blue-500 font-semibold hover:underline">
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[["all", "Tất cả"], ["unread", "Chưa đọc"], ["read", "Đã đọc"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === val ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔔</div>
          <p>Không có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((noti) => (
            <Link
              key={noti.notification_id}
              to={getNotificationLink(noti)}
              onClick={() => !noti.is_read && handleMarkRead(noti.notification_id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 ${
                !noti.is_read ? "bg-blue-50 hover:bg-blue-100" : ""
              }`}>
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={noti.sender?.url_avt || `https://ui-avatars.com/api/?name=${noti.sender?.name}&background=random`}
                  className="w-11 h-11 rounded-full object-cover"
                  alt={noti.sender?.name}
                />
                <span className="absolute -bottom-1 -right-1 text-base">
                  {NOTI_ICONS[noti.type] || "🔔"}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{noti.sender?.name}</span>{" "}
                  <span className="text-gray-600">{NOTI_LABELS[noti.type] || "đã có hoạt động mới"}</span>
                </p>
                <p className={`text-xs mt-0.5 ${!noti.is_read ? "text-blue-500 font-semibold" : "text-gray-400"}`}>
                  {timeAgo(noti.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!noti.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
