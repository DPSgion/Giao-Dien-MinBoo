import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userService, postService, friendService } from "../../services/apiServices";

export default function Profile() {
    const { userId } = useParams();
    const { user: me, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        email: "", sdt: "", address: "", birth: "", sex: "",
    });
    const [saving, setSaving] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const fileRef = useRef(null);

    const isMe = !userId || userId === me?.user_id || userId === me?.id || userId === "me";
    const targetId = isMe ? (me?.user_id || me?.id) : userId;

    useEffect(() => {
        if (!targetId) { setLoading(false); return; }
        fetchProfile();
        fetchPosts();
    }, [userId, targetId]);

    // GET /users/{id}
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await userService.getUser(targetId);
            const raw = res.data || res;
            const profileData = {
                ...raw,
                user_id: raw.id || raw.user_id,
                url_avt: raw.avatar || raw.url_avt,
                name: raw.name || raw.username,
            };
            setProfile(profileData);
            setEditForm({
                email: raw.email || "",
                sdt: raw.phone || raw.sdt || "",
                address: raw.address || "",
                birth: raw.birth || "",
                sex: raw.sex || "",
            });
            if (isMe) updateUser(profileData);
        } catch (err) {
            console.error("Profile fetch error:", err);
            // FALLBACK: nếu API lỗi nhưng đã có data từ login → dùng luôn
            if (isMe && me) {
                const fallback = {
                    ...me,
                    user_id: me.user_id || me.id,
                    url_avt: me.avatar || me.url_avt,
                    name: me.name || me.username,
                };
                setProfile(fallback);
                setEditForm({
                    email: me.email || "",
                    sdt: me.phone || me.sdt || "",
                    address: me.address || "",
                    birth: me.birth || "",
                    sex: me.sex || "",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await postService.getUserPosts(targetId);
            const data = res.data || res;
            setPosts(data.posts || data.content || (Array.isArray(data) ? data : []));
        } catch (_) { }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await userService.uploadAvatar(formData);
            const data = res.data || res;
            const newAvt = data.avatar || data.url_avt || data.url;
            setProfile(p => ({ ...p, url_avt: newAvt, avatar: newAvt }));
            updateUser({ url_avt: newAvt, avatar: newAvt });
        } catch (err) {
            const detail = err?.response?.data?.message || err?.message || JSON.stringify(err);
            alert("Upload thất bại: " + detail);
            console.error("Upload error detail:", err?.response || err);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const payload = {
                email: editForm.email || undefined,
                phone: editForm.sdt || undefined,
                address: editForm.address || undefined,
                birth: editForm.birth || undefined,
                sex: editForm.sex || undefined,
            };
            const res = await userService.updateProfile(payload);
            const data = res.data || res;
            const updated = { ...profile, ...data, url_avt: data.avatar || data.url_avt || profile?.url_avt, user_id: data.id || data.user_id || profile?.user_id };
            setProfile(updated);
            updateUser(updated);
            setEditMode(false);
        } catch (err) {
            const detail = err?.response?.data?.message || err?.message || JSON.stringify(err);
            alert("Cập nhật thất bại: " + detail);
            console.error("Update error detail:", err?.response || err);
        }
        finally { setSaving(false); }
    };

    const handleAddFriend = async () => {
        try { await friendService.sendRequest({ to_id_B: userId }); setProfile(p => ({ ...p, friend_request_status: 1 })); } catch (_) { }
    };
    const handleUnfriend = async () => {
        if (!confirm("Hủy kết bạn?")) return;
        try { await friendService.unfriend(userId); setProfile(p => ({ ...p, friend_request_status: 0 })); } catch (_) { }
    };

    const sexLabel = (v) => {
        if (v === "1" || v === 1) return "Nam";
        if (v === "0" || v === 0) return "Nữ";
        if (v === "2" || v === 2) return "Khác";
        if (v === "male") return "Nam";
        if (v === "female") return "Nữ";
        return v || "";
    };

    // ========== LOADING ==========
    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-gray-200" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-transparent border-t-gray-800 animate-spin" />
            </div>
        </div>
    );

    // ========== SETUP PROFILE (tài khoản mới chưa có data) ==========
    if (!profile && isMe) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white border border-gray-200 rounded-sm px-10 py-10">
                    {/* Logo */}
                    <h1 className="text-center text-3xl mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>MinBoo</h1>
                    <p className="text-center text-gray-500 text-sm mb-8">Thiết lập thông tin cá nhân để bắt đầu</p>

                    {/* Avatar placeholder */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition" onClick={() => fileRef.current?.click()}>
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    <div className="space-y-3">
                        <input placeholder="Email" value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-gray-400 placeholder-gray-400" />
                        <input placeholder="Số điện thoại" value={editForm.sdt}
                            onChange={e => setEditForm({ ...editForm, sdt: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-gray-400 placeholder-gray-400" />
                        <input placeholder="Địa chỉ" value={editForm.address}
                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-gray-400 placeholder-gray-400" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" placeholder="Ngày sinh" value={editForm.birth}
                                onChange={e => setEditForm({ ...editForm, birth: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-gray-400 text-gray-500" />
                            <select value={editForm.sex}
                                onChange={e => setEditForm({ ...editForm, sex: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-gray-400 text-gray-500">
                                <option value="">Giới tính</option>
                                <option value="1">Nam</option>
                                <option value="0">Nữ</option>
                                <option value="2">Khác</option>
                            </select>
                        </div>
                        <button onClick={handleSaveProfile} disabled={saving}
                            className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors mt-2">
                            {saving ? "Đang lưu..." : "Hoàn tất"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!profile) return <div className="text-center py-16 text-gray-500 text-sm">Không tìm thấy người dùng.</div>;

    // ========== MAIN PROFILE (Instagram-style) ==========
    return (
        <div className="max-w-[935px] mx-auto px-5 pt-8 pb-16">

            {/* ===== HEADER ===== */}
            <header className="flex items-start gap-8 md:gap-24 mb-11 px-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="relative group">
                        <div className="w-[150px] h-[150px] rounded-full p-[3px] bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5]">
                            <div className="w-full h-full rounded-full bg-white p-[3px]">
                                <img
                                    src={profile.url_avt || profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=f0f0f0&color=999&size=300&bold=true`}
                                    alt={profile.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        {isMe && (
                            <>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                    <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                    {/* Row 1: Username + Buttons */}
                    <div className="flex items-center gap-5 mb-5 flex-wrap">
                        <h2 className="text-xl font-normal">{profile.username || profile.name}</h2>

                        {isMe ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="bg-[#efefef] hover:bg-[#dbdbdb] text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                                >
                                    {editMode ? "Hủy" : "Chỉnh sửa trang cá nhân"}
                                </button>
                                <button className="p-1.5">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                {(!profile.friend_request_status || profile.friend_request_status === 0) && (
                                    <button onClick={handleAddFriend}
                                        className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-6 py-1.5 rounded-lg transition-colors">
                                        Theo dõi
                                    </button>
                                )}
                                {profile.friend_request_status === 1 && (
                                    <button className="bg-[#efefef] text-sm font-semibold px-4 py-1.5 rounded-lg cursor-default">
                                        Đã gửi yêu cầu
                                    </button>
                                )}
                                {profile.friend_request_status === 2 && (
                                    <>
                                        <button className="bg-[#efefef] hover:bg-[#dbdbdb] text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                                            Đang theo dõi
                                        </button>
                                        <button className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
                                            Nhắn tin
                                        </button>
                                    </>
                                )}
                                <button className="p-1.5">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Row 2: Stats */}
                    <div className="flex gap-10 mb-5">
                        <div className="text-sm"><span className="font-semibold">{posts.length}</span> bài viết</div>
                        <div className="text-sm cursor-pointer"><span className="font-semibold">0</span> người theo dõi</div>
                        <div className="text-sm cursor-pointer">Đang theo dõi <span className="font-semibold">0</span> người dùng</div>
                    </div>

                    {/* Row 3: Name + Bio */}
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{profile.name}</p>

                        {/* Thông tin chi tiết */}
                        {profile.email && (
                            <p className="text-sm text-gray-600">📧 {profile.email}</p>
                        )}
                        {(profile.phone || profile.sdt) && (
                            <p className="text-sm text-gray-600">📞 {profile.phone || profile.sdt}</p>
                        )}
                        {profile.sex !== undefined && profile.sex !== null && profile.sex !== "" && (
                            <p className="text-sm text-gray-600">⚧ {sexLabel(profile.sex)}</p>
                        )}
                        {profile.address && (
                            <p className="text-sm text-gray-600">📍 {profile.address}</p>
                        )}
                        {profile.birth && (
                            <p className="text-sm text-gray-600">🎂 {profile.birth}</p>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== EDIT FORM (Instagram-style modal-ish) ===== */}
            {isMe && editMode && (
                <div className="border border-gray-200 rounded-xl bg-white mb-8 mx-4 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-base font-semibold">Chỉnh sửa trang cá nhân</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-5 max-w-lg">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Email</label>
                                <input value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white" />
                            </div>
                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Số điện thoại</label>
                                <input value={editForm.sdt}
                                    onChange={e => setEditForm({ ...editForm, sdt: e.target.value })}
                                    placeholder="0987654321"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white" />
                            </div>
                            {/* Address */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Địa chỉ</label>
                                <input value={editForm.address}
                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                    placeholder="Hà Nội, Việt Nam"
                                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Birth */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">Ngày sinh</label>
                                    <input type="date" value={editForm.birth}
                                        onChange={e => setEditForm({ ...editForm, birth: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white" />
                                </div>
                                {/* Sex */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-800 mb-1.5">Giới tính</label>
                                    <select value={editForm.sex}
                                        onChange={e => setEditForm({ ...editForm, sex: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white">
                                        <option value="">Chọn</option>
                                        <option value="1">Nam</option>
                                        <option value="0">Nữ</option>
                                        <option value="2">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSaveProfile} disabled={saving}
                                className="bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors">
                                {saving ? "Đang lưu..." : "Gửi"}
                            </button>
                            <button onClick={() => setEditMode(false)}
                                className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DIVIDER + TABS ===== */}
            <div className="border-t border-gray-200">
                <div className="flex justify-center gap-16">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`flex items-center gap-1.5 py-4 text-xs font-semibold tracking-[1px] uppercase border-t transition-colors -mt-px ${activeTab === "posts"
                            ? "border-gray-900 text-gray-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Bài viết
                    </button>
                    <button
                        onClick={() => setActiveTab("saved")}
                        className={`flex items-center gap-1.5 py-4 text-xs font-semibold tracking-[1px] uppercase border-t transition-colors -mt-px ${activeTab === "saved"
                            ? "border-gray-900 text-gray-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        Đã lưu
                    </button>
                    <button
                        onClick={() => setActiveTab("tagged")}
                        className={`flex items-center gap-1.5 py-4 text-xs font-semibold tracking-[1px] uppercase border-t transition-colors -mt-px ${activeTab === "tagged"
                            ? "border-gray-900 text-gray-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        Được gắn thẻ
                    </button>
                </div>
            </div>

            {/* ===== POST GRID ===== */}
            {activeTab === "posts" && posts.length > 0 && (
                <div className="grid grid-cols-3 gap-1">
                    {posts.map((post) => (
                        <div
                            key={post.post_id || post.id}
                            className="aspect-square relative group cursor-pointer bg-gray-100"
                            onClick={() => setSelectedPost(post)}
                        >
                            {(post.url_img || post.image) ? (
                                <img src={post.url_img || post.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                                    <p className="text-sm text-gray-500 text-center line-clamp-4 leading-relaxed">{post.content}</p>
                                </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-6 text-white">
                                    <span className="flex items-center gap-1.5 font-semibold text-sm drop-shadow">
                                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                        {post.reaction_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-semibold text-sm drop-shadow">
                                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                                        {post.comment_count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {activeTab === "posts" && posts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-light mb-2">{isMe ? "Chia sẻ ảnh" : "Chưa có bài viết"}</h3>
                    {isMe && <p className="text-sm text-gray-400">Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân.</p>}
                </div>
            )}

            {(activeTab === "saved" || activeTab === "tagged") && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
                        {activeTab === "saved" ? (
                            <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                        ) : (
                            <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                        )}
                    </div>
                    <h3 className="text-3xl font-light">{activeTab === "saved" ? "Lưu" : "Ảnh có mặt bạn"}</h3>
                </div>
            )}

            {/* ===== POST DETAIL MODAL ===== */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center" onClick={() => setSelectedPost(null)}>
                    <button className="absolute top-4 right-4 text-white" onClick={() => setSelectedPost(null)}>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="bg-white rounded-sm max-w-4xl w-full max-h-[90vh] flex overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Image */}
                        <div className="w-[60%] bg-black flex items-center justify-center">
                            {(selectedPost.url_img || selectedPost.image) ? (
                                <img src={selectedPost.url_img || selectedPost.image} className="max-w-full max-h-[90vh] object-contain" alt="" />
                            ) : (
                                <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 p-8">
                                    <p className="text-lg text-gray-700 text-center">{selectedPost.content}</p>
                                </div>
                            )}
                        </div>
                        {/* Detail */}
                        <div className="w-[40%] flex flex-col">
                            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                                <img src={profile.url_avt || profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                                <span className="text-sm font-semibold">{profile.username || profile.name}</span>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                <p className="text-sm">{selectedPost.content}</p>
                            </div>
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-4 mb-2">
                                    <span className="text-sm">❤️ {selectedPost.reaction_count || 0}</span>
                                    <span className="text-sm">💬 {selectedPost.comment_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
