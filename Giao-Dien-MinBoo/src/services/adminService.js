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
    await delay();
    return {
      data: {
        total_users: mockUsers.length,
        active_users: mockUsers.filter(u => u.is_active).length,
        banned_users: mockUsers.filter(u => !u.is_active).length,
        total_posts: 156,
        pending_reports: mockReports.filter(r => r.status === 'pending').length
      }
    };
  },

  getUsers: async (params) => {
    await delay();
    let filtered = [...mockUsers];
    
    // Tìm kiếm
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(s) || 
        u.username.toLowerCase().includes(s) || 
        u.email.toLowerCase().includes(s)
      );
    }
    
    // Lọc theo trạng thái
    if (params.is_active !== undefined) {
      filtered = filtered.filter(u => u.is_active === params.is_active);
    }

    // Lọc Role (nếu có truyền lên)
    if (params.role !== undefined) {
      filtered = filtered.filter(u => u.role === params.role);
    }

    // Phân trang
    const page = params.page || 1;
    const limit = params.limit || 15;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: {
        users: paginated,
        pagination: { total: filtered.length, page, limit }
      }
    };
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
    await delay(200);
    return { data: { tags: mockTags } };
  },

  createTag: async (tag) => {
    await delay(300);
    mockTags.push({ 
      tag_id: mockTags.length + 1, 
      tag_name: tag, 
      created_at: new Date().toISOString() 
    });
    return { data: { success: true } };
  }
};

export default adminService;
