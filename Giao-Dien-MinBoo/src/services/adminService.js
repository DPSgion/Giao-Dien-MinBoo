// ==========================================
// MOCK DATA FOR ADMIN UI TESTING
// Dựa trên bảng SQL (users, reports, tags, posts)
// ==========================================
import axiosClient from './axiosClient';

// --- Giả lập Database trong RAM ---
let mockUsers = [
  {
    user_id: '7d99d30e-caeb-4e3a-aa81-cc5a7c58a1d2',
    url_avt: 'https://ui-avatars.com/api/?name=Tai&background=7c3aed&color=fff',
    name: 'Tài Nguyễn (Admin)',
    username: 'tai123',
    email: 'ahaha@gmail.com',
    role: 1, // Admin
    is_active: true,
    created_at: '2026-03-20T14:17:23.190Z'
  },
  {
    user_id: 'c8a2d1f4-3b5e-4c7a-9d2b-1e8f5a6b7c8d',
    url_avt: 'https://ui-avatars.com/api/?name=Mai+Le&background=10b981&color=fff',
    name: 'Mai Lê',
    username: 'maile99',
    email: 'mai.le@gmail.com',
    role: 0,
    is_active: true,
    created_at: '2026-03-22T09:30:00.000Z'
  },
  {
    user_id: 'b3f5e2d1-4c6a-4b8b-8e1d-9f2a4c6b8d0e',
    url_avt: 'https://ui-avatars.com/api/?name=Spam&background=ef4444&color=fff',
    name: 'Khách Hàng Spam',
    username: 'spammer1',
    email: 'spam@mailinator.com',
    role: 0,
    is_active: false,
    created_at: '2026-03-23T11:45:00.000Z'
  }
];

// Sinh thêm data ảo cho Users
for (let i = 4; i <= 35; i++) {
  mockUsers.push({
    user_id: `user-uuid-${i}`,
    url_avt: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
    name: `Người dùng ${i}`,
    username: `user${i}`,
    email: `user${i}@example.com`,
    role: 0,
    is_active: Math.random() > 0.2, // 80% user hoạt động, 20% bị khóa
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString()
  });
}

let mockReports = [
  {
    report_id: 1,
    post_id: 'post-uuid-1',
    reported_by: { name: 'Mai Lê' },
    reason: 'spam',
    description: 'Tài khoản này liên tục đăng bài quảng cáo rác làm phiền bản tin.',
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    report_id: 2,
    post_id: 'post-uuid-2',
    reported_by: { name: 'Tài Nguyễn' },
    reason: 'inappropriate_content',
    description: 'Sử dụng ngôn từ thù ghét',
    status: 'resolved',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    report_id: 3,
    post_id: 'post-uuid-3',
    reported_by: { name: 'Người dùng 5' },
    reason: 'other',
    description: 'Kêu gọi lừa đảo nạp tiền',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export const mockTags = [
  { tag_id: 1, tag_name: 'Giáo dục', created_at: new Date().toISOString() },
  { tag_id: 2, tag_name: 'Giải trí', created_at: new Date().toISOString() }
];

// --- Fake Delay (Giả lập thời gian load mạng) ---
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const adminService = {
  getStatistics: async () => {
    // Gọi DB thực để lấy tổng user
    try {
      const res = await axiosClient.get("/users", { params: { size: 1, page: 0 } });
      const total = res?.totalElements || res?.data?.totalElements || 0;
      
      return {
        data: {
          total_users: total,
          active_users: total,
          banned_users: 0,
          total_posts: 156, // Chưa có API đếm bài viết trên BE
          pending_reports: mockReports.filter(r => r.status === 'pending').length
        }
      };
    } catch(err) {
      return { data: { total_users: 0, active_users: 0, banned_users: 0, total_posts: 0, pending_reports: 0 } };
    }
  },

  getUsers: async (params) => {
    try {
      // Vì BE (PageResponse) map page từ 0 (0-indexed), nên ta trừ đi 1 so với Frontend (1-indexed).
      const pageIndex = (params.page || 1) - 1;
      const limit = params.limit || 15;
      
      const beParams = {
        page: pageIndex,
        size: limit
      };
      
      if (params.search) {
        beParams.search = params.search;
      }
      
      const res = await axiosClient.get("/users", { params: beParams });
      
      // Axios interceptor đã lấy response.data
      const content = res?.content || res?.data?.content || [];
      const totalElements = res?.totalElements || res?.data?.totalElements || 0;
      
      // Map định dạng BE sang định dạng FE Admin mong đợi
      const mappedUsers = content.map(u => ({
        user_id: u.id,
        url_avt: u.avatar,
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.username === "POCCHITHEROCK" ? 1 : 0, // Tạm thời nâng quyền để dễ test Admin
        is_active: true, // DB hiện chưa chặn user
        created_at: new Date().toISOString() // DB hiện chưa lưu created_at vào Response
      }));
      
      return {
        data: {
          users: mappedUsers,
          pagination: { total: totalElements, page: params.page || 1, limit }
        }
      };
    } catch(err) {
      return { data: { users: [], pagination: { total: 0 } } };
    }
  },

  updateUserStatus: async (userId, status) => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.user_id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].is_active = status;
    }
    return { data: { success: true } };
  },

  getReports: async (params) => {
    await delay();
    let filtered = [...mockReports];

    if (params.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 15;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: {
        reports: paginated,
        pagination: { total: filtered.length, page, limit }
      }
    };
  },

  updateReportStatus: async (reportId, status) => {
    await delay(300);
    const reportIndex = mockReports.findIndex(r => r.report_id === reportId);
    if (reportIndex !== -1) {
      mockReports[reportIndex].status = status;
    }
    return { data: { success: true } };
  },

  deletePost: async (postId) => {
    await delay(400);
    // giả định post bị xóa thành công
    return { data: { success: true } };
  },

  getTags: async () => {
    return axiosClient.get("/tags").then(res => {
      return { data: { tags: res.data || res || [] } };
    }).catch(() => {
      return { data: { tags: [] } };
    });
  },

  createTag: async (tag) => {
    return axiosClient.post("/tags", { tag_name: tag }).then(res => {
      return { data: res.data || res };
    });
  },

  deleteTag: async (tagId) => {
    return axiosClient.delete(`/tags/${tagId}`).then(res => {
      return { data: { success: true } };
    });
  },

  getPendingPosts: async (params) => {
    return axiosClient.get("/admin/pending", { params });
  },

  updatePostModeration: async (postId, status) => {
    return axiosClient.patch(`/admin/${postId}/status`, null, { params: { status } });
  }
};

export default adminService;
