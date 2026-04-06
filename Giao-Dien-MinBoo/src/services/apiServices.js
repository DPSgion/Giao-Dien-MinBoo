import axiosClient from "./axiosClient";

// ============================================================
// USER SERVICE - [API 3] Quản lý thông tin người dùng
// ============================================================
export const userService = {
    // [API 3.1] GET /users/{user_id}
    getUser: (userId) => axiosClient.get(`/users/${userId}`),

    // [API 3.2] PATCH /users/me
    updateProfile: (data) => axiosClient.patch("/users/me", data),

    // [API 3.3] POST /users/me/avatar (multipart/form-data)
    uploadAvatar: (formData) =>
        axiosClient.post("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // [API 3.4] GET /users/search
    searchUsers: (params) => axiosClient.get("/users/search", { params }),
};

// ============================================================
// FRIEND SERVICE - [API 4] Quản lý bạn bè
// ============================================================
export const friendService = {
    // [API 4.1] GET /users/{user_id}/friends
    getFriends: (userId, params) =>
        axiosClient.get(`/users/${userId}/friends`, { params }),

    // [API 4.2] POST /friends/requests
    sendRequest: (data) => axiosClient.post("/friends/requests", data),

    // [API 4.3] PATCH /friends/requests/{id}/accept
    acceptRequest: (friendRequestId) =>
        axiosClient.patch(`/friends/requests/${friendRequestId}/accept`),

    // [API 4.4] DELETE /friends/requests/{id}
    deleteRequest: (friendRequestId) =>
        axiosClient.delete(`/friends/requests/${friendRequestId}`),

    // [API 4.5] DELETE /friends/{user_id}
    unfriend: (userId) => axiosClient.delete(`/friends/${userId}`),

    // [API 4.6] GET /friends/requests/pending
    getPendingRequests: () => axiosClient.get("/friends/requests/pending"),
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
