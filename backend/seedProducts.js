const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./src/models/product.model'); // Tạo file này sau

mongoose.connect('mongodb+srv://nguyentrungson267:2672004@nodejs-crud.lmw4g.mongodb.net/?retryWrites=true&w=majority&appName=nodejs-crud', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedProducts = async () => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    const products = response.data.map(product => ({
      productId: product.id.toString(), // Chuyển id thành String để tránh xung đột
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
    }));

    await Product.insertMany(products);
    console.log('Dữ liệu sản phẩm đã được thêm thành công!');
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedProducts();