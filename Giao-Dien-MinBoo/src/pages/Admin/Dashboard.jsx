import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

function StatCard({ label, value, sub, icon, color, loading }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: '#111118', border: '1px solid #1f1f2e' }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
            {label}
          </p>
          <p className="text-3xl font-black text-white">
            {loading ? (
              <span className="opacity-30">...</span>
            ) : typeof value === 'number' ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: '#4b5563' }}>
              {sub}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="mt-3 h-1 rounded-full" style={{ background: '#1f1f2e' }}>
        <div
          className="h-full rounded-full w-3/4"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // [API 12.1] GET /admin/statistics
    adminService
      .getStatistics()
      .then((res) => setStats(res.data))
      .catch((e) => setError(e?.message || 'Không thể tải thống kê'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171',
          }}
        >
          ⚠️ {error} — Có thể bạn chưa có quyền Admin (role = 1) hoặc Backend
          chưa hoạt động.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats?.total_users ?? 0}
          sub="Tổng tài khoản"
          icon="👥"
          color="#7c3aed"
          loading={loading}
        />
        <StatCard
          label="Đang hoạt động"
          value={stats?.active_users ?? 0}
          sub="Tài khoản bình thường"
          icon="✅"
          color="#10b981"
          loading={loading}
        />
        <StatCard
          label="Bị khóa"
          value={stats?.banned_users ?? 0}
          sub="Tài khoản bị ban"
          icon="🔒"
          color="#ef4444"
          loading={loading}
        />
        <StatCard
          label="Tổng bài viết"
          value={stats?.total_posts ?? 0}
          sub="Đã được đăng"
          icon="📸"
          color="#ec4899"
          loading={loading}
        />
        <StatCard
          label="Báo cáo chờ"
          value={stats?.pending_reports ?? 0}
          sub="Cần xử lý"
          icon="🚨"
          color="#f59e0b"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            to: '/admin/users',
            label: 'Quản lý người dùng',
            desc: 'Xem, khóa, mở khóa tài khoản',
            icon: '👥',
            color: '#7c3aed',
          },
          {
            to: '/admin/users?filter=banned',
            label: 'Tài khoản bị khóa',
            desc: `${stats?.banned_users ?? 0} tài khoản bị ban`,
            icon: '🔒',
            color: '#ef4444',
          },
          {
            to: '/admin/reports',
            label: 'Xử lý báo cáo',
            desc: `${stats?.pending_reports ?? 0} báo cáo đang chờ`,
            icon: '🚨',
            color: '#f59e0b',
          },
          {
            to: '/admin/tags',
            label: 'Quản lý Tags',
            desc: 'Thêm, xóa thẻ tag bài viết',
            icon: '🏷️',
            color: '#10b981',
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02]"
            style={{ background: '#111118', border: '1px solid #1f1f2e' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = item.color + '60')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = '#1f1f2e')
            }
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: item.color + '20' }}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {item.label}
              </p>
              <p className="text-xs truncate" style={{ color: '#6b7280' }}>
                {item.desc}
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 flex-shrink-0 ml-auto"
              style={{ color: '#4b5563' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* System info */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#111118', border: '1px solid #1f1f2e' }}
      >
        <h3 className="text-white font-bold text-sm mb-4">
          Thông tin hệ thống
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Base URL', 'minboo-be.io.vn'],
            ['API Version', 'v1.1'],
            ['Auth', 'JWT Bearer'],
            ['Admin Role', 'role = 1'],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl p-3"
              style={{ background: '#1a1a24' }}
            >
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>
                {k}
              </p>
              <p className="text-sm font-mono text-white font-medium">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
