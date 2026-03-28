import { useState, useEffect } from 'react';
import { notificationService } from '../../services/apiServices';

import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

//
const navItems = [
  {
    path: '/admin',
    label: 'Tổng quan',
    exact: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/admin/users',
    label: 'Người dùng',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    path: '/admin/posts',
    label: 'Bài viết',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    path: '/admin/reports',
    label: 'Báo cáo vi phạm',
    hasBadge: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    path: '/admin/tags',
    label: 'Quản lý Tags',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export default function AdminLayout({ pendingReports = 0 }) {
  const { user, logout } = useAuth();
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setReportCount(res.data.total_unread || 0);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const currentPage = navItems.find((n) => isActive(n)) || navItems[0];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-200
        ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: '#111118', borderRight: '1px solid #1f1f2e' }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-4 flex-shrink-0`}
          style={{ borderBottom: '1px solid #1f1f2e' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              className="w-4 h-4"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-none">
                MinBoo
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#7c3aed' }}>
                Admin Panel
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                ${isActive(item) ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              style={
                isActive(item)
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
                      border: '1px solid rgba(124,58,237,0.3)',
                    }
                  : {}
              }
            >
              <div className="flex-shrink-0 relative">
                {item.icon}
                {/* {item.hasBadge && pendingReports > 0 && ( */}
                {item.hasBadge && reportCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                    {/* {pendingReports > 9 ? '9+' : pendingReports} */}
                    {reportCount > 9 ? '9+' : reportCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive(item) && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: '#7c3aed' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 mb-2" style={{ borderTop: '1px solid #1f1f2e' }} />

        {/* Bottom actions */}
        <div className="px-2 pb-3 space-y-0.5 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 transition-all"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1f1f2e')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 flex-shrink-0"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {!collapsed && <span className="text-sm">Về trang chủ</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:text-red-400 transition-all"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 flex-shrink-0"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!collapsed && (
              <span className="text-sm font-medium">Đăng xuất</span>
            )}
          </button>

          {/* Admin info */}
          <div
            className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl"
            style={{ background: '#1a1a24' }}
          >
            <img
              src={
                user?.url_avt ||
                `https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=7c3aed&color=fff`
              }
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              alt={user?.name}
              style={{ outline: '2px solid #7c3aed', outlineOffset: '1px' }}
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs" style={{ color: '#7c3aed' }}>
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'} flex flex-col min-h-screen`}
      >
        {/* Topbar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
          style={{
            background: 'rgba(17,17,24,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #1f1f2e',
          }}
        >
          <div>
            <h1 className="text-white font-black text-base">
              {currentPage.label}
            </h1>
            <p className="text-xs" style={{ color: '#4b5563' }}>
              MinBoo Management System
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#4b5563' }}>
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500">Online</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6"><Outlet /></div>
      </main>
    </div>
  );
}
