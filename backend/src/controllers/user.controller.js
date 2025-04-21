const bcrypt = require('bcryptjs');  // Thêm bcrypt
const jwt = require('jsonwebtoken'); // Thêm jwt
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/config'); // Đảm bảo file config có JWT secret
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const { cloudinary, upload } = require('../config/cloudinary');

// Đăng ký
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    const result = await userService.register({ name, email, password });
    res.status(201).json({ message: 'Đăng ký thành công', ...result });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ email }).select("+password"); // Lấy password
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "Lỗi hệ thống: Tài khoản này không có mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
      expiresIn: "7d",
    });

    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified // Đảm bảo trả về isVerified
      },
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!user.verificationCode || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu lại.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ message: 'Xác thực thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


const requestVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Tài khoản của bạn đã được xác thực' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    await emailService.sendVerificationEmail(user.email, verificationCode);
    res.json({ message: 'Mã xác thực đã được gửi vào email của bạn.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Google OAuth
const client = new OAuth2Client("GOOGLE_CLIENT_ID");

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: "GOOGLE_CLIENT_ID",
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        googleId: payload.sub,
        authType: 'google',
        isVerified: true,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed', error });
  }
};

// Lấy thông tin người dùng
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(); // Không trả về mật khẩu
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Cập nhật thông tin cá nhân
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const user = await userService.updateProfile(userId, updateData);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm địa chỉ mới
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;
    const addresses = await userService.addAddress(userId, addressData);
    res.status(201).json(addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const addressData = req.body;
    const addresses = await userService.updateAddress(userId, addressId, addressData);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const addresses = await userService.deleteAddress(userId, addressId);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm sản phẩm vào wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const wishlist = await userService.addToWishlist(userId, productId);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const wishlist = await userService.removeFromWishlist(userId, productId);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await userService.getWishlist(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo đơn hàng (cập nhật để lấy _id từ Product)
const createOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, shippingAddress } = req.body;
    const orderProducts = await Promise.all(products.map(async (item) => {
      const product = await Product.findOne({ productId: item.productId.toString() });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    }));
    const order = new Order({
      userId,
      products: orderProducts,
      totalAmount,
      shippingAddress,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Gửi mã xác thực để reset mật khẩu
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user) {
      return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    }
    if (user.authType !== 'local') {
      return res.status(400).json({ message: 'Tài khoản này sử dụng đăng nhập qua bên thứ ba (Google/Facebook).' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút
    await user.save();

    await emailService.sendResetPasswordEmail(email, resetCode);
    res.json({ message: 'Mã xác thực đã được gửi vào email của bạn.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Xác minh mã reset
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    if (user.resetPasswordCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn.' });
    }
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng.' });
    }

    res.json({ message: 'Xác thực thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Đổi mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    if (user.authType !== 'local') {
      return res.status(400).json({ message: 'Tài khoản này không sử dụng mật khẩu local.' });
    }
    if (user.resetPasswordCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn.' });
    }
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }

    // Hash mật khẩu mới trước khi lưu
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpires = null;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// API: Lấy danh sách người dùng (Chỉ admin được phép)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Không trả về mật khẩu
    if (!users.length) {
      return res.status(404).json({ message: 'Không có người dùng nào.' });
    }
    res.json(users);
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log('User ID:', userId);
    const orders = await userService.getOrderHistory(userId);
    // console.log('Orders:', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Lỗi getOrderHistory:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Xóa ảnh cũ trên Cloudinary nếu có
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Lưu ảnh mới
    const avatar = {
      url: req.file.path, // URL ảnh từ Cloudinary
      public_id: req.file.filename, // Public ID để xóa sau này
    };
    user.avatar = avatar;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Lỗi upload avatar:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  verifyEmail,
  requestVerification,
  login,
  googleLogin,
  getUserProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  changePassword,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  getAllUsers,
  getOrderHistory,
  createOrder,
  uploadAvatar,
};