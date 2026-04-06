import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { friendService } from "../../services/apiServices";

export default function Friends() {
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState({ received: [], sent: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "friends") fetchFriends();
    if (tab === "requests") fetchPending();
  }, [tab]);

  // ============================================================
  // [API 4.1] GET /users/me/friends - Danh sách bạn bè
  // Backend Java: FriendController.getFriends()
  // Query: { page, limit, search? }
  // ============================================================
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await friendService.getFriends("me", { page: 1, limit: 50, search });
      setFriends(res.data.friends || []);
    } catch (_) {} finally { setLoading(false); }
  };

  // ============================================================
  // [API 4.6] GET /friends/requests/pending - Lời mời đang chờ
  // Backend Java: FriendController.getPendingRequests()
  // Response: { received: [...], sent: [...] }
  // ============================================================
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await friendService.getPendingRequests();
      setPending(res.data);
    } catch (_) {} finally { setLoading(false); }
  };

  // ============================================================
  // [API 4.3] PATCH /friends/requests/{id}/accept - Chấp nhận
  // Backend Java: FriendController.acceptRequest()
  // ============================================================
  const handleAccept = async (friendRequestId, user) => {
    try {
      await friendService.acceptRequest(friendRequestId);
      setPending((prev) => ({
        ...prev,
        received: prev.received.filter((r) => r.friend_request_id !== friendRequestId),
      }));
      setFriends((prev) => [...prev, { ...user }]);
    } catch (_) {}
  };

  // ============================================================
  // [API 4.4] DELETE /friends/requests/{id} - Từ chối / hủy
  // Backend Java: FriendController.deleteRequest()
  // ============================================================
  const handleDecline = async (friendRequestId, isSent = false) => {
    try {
      await friendService.deleteRequest(friendRequestId);
      if (isSent) {
        setPending((prev) => ({
          ...prev,
          sent: prev.sent.filter((r) => r.friend_request_id !== friendRequestId),
        }));
      } else {
        setPending((prev) => ({
          ...prev,
          received: prev.received.filter((r) => r.friend_request_id !== friendRequestId),
        }));
      }
    } catch (_) {}
  };

  // ============================================================
  // [API 4.5] DELETE /friends/{user_id} - Hủy kết bạn
  // Backend Java: FriendController.unfriend()
  // ============================================================
  const handleUnfriend = async (userId) => {
    if (!confirm("Hủy kết bạn?")) return;
    try {
      await friendService.unfriend(userId);
      setFriends((prev) => prev.filter((f) => f.user_id !== userId));
    } catch (_) {}
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[700px] mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Bạn bè</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[["friends", "Bạn bè"], ["requests", "Lời mời kết bạn"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === val ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {label}
            {val === "requests" && pending.received?.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {pending.received.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search (friends tab) */}
      {tab === "friends" && (
        <div className="relative mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchFriends()}
            placeholder="Tìm kiếm bạn bè..."
            className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Friends list */}
      {tab === "friends" && !loading && (
        <>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-medium">Chưa có bạn bè nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredFriends.map((friend) => (
                <div key={friend.user_id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                  <Link to={`/profile/${friend.user_id}`} className="relative">
                    <img
                      src={friend.url_avt || `https://ui-avatars.com/api/?name=${friend.name}&background=random&size=100`}
                      className="w-20 h-20 rounded-full object-cover"
                      alt={friend.name}
                    />
                    {friend.is_online && (
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </Link>
                  <div className="text-center">
                    <Link to={`/profile/${friend.user_id}`}
                      className="font-semibold text-sm hover:underline line-clamp-1">
                      {friend.name}
                    </Link>
                    {friend.address && (
                      <p className="text-xs text-gray-400 mt-0.5">{friend.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnfriend(friend.user_id)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-1.5 rounded-lg transition-colors">
                    Hủy kết bạn
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Friend requests */}
      {tab === "requests" && !loading && (
        <div className="space-y-6">
          {/* Received */}
          {pending.received?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">
                LỜI MỜI NHẬN ĐƯỢC ({pending.received.length})
              </h3>
              <div className="space-y-3">
                {pending.received.map((req) => (
                  <div key={req.friend_request_id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Link to={`/profile/${req.from_user?.user_id}`}>
                      <img
                        src={req.from_user?.url_avt || `https://ui-avatars.com/api/?name=${req.from_user?.name}&background=random`}
                        className="w-12 h-12 rounded-full object-cover"
                        alt={req.from_user?.name}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${req.from_user?.user_id}`}
                        className="font-semibold text-sm hover:underline block">
                        {req.from_user?.name}
                      </Link>
                      {req.message && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">"{req.message}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{formatTime(req.created_at)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(req.friend_request_id, req.from_user)}
                        className="bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleDecline(req.friend_request_id)}
                        className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent */}
          {pending.sent?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">
                ĐÃ GỬI LỜI MỜI ({pending.sent.length})
              </h3>
              <div className="space-y-3">
                {pending.sent.map((req) => (
                  <div key={req.friend_request_id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Link to={`/profile/${req.to_user?.user_id}`}>
                      <img
                        src={req.to_user?.url_avt || `https://ui-avatars.com/api/?name=${req.to_user?.name}&background=random`}
                        className="w-12 h-12 rounded-full object-cover"
                        alt={req.to_user?.name}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${req.to_user?.user_id}`}
                        className="font-semibold text-sm hover:underline block">
                        {req.to_user?.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Đang chờ phản hồi • {formatTime(req.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDecline(req.friend_request_id, true)}
                      className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                      Hủy lời mời
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.received?.length === 0 && pending.sent?.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">✉️</div>
              <p>Không có lời mời kết bạn nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}
