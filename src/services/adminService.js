import axiosClient from "./axiosClient";

// ============================================================
// ADMIN SERVICE - Chỉ dành cho user có role = 1 (Admin)
// Base URL: https://www.minboo-be.io.vn
// Auth: Authorization Bearer <access_token> (BẮT BUỘC)
// 403 Forbidden nếu user thường gọi các API này
// ============================================================

const adminService = {
  // ============================================================
  // [API 12.1] GET /admin/statistics - Thống kê tổng quan
  // Backend Java: AdminController.getStatistics()
  // Response: { total_users, active_users, banned_users, total_posts, pending_reports }
  // ============================================================
  getStatistics: () => axiosClient.get("/admin/statistics"),

  // ============================================================
  // [API 12.2.1] GET /admin/users - Danh sách người dùng
  // Backend Java: AdminController.getUsers()
  // Query: { page?, limit?, search?, is_active? }
  // Response: { users: [{ user_id, username, name, email, role, is_active, created_at }], pagination }
  // ============================================================
  getUsers: (params) => axiosClient.get("/admin/users", { params }),

  // ============================================================
  // [API 12.2.2] PATCH /admin/users/{user_id}/status - Khóa / Mở khóa tài khoản
  // Backend Java: AdminController.updateUserStatus()
  // Body: { is_active: boolean } — false để khóa, true để mở khóa
  // ============================================================
  updateUserStatus: (userId, is_active) =>
    axiosClient.patch(`/admin/users/${userId}/status`, { is_active }),

  // ============================================================
  // [API 12.3.1] DELETE /admin/posts/{post_id} - Admin xóa bài viết (bỏ qua quyền tác giả)
  // Backend Java: AdminController.deletePost()
  // ============================================================
  deletePost: (postId) => axiosClient.delete(`/admin/posts/${postId}`),

  // ============================================================
  // [API 12.4.1] GET /admin/reports - Danh sách báo cáo vi phạm
  // Backend Java: AdminController.getReports()
  // Query: { page?, limit?, status?: "pending" | "resolved" | "ignored" }
  // ============================================================
  getReports: (params) => axiosClient.get("/admin/reports", { params }),

  // ============================================================
  // [API 12.4.2] PATCH /admin/reports/{report_id}/status - Cập nhật trạng thái báo cáo
  // Backend Java: AdminController.updateReportStatus()
  // Body: { status: "resolved" | "ignored" }
  // ============================================================
  updateReportStatus: (reportId, status) =>
    axiosClient.patch(`/admin/reports/${reportId}/status`, { status }),

  // ============================================================
  // [API 8.1] GET /tags - Lấy tất cả tags (Admin quản lý)
  // Backend Java: TagController.getAllTags()
  // ============================================================
  getTags: () => axiosClient.get("/tags"),

  // ============================================================
  // [API 8.2] POST /tags - Tạo tag mới
  // Backend Java: TagController.createTag()
  // Body: { tag_name } — UNIQUE, 409 nếu trùng
  // ============================================================
  createTag: (tag_name) => axiosClient.post("/tags", { tag_name }),
};

export default adminService;
