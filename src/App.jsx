import { useState, useEffect } from 'react';
import './style.css';

const API_URL = 'https://www.minboo-be.io.vn/users';

function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function fetchUsersData() {
      try {
        setStatus('loading');
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    }

    fetchUsersData();
  }, []);

  return (
    <div className="container">
      <h2>Users</h2>
      <table id="userTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {status === 'loading' && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                Đang tải dữ liệu từ server...
              </td>
            </tr>
          )}

          {status === 'error' && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
                Không thể kết nối đến máy chủ hoặc xảy ra lỗi khi tải dữ liệu.
              </td>
            </tr>
          )}

          {status === 'success' && (!data || data.length === 0) && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Chưa có dữ liệu người dùng nào.
              </td>
            </tr>
          )}

          {status === 'success' && data && data.length > 0 && data.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;