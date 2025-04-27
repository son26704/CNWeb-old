const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const config = require('../config/config');
const axios = require('axios'); // Thêm axios để gọi GitHub API

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      authType: 'local',
      role: 'user',
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (!user.password) {
      console.log('User has no password (social login account)');
      return res.status(400).json({ message: 'Tài khoản này sử dụng đăng nhập qua bên thứ ba' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    console.log('Successful login for user:', email);
    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, {
      expiresIn: "7d",
    });

    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Không có token' });
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      const existingLocalUser = await User.findOne({ email: decoded.email, authType: 'local' });
      if (existingLocalUser) {
        return res.status(400).json({ message: 'Email này đã đăng ký với tài khoản local' });
      }

      user = new User({
        email: decoded.email,
        name: decoded.name || 'Google User',
        avatar: { url: decoded.picture || '' },
        isVerified: true,
        authType: 'google',
        role: 'user',
      });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });
    res.json({ user, token: authToken });
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const githubLogin = async (req, res) => {
  try {
    const { code } = req.body; // Nhận mã code từ frontend
    if (!code) {
      return res.status(400).json({ message: 'Không có mã code' });
    }

    // Trao đổi code để lấy access token từ GitHub
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ message: 'Không thể lấy access token từ GitHub' });
    }

    // Lấy thông tin user từ GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubData = userResponse.data;

    let user = await User.findOne({ githubId: githubData.id });
    if (!user) {
      const existingLocalUser = await User.findOne({ email: githubData.email, authType: 'local' });
      if (existingLocalUser) {
        return res.status(400).json({ message: 'Email này đã đăng ký với tài khoản local' });
      }

      user = new User({
        githubId: githubData.id,
        email: githubData.email || `${githubData.login}@github.com`, // Nếu không có email công khai
        name: githubData.name || githubData.login,
        avatar: { url: githubData.avatar_url || '' },
        authType: 'github',
        isVerified: true, // GitHub đã xác thực
        role: 'user',
      });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });
    res.json({ user, token: authToken });
  } catch (error) {
    console.error('Lỗi đăng nhập GitHub:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  githubLogin,
};