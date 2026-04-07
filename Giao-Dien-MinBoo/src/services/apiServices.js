import axiosClient from "./axiosClient";

// ============================================================
// USER SERVICE - Quản lý thông tin người dùng
// ============================================================
export const userService = {
    // GET /users - Lấy danh sách tất cả user
    getAllUsers: () => axiosClient.get("/users"),

    // GET /users/{id} - Lấy thông tin 1 user
    getUser: (userId) => axiosClient.get(`/users/${userId}`),

    // GET /user/me - Lấy thông tin bản thân
    getCurrentUser: () => axiosClient.get("/user/me"),

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

    // GET /users/search - Tìm kiếm user
    searchUsers: (params) => axiosClient.get("/users/search", { params }),
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

    // POST /friends/requests/accept/{requestId} - Chấp nhận lời mời
    acceptRequest: (requestId) =>
        axiosClient.post(`/friends/requests/accept/${requestId}`),

    // POST /friends/requests/reject/{requestId} - Từ chối lời mời
    rejectRequest: (requestId) =>
        axiosClient.post(`/friends/requests/reject/${requestId}`),

    // POST /friends/unfriend/{friendId} - Hủy kết bạn
    unfriend: (friendId) =>
        axiosClient.post(`/friends/unfriend/${friendId}`),
};

// ============================================================
// POST SERVICE - [API 5] Quản lý bài viết
// ============================================================
export const postService = {
    // [API 5.1] GET /posts/feed
    getFeed: (params) => axiosClient.get("/posts/feed", { params }),

    // [API 5.2] GET /users/{user_id}/posts
    getUserPosts: (userId, params) =>
        axiosClient.get(`/users/${userId}/posts`, { params }),

    // [API 5.3] POST /posts (multipart/form-data)
    createPost: (formData) =>
        axiosClient.post("/posts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // [API 5.4] PATCH /posts/{post_id}
    updatePost: (postId, data) => axiosClient.patch(`/posts/${postId}`, data),

    // [API 5.5] DELETE /posts/{post_id}
    deletePost: (postId) => axiosClient.delete(`/posts/${postId}`),

    // [API 5.6] POST /posts/{post_id}/report
    reportPost: (postId, data) =>
        axiosClient.post(`/posts/${postId}/report`, data),

    // Lấy 1 bài viết cụ thể (nếu BE có hỗ trợ)
    getPost: (postId) => axiosClient.get(`/posts/${postId}`),
};

// ============================================================
// COMMENT SERVICE - [API 6] Quản lý bình luận
// ============================================================
export const commentService = {
    // [API 6.1] GET /posts/{post_id}/comments
    getComments: (postId, params) =>
        axiosClient.get(`/posts/${postId}/comments`, { params }),

    // [API 6.2] POST /posts/{post_id}/comments
    addComment: (postId, data) =>
        axiosClient.post(`/posts/${postId}/comments`, data),

    // [API 6.3] DELETE /posts/{post_id}/comments/{comment_id}
    deleteComment: (postId, commentId) =>
        axiosClient.delete(`/posts/${postId}/comments/${commentId}`),
};

// ============================================================
// REACTION SERVICE - [API 7] Tương tác (Like, Love, Haha, Sad, Angry)
// ============================================================
export const reactionService = {
    // [API 7.1] POST /posts/{post_id}/reactions
    reactPost: (postId, type) =>
        axiosClient.post(`/posts/${postId}/reactions`, { type }),

    // [API 7.2] DELETE /posts/{post_id}/reactions
    removeReaction: (postId) =>
        axiosClient.delete(`/posts/${postId}/reactions`),

    // [API 7.3] GET /posts/{post_id}/reactions
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
