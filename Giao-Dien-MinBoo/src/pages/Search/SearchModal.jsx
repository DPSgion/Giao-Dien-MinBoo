import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { userService, friendService } from "../../services/apiServices";

export default function SearchModal({ onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recent, setRecent] = useState(() => {
        try { return JSON.parse(localStorage.getItem("recentSearch") || "[]"); } catch { return []; }
    });
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!query.trim()) { setResults([]); return; }
        debounceRef.current = setTimeout(() => doSearch(query), 400);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // ============================================================
    // [API 3.4] GET /users/search - Tìm kiếm user
    // Backend Java: UserController.searchUsers()
    // Query: { q, page: 1, limit: 20 }
    // ============================================================
    const doSearch = async (q) => {
        setLoading(true);
        try {
            const res = await userService.searchUsers({ q, page: 1, limit: 20 });
            const payload = res.data || res;
            
            // BE có thể trả về mảng trực tiếp, hoặc { users: [...] }, hoặc { content: [...] } (Spring Boot Page)
            let userList = [];
            if (Array.isArray(payload)) {
                userList = payload;
            } else {
                userList = payload.users || payload.content || [];
            }

            // Đồng bộ key do API thực tế dùng id, avatar
            const mappedUsers = userList.map(u => ({
                ...u,
                user_id: u.id || u.user_id,
                url_avt: u.avatar || u.url_avt,
            }));

            setResults(mappedUsers);
        } catch (err) {
            console.error("Search API Error:", err);
            // Hiện thử thông báo lỗi để debug xem BE trả về cái gì (404 Not Found hay 400 Bad Request)
            alert("Lỗi từ máy chủ: " + (err?.response?.data?.message || err.message || "Endpoint không hợp lệ"));
        } finally { setLoading(false); }
    };

    const saveRecent = (user) => {
        const updated = [user, ...recent.filter((r) => r.user_id !== user.user_id)].slice(0, 8);
        setRecent(updated);
        localStorage.setItem("recentSearch", JSON.stringify(updated));
    };

    const removeRecent = (userId) => {
        const updated = recent.filter((r) => r.user_id !== userId);
        setRecent(updated);
        localStorage.setItem("recentSearch", JSON.stringify(updated));
    };

    // ============================================================
    // [API 4.2] POST /friends/requests - Gửi lời mời kết bạn từ search
    // Backend Java: FriendController.sendFriendRequest()
    // ============================================================
    const handleAddFriend = async (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await friendService.sendRequest({ to_id_B: userId });
            setResults((prev) =>
                prev.map((u) => u.user_id === userId ? { ...u, is_friend: true } : u)
            );
        } catch (_) { }
    };

    const displayList = query.trim() ? results : recent;

    return (
        <div className="fixed left-20 top-0 h-full w-96 bg-white shadow-2xl z-30 flex flex-col border-r border-gray-200">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Tìm kiếm</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Search input */}
                <div className="relative">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm người dùng..."
                        className="w-full bg-gray-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    {query && (
                        <button onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <circle cx="12" cy="12" r="10" /><path fill="white" d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Section label */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">
                    {query ? `Kết quả tìm kiếm` : "Tìm kiếm gần đây"}
                </span>
                {!query && recent.length > 0 && (
                    <button onClick={() => { setRecent([]); localStorage.removeItem("recentSearch"); }}
                        className="text-xs text-blue-500 font-semibold hover:underline">
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Không tìm thấy kết quả cho "{query}"
                    </div>
                )}

                {!loading && !query && recent.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Chưa có tìm kiếm gần đây
                    </div>
                )}

                {!loading && displayList.map((user) => (
                    <Link
                        key={user.user_id}
                        to={`/profile/${user.user_id}`}
                        onClick={() => { saveRecent(user); onClose(); }}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="relative flex-shrink-0">
                            <img
                                src={user.url_avt || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=80`}
                                className="w-11 h-11 rounded-full object-cover"
                                alt={user.name}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.username || user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.name}</p>
                            {user.address && (
                                <p className="text-xs text-gray-300 truncate">{user.address}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!user.is_friend && (
                                <button
                                    onClick={(e) => handleAddFriend(e, user.user_id)}
                                    className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                                    Kết bạn
                                </button>
                            )}
                            {!query && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeRecent(user.user_id); }}
                                    className="text-gray-400 hover:text-gray-600 p-1">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {user.is_friend && (
                            <span className="text-xs text-green-500 font-medium flex-shrink-0">Bạn bè</span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
