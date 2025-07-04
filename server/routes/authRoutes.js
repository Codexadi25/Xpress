const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User'); // MongoDB User Model
const { logError } = require('../utils/errorHandlerUtils');
const { JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } = require('../utils/jwtUtils');
const refreshTokens = require('../utils/tokenStore'); // In-memory token store

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, addresses } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone number already exists.', code: 'REG_001' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userId = uuidv4();

        const newUser = new User({
            userId,
            firstName,
            lastName,
            email,
            passwordHash,
            phoneNumber,
            addresses: addresses || []
        });
        const savedUser = await newUser.save();

        res.status(201).json({ message: 'User registered successfully!', userId: savedUser.userId });
    } catch (err) {
        logError('registerUser', err);
        res.status(500).json({ message: 'Failed to register user. Please try again.', code: 'REG_002' });
    }
});

// User Login & Token Generation
router.post('/login', async (req, res) => {
    console.log('Received login request body in authRoutes:', req.body); // Keep this for debugging
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.', code: 'LOGIN_001' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.', code: 'LOGIN_001' });
        }

        const accessToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
        const refreshToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });

        refreshTokens.push(refreshToken); // Store refresh token (in-memory, bad for prod)

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            expiresIn: JWT_ACCESS_EXPIRY
        });
    } catch (err) {
        logError('userLogin', err);
        res.status(500).json({ message: 'Login failed. Please try again.', code: 'LOGIN_002' });
    }
});

// Token Refresh Endpoint
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        logError('refreshToken', new Error('Invalid or missing refresh token'), 401);
        return res.status(401).json({ message: 'Invalid refresh token. Please re-login.', code: 'REFRESH_001' });
    }

    jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
        if (err) {
            logError('refreshToken', err, 403);
            return res.status(403).json({ message: 'Refresh token expired or invalid. Please re-login.', code: 'REFRESH_002' });
        }

        // Remove old refresh token and generate new ones (rotate tokens for better security)
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);

        const newAccessToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
        const newRefreshToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });

        refreshTokens.push(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: JWT_ACCESS_EXPIRY
        });
    });
});

// Logout (invalidate refresh token)
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    }
    res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;