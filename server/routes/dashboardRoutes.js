const express = require('express');
const router = express.Router();
const { getErrorLogs } = require('../utils/errorHandlerUtils'); // Import getErrorLogs

// EJS Dashboard Route
router.get('/', (req, res) => {
    res.render('dashboard', { errorLogs: getErrorLogs() }); // Pass collected error logs
});

module.exports = router;