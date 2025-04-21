const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');


// Import routes
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
// Các route khác sẽ được import ở đây nếu cần

// Khởi tạo app
const app = express();

// Middlewares
app.use(cors()); // Cho phép CORS từ frontend
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
// app.use(passport.initialize()); // Khởi tạo Passport cho authentication

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch((err) => console.log('❌ Lỗi kết nối MongoDB:', err));

// Routes với prefix /api
app.use('/api/users', userRoutes); // Các route liên quan đến user: /api/users/profile, /api/users/wishlist, ...
app.use('/api/auth', authRoutes); // Các route xác thực: /api/auth/login, /api/auth/register, ...
app.use('/api/products', productRoutes); // Các route sản phẩm: /api/products, /api/products/:id, ...

// Route mẫu để kiểm tra server
app.get('/', (req, res) => {
  res.send('Backend đang chạy!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});

module.exports = app;