import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationService, friendService } from "../../services/apiServices";

const NOTI_ICONS = {
    friend_request: "👋",
    friend_accepted: "🤝",
    new_post: "📸",
    new_comment: "💬",
    new_reaction: "❤️",
    new_message: "✉️",
};

const NOTI_LABELS = {
    friend_request: "đã bắt đầu theo dõi bạn.",
    friend_accepted: "đã chấp nhận lời mời kết bạn của bạn.",
    new_post: "đã đăng một bài viết mới.",
    new_comment: "đã bình luận trên bài viết của bạn.",
    new_reaction: "đã thích bài viết của bạn.",
    new_message: "đã gửi cho bạn một tin nhắn.",
};

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [followedBack, setFollowedBack] = useState({}); // track which users we followed back

    useEffect(() => {
        fetchNotifications();
        fetchFriendRequests();
    }, [filter]);

    // ============================================================
    // [API 11.1] GET /notifications - Danh sách thông báo
    // ============================================================
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = { page: 1, limit: 50 };
            if (filter === "unread") params.is_read = false;
            if (filter === "read") params.is_read = true;
            const res = await notificationService.getNotifications(params);
            const notiList = res?.notifications || res?.data?.notifications || [];
            setNotifications(notiList);
        } catch (_) { } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách lời mời kết bạn đang chờ (hiển thị như thông báo)
    const fetchFriendRequests = async () => {
        try {
            const res = await friendService.getPendingRequests();
            const pending = Array.isArray(res) ? res : (res?.data || []);
            const mapped = pending.map(req => ({
                _isFriendRequest: true,
                requestId: req.requestId,
                sender: {
                    user_id: req.requesterId,
                    name: req.requesterName,
                    url_avt: null,
                },
                type: "friend_request",
                created_at: req.createdAt,
                is_read: false,
            }));
            setFriendRequests(mapped);
        } catch (_) { }
    };

    // ============================================================
    // [API 11.2] PATCH /notifications/{id}/read - Đánh dấu đã đọc
    // ============================================================
    const handleMarkRead = async (notificationId) => {
        try {
            await notificationService.markRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) => n.notification_id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (_) { }
    };

    // ============================================================
    // [API 11.3] PATCH /notifications/read-all - Đánh dấu tất cả đã đọc
    // ============================================================
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (_) { }
    };

    // Theo dõi lại
    const handleFollowBack = async (senderId, requestId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            // Chấp nhận lời mời kết bạn
            if (requestId) {
                await friendService.acceptRequest(requestId);
            } else {
                await friendService.sendRequest(senderId);
            }
            setFollowedBack(prev => ({ ...prev, [senderId]: true }));
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "";
            if (msg.includes("Data already exists") || msg.includes("violates system constraints")) {
                setFollowedBack(prev => ({ ...prev, [senderId]: true }));
            }
        }
    };

    // Navigate đến entity khi click thông báo
    const getNotificationLink = (noti) => {
        if (noti._isFriendRequest) return `/profile/${noti.sender?.user_id}`;
        switch (noti.entity_type) {
            case "post": return `/post/${noti.entity_id}`;
            case "user": return `/profile/${noti.entity_id}`;
            case "conversation": return `/messages/${noti.entity_id}`;
            case "friend_request": return `/profile/${noti.sender?.user_id || noti.entity_id}`;
            default: return "#";
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return "Vừa xong";
        if (m < 60) return `${m} phút`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} giờ`;
        const d = Math.floor(h / 24);
        if (d < 7) return `${d} ngày`;
        const w = Math.floor(d / 7);
        return `${w} tuần`;
    };

    // Gộp thông báo từ API + lời mời kết bạn, sắp xếp theo thời gian
    const allNotifications = [...friendRequests, ...notifications].sort((a, b) => {
        const ta = new Date(a.created_at || 0).getTime();
        const tb = new Date(b.created_at || 0).getTime();
        return tb - ta;
    });

    const hasUnread = allNotifications.some((n) => !n.is_read);

    return (
        <div className="max-w-[600px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Thông báo</h1>
                {hasUnread && (
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === val ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            ) : allNotifications.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🔔</div>
                    <p>Không có thông báo nào</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {allNotifications.map((noti, idx) => {
                        const senderId = noti.sender?.user_id || noti.sender?.id;
                        const isFollowType = noti.type === "friend_request";
                        const alreadyFollowed = followedBack[senderId];

                        return (
                            <Link
                                key={noti.notification_id || noti.requestId || idx}
                                to={getNotificationLink(noti)}
                                onClick={() => noti.notification_id && !noti.is_read && handleMarkRead(noti.notification_id)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 ${!noti.is_read ? "bg-blue-50 hover:bg-blue-100" : ""
                                    }`}>
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={noti.sender?.url_avt || `https://ui-avatars.com/api/?name=${encodeURIComponent(noti.sender?.name || "U")}&background=random`}
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

                                {/* Follow Back button */}
                                {isFollowType && (
                                    alreadyFollowed ? (
                                        <span className="flex-shrink-0 bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-2 rounded-lg">
                                            Đã theo dõi
                                        </span>
                                    ) : (
                                        <button
                                            onClick={(e) => handleFollowBack(senderId, noti.requestId, e)}
                                            className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                                            Theo dõi lại
                                        </button>
                                    )
                                )}

                                {/* Unread dot (for non-follow notifications) */}
                                {!isFollowType && !noti.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
