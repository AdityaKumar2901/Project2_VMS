-- Local Vendor Marketplace - Seed Data
-- This script populates the database with sample data for testing

-- Insert Admin User
-- Password: Admin@123
INSERT INTO users (name, email, password_hash, role) VALUES
('Platform Admin', 'admin@marketplace.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'admin');

-- Insert Vendor Users
-- Password for all: Vendor@123
INSERT INTO users (name, email, password_hash, role) VALUES
('Raj Patel', 'spicemart@vendor.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'vendor'),
('Maria Garcia', 'freshharvest@vendor.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'vendor'),
('Tom Wilson', 'techstore@vendor.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'vendor'),
('Sarah Chen', 'homeessentials@vendor.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'vendor'),
('Ahmed Hassan', 'fashionhub@vendor.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'vendor');

-- Insert Customer Users
-- Password for all: Customer@123
INSERT INTO users (name, email, password_hash, role) VALUES
('John Customer', 'john.customer@email.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'customer'),
('Emily Brown', 'emily.brown@email.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'customer'),
('David Lee', 'david.lee@email.com', '$2b$10$YQ8P8fGnVPdYJKMQfJZLHOoZXh3r6mJE5rJ5wJ5xJ5zJ5AJ5BJ5CJ', 'customer');

-- Insert Vendor Profiles with coordinates (San Francisco Bay Area locations)
INSERT INTO vendor_profiles (user_id, shop_name, phone, email, description, address, city, state, zip, country, lat, lng, verified) VALUES
(2, 'Spice Mart', '+1-415-555-0101', 'spicemart@vendor.com', 'Premium spices and ingredients from around the world', '123 Market St', 'San Francisco', 'CA', '94102', 'USA', 37.7749, -122.4194, TRUE),
(3, 'Fresh Harvest', '+1-415-555-0102', 'freshharvest@vendor.com', 'Organic fruits and vegetables delivered fresh daily', '456 Mission St', 'San Francisco', 'CA', '94105', 'USA', 37.7897, -122.4003, TRUE),
(4, 'Tech Store Plus', '+1-408-555-0103', 'techstore@vendor.com', 'Latest electronics and gadgets at competitive prices', '789 El Camino Real', 'Palo Alto', 'CA', '94301', 'USA', 37.4419, -122.1430, TRUE),
(5, 'Home Essentials', '+1-510-555-0104', 'homeessentials@vendor.com', 'Everything you need for a comfortable home', '321 Broadway', 'Oakland', 'CA', '94612', 'USA', 37.8044, -122.2712, TRUE),
(6, 'Fashion Hub', '+1-650-555-0105', 'fashionhub@vendor.com', 'Trendy clothing and accessories for all occasions', '654 Main St', 'Redwood City', 'CA', '94063', 'USA', 37.4852, -122.2364, TRUE);

-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES
('Groceries', 'groceries', 'Food and daily essentials'),
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Fashion', 'fashion', 'Clothing, shoes, and accessories'),
('Home & Kitchen', 'home-kitchen', 'Home improvement and kitchen items'),
('Health & Beauty', 'health-beauty', 'Personal care and wellness products'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Books & Media', 'books-media', 'Books, music, and entertainment'),
('Toys & Games', 'toys-games', 'Toys and games for all ages');

-- Insert Products for Spice Mart (Vendor 1)
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(1, 1, 'Organic Turmeric Powder', 'SM-TURM-001', 'Premium organic turmeric powder, 500g pack', 8.99, 150, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', TRUE),
(1, 1, 'Himalayan Pink Salt', 'SM-SALT-001', 'Pure Himalayan pink salt, 1kg', 12.99, 200, 'https://images.unsplash.com/photo-1599909533922-61b47e6f4966?w=400', TRUE),
(1, 1, 'Whole Black Pepper', 'SM-PEPP-001', 'Premium black pepper, 250g', 15.49, 100, 'https://images.unsplash.com/photo-1596040033229-a0b3b64d6d6e?w=400', TRUE),
(1, 1, 'Indian Garam Masala', 'SM-GARA-001', 'Authentic Indian spice blend, 200g', 9.99, 80, 'https://images.unsplash.com/photo-1596040033229-a0b3b64d6d6e?w=400', TRUE),
(1, 1, 'Saffron Threads', 'SM-SAFF-001', 'Premium saffron threads, 5g', 49.99, 30, 'https://images.unsplash.com/photo-1596040033229-a0b3b64d6d6e?w=400', TRUE);

-- Insert Products for Fresh Harvest (Vendor 2)
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(2, 1, 'Organic Avocados', 'FH-AVO-001', 'Fresh organic avocados, pack of 4', 6.99, 50, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400', TRUE),
(2, 1, 'Cherry Tomatoes', 'FH-TOM-001', 'Sweet cherry tomatoes, 500g', 4.49, 100, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', TRUE),
(2, 1, 'Mixed Salad Greens', 'FH-SAL-001', 'Fresh organic salad mix, 300g', 3.99, 75, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', TRUE),
(2, 1, 'Organic Strawberries', 'FH-STRA-001', 'Fresh organic strawberries, 400g', 7.99, 60, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', TRUE),
(2, 1, 'Baby Carrots', 'FH-CAR-001', 'Crunchy baby carrots, 1kg', 3.49, 120, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', TRUE);

-- Insert Products for Tech Store Plus (Vendor 3)
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(3, 2, 'Wireless Bluetooth Earbuds', 'TS-EAR-001', 'Premium wireless earbuds with noise cancellation', 89.99, 45, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', TRUE),
(3, 2, 'USB-C Fast Charger', 'TS-CHAR-001', '65W USB-C fast charger with cable', 29.99, 80, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400', TRUE),
(3, 2, 'Portable Power Bank', 'TS-PWR-001', '20000mAh portable power bank', 39.99, 60, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', TRUE),
(3, 2, 'Wireless Mouse', 'TS-MOU-001', 'Ergonomic wireless mouse, 2.4GHz', 24.99, 90, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', TRUE),
(3, 2, 'Phone Stand Holder', 'TS-STAN-001', 'Adjustable aluminum phone stand', 19.99, 100, 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400', TRUE);

-- Insert Products for Home Essentials (Vendor 4)
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(4, 4, 'Non-Stick Cookware Set', 'HE-COOK-001', '12-piece non-stick cookware set', 129.99, 25, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', TRUE),
(4, 4, 'Cotton Bed Sheet Set', 'HE-SHEET-001', 'Queen size cotton bed sheet set', 49.99, 40, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400', TRUE),
(4, 4, 'LED Desk Lamp', 'HE-LAMP-001', 'Adjustable LED desk lamp with USB port', 34.99, 55, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', TRUE),
(4, 4, 'Storage Organizer Bins', 'HE-STOR-001', 'Set of 6 fabric storage bins', 39.99, 70, 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400', TRUE),
(4, 4, 'Microfiber Towel Set', 'HE-TOW-001', 'Ultra-soft microfiber towel set, 8 pieces', 29.99, 85, 'https://images.unsplash.com/photo-1584727122626-7b696e66cd6e?w=400', TRUE);

-- Insert Products for Fashion Hub (Vendor 5)
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(5, 3, 'Classic Denim Jeans', 'FH-JEAN-001', 'Comfortable slim-fit denim jeans', 59.99, 50, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', TRUE),
(5, 3, 'Cotton T-Shirt Pack', 'FH-TSH-001', 'Pack of 3 cotton t-shirts, assorted colors', 29.99, 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', TRUE),
(5, 3, 'Leather Crossbody Bag', 'FH-BAG-001', 'Genuine leather crossbody bag', 79.99, 30, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', TRUE),
(5, 3, 'Running Sneakers', 'FH-SHOE-001', 'Lightweight running sneakers', 89.99, 40, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', TRUE),
(5, 3, 'Sunglasses UV Protection', 'FH-SUNG-001', 'Polarized sunglasses with UV protection', 39.99, 60, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', TRUE);

-- Insert Sample Reviews for Products
INSERT INTO reviews (reviewer_user_id, product_id, rating, comment) VALUES
(7, 1, 5, 'Excellent quality turmeric! Very fresh and aromatic.'),
(8, 1, 4, 'Good product, fast delivery. Slightly expensive but worth it.'),
(9, 6, 5, 'Best avocados I have bought online. Perfect ripeness!'),
(7, 11, 5, 'These earbuds are amazing! Great sound quality and battery life.'),
(8, 11, 4, 'Good earbuds for the price. Comfortable fit.'),
(9, 16, 5, 'Love this cookware set! Non-stick coating works perfectly.'),
(7, 21, 4, 'Nice jeans, good fit. Shipping was quick.'),
(8, 3, 5, 'The black pepper is so fresh and flavorful!'),
(9, 12, 4, 'Fast charger works great. Heats up a bit but expected.'),
(7, 18, 5, 'Super useful storage bins. Great quality!');

-- Insert Sample Reviews for Vendors
INSERT INTO reviews (reviewer_user_id, vendor_id, rating, comment) VALUES
(7, 1, 5, 'Spice Mart has the best quality spices. Always fresh!'),
(8, 2, 5, 'Fresh Harvest delivers on time and products are always fresh.'),
(9, 3, 4, 'Tech Store has good prices. Customer service could be better.'),
(7, 4, 5, 'Home Essentials is my go-to for household items!'),
(8, 5, 4, 'Fashion Hub has trendy items but sizing can be off sometimes.');

-- Insert Sample Cart for John Customer
INSERT INTO carts (customer_user_id) VALUES (7);

INSERT INTO cart_items (cart_id, product_id, qty, unit_price_snapshot) VALUES
(1, 1, 2, 8.99),
(1, 6, 1, 6.99),
(1, 11, 1, 89.99);

-- Insert Sample Orders
INSERT INTO orders (order_number, customer_user_id, status, subtotal, delivery_fee, total, delivery_address, delivery_city, delivery_state, delivery_zip, phone, payment_method) VALUES
('ORD-2026-0001', 7, 'delivered', 24.97, 5.00, 29.97, '456 Oak Avenue', 'San Francisco', 'CA', '94110', '+1-415-555-1001', 'Cash on Delivery'),
('ORD-2026-0002', 8, 'out_for_delivery', 89.99, 5.00, 94.99, '789 Pine Street', 'Oakland', 'CA', '94607', '+1-510-555-1002', 'Cash on Delivery'),
('ORD-2026-0003', 9, 'accepted', 129.99, 5.00, 134.99, '321 Maple Drive', 'Palo Alto', 'CA', '94303', '+1-650-555-1003', 'Cash on Delivery'),
('ORD-2026-0004', 7, 'pending', 45.98, 5.00, 50.98, '456 Oak Avenue', 'San Francisco', 'CA', '94110', '+1-415-555-1001', 'Cash on Delivery');

-- Insert Order Items
INSERT INTO order_items (order_id, vendor_id, product_id, product_name, qty, unit_price_snapshot, line_total) VALUES
(1, 1, 1, 'Organic Turmeric Powder', 2, 8.99, 17.98),
(1, 2, 6, 'Organic Avocados', 1, 6.99, 6.99),
(2, 3, 11, 'Wireless Bluetooth Earbuds', 1, 89.99, 89.99),
(3, 4, 16, 'Non-Stick Cookware Set', 1, 129.99, 129.99),
(4, 1, 2, 'Himalayan Pink Salt', 2, 12.99, 25.98),
(4, 4, 18, 'Storage Organizer Bins', 1, 39.99, 39.99);

-- Update product stock quantities based on orders (simulate sold items)
UPDATE products SET stock_qty = stock_qty - 2 WHERE id = 1;
UPDATE products SET stock_qty = stock_qty - 1 WHERE id = 6;
UPDATE products SET stock_qty = stock_qty - 1 WHERE id = 11;
UPDATE products SET stock_qty = stock_qty - 1 WHERE id = 16;
UPDATE products SET stock_qty = stock_qty - 2 WHERE id = 2;
UPDATE products SET stock_qty = stock_qty - 1 WHERE id = 18;

-- Note: The password hash used is for demonstration only.
-- In production, generate actual bcrypt hashes using:
-- bcrypt.hash('password', 10)

-- To verify login credentials:
-- Admin: admin@marketplace.com / Admin@123
-- Vendor: spicemart@vendor.com / Vendor@123
-- Customer: john.customer@email.com / Customer@123
