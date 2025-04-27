const rateLimit = require('express-rate-limit');

// Rate limiter cho đăng nhập
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Giới hạn 5 lần đăng nhập trong 15 phút
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: function(req) {
        // Log IP address for debugging
        console.log('Login attempt from IP:', req.ip);
        return req.ip;
    },
    handler: function (req, res) {
        console.log('Rate limit exceeded for IP:', req.ip);
        res.status(429).json({ 
            success: false, 
            message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' 
        });
    }
});

module.exports = loginLimiter; 