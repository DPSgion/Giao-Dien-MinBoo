# CÁC YÊU CẦU CẦN THỰC HIỆN TỪ FILE WORD

👉 **HƯỚNG DẪN:** 
API
Version 1.1 • REST API • JSON
Base URL: https://www.minboo-be.io.vn
1. Tổng quan
1.1 Quy ước chung
•	Content-Type: Tất cả request và response sử dụng application/json
•	Authentication: Xác thực bằng JWT Bearer Token trong header Authorization
•	Timestamp: Định dạng ISO 8601 (UTC). Ví dụ: 2024-01-15T14:30:00Z
•	Pagination: Mặc định page=1, limit=20
1.2 HTTP Status Codes & Error Codes
•	200 OK: Thành công
•	201 Created: Tạo thành công
•	400 Bad Request: Dữ liệu không hợp lệ
•	401 Unauthorized: Chưa xác thực (mã lỗi: INVALID_CREDENTIALS, TOKEN_EXPIRED)
•	403 Forbidden: Không có quyền (mã lỗi: FORBIDDEN)
•	404 Not Found: Không tìm thấy resource (mã lỗi: USER_NOT_FOUND, POST_NOT_FOUND)
•	409 Conflict: Xung đột (mã lỗi: USERNAME_EXISTS, ALREADY_FRIENDS)
•	500 Internal Server Error: Lỗi hệ thống
 
2. Authentication (/auth)
2.1 Đăng ký tài khoản mới
API: POST - /auth/register
Request Body:
Field	Type	Bắt buộc	Mô tả
name	string	Có	Họ và tên hiển thị
username	string	Có	Tên đăng nhập (Unique)
password	string	Có	Mật khẩu
email	string	Có	Email (Unique)
sdt	string	Có	Số điện thoại (Unique)
birth	string	Không	Ngày sinh (YYYY-MM-DD)
sex	string	Không	Giới tính
address	string	Không	Địa chỉ / Thành phố
Response 201:
{
  "success": true,
  "data": {
    "user": {
      "user_id": "jqjjj34",
      "name": "tai",
      "username": "ba123",
      "email": "bai321@email.com",
      "sdt": "0987654321",
      "birth": "1995-05-15",
      "sex": "male",
      "address": "Ho Chi Minh",
      "url_avt": null,
      "created_at": "2024-01-15T07:00:00Z"
    },
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci..." }}
2.2 Đăng nhập
API: POST - /auth/login
Request Body:
Field	Type	Bắt buộc	Mô tả
username	string	Có	Tên đăng nhập 
password	string	Có	Mật khẩu 
Response 200: Trả về thông tin user cùng với token để xác thực các request tiếp theo.
=> Giống response của đăng ký
 
2.3 Lấy Token mới (Refresh Token)
API: POST /auth/refresh-token
API này không yêu cầu header Authorization.
Request Body:
Field	Type	Bắt buộc	Mô tả
refresh_token	string	Có	Refresh token nhận được khi đăng nhập lần đầu 
Response 200:
Trả về cặp token mới để frontend lưu lại và tiếp tục sử dụng.
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refresh_token": "def502005a30e46821382559..."
  },
  "message": "Token refreshed successfully"
}
 
2.4 Đăng xuất
API: POST - /auth/logout
API này CÓ yêu cầu gửi kèm header Authorization: Bearer <access_token>
Request Body:
Field	Type	Bắt buộc	Mô tả
refresh_token	string	Có	Refresh token hiện tại cần thu hồi/xóa khỏi server 
Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
 
3. User
3.1 Lấy thông tin cá nhân
API: GET - /users/{user_id}
Path Params:
Param	Type	Bắt buộc	Mô tả
user_id	string (uuid)	Có	ID của user cần xem (Truyền me để lấy thông tin của chính mình)
Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@email.com",
    "sdt": "0987654321",
    "sex": "male",
    "address": "Ho Chi Minh City",
    "birth": "1995-05-15",
    "url_avt": "https://cdn.yourdomain.com/avatar.jpg",
    "friend_request_status": 1,
    "created_at": "2024-01-15T07:00:00Z"
  }
}
 
