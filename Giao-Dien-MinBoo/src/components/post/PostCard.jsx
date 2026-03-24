import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { reactionService, commentService } from "../../services/apiServices";

// Emoji map cho reaction types
const REACTION_EMOJIS = {
    like: "👍", love: "❤️", haha: "😂", sad: "😢", angry: "😡",
};
const REACTION_COLORS = {
    like: "text-blue-500", love: "text-red-500", haha: "text-yellow-500",
    sad: "text-yellow-600", angry: "text-orange-500",
};

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth();
    const [showReactions, setShowReactions] = useState(false);
    const [currentReaction, setCurrentReaction] = useState(post.my_reaction || null);
    const [reactionCount, setReactionCount] = useState(post.reaction_count || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [loadingComment, setLoadingComment] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    let reactionTimer;

    // ============================================================
    // [API 7.1] POST /posts/{post_id}/reactions - React bài viết
    // [API 7.2] DELETE /posts/{post_id}/reactions - Xóa reaction
    // Backend Java: ReactionController
    // ============================================================
    const handleReact = async (type) => {
        setShowReactions(false);
        try {
            if (currentReaction === type) {
                // Xóa reaction nếu click cùng loại
                await reactionService.removeReaction(post.post_id);
                setCurrentReaction(null);
                setReactionCount((c) => Math.max(0, c - 1));
            } else {
                await reactionService.reactPost(post.post_id, type);
                if (!currentReaction) setReactionCount((c) => c + 1);
                setCurrentReaction(type);
            }
        } catch (_) { }
    };

    // ============================================================
    // [API 6.1] GET /posts/{post_id}/comments - Lấy bình luận
    // Backend Java: CommentController.getComments()
    // ============================================================
    const loadComments = async () => {
        if (showComments) return setShowComments(false);
        try {
            const res = await commentService.getComments(post.post_id);
            setComments(res.data.comments || []);
            setShowComments(true);
        } catch (_) { }
    };

    // ============================================================
    // [API 6.2] POST /posts/{post_id}/comments - Thêm bình luận
    // Backend Java: CommentController.addComment()
    // ============================================================
    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setLoadingComment(true);
        try {
            const res = await commentService.addComment(post.post_id, { content: newComment });
            setComments((prev) => [...prev, res.data]);
            setCommentCount((c) => c + 1);
            setNewComment("");
        } catch (_) { } finally {
            setLoadingComment(false);
        }
    };

    // ============================================================
    // [API 5.5] DELETE /posts/{post_id} - Xóa bài viết
    // Backend Java: PostController.deletePost()
    // ============================================================
    const handleDelete = async () => {
        if (!confirm("Xóa bài viết này?")) return;
        try {
            await onDelete(post.post_id);
        } catch (_) { }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return "Vừa xong";
        if (m < 60) return `${m} phút trước`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h} giờ trước`;
        return `${Math.floor(h / 24)} ngày trước`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-sm mb-6 max-w-[470px] w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <Link to={`/profile/${post.author?.user_id}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                        <img
                            src={post.author?.url_avt || `https://ui-avatars.com/api/?name=${post.author?.name}&background=random`}
                            className="w-full h-full rounded-full object-cover border-2 border-white"
                            alt={post.author?.name}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">{post.author?.name}</p>
                        <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
                    </div>
                </Link>
                {post.author?.user_id === user?.user_id && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500 hover:text-gray-700 p-1">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                            </svg>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 bg-white shadow-xl rounded-xl border border-gray-100 py-2 w-40 z-10">
                                <button onClick={handleDelete}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 font-semibold hover:bg-gray-50">
                                    Xóa
                                </button>
                                <Link to={`/edit-post/${post.post_id}`}
                                    className="block px-4 py-2 text-sm hover:bg-gray-50">
                                    Chỉnh sửa
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image */}
            {post.url_img && (
                <img src={post.url_img} className="w-full aspect-square object-cover" alt="post" />
            )}

            {/* Actions */}
            <div className="px-4 py-2">
                <div className="flex items-center gap-4 mb-2">
                    {/* Reaction button */}
                    <div className="relative"
                        onMouseEnter={() => { clearTimeout(reactionTimer); setShowReactions(true); }}
                        onMouseLeave={() => { reactionTimer = setTimeout(() => setShowReactions(false), 500); }}>
                        <button
                            className={`flex items-center gap-1 hover:opacity-70 transition-all ${currentReaction ? REACTION_COLORS[currentReaction] : ""
                                }`}
                            onClick={() => handleReact(currentReaction || "like")}
                        >
                            {currentReaction ? (
                                <span className="text-xl">{REACTION_EMOJIS[currentReaction]}</span>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                </svg>
                            )}
                        </button>

                        {/* Reaction picker */}
                        {showReactions && (
                            <div className="absolute bottom-8 -left-2 flex gap-1 bg-white rounded-full shadow-xl border border-gray-200 px-3 py-2 z-20">
                                {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                                    <button key={type} onClick={() => handleReact(type)}
                                        className="text-2xl hover:scale-125 transition-transform" title={type}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment button */}
                    <button onClick={loadComments} className="hover:opacity-70 transition-opacity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </button>

                    {/* Share button */}
                    <button className="hover:opacity-70 transition-opacity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>

                {/* Reaction count */}
                {reactionCount > 0 && (
                    <p className="text-sm font-semibold mb-1">{reactionCount} lượt thích</p>
                )}

                {/* Caption */}
                {post.content && (
                    <p className="text-sm mb-1">
                        <Link to={`/profile/${post.author?.user_id}`} className="font-semibold mr-1">
                            {post.author?.name}
                        </Link>
                        {post.content}
                    </p>
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                        {post.tags.map((tag) => (
                            <span key={tag.tag_id} className="text-blue-500 text-xs">#{tag.tag_name}</span>
                        ))}
                    </div>
                )}

                {/* Comment count */}
                {commentCount > 0 && (
                    <button onClick={loadComments} className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
                        Xem tất cả {commentCount} bình luận
                    </button>
                )}

                {/* Comments list */}
                {showComments && (
                    <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
                        {comments.map((c) => (
                            <div key={c.comment_id} className="text-sm">
                                <Link to={`/profile/${c.author?.user_id}`} className="font-semibold mr-1">
                                    {c.author?.name}
                                </Link>
                                {c.content}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comment input */}
            <form onSubmit={handleComment} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                <img
                    src={user?.url_avt || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                    className="w-7 h-7 rounded-full object-cover"
                    alt={user?.name}
                />
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Thêm bình luận..."
                    className="flex-1 text-sm outline-none placeholder-gray-400"
                />
                {newComment.trim() && (
                    <button type="submit" disabled={loadingComment}
                        className="text-blue-500 font-semibold text-sm disabled:opacity-50">
                        Đăng
                    </button>
                )}
            </form>
        </div>
    );
}
