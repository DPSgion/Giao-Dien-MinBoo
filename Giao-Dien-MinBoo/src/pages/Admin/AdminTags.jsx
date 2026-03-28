import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // [API 8.1] GET /tags
    adminService
      .getTags()
      .then((res) => setTags(res.data?.tags || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // [API 8.2] POST /tags
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.createTag(newTag.trim());
      setTags((prev) => [...prev, res.data]);
      setNewTag('');
      setSuccess(`Tag "#${res.data.tag_name}" đã được tạo thành công!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err?.error_code === 'CONFLICT' || err?.status === 409) {
        setError('Tag này đã tồn tại, vui lòng chọn tên khác.');
      } else {
        setError('Không thể tạo tag. Thử lại sau.');
      }
    } finally {
      setCreating(false);
    }
  };

  const TAG_COLORS = [
    '#7c3aed',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Quản lý Tags</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
          Tổng{' '}
          <span style={{ color: '#10b981' }} className="font-semibold">
            {tags.length}
          </span>{' '}
          tags
        </p>
      </div>

      {/* Create form */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#111118', border: '1px solid #1f1f2e' }}
      >
        <h3 className="text-white font-bold text-sm mb-4">Tạo tag mới</h3>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: '#4b5563' }}
            >
              #
            </span>
            <input
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setError('');
              }}
              placeholder="Tên tag mới..."
              maxLength={50}
              className="w-full rounded-xl pl-7 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
              style={{ background: '#1a1a24', border: '1px solid #1f1f2e' }}
              onFocus={(e) => (e.target.style.borderColor = '#10b981')}
              onBlur={(e) => (e.target.style.borderColor = '#1f1f2e')}
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newTag.trim()}
            className="text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40"
            style={{ background: '#10b981' }}
          >
            {creating ? 'Đang tạo...' : '+ Tạo tag'}
          </button>
        </form>

        {error && (
          <p
            className="text-xs mt-3 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p
            className="text-xs mt-3 px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            ✅ {success}
          </p>
        )}
        <p className="text-xs mt-3" style={{ color: '#4b5563' }}>
          Lưu ý: tag_name có ràng buộc UNIQUE — Backend trả 409 nếu trùng tên.
        </p>
      </div>

      {/* Tags grid */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#111118', border: '1px solid #1f1f2e' }}
      >
        <h3 className="text-white font-bold text-sm mb-4">
          Danh sách tags hiện có
        </h3>
        {loading ? (
          <div className="flex flex-wrap gap-3">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 rounded-full animate-pulse"
                  style={{ background: '#1f1f2e' }}
                />
              ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#4b5563' }}>
            Chưa có tag nào
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => {
              const color = TAG_COLORS[i % TAG_COLORS.length];
              return (
                <div
                  key={tag.tag_id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: color + '18',
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  <span>#</span>
                  <span>{tag.tag_name}</span>
                  <span className="text-xs opacity-50 font-normal">
                    ID:{tag.tag_id}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
