import { useState, useEffect, useRef, useCallback } from "react";
import { postService, notificationService } from "../../services/apiServices";
import PostCard from "../../components/post/PostCard";
import StoryBar from "../../components/story/StoryBar";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const NOTI_ICONS = {
    friend_request: "👋",
    friend_accepted: "🤝",
    new_post: "📸",
    new_comment: "💬",
    new_reaction: "❤️",
    new_message: "✉️",
};

export default function Home() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Right sidebar activities
    const [activities, setActivities] = useState([]);
    
    const loadingRef = useRef(false);
    const bottomRef = useRef(null);

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
        } catch (_) { } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await notificationService.getNotifications({ page: 1, limit: 7 });
            const notiList = res?.notifications || res?.data?.notifications || [];
            // Filter to show mainly interactions or friend's posts
            setActivities(notiList.filter(n => n.type === 'new_post' || n.type === 'friend_request' || n.type === 'new_reaction' || n.type === 'new_comment').slice(0, 5));
        } catch (_) {}
    };

    useEffect(() => {
        fetchFeed(1);
        fetchActivities();
    }, [fetchFeed]);

    useEffect(() => {
        if (!hasMore) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loadingRef.current) {
                setPage((p) => {
                    const next = p + 1;
                    fetchFeed(next);
                    return next;
                });
            }
        }, { threshold: 0.1 });
        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, [hasMore, fetchFeed]);

    const handleDeletePost = async (postId) => {
        await postService.deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.post_id !== postId));
    };

    const timeAgoShort = (dateStr) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 60) return `${m}p`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h`;
        const d = Math.floor(h / 24);
        return `${d}d`;
    };

    const getActivityLabel = (type) => {
        if (type === 'new_post') return "đã đăng ảnh mới";
        if (type === 'friend_request') return "bắt đầu theo dõi bạn";
        if (type === 'new_comment') return "đã bình luận ảnh";
        if (type === 'new_reaction') return "đã thích bài viết";
        return "hoạt động mới";
    };

    return (
        <div className="flex justify-center gap-8 px-4 py-6 min-h-screen">
            <div className="w-full max-w-[470px]">
                <div className="mb-6">
                    <StoryBar />
                </div>

                {posts.map((post) => (
                    <PostCard key={post.post_id} post={post} onDelete={handleDeletePost} />
                ))}

                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Bạn đã xem hết tất cả bài viết 🎉
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-4">📸</div>
                        <p className="font-semibold text-lg mb-1">Chào mừng đến MinBoo!</p>
                        <p className="text-gray-500 text-sm">Kết bạn để xem bài viết của họ tại đây.</p>
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>

            <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6">
                    {/* User Mini Profile */}
                    <div className="flex items-center gap-3 mb-6">
                        <Link to={`/profile/${user?.user_id}`}>
                            <img
                                src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                className="w-12 h-12 rounded-full object-cover"
                                alt={user?.name}
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${user?.user_id}`} className="text-sm font-semibold hover:underline">
                                {user?.username || user?.name}
                            </Link>
                            <p className="text-xs text-gray-500">{user?.name}</p>
                        </div>
                    </div>

                    {/* Friend Activities - Bảng tin Sự kiện bạn bè bên Phải */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm font-semibold text-gray-500">Hoạt động bạn bè</p>
                            <Link to="/notifications" className="text-xs font-semibold text-gray-900 hover:text-gray-500">Xem tất cả</Link>
                        </div>
                        
                        {activities.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Chưa có hoạt động mới nào.</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((act) => (
                                    <div key={act.notification_id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="relative flex-shrink-0">
                                                <Link to={`/profile/${act.sender?.user_id}`}>
                                                    <img
                                                        src={act.sender?.url_avt || `https://ui-avatars.com/api/?name=${act.sender?.name}&background=random`}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        alt={act.sender?.name}
                                                    />
                                                </Link>
                                                <span className="absolute -bottom-1 -right-1 text-[10px] bg-white rounded-full">
                                                    {NOTI_ICONS[act.type] || "🔔"}
                                                </span>
                                            </div>
                                            <div className="truncate text-xs">
                                                <Link to={`/profile/${act.sender?.user_id}`} className="font-semibold text-gray-900 hover:underline">
                                                    {act.sender?.name}
                                                </Link>
                                                <span className="text-gray-500 ml-1 truncate">
                                                    {getActivityLabel(act.type)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2 group-hover:text-gray-500">{timeAgoShort(act.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Existing Header Suggestion */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-semibold text-gray-500">Gợi ý cho bạn</p>
                        <Link to="/friends" className="text-xs font-semibold hover:opacity-70">Xem tất cả</Link>
                    </div>

                    <p className="text-xs text-gray-400 mt-8 leading-relaxed">
                        Giới thiệu • Trợ giúp • Báo chí • API • Việc làm • Quyền riêng tư • Điều khoản • Vị trí • Ngôn ngữ <br/><br/>
                        © 2024 MINBOO FROM VIETNAM
                    </p>
                </div>
            </div>
        </div>
    );
}