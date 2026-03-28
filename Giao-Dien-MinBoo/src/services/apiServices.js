import axiosClient from "./axiosClient";
import { mockTags } from "./adminService";

// ============================================================
// USER SERVICE - Quản lý thông tin người dùng
// ============================================================
export const userService = {
    // [API 3.1] GET /users/{user_id} - Lấy thông tin user
    // Truyền "me" để lấy thông tin chính mình
    // Backend Java: UserController.getUserById(@PathVariable String userId)
    getUser: (userId) => axiosClient.get(`/users/${userId}`),

    // [API 3.2] PATCH /users/me - Cập nhật thông tin cá nhân
    // Backend Java: UserController.updateProfile(@RequestBody UpdateProfileRequest)
    // Body: { address?, birth?, sex?, email?, sdt? }
    updateProfile: (data) => axiosClient.patch("/users/me", data),

    // [API 3.3] POST /users/me/avatar - Upload ảnh đại diện
    // Backend Java: UserController.uploadAvatar(@RequestParam MultipartFile file)
    // Content-Type: multipart/form-data, tối đa 10MB, JPG/PNG/WEBP
    uploadAvatar: (formData) =>
        axiosClient.post("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // [API 3.4] GET /users/search - Tìm kiếm user
    // Backend Java: UserController.searchUsers(@RequestParam String q, int page, int limit)
    // Query: { q, page?, limit? }
    searchUsers: (params) => axiosClient.get("/users/search", { params }),
};

// ============================================================
// MOCK DATA CHO FRIENDS
// ============================================================
const mockFriends = [
    {
        user_id: 'user-uuid-3',
        name: 'Khánh Vi',
        url_avt: 'https://ui-avatars.com/api/?name=Khanh+Vi&background=ec4899&color=fff'
    },
    {
        user_id: 'user-uuid-4',
        name: 'Đức Phát',
        url_avt: 'https://ui-avatars.com/api/?name=Duc+Phat&background=3b82f6&color=fff'
    },
    {
        user_id: 'user-uuid-5',
        name: 'Hải Trình',
        url_avt: 'https://ui-avatars.com/api/?name=Hai+Trinh&background=10b981&color=fff'
    }
];

// ============================================================
// FRIEND SERVICE - Quản lý bạn bè
// ============================================================
export const friendService = {
    // [MOCK] Danh sách bạn bè
    getFriends: async (userId, params) => {
        await new Promise(r => setTimeout(r, 400));
        return { data: { friends: mockFriends } };
    },

    // [MOCK] Lời mời kết bạn
    sendRequest: async (data) => {
        await new Promise(r => setTimeout(r, 300));
        return { data: { success: true } };
    },

    acceptRequest: async (friendRequestId) => ({ data: { success: true } }),
    deleteRequest: async (friendRequestId) => ({ data: { success: true } }),
    unfriend: async (userId) => ({ data: { success: true } }),

    getPendingRequests: async () => {
        await new Promise(r => setTimeout(r, 300));
        return {
            data: {
                received: [
                    { id: 1, from_user: { user_id: 'u6', name: 'Hoài Lâm', url_avt: '' } }
                ],
                sent: []
            }
        };
    },
};

// ============================================================
// MOCK DATA DÀNH CHO BÀI VIẾT (POSTS)
// ============================================================
const mockPosts = [
    {
        post_id: 'post-uuid-1',
        author: {
            user_id: 'user-uuid-1',
            name: 'Nguyễn Văn A',
            url_avt: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random'
        },
        content: 'Chào ngày mới mọi người! Hôm nay thời tiết thật đẹp.',
        url_img: 'https://picsum.photos/seed/post1/600/400',
        privacy: 'public',
        reaction_count: 15,
        comment_count: 3,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        post_id: 'post-uuid-2',
        author: {
            user_id: 'user-uuid-2',
            name: 'Trần Bình',
            url_avt: 'https://ui-avatars.com/api/?name=Tran+Binh&background=random'
        },
        content: 'Vừa hoàn thành xong project ReactJS đầu tay! Vui quá đi mất 🎉',
        url_img: null,
        privacy: 'public',
        reaction_count: 42,
        comment_count: 8,
        created_at: new Date(Date.now() - 7200000).toISOString()
    }
];

// ============================================================
// POST SERVICE - Quản lý bài viết
// ============================================================
export const postService = {
    // [MOCK] Lấy bảng tin (Feed)
    getFeed: async (params) => {
        await new Promise(r => setTimeout(r, 600)); // giả lập delay mạng
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const start = (page - 1) * limit;
        const result = mockPosts.slice(start, start + limit);
        return { data: { posts: result } };
    },

    // [MOCK] Lấy bài của 1 User
    getUserPosts: async (userId, params) => {
        await new Promise(r => setTimeout(r, 400));
        return { data: { posts: mockPosts.filter(p => p.author.user_id === userId) } };
    },

    // [MOCK] Đăng bài viết mới
    createPost: async (formData) => {
        await new Promise(r => setTimeout(r, 800));
        
        const content = formData.get('content') || '';
        const privacy = formData.get('privacy') || 'public';
        const file = formData.get('url_img');
        
        let url_img = null;
        if (file && file.size > 0) {
            url_img = URL.createObjectURL(file);
        }

        const rawUser = localStorage.getItem("user");
        const currentUser = rawUser ? JSON.parse(rawUser) : { name: 'Người dùng', url_avt: 'https://ui-avatars.com/api/?name=User' };

        const newPost = {
            post_id: `post-uuid-${Date.now()}`,
            author: currentUser,
            content,
            url_img,
            privacy,
            reaction_count: 0,
            comment_count: 0,
            created_at: new Date().toISOString()
        };

        mockPosts.unshift(newPost); // Thêm lên đầu trang
        return { data: newPost };
    },

    updatePost: async (postId, data) => ({ data: { success: true } }),

    // [MOCK] Xóa bài
    deletePost: async (postId) => {
        await new Promise(r => setTimeout(r, 400));
        const index = mockPosts.findIndex(p => p.post_id === postId);
        if (index !== -1) mockPosts.splice(index, 1);
        return { data: { success: true } };
    },

    getPost: async (postId) => {
        await new Promise(r => setTimeout(r, 300));
        const post = mockPosts.find(p => p.post_id === postId);
        return { data: post };
    },
};

// ============================================================
// COMMENT SERVICE - Quản lý bình luận
// ============================================================
export const commentService = {
    // [API 6.1] GET /posts/{post_id}/comments - Danh sách bình luận
    // Backend Java: CommentController.getComments(@PathVariable String postId)
    // Query: { page?, limit? }
    getComments: (postId, params) =>
        axiosClient.get(`/posts/${postId}/comments`, { params }),

    // [API 6.2] POST /posts/{post_id}/comments - Thêm bình luận
    // Backend Java: CommentController.addComment(@PathVariable String postId, @RequestBody)
    // Body: { content } (1-1000 ký tự)
    addComment: (postId, data) =>
        axiosClient.post(`/posts/${postId}/comments`, data),

    // [API 6.3] DELETE /posts/{post_id}/comments/{comment_id} - Xóa bình luận
    // Backend Java: CommentController.deleteComment(@PathVariable String postId, int commentId)
    // Chỉ tác giả comment hoặc tác giả post mới được xóa
    deleteComment: (postId, commentId) =>
        axiosClient.delete(`/posts/${postId}/comments/${commentId}`),
};

// ============================================================
// REACTION SERVICE - Tương tác (Like, Love, Haha, Sad, Angry)
// ============================================================
export const reactionService = {
    // [MOCK] Thả react (Like)
    reactPost: async (postId, type) => {
        await new Promise(r => setTimeout(r, 200));
        const post = mockPosts.find(p => p.post_id === postId);
        if (post) post.reaction_count += 1;
        return { data: { success: true } };
    },

    // [MOCK] Bỏ Like
    removeReaction: async (postId) => {
        await new Promise(r => setTimeout(r, 200));
        const post = mockPosts.find(p => p.post_id === postId);
        if (post && post.reaction_count > 0) post.reaction_count -= 1;
        return { data: { success: true } };
    },

    getReactions: async () => ({ data: [] })
};

// ============================================================
// TAG SERVICE - Quản lý thẻ tag
// ============================================================
export const tagService = {
    // [MOCK] Lấy danh sách tags đã cho phép bởi Admin
    getAllTags: async () => {
        await new Promise(r => setTimeout(r, 200));
        return { data: { tags: mockTags } };
    },

    // [MOCK] Tạo tag mới (User có thể gọi, tuy nhiên thường Admin làm)
    createTag: async (tag_name) => {
        await new Promise(r => setTimeout(r, 200));
        mockTags.push({
            tag_id: mockTags.length + 1,
            tag_name: tag_name,
            created_at: new Date().toISOString()
        });
        return { data: { success: true } };
    },
};

// ============================================================
// MESSAGE SERVICE - Tin nhắn
// ============================================================
export const messageService = {
    // [API 9.1] GET /conversations - Danh sách cuộc hội thoại
    // Backend Java: MessageController.getConversations()
    getConversations: () => axiosClient.get("/conversations"),

    // [API 9.2] GET /conversations/{id}/messages - Lịch sử tin nhắn
    // Backend Java: MessageController.getMessages(@PathVariable String conversationId)
    // Query: { before? (uuid), limit? } - Cursor-based pagination
    getMessages: (conversationId, params) =>
        axiosClient.get(`/conversations/${conversationId}/messages`, { params }),

    // [API 9.3] POST /conversations/{id}/messages - Gửi tin nhắn (REST fallback)
    // Backend Java: MessageController.sendMessage(@PathVariable String conversationId)
    // Content-Type: multipart/form-data
    // Body: { content?, url_img (file)? } - ít nhất 1 trong 2
    sendMessage: (conversationId, formData) =>
        axiosClient.post(`/conversations/${conversationId}/messages`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // [API 9.4] POST /conversations/{id}/seen - Đánh dấu đã xem
    // Backend Java: MessageController.markSeen(@PathVariable String conversationId)
    // Backend sẽ update seen_by và reset unread_count = 0
    markSeen: (conversationId) =>
        axiosClient.post(`/conversations/${conversationId}/seen`),

    // [API 9.5] POST /conversations - Tạo cuộc hội thoại mới
    // Backend Java: MessageController.createConversation(@RequestBody)
    // Body: { user_id }
    // Nếu đã tồn tại -> trả về conversation_id hiện có (không tạo mới)
    createConversation: (userId) =>
        axiosClient.post("/conversations", { user_id: userId }),
};

// ============================================================
// NOTIFICATION SERVICE - Thông báo
// ============================================================
export const notificationService = {
    // [API 11.1] GET /notifications - Danh sách thông báo
    // Backend Java: NotificationController.getNotifications()
    // Query: { page?, limit?, is_read? }
    getNotifications: (params) => axiosClient.get("/notifications", { params }),

    // [API 11.2] PATCH /notifications/{id}/read - Đánh dấu một thông báo đã đọc
    // Backend Java: NotificationController.markRead(@PathVariable int notificationId)
    markRead: (notificationId) =>
        axiosClient.patch(`/notifications/${notificationId}/read`),

    // [API 11.3] PATCH /notifications/read-all - Đánh dấu tất cả đã đọc
    // Backend Java: NotificationController.markAllRead()
    markAllRead: () => axiosClient.patch("/notifications/read-all"),

    // [API 11.4] GET /notifications/unread-count - Số lượng chưa đọc
    // Backend Java: NotificationController.getUnreadCount()
    // Response: { notifications_unread, messages_unread, total_unread }
    getUnreadCount: () => axiosClient.get("/notifications/unread-count"),
};
