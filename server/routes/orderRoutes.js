const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Order = require('../models/Order'); // MongoDB Order Model
const Store = require('../models/Store'); // MongoDB Store Model
const Product = require('../models/Product'); // MongoDB Product Model
const authenticateToken = require('../middlewares/authMiddleware'); // Auth middleware
const { logError } = require('../utils/errorHandlerUtils');

// Protected API for Order Placement
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { storeId, deliveryAddress, items, paymentMethod, notes } = req.body;
        const userId = req.user.userId; // From authenticated JWT

        if (!storeId || !deliveryAddress || !items || items.length === 0 || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required order details.', code: 'ORDER_001' });
        }

        const store = await Store.findOne({ storeId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found.', code: 'ORDER_002' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId, storeId: store.storeId });
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found.`, code: 'ORDER_003' });
            }

            let unitPrice = product.basePrice;
            let productVariantId = null;

            if (item.productVariantId) {
                const variant = product.variants.find(v => v.variantId === item.productVariantId);
                if (!variant) {
                    return res.status(404).json({ message: `Product variant ${item.productVariantId} not found.`, code: 'ORDER_004' });
                }
                unitPrice += variant.priceModifier;
                productVariantId = variant.variantId;
            }

            if (item.quantity <= 0) {
                 return res.status(400).json({ message: 'Item quantity must be positive.', code: 'ORDER_005' });
            }

            const subtotal = unitPrice * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                productId: item.productId,
                productVariantId: productVariantId,
                quantity: item.quantity,
                unitPrice: unitPrice,
                subtotal: subtotal,
                notes: item.notes
            });
        }

        // Calculate delivery fees, taxes, discounts (simplified)
        const deliveryFee = 50; // Example fixed fee
        const taxAmount = totalAmount * 0.05; // 5% tax
        const discountAmount = 0; // No discounts for simplicity

        const finalAmount = totalAmount + deliveryFee + taxAmount - discountAmount;
        const orderId = uuidv4();

        const newOrder = new Order({
            orderId,
            userId: userId,
            storeId: storeId,
            deliveryAddress: deliveryAddress, // Embedded address
            orderDate: new Date(),
            totalAmount,
            deliveryFee,
            taxAmount,
            discountAmount,
            finalAmount,
            orderStatus: 'Pending',
            paymentMethod,
            paymentStatus: 'Pending',
            items: orderItems,
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder.orderId, finalAmount: savedOrder.finalAmount });

    } catch (err) {
        logError('placeOrder', err);
        res.status(500).json({ message: 'Failed to place order. Please check details and try again.', code: 'ORDER_006' });
    }
});

module.exports = router;