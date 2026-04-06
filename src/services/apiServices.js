import axiosClient from "./axiosClient";

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
// FRIEND SERVICE - Quản lý bạn bè
// ============================================================
export const friendService = {
  // [API 4.1] GET /users/{user_id}/friends - Danh sách bạn bè
  // Backend Java: FriendController.getFriends(@PathVariable String userId)
  // Query: { page?, limit?, search? }
  getFriends: (userId, params) =>
    axiosClient.get(`/users/${userId}/friends`, { params }),

  // [API 4.2] POST /friends/requests - Gửi lời mời kết bạn
  // Backend Java: FriendController.sendFriendRequest(@RequestBody FriendRequestDTO)
  // Body: { to_id_B, message? }
  sendRequest: (data) => axiosClient.post("/friends/requests", data),

  // [API 4.3] PATCH /friends/requests/{id}/accept - Chấp nhận lời mời
  // Backend Java: FriendController.acceptRequest(@PathVariable int friendRequestId)
  acceptRequest: (friendRequestId) =>
    axiosClient.patch(`/friends/requests/${friendRequestId}/accept`),

  // [API 4.4] DELETE /friends/requests/{id} - Từ chối / hủy lời mời
  // Backend Java: FriendController.deleteRequest(@PathVariable int friendRequestId)
  deleteRequest: (friendRequestId) =>
    axiosClient.delete(`/friends/requests/${friendRequestId}`),

  // [API 4.5] DELETE /friends/{user_id} - Hủy kết bạn
  // Backend Java: FriendController.unfriend(@PathVariable String userId)
  unfriend: (userId) => axiosClient.delete(`/friends/${userId}`),

  // [API 4.6] GET /friends/requests/pending - Lời mời đang chờ
  // Backend Java: FriendController.getPendingRequests()
  // Response: { received: [...], sent: [...] }
  getPendingRequests: () => axiosClient.get("/friends/requests/pending"),
};

// ============================================================
// POST SERVICE - Quản lý bài viết
// ============================================================
export const postService = {
  // [API 5.1] GET /posts/feed - Bảng tin Home Feed
  // Backend Java: PostController.getFeed(@RequestParam int page, int limit)
  // Query: { page?, limit? }
  getFeed: (params) => axiosClient.get("/posts/feed", { params }),

  // [API 5.2] GET /users/{user_id}/posts - Bài viết của một user
  // Backend Java: PostController.getUserPosts(@PathVariable String userId)
  getUserPosts: (userId, params) =>
    axiosClient.get(`/users/${userId}/posts`, { params }),

  // [API 5.3] POST /posts - Tạo bài viết mới
  // Backend Java: PostController.createPost(@RequestBody / MultipartForm)
  // Content-Type: multipart/form-data
  // Body: { content?, url_img (file)?, privacy, tag_ids? }
  createPost: (formData) =>
    axiosClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // [API 5.4] PATCH /posts/{post_id} - Cập nhật bài viết
  // Backend Java: PostController.updatePost(@PathVariable String postId, @RequestBody)
  // Body: { content?, privacy?, tag_ids? }
  updatePost: (postId, data) => axiosClient.patch(`/posts/${postId}`, data),

  // [API 5.5] DELETE /posts/{post_id} - Xóa bài viết
  // Backend Java: PostController.deletePost(@PathVariable String postId)
  deletePost: (postId) => axiosClient.delete(`/posts/${postId}`),

  // [API 5.6] GET /posts/{post_id} - Chi tiết bài viết
  // Backend Java: PostController.getPostById(@PathVariable String postId)
  getPost: (postId) => axiosClient.get(`/posts/${postId}`),
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
  // [API 7.1] POST /posts/{post_id}/reactions - React bài viết
  // Backend Java: ReactionController.reactPost(@PathVariable String postId, @RequestBody)
  // Body: { type: "like" | "love" | "haha" | "sad" | "angry" }
  // Lưu ý: DB có UNIQUE(post_id, user_id) -> nếu đã react sẽ UPDATE thay vì INSERT
  reactPost: (postId, type) =>
    axiosClient.post(`/posts/${postId}/reactions`, { type }),

  // [API 7.2] DELETE /posts/{post_id}/reactions - Xóa reaction
  // Backend Java: ReactionController.removeReaction(@PathVariable String postId)
  removeReaction: (postId) => axiosClient.delete(`/posts/${postId}/reactions`),

  // [API 7.3] GET /posts/{post_id}/reactions - Danh sách người đã react
  // Backend Java: ReactionController.getReactions(@PathVariable String postId)
  // Query: { type?, page?, limit? }
  getReactions: (postId, params) =>
    axiosClient.get(`/posts/${postId}/reactions`, { params }),
};

// ============================================================
// TAG SERVICE - Quản lý thẻ tag
// ============================================================
export const tagService = {
  // [API 8.1] GET /tags - Lấy tất cả tags
  // Backend Java: TagController.getAllTags()
  getAllTags: () => axiosClient.get("/tags"),

  // [API 8.2] POST /tags - Tạo tag mới
  // Backend Java: TagController.createTag(@RequestBody)
  // Body: { tag_name } - UNIQUE constraint, 409 nếu trùng
  createTag: (tag_name) => axiosClient.post("/tags", { tag_name }),
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
