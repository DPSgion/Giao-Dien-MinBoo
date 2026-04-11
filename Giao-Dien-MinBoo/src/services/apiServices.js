import axiosClient from "./axiosClient";

// ============================================================
// USER SERVICE - Quản lý thông tin người dùng
// ============================================================
export const userService = {
    // GET /users - Lấy danh sách tất cả user
    getAllUsers: () => axiosClient.get("/users"),

    // GET /users/{id} (Hỗ trợ cả username bằng cách tự động search & lấy ID)
    getUser: async (userId) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
        if (isUUID) return axiosClient.get(`/users/${userId}`);

        // Nếu không phải UUID (vd: là username), gọi search API để bắt đúng người
        const res = await axiosClient.get("/users", { params: { search: userId } });
        const users = res?.content || res?.data || [];
        const matchedUser = users.find(u => u.username === userId);
        if (matchedUser) return { data: matchedUser }; // Giả lập response từ BE
        throw new Error("User not found");
    },

    // FE Fetch profile không có API /user/me nên gọi getUser với Username lấy từ JWT
    getCurrentUser: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No token");
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload?.sub; // BE lưu username trong sub
        return userService.getUser(username);
    },

    updateProfile: (data) => {

        if (data instanceof FormData) {
            return axiosClient.put("/user/me", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

        return axiosClient.put("/user/me", data);
    },


    uploadAvatar: (formData) =>
        axiosClient.post("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // PATCH /users/me/password - Đổi mật khẩu
    changePassword: (data) => axiosClient.patch("/users/me/password", data),

    // GET /users - Tìm kiếm user
    searchUsers: (params) => axiosClient.get("/users", {
        params: {
            search: params.q,
            page: params.page ? params.page - 1 : 0,
            size: params.limit || 20
        }
    }),
};

// ============================================================
// FRIEND SERVICE - Quản lý bạn bè
// ============================================================
export const friendService = {
    // GET /friends - Danh sách bạn bè
    getFriends: () => axiosClient.get("/friends"),

    // POST /friends/request/{friendId} - Gửi lời mời kết bạn
    // Body: { message: "Chào bạn, kết bạn nhé!" }
    sendRequest: (friendId, message) =>
        axiosClient.post(`/friends/request/${friendId}`, { message: message || "" }),

    // GET /friends/requests/send - Xem lời mời đã gửi
    getSentRequests: () => axiosClient.get("/friends/requests/send"),

    // GET /friends/requests/pending - Xem lời mời nhận được
    getPendingRequests: () => axiosClient.get("/friends/requests/pending"),

    // POST /friends/request/accept/{requestId} - Chấp nhận lời mời
    acceptRequest: (requestId) =>
        axiosClient.post(`/friends/request/accept/${requestId}`),

    // POST /friends/request/reject/{requestId} - Từ chối lời mời
    rejectRequest: (requestId) =>
        axiosClient.post(`/friends/request/reject/${requestId}`),

    // POST /friends/unfriend/{friendId} - Hủy kết bạn
    unfriend: (friendId) =>
        axiosClient.post(`/friends/unfriend/${friendId}`),
};


export const postService = {

    getFeed: (params) => axiosClient.get("/posts/feed", { params }),


    getUserPosts: (userId, params) =>
        axiosClient.get(`/users/${userId}/posts`, { params }),


    createPost: (formData) =>
        axiosClient.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),


    updatePost: (postId, data) => axiosClient.patch(`/posts/${postId}`, data),


    deletePost: (postId) => axiosClient.delete(`/posts/${postId}`),


    reportPost: (postId, data) =>
        axiosClient.post(`/posts/${postId}/report`, data),


    getPost: (postId) => axiosClient.get(`/posts/${postId}`),
};


export const commentService = {

    getComments: (postId, params) =>
        axiosClient.get(`/posts/${postId}/comments`, { params }),


    addComment: (postId, data) =>
        axiosClient.post(`/posts/${postId}/comments`, data),

    // [API 6.3] DELETE /posts/{post_id}/comments/{comment_id}
    deleteComment: (postId, commentId) =>
        axiosClient.delete(`/posts/${postId}/comments/${commentId}`),
};


export const reactionService = {

    reactPost: (postId, type) =>
        axiosClient.post(`/posts/${postId}/reactions`, { type }),


    removeReaction: (postId) =>
        axiosClient.delete(`/posts/${postId}/reactions`),


    getReactions: (postId, params) =>
        axiosClient.get(`/posts/${postId}/reactions`, { params }),
};

// ============================================================
// TAG SERVICE - [API 8] Quản lý thẻ tag
// ============================================================
export const tagService = {
    // [API 8.1] GET /tags
    getAllTags: () => axiosClient.get("/tags"),

    // [API 8.2] POST /tags
    createTag: (tag_name) => axiosClient.post("/tags", { tag_name }),
};

// ============================================================
// MESSAGE SERVICE - [API 9] Tin nhắn
// ============================================================
export const messageService = {
    // [API 9.1] GET /conversations
    getConversations: () => axiosClient.get("/conversations"),

    // [API 9.2] GET /conversations/{id}/messages
    getMessages: (conversationId, params) =>
        axiosClient.get(`/conversations/${conversationId}/messages`, { params }),

    // [API 9.3] POST /conversations/{id}/messages (multipart/form-data)
    sendMessage: (conversationId, formData) =>
        axiosClient.post(`/conversations/${conversationId}/messages`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // [API 9.4] POST /conversations/{id}/seen
    markSeen: (conversationId) =>
        axiosClient.post(`/conversations/${conversationId}/seen`),

    // [API 9.5] POST /conversations
    createConversation: (userId) =>
        axiosClient.post("/conversations", { user_id: userId }),
};

// ============================================================
// NOTIFICATION SERVICE - [API 11] Thông báo
// ============================================================
export const notificationService = {
    // [API 11.1] GET /notifications
    getNotifications: (params) => axiosClient.get("/notifications", { params }),

    // [API 11.2] PATCH /notifications/{id}/read
    markRead: (notificationId) =>
        axiosClient.patch(`/notifications/${notificationId}/read`),

    // [API 11.3] PATCH /notifications/read-all
    markAllRead: () => axiosClient.patch("/notifications/read-all"),

    // [API 11.4] GET /notifications/unread-count
    getUnreadCount: () => axiosClient.get("/notifications/unread-count"),
};
