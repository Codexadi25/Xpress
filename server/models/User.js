import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { _id: true }); // _id: true for subdocuments

const UserSchema = new Schema({
    userId: { type: String, unique: true, required: true }, // For consistency with SQL or external IDs
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    addresses: [AddressSchema], // Embedded documents for addresses
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now }
}, { timestamps: true }
);

// Middleware to update `updatedAt` field on save
UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', UserSchema);