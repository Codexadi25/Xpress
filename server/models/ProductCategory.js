import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
    categoryId: { type: String, unique: true, required: true },
    categoryName: { type: String, required: true, unique: true },
    parentCategoryId: { type: String, ref: 'ProductCategory' }, // For hierarchical categories
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProductCategorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ProductCategory', ProductCategorySchema);