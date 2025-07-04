const express = require('express');
const router = express.Router();
const { logError } = require('../utils/errorHandlerUtils');

// Fallback for unhandled API routes (any /api/ route that doesn't match above)
router.use('/', (req, res) => {
    logError('API_NotFound', new Error(`API endpoint not found: ${req.method} ${req.originalUrl}`), 404);
    res.status(404).json({ message: 'API endpoint not found.', code: 'API_001' });
});

module.exports = router;