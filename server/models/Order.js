import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
    productId: { type: String, ref: 'Product', required: true },
    productVariantId: { type: String }, // Can be null if no variant
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true }, // Price at time of purchase
    subtotal: { type: Number, required: true },
    notes: { type: String }
}, { _id: true });

const OrderSchema = new Schema({
    orderId: { type: String, unique: true, required: true },
    userId: { type: String, ref: 'User', required: true },
    storeId: { type: String, ref: 'Store', required: true },
    deliveryAddress: { // Embedded copy of the address for the order
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    orderDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true }, // Sum of all item subtotals
    deliveryFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
        default: 'Pending'
    },
    deliveryPartnerId: { type: String, ref: 'DeliveryPartner' },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    notes: { type: String },
    items: [OrderItemSchema], // Embedded array of order items
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', OrderSchema);