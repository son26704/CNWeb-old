const bcrypt = require('bcryptjs'); 
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Đăng ký người dùng mới
const register = async (userData) => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Mã hóa mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Tạo người dùng mới
    const user = new User({
      email: userData.email,
      password: hashedPassword,  // ✅ Lưu mật khẩu đã hash
      name: userData.name,
      phone: userData.phone || '',
      authType: 'local',
    });

    await user.save();
    
    // Tạo và trả về token
    const token = generateToken(user._id);
    
    return { 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token 
    };
  } catch (error) {
    throw error;
  }
};

// Đăng nhập người dùng
const login = async (email, password) => {
  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user || user.authType !== 'local') {
      throw new Error('Email hoặc mật khẩu không hợp lệ');
    }

    // So sánh mật khẩu bằng bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password); // ✅ Sử dụng bcrypt.compare
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không hợp lệ');
    }

    // Tạo và trả về token
    const token = generateToken(user._id);
    
    return { 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token 
    };
  } catch (error) {
    throw error;
  }
};

// Lấy thông tin người dùng
const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -twoFactorSecret');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (userId, updateData) => {
  try {
    // Loại bỏ các trường không được phép cập nhật trực tiếp
    const allowedUpdates = ['name', 'phone', 'avatar'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Thêm địa chỉ mới
const addAddress = async (userId, addressData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Nếu đánh dấu là địa chỉ mặc định, cập nhật tất cả địa chỉ khác
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();

    return user.addresses;
  } catch (error) {
    throw error;
  }
};

// Cập nhật địa chỉ
const updateAddress = async (userId, addressId, addressData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    // Nếu đánh dấu là địa chỉ mặc định, cập nhật tất cả địa chỉ khác
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Cập nhật địa chỉ
    Object.keys(addressData).forEach(key => {
      user.addresses[addressIndex][key] = addressData[key];
    });

    await user.save();

    return user.addresses;
  } catch (error) {
    throw error;
  }
};

// Xóa địa chỉ
const deleteAddress = async (userId, addressId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    return user.addresses;
  } catch (error) {
    throw error;
  }
};

// Thêm sản phẩm vào wishlist
const addToWishlist = async (userId, productId) => {
  try {
    const user = await User.findById(userId).populate('wishlist.productId');
    if (!user) {
      throw new Error('User not found');
    }

    const product = await Product.findOne({ productId: productId.toString() });
    if (!product) {
      throw new Error('Product not found');
    }

    const existingProduct = user.wishlist.find(item => item.productId._id.toString() === product._id.toString());
    if (existingProduct) {
      return user.wishlist.map(item => ({
        productId: item.productId._id,
        name: item.productId.title,
        price: item.productId.price,
        image: item.productId.image,
      }));
    }

    user.wishlist.push({
      productId: product._id,
      name: product.title,
      price: product.price,
    });
    await user.save();

    // Lấy lại user với populate để có đầy đủ dữ liệu
    const updatedUser = await User.findById(userId).populate('wishlist.productId');
    return updatedUser.wishlist.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
    }));
  } catch (error) {
    throw error;
  }
};

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = async (userId, productId) => {
  try {
    const user = await User.findById(userId).populate('wishlist.productId');
    if (!user) {
      throw new Error('User not found');
    }

    const productIndex = user.wishlist.findIndex(item => item.productId._id.toString() === productId);
    if (productIndex === -1) {
      throw new Error('Product not in wishlist');
    }

    user.wishlist.splice(productIndex, 1);
    await user.save();

    // Lấy lại user với populate để có đầy đủ dữ liệu
    const updatedUser = await User.findById(userId).populate('wishlist.productId');
    return updatedUser.wishlist.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
    }));
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách wishlist
const getWishlist = async (userId) => {
  try {
    const user = await User.findById(userId).populate('wishlist.productId');
    if (!user) {
      throw new Error('User not found');
    }
    return user.wishlist.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.productId.price,
      image: item.productId.image,
    }));
  } catch (error) {
    throw error;
  }
};

// Lấy lịch sử đơn hàng
const getOrderHistory = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .populate('products.productId')
      .sort({ orderDate: -1 });
    return orders.map(order => ({
      ...order.toObject(),
      products: order.products.map(item => ({
        productId: item.productId._id,
        name: item.productId.title,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity,
      })),
    }));
  } catch (error) {
    throw error;
  }
};

// Đổi mật khẩu
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('Tài khoản này không sử dụng mật khẩu local. Vui lòng sử dụng tùy chọn đăng nhập khác.');
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash mật khẩu mới trước khi lưu
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  changePassword,
  getOrderHistory,
};