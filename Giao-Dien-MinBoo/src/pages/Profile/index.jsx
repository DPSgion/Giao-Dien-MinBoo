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
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        email: "", sdt: "", address: "", birth: "", sex: "",
    });
    const [saving, setSaving] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [friendStatus, setFriendStatus] = useState(null); // 0=none, 1=sent, 2=friends, 3=received
    const fileRef = useRef(null);

    const isMe = !userId || userId === me?.user_id || userId === me?.id || userId === "me";

    // targetId: dùng UUID nếu có, nếu không dùng "me" → BE sẽ tự resolve
    const targetId = isMe ? (me?.user_id || me?.id || "me") : userId;

    useEffect(() => {
        if (!targetId) { setLoading(false); return; }
        fetchProfile();
        fetchPosts();
        if (!isMe) checkFriendStatus();
    }, [userId, targetId]);

    // ===== CHECK FRIEND STATUS from BE =====
    const checkFriendStatus = async () => {
        const myId = me?.user_id || me?.id;
        alert("STEP 0: checkFriendStatus started. userId=" + userId);

        // Check sent requests first
        try {
            alert("STEP 1: calling getSentRequests...");
            const sentRes = await friendService.getSentRequests();
            alert("STEP 2: getSentRequests returned: " + JSON.stringify(sentRes));
            const sentList = Array.isArray(sentRes) ? sentRes : (sentRes?.data || []);
            for (const r of sentList) {
                if (r.receiverId === userId) { setFriendStatus(1); return; }
            }
        } catch (err) {
            console.error("checkFriendStatus sentReq error:", err);
            alert("sentReq ERROR: " + JSON.stringify(err));
        }

        // Check friends list
        try {
            const friendsRes = await friendService.getFriends();
            const friendsList = Array.isArray(friendsRes) ? friendsRes : (friendsRes?.data || []);
            for (const f of friendsList) {
                const otherId = f.requesterId === myId ? f.receiverId : f.requesterId;
                if (otherId === userId) { setFriendStatus(2); return; }
            }
        } catch (err) {
            console.error("checkFriendStatus friends error:", err);
        }

        // Check pending received
        try {
            const pendingRes = await friendService.getPendingRequests();
            const pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || []);
            for (const r of pendingList) {
                if (r.requesterId === userId) { setFriendStatus(3); return; }
            }
        } catch (err) {
            console.error("checkFriendStatus pending error:", err);
        }

        setFriendStatus(0);
    };

    // ===== FETCH PROFILE: GET /users/{id} =====
    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = isMe || targetId === "me"
                ? await userService.getCurrentUser()
                : await userService.getUser(targetId);
            const raw = res.data?.data || res.data || res;
            const profileData = mapBeToFe(raw);
            setProfile(profileData);
            populateEditForm(raw);
            if (isMe) updateUser(profileData);
        } catch (err) {
            console.error("Profile fetch error:", err?.response?.status, err?.response?.data || err.message);
            // Fallback: dùng dữ liệu từ AuthContext
            if (isMe && me) {
                setProfile({
                    ...me,
                    user_id: me.user_id || me.id,
                    url_avt: me.avatar || me.url_avt,
                    name: me.name || me.username,
                });
                populateEditForm(me);
            } else {
                setError(`Không thể tải profile (${err?.response?.status || "Network Error"})`);
            }
        } finally {
            setLoading(false);
        }
    };

    // ===== MAP BACKEND → FRONTEND =====
    // BE trả: id, name, username, email, phone, sex(1/0/2), address, birth, avatar, active
    // FE cần: user_id, name, username, email, sdt, sex, address, birth, url_avt
    const mapBeToFe = (raw) => ({
        ...raw,
        user_id: raw.id || raw.user_id,
        name: raw.name || raw.username,
        url_avt: raw.avatar || raw.url_avt,
        sdt: raw.phone || raw.sdt,
    });

    const populateEditForm = (raw) => {
        setEditForm({
            email: raw.email || "",
            sdt: raw.phone || raw.sdt || "",
            address: raw.address || "",
            birth: raw.birth || "",
            sex: raw.sex !== undefined && raw.sex !== null ? String(raw.sex) : "",
        });
    };

    // ===== FETCH POSTS =====
    const fetchPosts = async () => {
        try {
            const res = await postService.getUserPosts(targetId);
            const data = res.data?.data || res.data || res;
            setPosts(data.posts || data.content || (Array.isArray(data) ? data : []));
        } catch (_) { }
    };

    // ===== UPLOAD AVATAR: POST /users/me/avatar =====
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await userService.uploadAvatar(formData);
            const data = res.data?.data || res.data || res;
            const newAvt = data.url_avt || data.avatar || data.url;
            setProfile((p) => ({ ...p, url_avt: newAvt, avatar: newAvt }));
            updateUser({ url_avt: newAvt, avatar: newAvt });
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
            alert("Upload thất bại: " + msg);
            console.error("Upload error:", err?.response || err);
        }
    };

    // ===== SAVE PROFILE: PATCH /users/me =====
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // Chỉ gửi field có giá trị, BE không yêu cầu field trống
            const payload = {};
            if (editForm.email) payload.email = editForm.email;
            if (editForm.sdt) payload.sdt = editForm.sdt;
            if (editForm.address) payload.address = editForm.address;
            if (editForm.birth) payload.birth = editForm.birth;
            if (editForm.sex !== "") payload.sex = editForm.sex;

            const res = await userService.updateProfile(payload);
            const data = res.data?.data || res.data || res;
            const updated = mapBeToFe({ ...profile, ...data });
            setProfile(updated);
            updateUser(updated);
            setEditMode(false);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
            alert("Cập nhật thất bại: " + msg);
            console.error("Update error:", err?.response || err);
        } finally {
            setSaving(false);
        }
    };

    // ===== FRIEND ACTIONS =====
    const handleAddFriend = async () => {
        try {
            await friendService.sendRequest(targetId);
            setFriendStatus(1);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "";
            if (msg.includes("Data already exists") || msg.includes("violates system constraints")) {
                setFriendStatus(1);
            } else {
                alert("Lỗi: " + msg);
            }
        }
    };

    const handleUnfriend = async () => {
        if (!confirm("Hủy kết bạn?")) return;
        try {
            await friendService.unfriend(targetId);
            setFriendStatus(0);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message;
            alert("Lỗi: " + msg);
        }
    };

    // ===== ACCEPT/REJECT from Profile page =====
    const handleAcceptFromProfile = async () => {
        try {
            const pendingRes = await friendService.getPendingRequests();
            const pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || []);
            const req = pendingList.find(r => r.requesterId === userId);
            if (req) {
                await friendService.acceptRequest(req.requestId);
                setFriendStatus(2);
            }
        } catch (err) {
            alert("Lỗi: " + (err?.response?.data?.message || err?.message));
        }
    };

    const handleRejectFromProfile = async () => {
        try {
            const pendingRes = await friendService.getPendingRequests();
            const pendingList = Array.isArray(pendingRes) ? pendingRes : (pendingRes?.data || []);
            const req = pendingList.find(r => r.requesterId === userId);
            if (req) {
                await friendService.rejectRequest(req.requestId);
                setFriendStatus(0);
            }
        } catch (err) {
            alert("Lỗi: " + (err?.response?.data?.message || err?.message));
        }
    };

    // ===== HELPERS =====
    const sexLabel = (v) => {
        if (v === "1" || v === 1) return "Nam";
        if (v === "0" || v === 0) return "Nữ";
        if (v === "2" || v === 2) return "Khác";
        if (v === "male") return "Nam";
        if (v === "female") return "Nữ";
        return v || "";
    };

    // Avatar: lấy trực tiếp từ BE, không tự tạo
    const isRealAvatar = (url) => {
        if (!url) return false;
        // BE trả placeholder "https://default-avatar-url.png" → không dùng
        if (url.includes("default-avatar-url")) return false;
        return true;
    };
    const avatarUrl = (p) => {
        const url = p?.url_avt || p?.avatar;
        return isRealAvatar(url) ? url : null;
    };

    // ───────────────────────────────────────────────
    // RENDER: LOADING
    // ───────────────────────────────────────────────
    if (loading)
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <div style={{ position: "relative", width: 48, height: 48 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #dbdbdb" }} />
                    <div
                        style={{
                            position: "absolute", top: 0, left: 0, width: 48, height: 48,
                            borderRadius: "50%", border: "2px solid transparent",
                            borderTopColor: "#262626", animation: "spin 0.8s linear infinite",
                        }}
                    />
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );

    // ───────────────────────────────────────────────
    // RENDER: SETUP PROFILE (tài khoản mới, chưa có data)
    // ───────────────────────────────────────────────
    if (!profile && isMe)
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", padding: "0 16px" }}>
                <div style={{ width: "100%", maxWidth: 400 }}>
                    <div style={{ background: "#fff", border: "1px solid #dbdbdb", borderRadius: 4, padding: "40px 40px 24px" }}>
                        <h1 style={{ textAlign: "center", fontSize: 32, fontFamily: "'Segoe UI', sans-serif", fontWeight: 400, marginBottom: 4 }}>MinBoo</h1>
                        <p style={{ textAlign: "center", color: "#8e8e8e", fontSize: 13, marginBottom: 28 }}>Thiết lập thông tin cá nhân để bắt đầu</p>

                        {/* Avatar */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    width: 96, height: 96, borderRadius: "50%", background: "#fafafa",
                                    border: "2px dashed #dbdbdb", display: "flex", alignItems: "center",
                                    justifyContent: "center", cursor: "pointer",
                                }}
                            >
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#8e8e8e" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { key: "email", placeholder: "Email", type: "text" },
                                { key: "sdt", placeholder: "Số điện thoại", type: "text" },
                                { key: "address", placeholder: "Địa chỉ", type: "text" },
                            ].map((f) => (
                                <input
                                    key={f.key} type={f.type} placeholder={f.placeholder}
                                    value={editForm[f.key]}
                                    onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                    style={{
                                        width: "100%", background: "#fafafa", border: "1px solid #dbdbdb",
                                        borderRadius: 4, padding: "9px 12px", fontSize: 12, outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            ))}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <input
                                    type="date" value={editForm.birth}
                                    onChange={(e) => setEditForm({ ...editForm, birth: e.target.value })}
                                    style={{
                                        background: "#fafafa", border: "1px solid #dbdbdb", borderRadius: 4,
                                        padding: "9px 12px", fontSize: 12, outline: "none", color: "#8e8e8e",
                                    }}
                                />
                                <select
                                    value={editForm.sex}
                                    onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                                    style={{
                                        background: "#fafafa", border: "1px solid #dbdbdb", borderRadius: 4,
                                        padding: "9px 12px", fontSize: 12, outline: "none", color: "#8e8e8e",
                                    }}
                                >
                                    <option value="">Giới tính</option>
                                    <option value="1">Nam</option>
                                    <option value="0">Nữ</option>
                                    <option value="2">Khác</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSaveProfile} disabled={saving}
                                style={{
                                    width: "100%", background: "#0095f6", color: "#fff", border: "none",
                                    borderRadius: 8, padding: "8px 0", fontSize: 14, fontWeight: 600,
                                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                                    marginTop: 8,
                                }}
                            >
                                {saving ? "Đang lưu..." : "Hoàn tất"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );

    // ───────────────────────────────────────────────
    // RENDER: ERROR
    // ───────────────────────────────────────────────
    if (!profile)
        return (
            <div style={{ textAlign: "center", padding: "64px 16px", color: "#8e8e8e", fontSize: 14 }}>
                {error || "Không tìm thấy người dùng."}
            </div>
        );

    // ───────────────────────────────────────────────
    // RENDER: MAIN PROFILE (Instagram-style)
    // ───────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 935, margin: "0 auto", padding: "32px 20px 64px" }}>

            {/* ═══════ HEADER ═══════ */}
            <header style={{ display: "flex", alignItems: "flex-start", gap: "clamp(32px, 8vw, 96px)", marginBottom: 44, padding: "0 16px" }}>

                {/* Avatar with gradient ring */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                        <div
                            style={{
                                width: 150, height: 150, borderRadius: "50%", padding: 3,
                                background: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
                            }}
                        >
                            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", padding: 3 }}>
                                {avatarUrl(profile) ? (
                                    <img
                                        src={avatarUrl(profile)}
                                        alt={profile.name}
                                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }}
                                    />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="#c7c7c7">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isMe && (
                            <>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    style={{
                                        position: "absolute", inset: 0, borderRadius: "50%",
                                        background: "rgba(0,0,0,0)", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.2)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0)")}
                                >
                                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,.4))", opacity: 0 }} className="cam-icon">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                            </>
                        )}
                    </div>
                </div>

                {/* Info section */}
                <div style={{ flex: 1, paddingTop: 8 }}>

                    {/* Row 1: Username + buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>{profile.username || profile.name}</h2>
                        {isMe ? (
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    style={{
                                        background: "#efefef", border: "none", borderRadius: 8,
                                        padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    {editMode ? "Hủy" : "Chỉnh sửa trang cá nhân"}
                                </button>
                                <button style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}>
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#262626" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", gap: 8 }}>
                                {(friendStatus === null || friendStatus === 0) && (
                                    <button onClick={handleAddFriend} style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: 8, padding: "7px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                        Theo dõi
                                    </button>
                                )}
                                {friendStatus === 1 && (
                                    <button style={{ background: "#efefef", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "default" }}>
                                        Đã gửi yêu cầu
                                    </button>
                                )}
                                {friendStatus === 2 && (
                                    <>
                                        <button onClick={handleUnfriend} style={{ background: "#efefef", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                            Đang theo dõi
                                        </button>
                                        <button style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                            Nhắn tin
                                        </button>
                                    </>
                                )}
                                {friendStatus === 3 && (
                                    <>
                                        <button onClick={handleAcceptFromProfile} style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                            Chấp nhận
                                        </button>
                                        <button onClick={handleRejectFromProfile} style={{ background: "#efefef", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                            Từ chối
                                        </button>
                                    </>
                                )}
                                <button style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}>
                                    <svg width="20" height="20" fill="#262626" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Row 2: Stats */}
                    <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
                        <div style={{ fontSize: 14 }}><span style={{ fontWeight: 600 }}>{posts.length}</span> bài viết</div>
                        <div style={{ fontSize: 14, cursor: "pointer" }}><span style={{ fontWeight: 600 }}>0</span> người theo dõi</div>
                        <div style={{ fontSize: 14, cursor: "pointer" }}>Đang theo dõi <span style={{ fontWeight: 600 }}>0</span> người dùng</div>
                    </div>

                    {/* Row 3: Name + Bio info */}
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{profile.name}</p>
                        {profile.email && <p style={{ fontSize: 14, color: "#555", margin: "2px 0" }}>📧 {profile.email}</p>}
                        {(profile.sdt || profile.phone) && <p style={{ fontSize: 14, color: "#555", margin: "2px 0" }}>📞 {profile.sdt || profile.phone}</p>}
                        {profile.sex !== undefined && profile.sex !== null && profile.sex !== "" && (
                            <p style={{ fontSize: 14, color: "#555", margin: "2px 0" }}>⚧ {sexLabel(profile.sex)}</p>
                        )}
                        {profile.address && <p style={{ fontSize: 14, color: "#555", margin: "2px 0" }}>📍 {profile.address}</p>}
                        {profile.birth && <p style={{ fontSize: 14, color: "#555", margin: "2px 0" }}>🎂 {profile.birth}</p>}
                    </div>
                </div>
            </header>

            {/* ═══════ EDIT FORM ═══════ */}
            {isMe && editMode && (
                <div style={{ border: "1px solid #dbdbdb", borderRadius: 12, background: "#fff", marginBottom: 32, marginLeft: 16, marginRight: 16, overflow: "hidden" }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #efefef", background: "#fafafa" }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Chỉnh sửa trang cá nhân</h3>
                    </div>
                    <div style={{ padding: 24 }}>
                        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
                            {[
                                { label: "Email", key: "email", placeholder: "email@example.com" },
                                { label: "Số điện thoại", key: "sdt", placeholder: "0987654321" },
                                { label: "Địa chỉ", key: "address", placeholder: "Hà Nội, Việt Nam" },
                            ].map((f) => (
                                <div key={f.key}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#262626", marginBottom: 6 }}>{f.label}</label>
                                    <input
                                        value={editForm[f.key]}
                                        onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                        placeholder={f.placeholder}
                                        style={{ width: "100%", border: "1px solid #dbdbdb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                            ))}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#262626", marginBottom: 6 }}>Ngày sinh</label>
                                    <input type="date" value={editForm.birth} onChange={(e) => setEditForm({ ...editForm, birth: e.target.value })}
                                        style={{ width: "100%", border: "1px solid #dbdbdb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#262626", marginBottom: 6 }}>Giới tính</label>
                                    <select value={editForm.sex} onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                                        style={{ width: "100%", border: "1px solid #dbdbdb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                                        <option value="">Chọn</option>
                                        <option value="1">Nam</option>
                                        <option value="0">Nữ</option>
                                        <option value="2">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                            <button onClick={handleSaveProfile} disabled={saving}
                                style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                            <button onClick={() => setEditMode(false)}
                                style={{ background: "none", border: "none", padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TABS ═══════ */}
            <div style={{ borderTop: "1px solid #dbdbdb" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 60 }}>
                    {[
                        { id: "posts", label: "BÀI VIẾT", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
                        { id: "saved", label: "ĐÃ LƯU", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg> },
                        { id: "tagged", label: "ĐƯỢC GẮN THẺ", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
                    ].map((tab) => (
                        <button
                            key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "16px 0",
                                fontSize: 12, fontWeight: 600, letterSpacing: 1,
                                background: "none", border: "none", cursor: "pointer",
                                borderTop: activeTab === tab.id ? "1px solid #262626" : "1px solid transparent",
                                color: activeTab === tab.id ? "#262626" : "#8e8e8e",
                                marginTop: -1,
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════ POST GRID ═══════ */}
            {activeTab === "posts" && posts.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                    {posts.map((post) => (
                        <div
                            key={post.post_id || post.id}
                            onClick={() => setSelectedPost(post)}
                            style={{ aspectRatio: "1", position: "relative", cursor: "pointer", background: "#fafafa", overflow: "hidden" }}
                            onMouseEnter={(e) => (e.currentTarget.querySelector(".overlay").style.opacity = 1)}
                            onMouseLeave={(e) => (e.currentTarget.querySelector(".overlay").style.opacity = 0)}
                        >
                            {(post.url_img || post.image) ? (
                                <img src={post.url_img || post.image} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} alt="" />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fafafa, #efefef)", padding: 16 }}>
                                    <p style={{ fontSize: 13, color: "#8e8e8e", textAlign: "center", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>{post.content}</p>
                                </div>
                            )}
                            <div className="overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 24, opacity: 0, transition: "opacity 0.2s" }}>
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                    <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                    {post.reaction_count || 0}
                                </span>
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                    <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                                    {post.comment_count || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {activeTab === "posts" && posts.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                    <div style={{ width: 62, height: 62, borderRadius: "50%", border: "2px solid #262626", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#262626" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: 28, fontWeight: 300, margin: "0 0 8px" }}>{isMe ? "Chia sẻ ảnh" : "Chưa có bài viết"}</h3>
                    {isMe && <p style={{ fontSize: 14, color: "#8e8e8e" }}>Khi bạn chia sẻ ảnh, ảnh sẽ xuất hiện trên trang cá nhân.</p>}
                </div>
            )}

            {(activeTab === "saved" || activeTab === "tagged") && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                    <div style={{ width: 62, height: 62, borderRadius: "50%", border: "2px solid #262626", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        {activeTab === "saved" ? (
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#262626" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                        ) : (
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#262626" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                        )}
                    </div>
                    <h3 style={{ fontSize: 28, fontWeight: 300 }}>{activeTab === "saved" ? "Mục đã lưu" : "Ảnh có mặt bạn"}</h3>
                </div>
            )}

            {/* ═══════ POST DETAIL MODAL ═══════ */}
            {selectedPost && (
                <div
                    onClick={() => setSelectedPost(null)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <button onClick={() => setSelectedPost(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 4, maxWidth: 900, width: "95%", maxHeight: "90vh", display: "flex", overflow: "hidden" }}>
                        {/* Left: Image */}
                        <div style={{ width: "60%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {(selectedPost.url_img || selectedPost.image) ? (
                                <img src={selectedPost.url_img || selectedPost.image} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }} alt="" />
                            ) : (
                                <div style={{ width: "100%", height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", padding: 32 }}>
                                    <p style={{ fontSize: 18, color: "#333", textAlign: "center" }}>{selectedPost.content}</p>
                                </div>
                            )}
                        </div>
                        {/* Right: Details */}
                        <div style={{ width: "40%", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid #efefef" }}>
                                {avatarUrl(profile) ? (
                                    <img src={avatarUrl(profile)} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} alt="" />
                                ) : (
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#c7c7c7"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                    </div>
                                )}
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{profile.username || profile.name}</span>
                            </div>
                            <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
                                <p style={{ fontSize: 14 }}>{selectedPost.content}</p>
                            </div>
                            <div style={{ padding: 16, borderTop: "1px solid #efefef" }}>
                                <div style={{ display: "flex", gap: 16 }}>
                                    <span style={{ fontSize: 14 }}>❤️ {selectedPost.reaction_count || 0}</span>
                                    <span style={{ fontSize: 14 }}>💬 {selectedPost.comment_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
