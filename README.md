# MinBoo Frontend

Giao diện Instagram-style cho ứng dụng mạng xã hội MinBoo.

## Stack
- **ReactJS** (Vite)
- **Axios** + interceptor tự động refresh token
- **React Router v6**
- **Tailwind CSS**
- **WebSocket** native (real-time chat)

---

## Cài đặt & Chạy

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev server
npm run dev
# → http://localhost:3000
```

---

## Cấu trúc dự án

```
src/
├── contexts/
│   └── AuthContext.jsx          # Global auth state (user, login, logout)
├── services/
│   ├── axiosClient.js           # Axios instance + auto refresh token
│   ├── authService.js           # API 2.x - Auth
│   ├── apiServices.js           # API 3.x-11.x - User/Post/Friend/Message/Notification
│   └── websocketService.js      # WS - Real-time chat & notifications
├── components/
│   ├── layout/
│   │   └── MainLayout.jsx       # Sidebar navigation (Instagram style)
│   ├── post/
│   │   └── PostCard.jsx         # Post card với reactions, comments
│   └── story/
│       └── StoryBar.jsx         # Story circles
├── pages/
│   ├── Auth/
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── Home/
│   │   ├── index.jsx            # Feed + infinite scroll
│   │   └── CreatePost.jsx       # Tạo bài viết (drag & drop)
│   ├── Profile/
│   │   └── index.jsx            # Trang cá nhân + chỉnh sửa
│   ├── Messages/
│   │   └── index.jsx            # DM + WebSocket realtime
│   ├── Friends/
│   │   └── index.jsx            # Danh sách bạn bè + lời mời
│   ├── Notifications/
│   │   └── index.jsx            # Thông báo + đánh dấu đã đọc
│   └── Search/
│       └── SearchModal.jsx      # Tìm kiếm slide-in panel
└── App.jsx                      # Routes + PrivateRoute guard
```

---

## API Mapping (Backend Java)

| Service | API | Method | Endpoint |
|---------|-----|--------|----------|
| Auth | Đăng ký | POST | /auth/register |
| Auth | Đăng nhập | POST | /auth/login |
| Auth | Refresh token | POST | /auth/refresh-token |
| Auth | Đăng xuất | POST | /auth/logout |
| User | Lấy profile | GET | /users/{user_id} |
| User | Cập nhật profile | PATCH | /users/me |
| User | Upload avatar | POST | /users/me/avatar |
| User | Tìm kiếm | GET | /users/search |
| Friend | Danh sách bạn | GET | /users/{id}/friends |
| Friend | Gửi lời mời | POST | /friends/requests |
| Friend | Chấp nhận | PATCH | /friends/requests/{id}/accept |
| Friend | Từ chối/hủy | DELETE | /friends/requests/{id} |
| Friend | Hủy kết bạn | DELETE | /friends/{user_id} |
| Friend | Lời mời pending | GET | /friends/requests/pending |
| Post | Home feed | GET | /posts/feed |
| Post | Bài viết user | GET | /users/{id}/posts |
| Post | Tạo bài viết | POST | /posts |
| Post | Cập nhật | PATCH | /posts/{id} |
| Post | Xóa | DELETE | /posts/{id} |
| Comment | Danh sách | GET | /posts/{id}/comments |
| Comment | Thêm | POST | /posts/{id}/comments |
| Comment | Xóa | DELETE | /posts/{id}/comments/{cid} |
| Reaction | React | POST | /posts/{id}/reactions |
| Reaction | Xóa reaction | DELETE | /posts/{id}/reactions |
| Tag | Danh sách | GET | /tags |
| Tag | Tạo mới | POST | /tags |
| Message | Danh sách hội thoại | GET | /conversations |
| Message | Lịch sử tin nhắn | GET | /conversations/{id}/messages |
| Message | Gửi tin nhắn | POST | /conversations/{id}/messages |
| Message | Đánh dấu đã xem | POST | /conversations/{id}/seen |
| Message | Tạo hội thoại | POST | /conversations |
| Notification | Danh sách | GET | /notifications |
| Notification | Đánh dấu đọc | PATCH | /notifications/{id}/read |
| Notification | Đánh dấu tất cả | PATCH | /notifications/read-all |
| Notification | Số chưa đọc | GET | /notifications/unread-count |

---

## WebSocket Events

**Base URL:** `wss://www.minboo-be.io.vn/ws?token=<access_token>`

### Client → Server
| Event | Payload |
|-------|---------|
| send_message | `{ conversation_id, content, url_img }` |
| typing | `{ conversation_id }` |
| stop_typing | `{ conversation_id }` |
| mark_seen | `{ conversation_id }` |

### Server → Client
| Event | Payload |
|-------|---------|
| new_message | `{ message_id, conversation_id, content, ... }` |
| message_seen | `{ conversation_id, seen_by, seen_at }` |
| user_typing | `{ conversation_id, user_id }` |
| user_stop_typing | `{ conversation_id, user_id }` |
| user_online | `{ user_id }` |
| user_offline | `{ user_id, last_seen }` |
| new_notification | `{ notification_id, type, entity_id, ... }` |

---

## Lưu ý cho Backend Java

1. **CORS**: Cho phép origin `http://localhost:3000` trong development
2. **JWT**: Access token trong header `Authorization: Bearer <token>`
3. **Refresh Token**: `/auth/refresh-token` KHÔNG cần Authorization header
4. **Multipart**: Avatar và ảnh post dùng `multipart/form-data`
5. **WebSocket**: Xác thực qua query param `?token=<access_token>`
6. **Reactions**: DB có UNIQUE(post_id, user_id) → backend tự xử lý update/insert
7. **Conversations**: Nếu đã tồn tại giữa 2 user → trả về conversation_id hiện có
