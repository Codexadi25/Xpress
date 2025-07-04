const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwtUtils'); // Import secret
const { logError } = require('../utils/errorHandlerUtils'); // Import error logger

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        logError('authenticateToken', new Error('No token provided'), 401);
        return res.status(401).json({ message: 'Authentication required. No token provided.', code: 'AUTH_001' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            logError('authenticateToken', err, 403);
            return res.status(403).json({ message: 'Invalid or expired token. Please log in again.', code: 'AUTH_002' });
        }
        req.user = user; // user payload from JWT
        next();
    });
};

module.exports = authenticateToken;