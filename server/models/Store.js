import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const StoreSchema = new Schema({
    storeId: { type: String, unique: true, required: true },
    storeName: { type: String, required: true },
    description: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, lowercase: true },
    cuisineType: { type: String }, // Can be an array of strings for multiple types
    openingTime: { type: String }, // Store as HH:MM string for simplicity
    closingTime: { type: String }, // Store as HH:MM string
    isActive: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

StoreSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Store', StoreSchema);