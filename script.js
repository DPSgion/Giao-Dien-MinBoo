// Thay đổi URL này thành endpoint API thực tế từ backend của bạn
//const https://18.143.180.168phobo.onrender.com/users'; 
const API_URL = 'http://www.minboo-be.io.vn:8080/users'; 

const tableBody = document.getElementById('tableBody');

// Hàm gọi API để lấy dữ liệu
async function fetchUsersData() {
    try {
        // 1. Hiển thị trạng thái đang tải dữ liệu
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">Đang tải dữ liệu từ server...</td>
            </tr>
        `;

        // 2. Gửi request tới backend
        const response = await fetch(API_URL);

        // Kiểm tra xem phản hồi từ server có thành công không (status 200-299)
        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        // 3. Chuyển đổi dữ liệu nhận được sang JSON
        const data = await response.json();

        // 4. Render dữ liệu ra bảng
        renderTable(data);

    } catch (error) {
        // Xử lý lỗi (ví dụ: mất mạng, sai URL, server sập)
        console.error("Chi tiết lỗi gọi API:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: red; padding: 20px;">
                    Không thể kết nối đến máy chủ hoặc xảy ra lỗi khi tải dữ liệu.
                </td>
            </tr>
        `;
    }
}

// Hàm render HTML cho bảng (tái sử dụng)
function renderTable(data) {
    // Làm sạch nội dung cũ
    tableBody.innerHTML = ''; 

    // Nếu backend trả về mảng rỗng
    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">Chưa có dữ liệu người dùng nào.</td>
            </tr>
        `;
        return;
    }

    // Duyệt qua từng object người dùng và tạo hàng
    data.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Gọi hàm fetch data khi trang web vừa tải xong
document.addEventListener('DOMContentLoaded', fetchUsersData);