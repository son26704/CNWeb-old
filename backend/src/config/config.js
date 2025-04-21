require('dotenv').config();

module.exports = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://nguyentrungson267:2672004@nodejs-crud.lmw4g.mongodb.net/?retryWrites=true&w=majority&appName=nodejs-crud', // Kiểm tra fallback
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'mysecretkey',
        expiresIn: '7d',
    },
    port: process.env.PORT || 5000,
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    // facebook: {
    //     clientID: process.env.FACEBOOK_CLIENT_ID,
    //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    //     callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    // },
};