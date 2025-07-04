import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ProductVariantSchema = new Schema({
    variantId: { type: String, required: true }, // Unique ID for each variant
    variantName: { type: String, required: true }, // e.g., "500ml", "Large", "Red"
    priceModifier: { type: Number, default: 0 }, // Adjustment to base product price
    stockQuantity: { type: Number, default: 0 },
    imageUrl: { type: String },
    sku: { type: String, unique: true, required: true }
}, { _id: true });

const ProductSchema = new Schema({
    productId: { type: String, unique: true, required: true },
    storeId: { type: String, ref: 'Store', required: true }, // Reference to Store
    productName: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true }, // Renamed to basePrice for clarity with variants
    categoryId: { type: String, ref: 'ProductCategory', required: true }, // Reference to ProductCategory
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 }, // Main product stock (if no variants, or total)
    variants: [ProductVariantSchema], // Embedded array of variants
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', ProductSchema);