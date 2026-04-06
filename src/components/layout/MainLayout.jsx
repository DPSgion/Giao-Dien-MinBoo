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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      websocketService.connect(token);
      websocketService.on("new_notification", () =>
        setUnread((prev) => ({ ...prev, notifications: prev.notifications + 1 }))
      );
      websocketService.on("new_message", () =>
        setUnread((prev) => ({ ...prev, messages: prev.messages + 1 }))
      );
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
    } catch (_) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Khi search mở, sidebar thu nhỏ xuống icon
  const collapsed = showSearch;

  const navItems = [
    {
      path: "/", label: "Trang chủ",
      icon: (active) => active
        ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22" fill="currentColor"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      path: "/messages", label: "Tin nhắn", badge: unread.messages,
      icon: (active) => active
        ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    },
    {
      path: "/friends", label: "Bạn bè",
      icon: (active) => <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    {
      path: "/notifications", label: "Thông báo", badge: unread.notifications,
      icon: (active) => active
        ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── SIDEBAR ── */}
      <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-200
        ${collapsed ? "w-20" : "w-64"}
        bg-white border-r border-gray-200`}>

        {/* Gradient accent strip at top */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 flex-shrink-0" />

        {/* Logo */}
        <div className="px-5 py-4 mb-1 flex-shrink-0">
          {collapsed ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          ) : (
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Dancing Script', cursive" }}>
              MinBoo
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {/* Search */}
          <button
            onClick={() => setShowSearch((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
              ${showSearch
                ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-semibold"
                : "hover:bg-gray-100 text-gray-700"}`}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            {!collapsed && <span className="text-sm">Tìm kiếm</span>}
          </button>

          {navItems.map(({ path, label, icon, badge }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${isActive(path)
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-bold"
                  : "hover:bg-gray-100 text-gray-700 font-normal"}`}>
              <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {icon(isActive(path))}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          ))}

          {/* Create */}
          <Link to="/create"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all
              ${isActive("/create")
                ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-bold"
                : "hover:bg-gray-100 text-gray-700"}`}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            {!collapsed && <span className="text-sm">Tạo bài viết</span>}
          </Link>
        </nav>

        {/* Bottom: More + Profile */}
        <div className="px-3 pb-4 space-y-0.5 flex-shrink-0 border-t border-gray-100 pt-2">
          <div className="relative">
            <button onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 flex-shrink-0">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              {!collapsed && <span className="text-sm">Thêm</span>}
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-14 left-2 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 w-52 z-50">
                <Link to={`/profile/${user?.user_id}`}
                  onClick={() => setShowMoreMenu(false)}
                  className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                  Trang cá nhân
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 font-semibold hover:bg-red-50 transition-colors">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          <Link to={`/profile/${user?.user_id}`}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-6 h-6 flex-shrink-0">
              <img
                src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=6366f1&color=fff`}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-purple-200"
                alt={user?.name}
              />
            </div>
            {!collapsed && (
              <p className="text-sm font-semibold truncate w-32 text-gray-800">{user?.username || "Bạn"}</p>
            )}
          </Link>
        </div>
      </aside>

      {/* Search slide-in panel — không làm giật layout */}
      {showSearch && (
        <>
          {/* Overlay trong suốt để click ra ngoài đóng */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowSearch(false)}
          />
          <div className="fixed left-20 top-0 h-full w-96 bg-white shadow-2xl z-40 border-r border-gray-200"
            onClick={(e) => e.stopPropagation()}>
            <SearchModal onClose={() => setShowSearch(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all duration-200 ${collapsed ? "ml-20" : "ml-64"}`}>
        {children}
      </main>
    </div>
  );
}
