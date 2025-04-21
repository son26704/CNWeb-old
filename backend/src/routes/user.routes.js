const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); 
const { upload } = require('../config/cloudinary');

// Đăng ký & Đăng nhập
router.post('/register', userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/request-verification', verifyToken, userController.requestVerification);
router.post('/login', userController.login);

// Routes yêu cầu xác thực
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateProfile);

// Upload ảnh đại diện
router.post('/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);

// Quản lý địa chỉ
router.post('/addresses', verifyToken, userController.addAddress);
router.put('/addresses/:addressId', verifyToken, userController.updateAddress);
router.delete('/addresses/:addressId', verifyToken, userController.deleteAddress);

// Quản lý wishlist
router.post('/wishlist', verifyToken, userController.addToWishlist);
router.get('/wishlist', verifyToken, userController.getWishlist);
router.delete('/wishlist/:productId', verifyToken, userController.removeFromWishlist);

// Lịch sử đơn hàng
router.post('/orders', verifyToken, userController.createOrder);
router.get('/orders', verifyToken, userController.getOrderHistory);

// Đổi mật khẩu
router.post('/change-password', verifyToken, userController.changePassword);

// Quên mật khẩu
router.post('/forgot-password', userController.requestPasswordReset); // Gửi mã xác thực
router.post('/verify-reset-code', userController.verifyResetCode); // Xác minh mã
router.post('/reset-password', userController.resetPassword); // Đổi mật khẩu

// Admin lấy danh sách user
router.get('/admin/users', verifyToken, isAdmin, userController.getAllUsers); // Chỉ admin được gọi

module.exports = router;
