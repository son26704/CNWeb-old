import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, addAddress, updateAddress, deleteAddress } from '../api/user.api';
import { useAuth } from '../hooks/useAuth';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chuyển hướng nếu chưa đăng nhập
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Lấy danh sách địa chỉ từ API
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile();
        setAddresses(userData.addresses || []);
      } catch (err) {
        setError('Không thể tải danh sách địa chỉ');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Nếu là checkbox isDefault và đang có 1 địa chỉ duy nhất, không cho phép bỏ chọn
    if (name === 'isDefault' && addresses.length === 0 && !checked) {
      return;
    }
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openAddModal = () => {
    // Nếu chưa có địa chỉ nào, tự động chọn làm mặc định
    const isDefault = addresses.length === 0;
    setAddressForm({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: isDefault,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (address) => {
    setCurrentAddress(address);
    setAddressForm({
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      isDefault: address.isDefault || false,
    });
    setIsEditModalOpen(true);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const newAddresses = await addAddress(addressForm);
      setAddresses(newAddresses);
      setIsAddModalOpen(false);
      setSuccess('Thêm địa chỉ thành công');
    } catch (err) {
      setError(err.message || 'Thêm địa chỉ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedAddresses = await updateAddress(currentAddress._id, addressForm);
      setAddresses(updatedAddresses);
      setIsEditModalOpen(false);
      setSuccess('Cập nhật địa chỉ thành công');
    } catch (err) {
      setError(err.message || 'Cập nhật địa chỉ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedAddresses = await deleteAddress(addressId);
      setAddresses(updatedAddresses);
      setSuccess('Xóa địa chỉ thành công');
    } catch (err) {
      setError(err.message || 'Xóa địa chỉ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý địa chỉ</h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-blue-600 hover:text-blue-500"
        >
          Quay lại hồ sơ
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={openAddModal}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Thêm địa chỉ mới
        </button>
      </div>
      
      {addresses.length === 0 ? (
        <div className="bg-white shadow sm:rounded-md p-6 text-center">
          <p className="text-gray-500">Bạn chưa có địa chỉ nào.</p>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {addresses.map((address) => (
              <li key={address._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {address.street}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.country}
                    </p>
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(address)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Modal Thêm địa chỉ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm địa chỉ mới</h3>
              <form onSubmit={handleAddAddress}>
                <div className="mb-4">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    value={addressForm.street}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={addressForm.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Xã/Huyện
                  </label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    value={addressForm.state}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    value={addressForm.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={addressForm.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleChange}
                      disabled={addresses.length === 0 && addressForm.isDefault}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa địa chỉ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa địa chỉ</h3>
              <form onSubmit={handleUpdateAddress}>
                <div className="mb-4">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    value={addressForm.street}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={addressForm.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành
                  </label>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    value={addressForm.state}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    value={addressForm.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={addressForm.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleChange}
                      disabled={addresses.length === 0 && addressForm.isDefault}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
