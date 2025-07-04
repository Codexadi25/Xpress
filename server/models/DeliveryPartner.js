import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DeliveryPartnerSchema = new Schema({
    deliveryPartnerId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true },
    vehicleType: { type: String },
    currentLatitude: { type: Number },
    currentLongitude: { type: Number },
    availabilityStatus: { type: String, enum: ['Available', 'On Delivery', 'Offline'], default: 'Available' },
    rating: { type: Number, min: 0, max: 5 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

DeliveryPartnerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);