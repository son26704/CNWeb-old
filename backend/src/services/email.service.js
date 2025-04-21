const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Xác thực tài khoản của bạn',
    text: `Mã xác thực của bạn là: ${code}. Vui lòng nhập mã này để xác thực tài khoản.`,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetPasswordEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Đặt lại mật khẩu',
    text: `Mã xác thực để đặt lại mật khẩu của bạn là: ${code}. Mã này có hiệu lực trong 10 phút.`,
  };

  await transporter.sendMail(mailOptions);
};