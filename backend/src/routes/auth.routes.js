const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const loginLimiter = require('../middlewares/rateLimiter');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập với rate limiter
router.post('/login', loginLimiter, authController.login);

// Google OAuth
router.post('/google', authController.googleLogin);

// GitHub OAuth
router.post('/github', authController.githubLogin);

module.exports = router;
