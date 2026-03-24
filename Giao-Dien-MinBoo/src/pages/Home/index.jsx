import { useState, useEffect, useRef, useCallback } from "react";
import { postService } from "../../services/apiServices";
import PostCard from "../../components/post/PostCard";
import StoryBar from "../../components/story/StoryBar";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        fetchFeed(1);
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
                    <div className="flex items-center gap-3 mb-6">
                        <Link to={`/profile/${user?.user_id}`}>
                            <img
                                src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                className="w-10 h-10 rounded-full object-cover"
                                alt={user?.name}
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${user?.user_id}`} className="text-sm font-semibold hover:underline">
                                {user?.username}
                            </Link>
                            <p className="text-xs text-gray-400">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-semibold text-gray-500">Gợi ý cho bạn</p>
                        <Link to="/friends" className="text-xs font-semibold hover:opacity-70">Xem tất cả</Link>
                    </div>

                    <p className="text-xs text-gray-400 mt-8">
                        © 2024 MinBoo. Made with ❤️ in Vietnam
                    </p>
                </div>
            </div>
        </div>
    );
}