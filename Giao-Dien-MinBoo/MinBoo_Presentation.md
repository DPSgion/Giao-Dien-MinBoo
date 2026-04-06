# BÀI THUYẾT TRÌNH: PHÂN TÍCH KIẾN TRÚC & GIAO DIỆN DỰ ÁN MINBOO (SOCIAL MEDIA FRONTEND)

---

## Slide 1: Tiêu đề
**Chủ đề:** Phân tích Cấu trúc & Kiến trúc Code Giao diện Mạng Xã Hội MinBoo
**Mục tiêu:** Hiểu rõ cách tổ chức mã nguồn, các công nghệ được sử dụng, và luồng hoạt động của một ứng dụng Single Page Application (SPA) hiện đại.
**Người trình bày:** [Tên của bạn]
**Ngày trình bày:** [Ngày/Tháng/Năm]

---

## Slide 2: Tổng quan Dự án MinBoo
**MinBoo** là một nền tảng Mạng Xã Hội thu nhỏ, được xây dựng tập trung vào trải nghiệm người dùng hiện đại, giao diện trực quan và tính tương tác thời gian thực.
- **Phân hệ Người Dùng (Client):** Bảng tin (Feed), Đăng bài, Cập nhật trạng thái (Stories), Nhắn tin theo thời gian thực (Chat), Thông báo, Quản lý Hồ sơ & Bạn bè.
- **Phân hệ Quản Trị (Admin):** Bảng điều khiển (Dashboard), Quản lý Người dùng, Bài viết, Báo cáo vi phạm (Reports) và thẻ Tags.
- **Mô hình triển khai:** Frontend tách biệt hoàn toàn với Backend (giao tiếp qua REST API và WebSockets).

---

## Slide 3: Công nghệ Sử dụng (Tech Stack)
Dự án sử dụng các công nghệ Frontend tiên tiến và tối ưu nhất hiện nay:
- **Core Framework:** ReactJS (v18.2) cung cấp khả năng render UI linh hoạt.
- **Build Tool:** Vite - Giúp khởi động server dev cực nhanh và build file tối ưu.
- **Routing:** React Router DOM (v6.22) - Quản lý điều hướng trang SPA không cần reload.
- **Styling:** Tailwind CSS (v4) - Utility-first CSS cho phép code UI nhanh chóng, nhất quán.
- **HTTP Client:** Axios - Xử lý các request gọi API tới backend.
- **Real-time Communication:** WebSockets - Đẩy thông báo và tin nhắn tức thời một luồng 2 chiều (Bi-directional).

---

## Slide 4: Tổ chức Thư mục Codebase
Cấu trúc `src/` hiện đại, chia tách rõ ràng các Layers:
- `assets/` / `public/`: Tài nguyên tĩnh, hình ảnh.
- `components/`: Chứa các UI components dùng chung (Layout, thẻ Post, Story, Modals,...).
- `contexts/`: React Context để lưu trữ State toàn cục (Ví dụ: `AuthContext`).
- `pages/`: Các màn hình chính phân chia theo logic (Auth, Home, Profile, Messages, Admin,...).
- `services/`: Encapsulate (đóng gói) các lệnh gọi API (`apiServices.js`, `authService.js`, `axiosClient.js`, `websocketService.js`).
- `styles/` & `utils/`: CSS tùy biến và các hàm hỗ trợ helper functions.

---

## Slide 5: Hệ thống Routing & Phân quyền (App.jsx)
Sử dụng `react-router-dom` với cơ chế kiểm soát quyền truy cập chặt chẽ (Guarded Routes):
- **PublicRoute:** Chỉ cho phép người dùng chưa đăng nhập truy cập (Login, Register). Tự động đẩy (redirect) sang trang chủ nếu đã có token.
- **PrivateRoute:** Yêu cầu đã xác thực qua `AuthContext`. Bọc các trang như Home, Messages, Profile trong một `MainLayout` dùng chung.
- **AdminRoute:** Route dành riêng cho Quản trị viên, được bảo vệ và sử dụng giao diện `AdminLayout` tách biệt hoàn toàn hệ thống của user.

---

## Slide 6: Quản lý Trạng thái Toàn cục (State Management)
Dự án sử dụng **React Context API** kết hợp với Hooks thay vì các thư viện cồng kềnh như Redux:
- **`AuthContext.jsx`:** Chịu trách nhiệm lưu trữ thông tin User User Profile và trạng thái Loading / Xác thực token.
- **Custom Hook `useAuth()`:** Dễ dàng lấy thông tin người dùng đang đăng nhập bất kì đâu trong Component Tree.
- Trạng thái Local của mỗi tính năng (Ví dụ: Số lượng Post, Unread Notifications) được quản lý ngay tại Component của Page sử dụng `useState`.

---

## Slide 7: Cơ chế Gọi API & Axios Interceptors
- **`axiosClient.js`:** Cấu hình mặc định cho tất cả HTTP Request (Base URL, Headers).
- **Authentication Header:** Tự động đính kèm `access_token` từ `localStorage` vào mỗi Request Authorization Header.
- **Xử lý Lỗi Toàn cục:** Tự động bắt mã lỗi (ví dụ: `401 Unauthorized`) để thực hiện luồng làm mới token (Refresh Token) hoặc buộc User đăng xuất một cách tự động (Auto Logout).
- **API Services Modules:** Việc gọi các Endpoint được gom vào file như `postService`, `notificationService` để tái sử dụng và kiểm soát.

---

