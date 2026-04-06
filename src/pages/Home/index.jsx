import { useState, useEffect, useRef, useCallback } from "react";
import { postService, friendService } from "../../services/apiServices";
import PostCard from "../../components/post/PostCard";
import StoryBar from "../../components/story/StoryBar";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const loadingRef = useRef(false);
  const bottomRef = useRef(null);
  const pageRef = useRef(1);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await postService.getFeed({ page: pageNum, limit: 10 });
      const newPosts = res.data?.posts || [];
      if (pageNum === 1) setPosts(newPosts);
      else setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
    } catch (_) {} finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
    // [API 4.1] Lấy bạn bè để hiển thị gợi ý
    friendService.getFriends("me", { limit: 5 })
      .then((res) => setSuggestions(res.data?.friends || []))
      .catch(() => {});
  }, [fetchFeed]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingRef.current) {
        pageRef.current += 1;
        fetchFeed(pageRef.current);
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, fetchFeed]);

  const handleDeletePost = async (postId) => {
    await postService.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.post_id !== postId));
  };

  return (
    <div className="flex justify-center gap-8 px-4 py-6 min-h-screen">
      {/* ── FEED ── */}
      <div className="w-full max-w-[470px]">
        <div className="mb-6"><StoryBar /></div>

        {posts.map((post) => (
          <PostCard key={post.post_id} post={post} onDelete={handleDeletePost} />
        ))}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">Bạn đã xem hết 🎉</div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-red-400 to-purple-500 flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
            <p className="font-bold text-lg mb-1">Chào mừng đến MinBoo!</p>
            <p className="text-gray-400 text-sm">Kết bạn để xem bài viết của họ tại đây.</p>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6 space-y-4">

          {/* User card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Gradient banner */}
            <div className="h-14 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300" />
            <div className="px-4 pb-4 -mt-7">
              <Link to={`/profile/${user?.user_id}`}>
                <img
                  src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=6366f1&color=fff&size=80`}
                  className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md"
                  alt={user?.name}
                />
              </Link>
              <div className="mt-2">
                <Link to={`/profile/${user?.user_id}`} className="font-bold text-sm hover:underline block">
                  {user?.username || "testuser"}
                </Link>
                <p className="text-xs text-gray-400">{user?.name || "Test User"}</p>
                {user?.address && (
                  <p className="text-xs text-gray-400 mt-0.5">📍 {user.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-700">Gợi ý cho bạn</p>
              <Link to="/friends" className="text-xs font-semibold text-purple-500 hover:text-purple-700">
                Xem tất cả
              </Link>
            </div>

            {suggestions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Chưa có gợi ý</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div key={s.user_id} className="flex items-center gap-3">
                    <img
                      src={s.url_avt || `https://ui-avatars.com/api/?name=${s.name}&background=random&size=64`}
                      className="w-9 h-9 rounded-full object-cover"
                      alt={s.name}
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${s.user_id}`} className="text-xs font-semibold hover:underline block truncate">
                        {s.name}
                      </Link>
                      <p className="text-xs text-gray-400 truncate">{s.address || "MinBoo"}</p>
                    </div>
                    <Link to={`/profile/${s.user_id}`}
                      className="text-xs text-purple-500 font-semibold hover:text-purple-700 whitespace-nowrap">
                      Xem
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-1">
            <p className="text-xs text-gray-300">© 2024 MinBoo · Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </div>
    </div>
  );
}
