import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    reviewId: { type: String, unique: true, required: true },
    userId: { type: String, ref: 'User', required: true },
    orderId: { type: String, ref: 'Order' }, // Can be null if review isn't tied to a specific order
    productId: { type: String, ref: 'Product' },
    storeId: { type: String, ref: 'Store' },
    deliveryPartnerId: { type: String, ref: 'DeliveryPartner' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    reviewDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ReviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);