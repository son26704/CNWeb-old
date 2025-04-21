import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Thêm import useAuth

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth(); // Lấy isAuthenticated và user từ useAuth
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Kiểm tra quyền truy cập ngay khi component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // Chuyển hướng nếu chưa đăng nhập
      return;
    }
    if (user && user.role !== 'admin') {
      navigate('/profile'); // Chuyển hướng nếu không phải admin
      return;
    }

    fetch('/api/users/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        } else {
          console.error('Lỗi dữ liệu:', data);
          setUsers([]);
          setFilteredUsers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách người dùng:', err);
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      });
  }, [isAuthenticated, user, navigate]);

  // Xử lý tìm kiếm bằng jQuery
  useEffect(() => {
    const filterUsers = () => {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    };

    $('#searchInput').on('input', (e) => {
      setSearchTerm(e.target.value);
      filterUsers();
    });

    return () => {
      $('#searchInput').off('input');
    };
  }, [users, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Quản lý tài khoản
        </h1>

        {/* Thanh tìm kiếm */}
        <div className="mb-6">
          <input
            id="searchInput"
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bảng thông tin người dùng */}
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Xác thực
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Loại tài khoản
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Wishlist
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Địa chỉ mặc định
                  </th>
                  <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-900">{user.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-500 break-all">
                      {user.email}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {user.phone || 'Chưa có'}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold truncate whitespace-nowrap ${user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-500 capitalize">
                      {user.authType}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {user.wishlist.length} sản phẩm
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {user.addresses.length > 0
                        ? `${user.addresses[0].street}, ${user.addresses[0].city}, ${user.addresses[0].country}`
                        : 'Chưa có'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Không có người dùng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;