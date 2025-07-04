require('dotenv').config();
const mongoose = require('mongoose');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Import Mongoose Models
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const DeliveryPartner = require('../models/DeliveryPartner');

// PostgreSQL Connection Pool
const pgPool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: { rejectUnauthorized: false } // Adjust for production
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for initialization.');
        await pgPool.connect();
        console.log('PostgreSQL connected for initialization.');
    } catch (err) {
        console.error('Database connection error during initialization:', err);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    await pgPool.end();
    console.log('PostgreSQL disconnected.');
};

const clearDatabases = async () => {
    console.log('Clearing MongoDB collections...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await ProductCategory.deleteMany({});
    await DeliveryPartner.deleteMany({});
    console.log('MongoDB collections cleared.');

    console.log('Clearing PostgreSQL tables...');
    // Order of deletion matters due to foreign key constraints
    await pgPool.query('DELETE FROM order_items');
    await pgPool.query('DELETE FROM orders');
    await pgPool.query('DELETE FROM reviews');
    await pgPool.query('DELETE FROM product_variants');
    await pgPool.query('DELETE FROM products');
    await pgPool.query('DELETE FROM product_categories');
    await pgPool.query('DELETE FROM stores');
    await pgPool.query('DELETE FROM addresses');
    await pgPool.query('DELETE FROM users');
    await pgPool.query('DELETE FROM delivery_partners');
    console.log('PostgreSQL tables cleared.');
};

const initializeData = async () => {
    try {
        await connectDB();
        await clearDatabases();

        const salt = await bcrypt.genSalt(10);

        // --- Users ---
        const user1Id = uuidv4();
        const user1AddressId = new mongoose.Types.ObjectId(); // Mongoose generates _id for subdocuments
        const user1 = await User.create({
            userId: user1Id,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            passwordHash: await bcrypt.hash('password123', salt),
            phoneNumber: '1234567890',
            addresses: [{
                _id: user1AddressId, // Explicitly set for linking with PG
                addressLine1: '123 Main St',
                addressLine2: 'Apt 101',
                city: 'New Delhi',
                state: 'Delhi',
                postalCode: '110001',
                country: 'India',
                isDefault: true
            }]
        });
        await pgPool.query(
            `INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4, $5, $6)`,
            [user1.userId, user1.firstName, user1.lastName, user1.email, user1.passwordHash, user1.phoneNumber]
        );
        await pgPool.query(
            `INSERT INTO addresses (address_id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [user1AddressId, user1.userId, user1.addresses[0].addressLine1, user1.addresses[0].addressLine2, user1.addresses[0].city, user1.addresses[0].state, user1.addresses[0].postalCode, user1.addresses[0].country, user1.addresses[0].isDefault]
        );
        console.log('User: John Doe created.');

        const user2Id = uuidv4();
        const user2AddressId = new mongoose.Types.ObjectId();
        const user2 = await User.create({
            userId: user2Id,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            passwordHash: await bcrypt.hash('password123', salt),
            phoneNumber: '0987654321',
            addresses: [{
                _id: user2AddressId,
                addressLine1: '456 MG Road',
                city: 'Bengaluru',
                state: 'Karnataka',
                postalCode: '560001',
                country: 'India',
                isDefault: true
            }]
        });
        await pgPool.query(
            `INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4, $5, $6)`,
            [user2.userId, user2.firstName, user2.lastName, user2.email, user2.passwordHash, user2.phoneNumber]
        );
        await pgPool.query(
            `INSERT INTO addresses (address_id, user_id, address_line1, city, state, postal_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [user2AddressId, user2.userId, user2.addresses[0].addressLine1, user2.addresses[0].city, user2.addresses[0].state, user2.addresses[0].postalCode, user2.addresses[0].country, user2.addresses[0].isDefault]
        );
        console.log('User: Jane Smith created.');

        // --- Stores ---
        const store1Id = uuidv4();
        const store1 = await Store.create({
            storeId: store1Id,
            storeName: 'Blinkit Supermart',
            description: 'Your daily grocery needs.',
            addressLine1: 'Unit 1, Cyber City',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            phoneNumber: '9876543210',
            email: 'blinkit@example.com',
            cuisineType: 'Groceries',
            openingTime: '08:00',
            closingTime: '22:00',
            latitude: 28.4595,
            longitude: 77.0266
        });
        await pgPool.query(
            `INSERT INTO stores (store_id, store_name, description, address_line1, city, state, postal_code, phone_number, email, cuisine_type, opening_time, closing_time, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [store1.storeId, store1.storeName, store1.description, store1.addressLine1, store1.city, store1.state, store1.postalCode, store1.phoneNumber, store1.email, store1.cuisineType, store1.openingTime, store1.closingTime, store1.latitude, store1.longitude]
        );
        console.log('Store: Blinkit Supermart created.');

        const store2Id = uuidv4();
        const store2 = await Store.create({
            storeId: store2Id,
            storeName: 'Zomato Biryani House',
            description: 'Authentic Indian Biryani.',
            addressLine1: 'Shop 5, Food Street',
            city: 'New Delhi',
            state: 'Delhi',
            postalCode: '110002',
            phoneNumber: '9988776655',
            email: 'biryani@example.com',
            cuisineType: 'Indian',
            openingTime: '11:00',
            closingTime: '23:00',
            latitude: 28.6139,
            longitude: 77.2090
        });
        await pgPool.query(
            `INSERT INTO stores (store_id, store_name, description, address_line1, city, state, postal_code, phone_number, email, cuisine_type, opening_time, closing_time, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [store2.storeId, store2.storeName, store2.description, store2.addressLine1, store2.city, store2.state, store2.postalCode, store2.phoneNumber, store2.email, store2.cuisineType, store2.openingTime, store2.closingTime, store2.latitude, store2.longitude]
        );
        console.log('Store: Zomato Biryani House created.');


        // --- Product Categories ---
        const catGroceryId = uuidv4();
        const catFoodId = uuidv4();
        const catBeverageId = uuidv4();

        const catGrocery = await ProductCategory.create({ categoryId: catGroceryId, categoryName: 'Groceries' });
        await pgPool.query(`INSERT INTO product_categories (category_id, category_name) VALUES ($1, $2)`, [catGrocery.categoryId, catGrocery.categoryName]);

        const catFood = await ProductCategory.create({ categoryId: catFoodId, categoryName: 'Food' });
        await pgPool.query(`INSERT INTO product_categories (category_id, category_name) VALUES ($1, $2)`, [catFood.categoryId, catFood.categoryName]);

        const catBeverage = await ProductCategory.create({ categoryId: catBeverageId, categoryName: 'Beverages', parentCategoryId: catGroceryId });
        await pgPool.query(`INSERT INTO product_categories (category_id, category_name, parent_category_id) VALUES ($1, $2, $3)`, [catBeverage.categoryId, catBeverage.categoryName, catBeverage.parentCategoryId]);
        console.log('Product Categories created.');


        // --- Products ---
        const prodMilkId = uuidv4();
        const prodMilkVariantId = new mongoose.Types.ObjectId();
        const prodMilk = await Product.create({
            productId: prodMilkId,
            storeId: store1.storeId,
            productName: 'Amul Milk (1L)',
            description: 'Fresh toned milk, 1 liter pouch.',
            basePrice: 60,
            categoryId: catGrocery.categoryId,
            imageUrl: 'https://example.com/milk.jpg',
            stockQuantity: 100,
            variants: [{
                _id: prodMilkVariantId,
                variantId: uuidv4(),
                variantName: '500ml',
                priceModifier: -25,
                stockQuantity: 50,
                sku: 'AMULMILK500ML'
            }]
        });
        await pgPool.query(
            `INSERT INTO products (product_id, store_id, product_name, description, base_price, category_id, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [prodMilk.productId, prodMilk.storeId, prodMilk.productName, prodMilk.description, prodMilk.basePrice, prodMilk.categoryId, prodMilk.imageUrl, prodMilk.stockQuantity]
        );
        await pgPool.query(
            `INSERT INTO product_variants (variant_id, product_id, variant_name, price_modifier, stock_quantity, sku) VALUES ($1, $2, $3, $4, $5, $6)`,
            [prodMilkVariantId, prodMilk.productId, prodMilk.variants[0].variantName, prodMilk.variants[0].priceModifier, prodMilk.variants[0].stockQuantity, prodMilk.variants[0].sku]
        );
        console.log('Product: Amul Milk created.');

        const prodBiryaniId = uuidv4();
        const prodBiryani = await Product.create({
            productId: prodBiryaniId,
            storeId: store2.storeId,
            productName: 'Chicken Biryani - Regular',
            description: 'Spicy chicken biryani with raita.',
            basePrice: 250,
            categoryId: catFood.categoryId,
            imageUrl: 'https://example.com/biryani.jpg',
            stockQuantity: 50
        });
        await pgPool.query(
            `INSERT INTO products (product_id, store_id, product_name, description, base_price, category_id, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [prodBiryani.productId, prodBiryani.storeId, prodBiryani.productName, prodBiryani.description, prodBiryani.basePrice, prodBiryani.categoryId, prodBiryani.imageUrl, prodBiryani.stockQuantity]
        );
        console.log('Product: Chicken Biryani created.');

        const prodColaId = uuidv4();
        const prodCola = await Product.create({
            productId: prodColaId,
            storeId: store1.storeId,
            productName: 'Coca-Cola (600ml)',
            description: 'Refreshing soft drink.',
            basePrice: 45,
            categoryId: catBeverage.categoryId,
            imageUrl: 'https://example.com/coke.jpg',
            stockQuantity: 200
        });
        await pgPool.query(
            `INSERT INTO products (product_id, store_id, product_name, description, base_price, category_id, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [prodCola.productId, prodCola.storeId, prodCola.productName, prodCola.description, prodCola.basePrice, prodCola.categoryId, prodCola.imageUrl, prodCola.stockQuantity]
        );
        console.log('Product: Coca-Cola created.');

        // --- Delivery Partners ---
        const dp1Id = uuidv4();
        const dp1 = await DeliveryPartner.create({
            deliveryPartnerId: dp1Id,
            name: 'Rohan Sharma',
            phoneNumber: '9000000001',
            email: 'rohan.dp@example.com',
            vehicleType: 'Motorcycle',
            currentLatitude: 28.4600,
            currentLongitude: 77.0270,
            availabilityStatus: 'Available',
            rating: 4.8
        });
        await pgPool.query(
            `INSERT INTO delivery_partners (delivery_partner_id, name, phone_number, email, vehicle_type, current_latitude, current_longitude, availability_status, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [dp1.deliveryPartnerId, dp1.name, dp1.phoneNumber, dp1.email, dp1.vehicleType, dp1.currentLatitude, dp1.currentLongitude, dp1.availabilityStatus, dp1.rating]
        );
        console.log('Delivery Partner: Rohan Sharma created.');

        console.log('Database initialization complete!');

    } catch (error) {
        console.error('Error during database initialization:', error);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
};

initializeData();