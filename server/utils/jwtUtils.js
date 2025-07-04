// JWT Secret & Expiry (KEEP SECURE IN .env)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_ACCESS_EXPIRY = '15m'; // Access token expires in 15 minutes
const JWT_REFRESH_EXPIRY = '7d'; // Refresh token expires in 7 days (or longer)

module.exports = {
    JWT_SECRET,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY,
};