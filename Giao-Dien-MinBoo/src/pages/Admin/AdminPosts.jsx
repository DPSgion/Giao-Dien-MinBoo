import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '../../services/adminService';
import { postService } from '../../services/apiServices';

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
      // Vì Frontend đang nối với backend production nên không có API getPendingPosts.
      // Dùng LocalStorage để giả lập kho chờ duyệt ở trang Frontend
      const pendingData = JSON.parse(localStorage.getItem("admin_pending_posts") || "[]");
      
      const limit = 12;
      const startIndex = (p - 1) * limit;
      const paginated = pendingData.slice(startIndex, startIndex + limit);
      
      if (p === 1) setPosts(paginated);
      else setPosts((prev) => [...prev, ...paginated]);
      
      setHasMore(paginated.length === limit);
    } catch (_) {
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          pageRef.current += 1;
          fetchPosts(pageRef.current);
        }
      },
      { threshold: 0.1 }
    );
    if (bottomRef.current) obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, [hasMore, fetchPosts]);

  const handleModeration = async (postId, status) => {
    setDeleting(true);
    try {
      // Bóc tách khỏi kho tạm Frontend
      let pendingData = JSON.parse(localStorage.getItem("admin_pending_posts") || "[]");
      const approvedPost = pendingData.find(p => p.post_id === postId);
      pendingData = pendingData.filter(p => p.post_id !== postId);
      localStorage.setItem("admin_pending_posts", JSON.stringify(pendingData));
      
      // Cập nhật UI ngay
      setPosts((prev) => prev.filter((p) => p.post_id !== postId));

      if (status === 1 && approvedPost) {
         // Thực hiện gọi createPost thật lên API production Backend!
         const formData = new FormData();
         if (approvedPost.content) formData.append("content", approvedPost.content);
         formData.append("privacy", approvedPost.privacy);
         
         if (approvedPost.tags) {
             approvedPost.tags.forEach(tag => formData.append("tag_ids", tag.tag_id));
         }

         if (approvedPost.url_img && approvedPost.url_img.startsWith("data:image")) {
             // Chuyển base64 URL thành File thực thụ để Backend tiếp nhận
             const res = await fetch(approvedPost.url_img);
             const blob = await res.blob();
             // Trích xuất MIME type từ blob (eg: image/png)
             const ext = blob.type.split('/')[1] || 'jpg';
             const file = new File([blob], `image.${ext}`, { type: blob.type });
             formData.append("url_img", file);
         }
         
         await postService.createPost(formData);
      }
      
      if (status === 1) {
          alert("✅ Đã phê duyệt và đẩy bài viết lên hệ thống Backend!");
      } else {
          alert("🚫 Đã từ chối bài viết vĩnh viễn!");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi xử lý bài viết: " + (e.message || e));
    } finally {
      setDeleting(false);
    }
  };

  const privacyStyle = (p) =>
    ({
      public: {
        bg: 'rgba(16,185,129,0.15)',
        color: '#34d399',
        border: 'rgba(16,185,129,0.3)',
        label: 'Công khai',
      },
      friends: {
        bg: 'rgba(59,130,246,0.15)',
        color: '#60a5fa',
        border: 'rgba(59,130,246,0.3)',
        label: 'Bạn bè',
      },
      private: {
        bg: '#1f1f2e',
        color: '#6b7280',
        border: '#2a2a38',
        label: 'Riêng tư',
      },
    })[p] || { bg: '#1f1f2e', color: '#6b7280', border: '#2a2a38', label: p };

  const timeAgo = (d) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}p trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h trước`;
    return `${Math.floor(h / 24)}d trước`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">Kiểm duyệt bài viết (18+ / Cảnh báo)</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
          Các bài viết chứa nội dung nhạy cảm hiển thị tại đây để Admin xét duyệt.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && posts.length === 0
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: '#111118', border: '1px solid #1f1f2e' }}
                >
                  <div className="h-44" style={{ background: '#1f1f2e' }} />
                  <div className="p-4 space-y-2">
                    <div
                      className="h-3 rounded w-3/4"
                      style={{ background: '#1f1f2e' }}
                    />
                    <div
                      className="h-2 rounded w-1/2"
                      style={{ background: '#161620' }}
                    />
                  </div>
                </div>
              ))
          : posts.map((post) => {
              const p = privacyStyle(post.privacy);
              return (
                <div
                  key={post.post_id}
                  className="rounded-2xl overflow-hidden group transition-all hover:scale-[1.01]"
                  style={{ background: '#111118', border: '1px solid #1f1f2e' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = '#2a2a38')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = '#1f1f2e')
                  }
                >
                  {/* Image */}
                  <div
                    className="h-44 relative overflow-hidden"
                    style={{ background: '#1a1a24' }}
                  >
                    {post.url_img ? (
                      <img
                        src={post.url_img}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        ⚠️
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <button
                        onClick={() => handleModeration(post.post_id, 1)}
                        className="px-4 py-2 w-36 rounded-xl text-sm font-bold text-white transition-colors hover:scale-105"
                        style={{ background: '#10b981' }}
                      >
                        ✅ Duyệt bài
                      </button>
                      <button
                        onClick={() => handleModeration(post.post_id, -1)}
                        className="px-4 py-2 w-36 rounded-xl text-sm font-bold text-white transition-colors hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.9)' }}
                      >
                        🚫 Cấm bài
                      </button>
                    </div>
                    {/* Privacy badge */}
                    <span
                      className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
                      style={{
                        background: p.bg,
                        color: p.color,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      {p.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={
                          post.author?.url_avt ||
                          `https://ui-avatars.com/api/?name=${post.author?.name}&background=7c3aed&color=fff&size=40`
                        }
                        className="w-6 h-6 rounded-full object-cover"
                        alt={post.author?.name}
                      />
                      <p
                        className="text-xs font-semibold"
                        style={{ color: '#a78bfa' }}
                      >
                        {post.author?.name}
                      </p>
                      <span
                        className="text-xs ml-auto"
                        style={{ color: '#4b5563' }}
                      >
                        {timeAgo(post.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-white line-clamp-2 mb-3">
                      {post.content || (
                        <span style={{ color: '#4b5563' }}>
                          (Không có nội dung)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex gap-3 text-xs"
                        style={{ color: '#4b5563' }}
                      >
                        <span>❤️ {post.reaction_count || 0}</span>
                        <span>💬 {post.comment_count || 0}</span>
                      </div>
                      <button
                        onClick={() => handleModeration(post.post_id, -1)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}
                      >
                        Cấm bài
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-purple-500 animate-spin"
            style={{ borderColor: '#1f1f2e', borderTopColor: '#7c3aed' }}
          />
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