3.2 Cập nhật thông tin cá nhân
API: PATCH - /users/me
Request Body:
Field	Type	Bắt buộc	Mô tả
address	string	Không	Địa chỉ / Thành phố
birth	string	Không	Ngày sinh định dạng YYYY-MM-DD
sex	string	Không	Giới tính (ví dụ: male, female, other)
email	string	Không	Email (phải unique trong DB)
sdt	string	Không	Số điện thoại (phải unique trong DB)
Response 200:
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "username": "johndoe",
    "email": "john_new@email.com",
    "sdt": "0987654321",
    "sex": "male",
    "address": "Hanoi",
    "birth": "1995-05-15",
    "created_at": "2024-01-15T07:00:00Z"
  },
  "message": "Profile updated successfully"
}
 
3.3 Upload Ảnh đại diện (Avatar)
API: POST - /users/me/avatar
Request: multipart/form-data
Field	Type	Bắt buộc	Mô tả
file	file	Có	File ảnh upload (tối đa 10MB, định dạng JPG/PNG/WEBP)
Response 200:
{
  "success": true,
  "data": {
    "url_avt": "https://cdn.yourdomain.com/new_avatar.jpg"
  },
  "message": "Avatar uploaded successfully"
}
 
3.4 Tìm kiếm User
API: GET - /users/search
Tìm kiếm user theo tên, số điện thoại hoặc email.
Query Params:
Param	Type	Bắt buộc	Mô tả
q	string	Có	Từ khóa tìm kiếm (name, email, sdt)
page	integer	Không	Số trang, mặc định 1
limit	integer	Không	Số kết quả mỗi trang, mặc định 20
Response 200:
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "uuid",
        "name": "John Doe",
        "username": "johndoe",
        "address": "Ho Chi Minh City",
        "url_avt": "https://cdn.yourdomain.com/avatar.jpg",
        "is_friend": false
      },
      {
        "user_id": "uuid",
        "name": "Johnny Depp",
        "username": "johnny",
        "address": "Hanoi",
        "url_avt": null,
        "is_friend": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
 
4. Bạn Bè (Friends)
4.1 Danh sách bạn bè
API: GET - /users/{user_id}/friends
Query Params:
Param	Type	Bắt buộc	Mô tả
page	integer	Không	Số trang, mặc định 1
limit	integer	Không	Số kết quả, mặc định 20
search	string	Không	Tìm theo tên (name) hoặc địa chỉ (address)
Response 200:
{
  "success": true,
  "data": {
    "friends": [
      {
        "friend_id": 150,
        "user_id": "uuid",
        "name": "Jane Smith",
        "username": "janesmith",
        "url_avt": "https://cdn.yourdomain.com/jane.jpg",
        "address": "Hanoi",
        "is_online": true,
        "last_seen": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
 
4.2 Gửi lời mời kết bạn
API: POST - /friends/requests
Request Body:
Field	Type	Bắt buộc	Mô tả
to_id_B	uuid	Có	ID của user muốn kết bạn (Tương ứng với to_id_B trong DB)
message	string	Không	Lời nhắn gửi kèm khi kết bạn
Response 201:
{
  "success": true,
  "data": {
    "friend_request_id": 1024,
    "from_id_A": "uuid-cua-ban",
    "to_id_B": "uuid-nguoi-nhan",
    "message": "Chào bạn, mình làm quen nhé!",
    "status": "pending",
    "created_at": "2024-01-15T08:00:00Z"
  },
  "message": "Friend request sent successfully"
}
 
4.3 Chấp nhận lời mời kết bạn
API: PATCH - /friends/requests/{friend_request_id}/accept
Chấp nhận lời mời kết bạn. (Backend sẽ cập nhật status = 'accepted' và insert 1 record mới vào bảng friends)
Path Params:
Param	Type	Bắt buộc	Mô tả
friend_request_id	integer	Có	ID của lời mời kết bạn (SERIAL trong bảng friends_request)
Response 200:
{
  "success": true,
  "message": "Friend request accepted"
}
 
4.4 Từ chối / Hủy lời mời kết bạn
API: DELETE - /friends/requests/{friend_request_id}
Path Params:
Param	Type	Bắt buộc	Mô tả
friend_request_id	integer	Có	ID của lời mời kết bạn
Response 200:
{
  "success": true,
  "message": "Friend request removed"
}
 
4.5 Hủy kết bạn
API: DELETE - /friends/{user_id}
Backend sẽ query bảng friends dựa vào user_id_A và user_id_B để xóa dòng tương ứng
Path Params:
Param	Type	Bắt buộc	Mô tả
user_id	string (uuid)	Có	ID của người dùng muốn hủy kết bạn
Response 200:
{
  "success": true,
  "message": "Unfriended successfully"
}
 
4.6 Danh sách lời mời đang chờ
API: GET - /friends/requests/pending
Lấy danh sách các lời mời kết bạn chưa xử lý (status = pending)
Response 200:
{
  "success": true,
  "data": {
    "received": [ 
      {
        "friend_request_id": 1024,
        "message": "Xin chào, kết bạn nhé!",
        "from_user": {
          "user_id": "uuid",
          "name": "Alex",
          "url_avt": "https://cdn.yourdomain.com/alex.jpg"
        },
        "created_at": "2024-01-15T08:00:00Z"
      }
    ],
    "sent": [      
      {
        "friend_request_id": 1025,
        "message": null,
        "to_user": {
          "user_id": "uuid",
          "name": "Anna",
          "url_avt": "https://cdn.yourdomain.com/anna.jpg"
        },
        "created_at": "2024-01-15T09:00:00Z"
      }
    ]
  }} 
5. Bài Viết (Posts)
5.1 Lấy Bảng Tin (Home Feed)
API: GET - /posts/feed
Lấy danh sách bài viết hiển thị trên bảng tin (bao gồm bài của bạn bè và của chính user
Query Params:
Param	Type	Mô tả
page	integer	Số trang, mặc định 1 
limit	integer	Số bài mỗi trang, mặc định 20 
Response 200:
{
  "success": true,
  "data": {
    "posts": [
      {
        "post_id": "uuid-cua-bai-viet",
        "content": "Hôm nay thời tiết thật đẹp!",
        "url_img": "https://cdn.yourdomain.com/posts/img1.jpg",
        "privacy": "public",
        "created_at": "2024-01-15T07:30:00Z",
        "updated_at": "2024-01-15T07:30:00Z",
        "author": {
          "user_id": "uuid-cua-tac-gia",
          "name": "John Doe",
          "url_avt": "https://cdn.yourdomain.com/avatar.jpg"
        },
        "tags": [
          { "tag_id": 1, "tag_name": "Life" },
          { "tag_id": 2, "tag_name": "Chill" }
        ],
        "reactions_count": { "total": 15, "like": 10, "love": 3, "haha": 1, "sad": 1, "angry": 0 },
        "my_reaction": "like",
        "comments_count": 5
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
}
 
5.2 Lấy bài viết của một user cụ thể
API: GET - /users/{user_id}/posts
Lấy danh sách bài viết trên trang cá nhân của một người:
•	Chỉ trả về bài public hoặc bài của bạn bè (nếu hai người đã kết bạn).
•	Bài private (Chỉ mình tôi) chỉ hiện khi tự xem trang của chính mình.
Query Params và Response 200: tương tự API 5.1
 
5.3 Tạo bài viết mới
API: POST - /posts
Request: multipart/form-data
Field	Type	Bắt buộc	Mô tả
content	string	Không	Nội dung text bài viết 
url_img	file	Không	File ảnh đính kèm (tối đa 5MB). Theo DB hiện tại chỉ lưu 1 ảnh 
privacy	string	Có	Quyền riêng tư: public | friends | private 
tag_ids	integer[]	Không	Mảng các ID của tag muốn gắn (ví dụ: [1, 2, 5]) 
* Backend: Sau khi insert vào bảng posts, cần lặp mảng tag_ids để insert các record tương ứng vào bảng trung gian post_tags
Response 201:
 
5.4 Sửa bài viết
API: PATCH - /posts/{post_id}
Chỉ tác giả của bài viết mới có quyền gọi API này
Request Body:
Field	Type	Mô tả
content	string	Nội dung chữ mới 
privacy	string	Cập nhật quyền: public | friends | private 
tag_ids	integer[]	Danh sách tag mới (Backend sẽ xóa các tag cũ trong post_tags và insert lại danh sách này) 

 
5.5 Xóa bài viết
API: DELETE - /posts/{post_id}
Response 200:
{
  "success": true,
  "message": "Post deleted successfully"
}
 
5.6 Báo cáo bài viết
API: POST - /posts/{post_id}/report
Request Body:
Field	Type	Bắt buộc	Mô tả
reason	string	Có	inappropriate_content | spam | other 
description	string	Không	Mô tả chi tiết thêm về vi phạm 
Response 200:
{
  "success": true,
  "message": "Report submitted successfully"
}
 
6. Bình Luận (Comments)
6.1 Lấy danh sách bình luận
API: GET - /posts/{post_id}/comments
Query Params:
Param	Type	Mô tả
page	integer	Số trang, mặc định 1 
limit	integer	Số bình luận mỗi trang, mặc định 20 
Response 200:
{
  "success": true,
  "data": {
    "comments": [
      {
        "comment_id": 1,
        "content": "Tuyệt vời quá bạn ơi!",
        "created_at": "2024-01-15T08:00:00Z",
        "author": { 
          "user_id": "uuid", 
          "name": "Jane", 
          "url_avt": "https://cdn.yourdomain.com/jane.jpg" 
        }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 15 }
  }
}
 
6.2 Thêm bình luận
API: POST - /posts/{post_id}/comments
Request Body:
Field	Type	Bắt buộc	Mô tả
content	string	Có	Nội dung bình luận (1-1000 ký tự) 
Response 201: Trả về object bình luận vừa tạo giống cấu trúc của API 6.1.
 
6.3 Xóa bình luận
API: DELETE - /posts/{post_id}/comments/{comment_id}
Chỉ tác giả của bình luận hoặc tác giả của bài viết mới có quyền xóa.
Path Params:
Param	Type	Bắt buộc	Mô tả
comment_id	integer	Có	ID của bình luận cần xóa
Response 200:
{
  "success": true,
  "message": "Comment deleted successfully"
}
 
7. Tương Tác (Reactions)
7.1 React bài viết
API: POST - /posts/{post_id}/reactions
* Backend: Database đã cấu hình UNIQUE (post_id, user_id). Do đó, nếu user đã react trước đó, API này sẽ thực hiện thao tác Cập nhật (Update) thành loại reaction mới thay vì báo lỗi.
Request Body:
Field	Type	Bắt buộc	Mô tả
type	string	Có	Loại reaction: like | love | haha | sad | angry 
Response 200:
{
  "success": true,
  "message": "Reaction updated successfully"
}
 
7.2 Xóa reaction
API: DELETE - /posts/{post_id}/reactions
Response 200:
{
  "success": true,
  "message": "Reaction removed"
}
 
7.3 Danh sách người đã react
API: GET - /posts/{post_id}/reactions
Query Params:
Param	Type	Mô tả
type	string	Lọc theo loại: like | love | haha | sad | angry (optional) 
page	integer	Số trang, mặc định 1 
limit	integer	Số kết quả, mặc định 20 
Response 200:
{
  "success": true,
  "data": {
    "summary": { "total": 15, "like": 10, "love": 3, "haha": 1, "sad": 1, "angry": 0 },
    "users": [
      { 
        "user_id": "uuid", 
        "name": "Alex", 
        "url_avt": "https://cdn.yourdomain.com/alex.jpg", 
        "reaction_type": "like" 
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 15 }
  }
}
 
8. Tags (Thẻ)
8.1 Lấy danh sách tất cả tags
API: GET - /tags
Response 200:
{
  "success": true,
  "data": {
    "tags": [
      { "tag_id": 1, "tag_name": "Sport" },
      { "tag_id": 2, "tag_name": "Anime" },
      { "tag_id": 3, "tag_name": "Work" },
      { "tag_id": 4, "tag_name": "Hobby" },
      { "tag_id": 5, "tag_name": "Game" }
    ]
  }
}
 
8.2 Tạo tag mới
API: POST - /tags
* Backend: Lưu ý cột tag_name có ràng buộc UNIQUE, cần handle lỗi 409 Conflict nếu người dùng tạo trùng tên tag đang có.
Request Body:
Field	Type	Bắt buộc	Mô tả
tag_name	string	Có	Tên tag (không được trùng lặp) 
Response 201:
{
  "success": true,
  "data": {
    "tag_id": 6,
    "tag_name": "My Custom Tag",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "Tag created successfully"
}
 
9. Tin Nhắn (Messages / Chat)
9.1 Danh sách cuộc hội thoại
API: GET - /conversations
Response 200:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "uuid-cua-cuoc-tro-chuyen",
        "partner": { 
          "user_id": "uuid", 
          "name": "Jane Smith", 
          "url_avt": "https://cdn.yourdomain.com/jane.jpg", 
          "is_online": true 
        },
        "last_message": "Hôm nay bạn khỏe không?",
        "seen_by": "uuid-cua-nguoi-da-xem-cuoi-cung",
        "unread_count": 3,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
 
9.2 Lấy lịch sử tin nhắn
API: GET - /conversations/{conversation_id}/messages
Query Params:
Param	Type	Mô tả
before	uuid	Lấy tin nhắn trước ID này (dùng để load thêm tin nhắn cũ) 
limit	integer	Số tin nhắn mỗi lần fetch, mặc định 30 
Response 200:
{
  "success": true,
  "data": {
    "messages": [
      {
        "message_id": "uuid-cua-tin-nhan",
        "content": "Nội dung tin nhắn",
        "url_img": null,
        "created_at": "2024-01-15T10:00:00Z",
        "sender": { 
          "user_id": "uuid", 
          "name": "Jane Smith",
          "url_avt": "https://cdn.yourdomain.com/jane.jpg"
        }
      }
    ]
  }
}
 
9.3 Gửi tin nhắn (REST fallback)
API: POST - /conversations/{conversation_id}/messages
Gửi tin nhắn mới (ưu tiên dùng qua WebSocket, API này dùng làm dự phòng hoặc khi có đính kèm file)
Request: multipart/form-data
Field	Type	Bắt buộc	Mô tả
content	string	Không	Nội dung chữ của tin nhắn 
url_img	file	Không	Ảnh đính kèm (tối đa 10MB). Chỉ cho phép 1 ảnh theo DB
* Ít nhất phải có content hoặc url_img.
 
9.4 Đánh dấu đã xem
API: POST - /conversations/{conversation_id}/seen
* Backend sẽ update cột seen_by bằng ID của user gọi API và reset unread_count = 0 trong bảng conversations.
Response 200:
{
  "success": true,
  "message": "Conversation marked as seen"
}
 
9.5 Tạo cuộc hội thoại mới
API: POST - /conversations
Request Body:
Field	Type	Bắt buộc	Mô tả
user_id	uuid	Có	ID của user muốn nhắn tin (có thể yêu cầu phải là bạn bè tùy logic business) 
* Nếu giữa 2 user đã tồn tại cuộc trò chuyện, Backend không tạo mới mà trả về thông tin conversation_id hiện có.
Response 201/200:
{
  "success": true,
  "data": {
    "conversation_id": "uuid-cua-cuoc-tro-chuyen"
  },
  "message": "Conversation ready"
}
 
10. WebSocket -  Real-time Chat
Dùng để chat và nhận thông báo theo thời gian thực (real-time).
10.1 Kết nối
Endpoint kết nối:
wss://www.minboo-be.io.vn /ws?token=<access_token>
10.2 Events từ Client gửi lên Server
Khi Client (Frontend, Mobile) muốn thực hiện một hành động, sẽ emit các event sau:
Event	Payload (JSON)	Mô tả
send_message	{ "conversation_id": "uuid", "content": "...", "url_img": "..." }	Gửi tin nhắn mới
typing	{ "conversation_id": "uuid" }	Đang gõ tin nhắn 
stop_typing	{ "conversation_id": "uuid" }	Ngừng gõ tin nhắn 
mark_seen	{ "conversation_id": "uuid" }	Đánh dấu đã xem tất cả tin nhắn trong cuộc trò chuyện 
10.3 Events từ Server gửi về Client
Server sẽ push các event này về Client để cập nhật giao diện:
Event	Payload (JSON)	Mô tả
new_message	{ "message_id": "uuid", "conversation_id": "uuid", "content": "...", "url_img": "...", "created_at": "...", "sender": {...} }	Có tin nhắn mới 
message_seen	{ "conversation_id": "uuid", "seen_by": "uuid", "seen_at": "..." }	Đối phương đã xem tin nhắn
user_typing	{ "conversation_id": "uuid", "user_id": "uuid" }	Đối phương đang gõ 
user_stop_typing	{ "conversation_id": "uuid", "user_id": "uuid" }	Đối phương ngừng gõ 
user_online	{ "user_id": "uuid" }	Bạn bè vừa online 
user_offline	{ "user_id": "uuid", "last_seen": "..." }	Bạn bè vừa offline 
new_notification	{ "notification_id": 123, "type": "...", "entity_id": "...", "entity_type": "...", ... }	Có thông báo mới tới người dùng 
 
11. Thông Báo (Notifications)
11.1 Lấy danh sách thông báo
API: GET - /notifications
Query Params:
Param	Type	Mô tả
page	integer	Số trang, mặc định 1 
limit	integer	Số thông báo, mặc định 20 
is_read	boolean	Lọc thông báo đã đọc (true) hoặc chưa đọc (false) 
Response 200:
{
  "success": true,
  "data": {
    "unread_count": 5,
    "notifications": [
      {
        "notification_id": 1024,
        "type": "new_comment",
        "entity_id": "uuid-cua-post-hoac-comment",
        "entity_type": "post",
        "is_read": false,
        "created_at": "2024-01-15T09:00:00Z",
        "sender": { 
          "user_id": "uuid", 
          "name": "Jane Smith", 
          "url_avt": "https://cdn.yourdomain.com/jane.jpg" 
        }
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 25 }
  }
} 
Các loại thông báo (type) và cách map với Entity:
Thay vì dùng field meta như cũ, Frontend sẽ dựa vào entity_type và entity_id để biết nên điều hướng người dùng đi đâu khi click vào thông báo:
type	Ý nghĩa	entity_type	entity_id chứa
friend_request	Nhận được lời mời kết bạn	friend_request	friend_request_id
friend_accepted	Lời mời kết bạn được chấp nhận	user	user_id của người chấp nhận
new_post	Bạn bè đăng bài mới	post	post_id của bài viết
new_comment	Có bình luận mới trên bài của bạn	post	post_id của bài viết
new_reaction	Có người thả cảm xúc vào bài của bạn	post	post_id của bài viết
new_message	Có tin nhắn mới	conversation	conversation_id

 
11.2 Đánh dấu một thông báo đã đọc
API: PATCH - /notifications/{notification_id}/read
Response 200:
{
  "success": true,
  "message": "Notification marked as read"
}
11.3 Đánh dấu tất cả đã đọc
API: PATCH - /notifications/read-all
Response 200:
{
  "success": true,
  "message": "All notifications marked as read"
}
11.4 Lấy số lượng thông báo chưa đọc
API: GET - /notifications/unread-count
Response 200:
{
  "success": true,
  "data": {
    "notifications_unread": 3,
    "messages_unread": 7,
    "total_unread": 10
  }
}
