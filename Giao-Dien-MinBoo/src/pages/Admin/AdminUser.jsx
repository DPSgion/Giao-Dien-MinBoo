import { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async (s = '', active = 'all', p = 1) => {
    setLoading(true);
    try {
      // [API 12.2.1] GET /admin/users
      const params = { page: p, limit: 15, search: s || undefined };
      if (active !== 'all') params.is_active = active === 'true';
      const res = await adminService.getUsers(params);
      setUsers(res.data?.users || []);
      setPagination(res.data?.pagination || { total: 0 });
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, filterActive, 1);
  };

  const handleFilterChange = (val) => {
    setFilterActive(val);
    setPage(1);
    fetchUsers(search, val, 1);
  };

  // [API 12.2.2] PATCH /admin/users/{user_id}/status
  const handleToggleStatus = async (userId, currentStatus) => {
    setTogglingId(userId);
    try {
      await adminService.updateUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_active: !currentStatus } : u
        )
      );
    } catch (_) {
    } finally {
      setTogglingId(null);
    }
  };

  const card = (bg, border) => ({
    background: bg,
    border: `1px solid ${border}`,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">Người dùng</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Tổng{' '}
            <span style={{ color: '#7c3aed' }} className="font-semibold">
              {pagination.total?.toLocaleString()}
            </span>{' '}
            tài khoản
          </p>
        </div>
        {/* Filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: '#1a1a24', border: '1px solid #1f1f2e' }}
        >
          {[
            ['all', 'Tất cả'],
            ['true', 'Hoạt động'],
            ['false', 'Bị khóa'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => handleFilterChange(v)}
              className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
              style={
                filterActive === v
                  ? { background: '#7c3aed', color: 'white' }
                  : { color: '#6b7280' }
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: '#4b5563' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, username, email, SĐT..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
            style={{ background: '#111118', border: '1px solid #1f1f2e' }}
            onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
            onBlur={(e) => (e.target.style.borderColor = '#1f1f2e')}
          />
        </div>
        <button
          type="submit"
          className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          style={{ background: '#7c3aed' }}
          onMouseEnter={(e) => (e.target.style.background = '#6d28d9')}
          onMouseLeave={(e) => (e.target.style.background = '#7c3aed')}
        >
          Tìm
        </button>
      </form>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={card('#111118', '#1f1f2e')}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1f1f2e' }}>
                {[
                  'Người dùng',
                  'Email',
                  'Ngày tham gia',
                  'Role',
                  'Trạng thái',
                  'Thao tác',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#4b5563' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1a24' }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div
                            className="w-9 h-9 rounded-full"
                            style={{ background: '#1f1f2e' }}
                          />
                          <div className="space-y-1.5">
                            <div
                              className="h-3 rounded w-28"
                              style={{ background: '#1f1f2e' }}
                            />
                            <div
                              className="h-2 rounded w-20"
                              style={{ background: '#161620' }}
                            />
                          </div>
                        </div>
                      </td>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-5 py-3">
                          <div
                            className="h-3 rounded w-20"
                            style={{ background: '#1f1f2e' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16"
                    style={{ color: '#4b5563' }}
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #1a1a24' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#16161f')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.url_avt ||
                            `https://ui-avatars.com/api/?name=${u.name}&background=7c3aed&color=fff&size=64`
                          }
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          alt={u.name}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {u.name}
                          </p>
                          <p className="text-xs" style={{ color: '#4b5563' }}>
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-5 py-3 text-sm"
                      style={{ color: '#6b7280' }}
                    >
                      {u.email || '—'}
                    </td>
                    <td
                      className="px-5 py-3 text-sm"
                      style={{ color: '#6b7280' }}
                    >
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={
                          u.role === 1
                            ? {
                              background: 'rgba(124,58,237,0.2)',
                              color: '#a78bfa',
                              border: '1px solid rgba(124,58,237,0.3)',
                            }
                            : {
                              background: '#1f1f2e',
                              color: '#6b7280',
                              border: '1px solid #2a2a38',
                            }
                        }
                      >
                        {u.role === 1 ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={
                          u.is_active
                            ? {
                              background: 'rgba(16,185,129,0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16,185,129,0.3)',
                            }
                            : {
                              background: 'rgba(239,68,68,0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                            }
                        }
                      >
                        {u.is_active ? '● Hoạt động' : '● Bị khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        disabled={togglingId === u.user_id || u.role === 1}
                        onClick={() =>
                          handleToggleStatus(u.user_id, u.is_active)
                        }
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={
                          u.is_active
                            ? {
                              background: 'rgba(239,68,68,0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.3)',
                            }
                            : {
                              background: 'rgba(16,185,129,0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16,185,129,0.3)',
                            }
                        }
                      >
                        {togglingId === u.user_id
                          ? '...'
                          : u.is_active
                            ? '🔒 Khóa'
                            : '🔓 Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 15 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid #1f1f2e' }}
          >
            <p className="text-xs" style={{ color: '#4b5563' }}>
              Trang {page} • {pagination.total} tổng
            </p>
            <div className="flex gap-2">
              {[
                ['← Trước', -1],
                ['Sau →', 1],
              ].map(([label, dir]) => (
                <button
                  key={label}
                  disabled={dir === -1 ? page <= 1 : users.length < 15}
                  onClick={() => {
                    const p = page + dir;
                    setPage(p);
                    fetchUsers(search, filterActive, p);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: '#1a1a24',
                    color: '#9ca3af',
                    border: '1px solid #1f1f2e',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
