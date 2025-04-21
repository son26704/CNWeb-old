const express = require('express');
const { googleLogin, githubLogin } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/google', googleLogin); // Xử lý đăng nhập Google
router.post('/github', githubLogin); // Xử lý đăng nhập GitHub

module.exports = router;
