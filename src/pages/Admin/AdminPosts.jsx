import { useState, useEffect, useCallback, useRef } from "react";
import adminService from "../../services/adminService";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const bottomRef = useRef(null);

  const fetchPosts = useCallback(async (p = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      // Dùng /posts/feed vì admin chưa có endpoint riêng lấy tất cả posts
      // Khi Backend bổ sung GET /admin/posts thì đổi sang adminService.getPosts()
      const { postService } = await import("../../services/apiServices");
      const res = await postService.getFeed({ page: p, limit: 12 });
      const newPosts = res.data?.posts || [];
      if (p === 1) setPosts(newPosts);
      else setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 12);
    } catch (_) {} finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingRef.current) {
        pageRef.current += 1;
        fetchPosts(pageRef.current);
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, [hasMore, fetchPosts]);

  // [API 12.3.1] DELETE /admin/posts/{post_id}
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deletePost(deleteId);
      setPosts((prev) => prev.filter((p) => p.post_id !== deleteId));
      setDeleteId(null);
    } catch (_) {} finally { setDeleting(false); }
  };

  const privacyStyle = (p) => ({
    public: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)", label: "Công khai" },
    friends: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "rgba(59,130,246,0.3)", label: "Bạn bè" },
    private: { bg: "#1f1f2e", color: "#6b7280", border: "#2a2a38", label: "Riêng tư" },
  }[p] || { bg: "#1f1f2e", color: "#6b7280", border: "#2a2a38", label: p });

  const timeAgo = (d) => {
    if (!d) return "";
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}p trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h trước`;
    return `${Math.floor(h / 24)}d trước`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">Kiểm duyệt bài viết</h2>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
          Admin có thể xóa bài viết bất kỳ bỏ qua quyền tác giả
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && posts.length === 0 ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
            style={{ background: "#111118", border: "1px solid #1f1f2e" }}>
            <div className="h-44" style={{ background: "#1f1f2e" }} />
            <div className="p-4 space-y-2">
              <div className="h-3 rounded w-3/4" style={{ background: "#1f1f2e" }} />
              <div className="h-2 rounded w-1/2" style={{ background: "#161620" }} />
            </div>
          </div>
        )) : posts.map((post) => {
          const p = privacyStyle(post.privacy);
          return (
            <div key={post.post_id} className="rounded-2xl overflow-hidden group transition-all hover:scale-[1.01]"
              style={{ background: "#111118", border: "1px solid #1f1f2e" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2a2a38"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1f1f2e"}>
              {/* Image */}
              <div className="h-44 relative overflow-hidden" style={{ background: "#1a1a24" }}>
                {post.url_img
                  ? <img src={post.url_img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>
                }
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setDeleteId(post.post_id)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
                    style={{ background: "rgba(239,68,68,0.9)" }}>
                    🗑️ Xóa bài viết
                  </button>
                </div>
                {/* Privacy badge */}
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
                  style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
                  {p.label}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.author?.url_avt || `https://ui-avatars.com/api/?name=${post.author?.name}&background=7c3aed&color=fff&size=40`}
                    className="w-6 h-6 rounded-full object-cover"
                    alt={post.author?.name}
                  />
                  <p className="text-xs font-semibold" style={{ color: "#a78bfa" }}>{post.author?.name}</p>
                  <span className="text-xs ml-auto" style={{ color: "#4b5563" }}>{timeAgo(post.created_at)}</span>
                </div>
                <p className="text-sm text-white line-clamp-2 mb-3">
                  {post.content || <span style={{ color: "#4b5563" }}>(Không có nội dung)</span>}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs" style={{ color: "#4b5563" }}>
                    <span>❤️ {post.reaction_count || 0}</span>
                    <span>💬 {post.comment_count || 0}</span>
                  </div>
                  <button onClick={() => setDeleteId(post.post_id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-t-purple-500 animate-spin" style={{ borderColor: "#1f1f2e", borderTopColor: "#7c3aed" }} />
        </div>
      )}

      <div ref={bottomRef} className="h-4" />

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setDeleteId(null)}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            style={{ background: "#111118", border: "1px solid #2a2a38" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-white font-black text-lg mb-2">Xóa bài viết?</h3>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60"
                style={{ background: "#ef4444" }}>
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "#1a1a24", color: "#9ca3af", border: "1px solid #2a2a38" }}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
