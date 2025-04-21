require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_CLOUD_NAME || 'deijy2rb3', // Thay bằng Cloud Name của bạn
  api_key: process.env.CLOUNDINARY_API_KEY || '674421462849844', // Thay bằng API Key
  api_secret: process.env.CLOUNDINARY_API_SECRET || '4TXM2sB-cEPWUgOOWl8pY-jW3W0', // Thay bằng API Secret
});

// Cấu hình CloudinaryStorage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_avatars', // Thư mục lưu ảnh trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 150, height: 150, crop: 'limit' }], // Giới hạn kích thước ảnh
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };