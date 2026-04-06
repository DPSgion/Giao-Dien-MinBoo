import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { notificationService } from "../../services/apiServices";
import websocketService from "../../services/websocketService";

import SearchModal from "../../pages/Search/SearchModal";

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [unread, setUnread] = useState({ notifications: 0, messages: 0 });
    const [showSearch, setShowSearch] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        // Kết nối WebSocket khi đăng nhập
        const token = localStorage.getItem("access_token");
        if (token) {
            websocketService.connect(token);
            // [WS Server -> Client] new_notification - Nhận thông báo mới
            websocketService.on("new_notification", () => {
                setUnread((prev) => ({ ...prev, notifications: prev.notifications + 1 }));
            });
            // [WS Server -> Client] new_message - Nhận tin nhắn mới
            websocketService.on("new_message", () => {
                setUnread((prev) => ({ ...prev, messages: prev.messages + 1 }));
            });
        }
        fetchUnreadCount();
        return () => websocketService.disconnect();
    }, []);

    // [API 11.4] GET /notifications/unread-count
    const fetchUnreadCount = async () => {
        try {
            const res = await notificationService.getUnreadCount();
            setUnread({
                notifications: res.data.notifications_unread,
                messages: res.data.messages_unread,
            });
        } catch (_) { }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        {
            path: "/", label: "Trang chủ",
            icon: (active) => active
                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9.005 16.545a2.997 2.997 0 012.997-2.997A2.997 2.997 0 0115 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
        },
        {
            path: "/messages", label: "Tin nhắn", badge: unread.messages,
            icon: (active) => active
                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
        },
        {
            path: "/friends", label: "Bạn bè",
            icon: (active) => <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
        },
        {
            path: "/notifications", label: "Thông báo", badge: unread.notifications,
            icon: (active) => active
                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>,
        },
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full border-r border-gray-200 bg-white z-40 flex flex-col transition-all duration-300 ${collapsed || showSearch ? "w-20" : "w-64"
                    }`}
            >
                {/* Logo */}
                <div className="px-6 py-5 mb-3">
                    {collapsed || showSearch ? (
                        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">M</span>
                        </div>
                    ) : (
                        <span className="text-2xl font-bold" style={{ fontFamily: "'Dancing Script', cursive" }}>
                            MinBoo
                        </span>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 space-y-1">
                    {/* Search button */}
                    <button
                        onClick={() => { setShowSearch(!showSearch); setCollapsed(!collapsed); }}
                        className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors ${showSearch ? "font-semibold" : ""}`}
                    >
                        <div className="relative flex-shrink-0">
                            {showSearch
                                ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            }
                        </div>
                        {!collapsed && !showSearch && <span className="text-sm">Tìm kiếm</span>}
                    </button>

                    {navItems.map(({ path, label, icon, badge }) => (
                        <Link key={path} to={path}
                            className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors ${isActive(path) ? "font-bold" : "font-normal"
                                }`}>
                            <div className="relative flex-shrink-0">
                                {icon(isActive(path))}
                                {badge > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                        {badge > 9 ? "9+" : badge}
                                    </span>
                                )}
                            </div>
                            {!collapsed && !showSearch && <span className="text-sm">{label}</span>}
                        </Link>
                    ))}

                    {/* Create Post */}
                    <Link to="/create"
                        className={`flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors ${isActive("/create") ? "font-bold" : "font-normal"
                            }`}>
                        <div className="flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </div>
                        {!collapsed && !showSearch && <span className="text-sm">Tạo bài viết</span>}
                    </Link>
                </nav>

                {/* Profile & More */}
                <div className="px-3 pb-5 space-y-1">
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors relative"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 flex-shrink-0">
                            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                        {!collapsed && !showSearch && <span className="text-sm">Thêm</span>}
                    </button>

                    <Link to={`/profile/${user?.user_id || user?.id || 'me'}`}
                        className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                        {(user?.url_avt || user?.avatar) && !(user?.url_avt || user?.avatar || "").includes("default-avatar-url") ? (
                            <img
                                src={user?.url_avt || user?.avatar}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                alt={user?.name || 'User'}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#8e8e8e">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        )}
                        {!collapsed && !showSearch && (
                            <div className="text-left">
                                <p className="text-sm font-semibold truncate w-32">{user?.username || user?.name || 'Người dùng'}</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* More menu popup */}
                {showMoreMenu && (
                    <div className="absolute bottom-24 left-4 bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-56 z-50">
                        <button onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-red-500 font-semibold">
                            Đăng xuất
                        </button>
                    </div>
                )}
            </aside>

            {/* Search Modal */}
            {showSearch && <SearchModal onClose={() => { setShowSearch(false); setCollapsed(false); }} />}

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed || showSearch ? "ml-20" : "ml-64"}`}>
                {children}
            </main>
        </div>
    );
}
