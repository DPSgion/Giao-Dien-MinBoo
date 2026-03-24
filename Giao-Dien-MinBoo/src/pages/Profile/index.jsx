import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userService, friendService, postService } from "../../services/apiServices";
import PostCard from "../../components/post/PostCard";

// friend_request_status: 0 = chưa kết bạn, 1 = đã gửi lời mời, 2 = đã là bạn
export default function Profile() {
    const { userId } = useParams();
    const { user: me, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    const isMe = userId === me?.user_id || userId === "me";
    const targetId = isMe ? "me" : userId;

    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, [userId]);

    // ============================================================
    // [API 3.1] GET /users/{user_id} - Lấy thông tin profile
    // Backend Java: UserController.getUserById()
    // ============================================================
    const fetchProfile = async () => {
        try {
            const res = await userService.getUser(targetId);
            setProfile(res.data);
            setEditForm({
                address: res.data.address || "",
                birth: res.data.birth || "",
                sex: res.data.sex || "",
                email: res.data.email || "",
                sdt: res.data.sdt || "",
            });
        } catch (_) { } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // [API 5.2] GET /users/{user_id}/posts - Bài viết của user
    // Backend Java: PostController.getUserPosts()
    // ============================================================
    const fetchPosts = async () => {
        try {
            const res = await postService.getUserPosts(targetId);
            setPosts(res.data.posts || []);
        } catch (_) { }
    };

    // ============================================================
    // [API 3.3] POST /users/me/avatar - Upload avatar
    // Backend Java: UserController.uploadAvatar()
    // ============================================================
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await userService.uploadAvatar(formData);
            setProfile((prev) => ({ ...prev, url_avt: res.data.url_avt }));
            updateUser({ url_avt: res.data.url_avt });
        } catch (_) { }
    };

    // ============================================================
    // [API 3.2] PATCH /users/me - Cập nhật thông tin
    // Backend Java: UserController.updateProfile()
    // ============================================================
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await userService.updateProfile(editForm);
            setProfile((prev) => ({ ...prev, ...res.data }));
            updateUser(res.data);
            setEditMode(false);
        } catch (_) { } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // [API 4.2] POST /friends/requests - Gửi lời mời kết bạn
    // Backend Java: FriendController.sendFriendRequest()
    // ============================================================
    const handleAddFriend = async () => {
        try {
            await friendService.sendRequest({ to_id_B: userId });
            setProfile((prev) => ({ ...prev, friend_request_status: 1 }));
        } catch (_) { }
    };

    // ============================================================
    // [API 4.5] DELETE /friends/{user_id} - Hủy kết bạn
    // Backend Java: FriendController.unfriend()
    // ============================================================
    const handleUnfriend = async () => {
        if (!confirm("Hủy kết bạn?")) return;
        try {
            await friendService.unfriend(userId);
            setProfile((prev) => ({ ...prev, friend_request_status: 0 }));
        } catch (_) { }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
    );

    if (!profile) return <div className="text-center py-16 text-gray-500">Không tìm thấy người dùng</div>;

    return (
        <div className="max-w-[935px] mx-auto px-4 py-8">
            {/* Profile header */}
            <div className="flex gap-20 mb-10 px-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
                            <img
                                src={profile.url_avt || `https://ui-avatars.com/api/?name=${profile.name}&background=random&size=200`}
                                className="w-full h-full rounded-full object-cover border-4 border-white"
                                alt={profile.name}
                            />
                        </div>
                        {isMe && (
                            <>
                                <button onClick={() => fileRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-5">
                        <h1 className="text-xl font-light">{profile.username}</h1>
                        {isMe ? (
                            <button onClick={() => setEditMode(!editMode)}
                                className="border border-gray-300 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                {editMode ? "Hủy" : "Chỉnh sửa trang cá nhân"}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                {profile.friend_request_status === 0 && (
                                    <button onClick={handleAddFriend}
                                        className="bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                                        Kết bạn
                                    </button>
                                )}
                                {profile.friend_request_status === 1 && (
                                    <button disabled className="bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-1.5 rounded-lg">
                                        Đã gửi lời mời
                                    </button>
                                )}
                                {profile.friend_request_status === 2 && (
                                    <>
                                        <button
                                            onClick={() => {/* [API 9.5] POST /conversations - Tạo cuộc trò chuyện */ }}
                                            className="bg-gray-100 text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                            Nhắn tin
                                        </button>
                                        <button onClick={handleUnfriend}
                                            className="bg-gray-100 text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                            Hủy kết bạn
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mb-4">
                        <div className="text-sm"><span className="font-semibold">{posts.length}</span> bài viết</div>
                    </div>

                    {/* Bio */}
                    <div>
                        <p className="font-semibold text-sm">{profile.name}</p>
                        {profile.address && <p className="text-sm text-gray-600">{profile.address}</p>}
                        {profile.birth && <p className="text-sm text-gray-500">📅 {profile.birth}</p>}
                    </div>
                </div>
            </div>

            {/* Edit form */}
            {isMe && editMode && (
                <div className="border-t border-gray-200 py-6 px-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 max-w-lg">
                        <input placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                        <input placeholder="Số điện thoại" value={editForm.sdt} onChange={(e) => setEditForm({ ...editForm, sdt: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                        <input placeholder="Địa chỉ" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                        <input type="date" value={editForm.birth} onChange={(e) => setEditForm({ ...editForm, birth: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                        <select value={editForm.sex} onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                            <option value="">Giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <button onClick={handleSaveProfile} disabled={saving}
                        className="mt-4 bg-blue-500 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-colors">
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="border-t border-gray-200">
                <div className="flex justify-center gap-14">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`flex items-center gap-2 py-4 text-xs font-semibold tracking-widest border-t-2 transition-colors ${activeTab === "posts" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400"
                            }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                        BÀI VIẾT
                    </button>
                </div>

                {/* Posts grid */}
                {activeTab === "posts" && (
                    <div className="grid grid-cols-3 gap-1 mt-1">
                        {posts.map((post) => (
                            <div key={post.post_id} className="aspect-square relative group cursor-pointer">
                                {post.url_img ? (
                                    <img src={post.url_img} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <p className="text-xs text-gray-400 text-center p-2 line-clamp-3">{post.content}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-4 text-white font-semibold text-sm">
                                        <span>❤️ {post.reaction_count || 0}</span>
                                        <span>💬 {post.comment_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {posts.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-4xl mb-2">📷</div>
                        <p>{isMe ? "Chưa có bài viết nào" : "Chưa có bài viết công khai"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
