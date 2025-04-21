// const jwt = require('jsonwebtoken');
const Product = require('../models/product.model');

// Lấy danh sách tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error.message);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getAllProducts,
};