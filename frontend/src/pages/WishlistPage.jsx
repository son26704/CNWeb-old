import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getWishlist, addToWishlist, removeFromWishlist, getAllProducts } from '../api/user.api';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // State cho modal
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [wishlistResponse, productsResponse] = await Promise.all([
          getWishlist(),
          getAllProducts(),
        ]);
        // console.log('Wishlist từ API:', wishlistResponse);
        // console.log('Products từ API:', productsResponse);
        setWishlist(wishlistResponse);
        setProducts(productsResponse);
      } catch (err) {
        console.error('Lỗi API:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!selectedProductId) {
        throw new Error('Vui lòng chọn sản phẩm');
      }
      const response = await addToWishlist(selectedProductId);
      setWishlist(response);
      setSelectedProductId(''); // Reset dropdown
    } catch (err) {
      console.error('Lỗi thêm sản phẩm:', err);
      setError(err.message || 'Không thể thêm sản phẩm vào danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setLoading(true);
    setError('');
    try {
      const response = await removeFromWishlist(productId);
      setWishlist(response);
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      setError('Không thể xóa sản phẩm khỏi danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (productId) => {
    // Tìm sản phẩm trong products để lấy đầy đủ thông tin
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          Quay lại hồ sơ
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form với dropdown */}
      <form onSubmit={handleAddToWishlist} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Chọn sản phẩm</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((product) => (
              <option key={product._id} value={product.productId}>
                {product.title} - {product.price.toLocaleString('vi-VN')} VNĐ
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading || !selectedProductId}
        >
          Thêm vào danh sách yêu thích
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Sản phẩm trong Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-500">Danh sách yêu thích trống.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.productId}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col h-96" // Cố định chiều cao thẻ
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-full object-cover rounded mb-4 cursor-pointer"
                onClick={() => handleOpenModal(item.productId)}
              />
              <h3
                className="text-lg font-medium mb-2 line-clamp-2 cursor-pointer" // Cắt ngắn tên sản phẩm
                onClick={() => handleOpenModal(item.productId)}
                title={item.name} // Hiển thị tên đầy đủ khi hover
              >
                {item.name}
              </h3>
              <p className="text-gray-600 mb-4">{item.price.toLocaleString('vi-VN')} VNĐ</p>
              <button
                onClick={() => handleRemoveFromWishlist(item.productId)}
                className="mt-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" // Nút ở dưới cùng
                disabled={loading}
              >
                Xóa khỏi Wishlist
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal hiển thị chi tiết sản phẩm */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()} // Ngăn đóng modal khi bấm vào nội dung
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedProduct.title}</h2>
            <div className="flex space-x-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="h-48 w-48 object-cover rounded"
              />
              <div className="flex-1">
                <p><strong>Giá:</strong> {selectedProduct.price.toLocaleString('vi-VN')} VNĐ</p>
                <p><strong>Danh mục:</strong> {selectedProduct.category}</p>
                <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
                <p><strong>ID:</strong> {selectedProduct.productId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;