## Slide 8: Cấu trúc Giao diện Chính (MainLayout Component)
Học hỏi từ các MXH lớn mạnh nhất (như Instagram, X):
- **Sidebar Nằm ngang/Ngôn ngữ (Fixed):** Navigation chính, có thể tự động thu gọn `collapsed` khi mở Modal Tìm kiếm để tăng không gian.
- **Navigation Tình trạng (Badges):** Hiển thị số lượng thông báo (`unread numbers`) nằm đè (absolute) lên Icon trong Toolbar.
- **Main Content Area:** Khu vực chính `children`, thay đổi linh hoat dựa trên View của React Router.

---

## Slide 9: Tính năng Feed & Infinite Scroll
Trang chủ (`Home/index.jsx`) là điểm nhấn về hiệu năng xử lý dữ liệu:
- **Cơ chế tải trang (Pagination):** Không tải toàn bộ bài viết một lúc. Sử dụng cơ chế phân trang với `page` và `limit`.
- **Intersection Observer API:** Thay vì bắt sự kiện cuộn (scroll event) gây giảm hiệu năng, dùng `Intersection UI Observer` trên thẻ `bottomRef` để kích hoạt việc tải thêm bài (Infinite Scroll) khi User cuộn sát đáy màn hình.
- **UI State Handle:** Skeleton loading hoặc Spinner hiển thị ở đáy mượt mà chờ tải Data.

---

## Slide 10: Xử lý Tương tác Thời gian thực (WebSockets)
- Sử dụng `websocketService.js` để kết nối vào Server Socket ngay khi Token hợp lệ trong lúc Mount `MainLayout`.
- Bắt trực tiếp event Emit từ Server: `new_notification`, `new_message`.
- Ngay lập tức cập nhật `Badge Unread` trên thanh điều hướng cho Cập nhật Thông báo (Notification) thay vì phải gọi REST API định kỳ (Polling API -> Giúp tối ưu băng thông & server payload).

---

## Slide 11: Thành phần Post (PostCard) & Story Component
Các UI Component được thiết kế chú trọng Design Pattern và tính đóng gói cao:
- **PostCard:** Thiết kế Module hóa cao độ để tái sử dụng ở Home, Profile, hay Tìm kiếm. Encapsulate logic Like, Bình luận, Dropdown menu tùy chọn (Xóa bài viêt/Báo cáo).
- **StoryBar:** Thiết kế chiều ngang có thể kéo lướt (horizontally scrollable layout) tích hợp avatar bo tròn sinh động (Ring effect) khi chưa xem theo chuẩn UX Instagram.

---

## Slide 12: Trang Thông tin Người dùng (Profile)
- URL có thiết kế Route Params (`/profile/:userId`) để xem trạng thái của bản thân và người khác chung một giao diện (Tái sử dụng Component).
- Logic kết bạn: Tuỳ chỉnh nút "Kết bạn", "Hủy kết bạn", "Phản hồi lời mời" phụ thuộc vào việc so sánh tham số `userId` đang xem so với ID trong `AuthContext`.
- Grid/List UI xử lý hiển thị danh sách các bức ảnh, bài đăng riêng biệt của Người tham gia.

---

## Slide 13: Giao diện Quản trị viên (Admin Dashboard)
Tách biệt hoàn toàn Layout với người dùng phổ thông (Zero cross-contamination):
- **Phân vùng `Admin/`:** Nơi chứa `Dashboard`, `AdminUser`, `AdminPosts`.
- **Bảng dữ liệu & Thống kê:** Hiển thị tổng quan metrics của toàn bộ MXH (số lượng Users, Posts mới,...).
- Thừa hưởng UI thống nhất thông qua Tailwind CSS, với layout quản lý dạng Table (Data grids), Modals kiểm duyệt báo cáo (Reports) dễ truy cập.

---

## Slide 14: Kỹ thuật Tối ưu hoá & Hiệu ứng Thị giác (UI/UX)
- Giao diện sử dụng Font chữ tùy chỉnh như `'Dancing Script'` để tăng tính nghệ thuật cho Logo MinBoo.
- Hiệu ứng Gradient (CSS tr/from/via/to), shadow, blur tạo chiều sâu giao diện.
- Trạng thái trống (Empty State): Khi chưa có bạn bè, Feed hiển thị khu vực trống rất đẹp với "📸 Chào mừng đến MinBoo!" để kích thích tương tác.
- Tự động thay thế Hình tự động: Trường hợp người dùng lỗi Avt hoặc không có, thay thế bằng bộ API từ `ui-avatars.com`.

---

## Slide 15: Mô hình Kết nối Fullstack Tạm thời
- Trái với tính độc lập thuần túy của React, trong codebase có `server.cjs` sử dụng Express, pg (PostgreSQL) để Mock/Test trực tiếp Backend logic ở Port 3000.
- Đây là phương án thuận tiện dành cho Node.js Developer giúp tạo 1 Full-stack POC (Proof of Concept) ngay trong 1 repository trong giai đoạn Unit testing hay làm MVP.

---

## Slide 16: Kết luận & Định hướng Nâng cấp
**Đóng Góp của Giao diện MinBoo:** Đã mô phỏng được 80% luồng nghiệp vụ của một MXH chuyên nghiệp, tập trung vào UX đơn giản và hiệu năng cao.
**Hướng Nâng cấp (Future Works):**
1. Triển khai Service Workers để quản lý tính năng Progressive Web App (PWA) / thông báo Push Notifications offline.
2. Nâng cấp bộ định tuyến với cơ chế Lazy Loading Component / Code Splitting.
3. Đồng bộ hóa với Server S3 để xử lý nén CDN cho Images/Video của Post.
4. Scale up Database PostgreSQL & Dockerize dự án.
