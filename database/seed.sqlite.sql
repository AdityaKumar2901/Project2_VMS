-- Local Vendor Marketplace - Seed Data (SQLite)
-- This script populates the database with sample data for testing

-- Insert Admin User
-- Password: Admin@123
INSERT INTO users (name, email, password_hash, role) VALUES
('Platform Admin', 'admin@marketplace.com', '$2a$10$bBNVub7ZFYGERqsf4bpCvOTj7ivBHH50bZYqTv/BofuCP3x.j6sDS', 'admin');

-- Insert Vendor Users (5 vendors)
-- Password for all: Vendor@123
INSERT INTO users (name, email, password_hash, role) VALUES
('Raj Patel', 'spicemart@vendor.com', '$2a$10$IdshOqxYOV1aFrwC1pSOSOeRL.DtFyWlxWIJhT4kIYrVRv4YkzdKG', 'vendor'),
('Maria Garcia', 'freshharvest@vendor.com', '$2a$10$IdshOqxYOV1aFrwC1pSOSOeRL.DtFyWlxWIJhT4kIYrVRv4YkzdKG', 'vendor'),
('Tom Wilson', 'techstore@vendor.com', '$2a$10$IdshOqxYOV1aFrwC1pSOSOeRL.DtFyWlxWIJhT4kIYrVRv4YkzdKG', 'vendor'),
('Sarah Chen', 'homeessentials@vendor.com', '$2a$10$IdshOqxYOV1aFrwC1pSOSOeRL.DtFyWlxWIJhT4kIYrVRv4YkzdKG', 'vendor'),
('Ahmed Hassan', 'fashionhub@vendor.com', '$2a$10$IdshOqxYOV1aFrwC1pSOSOeRL.DtFyWlxWIJhT4kIYrVRv4YkzdKG', 'vendor');

-- Insert Customer Users
-- Password for all: Customer@123
INSERT INTO users (name, email, password_hash, role) VALUES
('John Customer', 'john.customer@email.com', '$2a$10$da6aGnZvktFRSJ1/XFMHDeuF6ZC3m17V8eo2AKpfyxlOfIEDk3GH.', 'customer'),
('Emily Brown', 'emily.brown@email.com', '$2a$10$da6aGnZvktFRSJ1/XFMHDeuF6ZC3m17V8eo2AKpfyxlOfIEDk3GH.', 'customer'),
('David Lee', 'david.lee@email.com', '$2a$10$da6aGnZvktFRSJ1/XFMHDeuF6ZC3m17V8eo2AKpfyxlOfIEDk3GH.', 'customer'),
('Lisa Wong', 'lisa.wong@email.com', '$2a$10$da6aGnZvktFRSJ1/XFMHDeuF6ZC3m17V8eo2AKpfyxlOfIEDk3GH.', 'customer'),
('Mike Johnson', 'mike.johnson@email.com', '$2a$10$da6aGnZvktFRSJ1/XFMHDeuF6ZC3m17V8eo2AKpfyxlOfIEDk3GH.', 'customer');

-- Insert Vendor Profiles with coordinates (San Francisco Bay Area locations)
INSERT INTO vendor_profiles (user_id, shop_name, phone, email, description, address, city, state, zip, country, lat, lng, verified) VALUES
(2, 'Spice Mart', '+1-415-555-0101', 'spicemart@vendor.com', 'Premium spices and ingredients from around the world. We source the finest spices directly from farms.', '123 Market St', 'San Francisco', 'CA', '94102', 'USA', 37.7749, -122.4194, 1),
(3, 'Fresh Harvest', '+1-415-555-0102', 'freshharvest@vendor.com', 'Organic fruits and vegetables delivered fresh daily. Farm to table produce at its finest.', '456 Mission St', 'San Francisco', 'CA', '94105', 'USA', 37.7897, -122.4003, 1),
(4, 'Tech Store Plus', '+1-408-555-0103', 'techstore@vendor.com', 'Latest electronics and gadgets at competitive prices. Your one-stop tech destination.', '789 El Camino Real', 'Palo Alto', 'CA', '94301', 'USA', 37.4419, -122.1430, 1),
(5, 'Home Essentials', '+1-510-555-0104', 'homeessentials@vendor.com', 'Everything you need for a comfortable home. Quality home goods at affordable prices.', '321 Broadway', 'Oakland', 'CA', '94612', 'USA', 37.8044, -122.2712, 1),
(6, 'Fashion Hub', '+1-650-555-0105', 'fashionhub@vendor.com', 'Trendy clothing and accessories for all occasions. Stay stylish with our curated collection.', '654 Main St', 'Redwood City', 'CA', '94063', 'USA', 37.4852, -122.2364, 1);

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

-- =====================================================
-- Products for SPICE MART (Vendor ID: 1) - 12 Products
-- =====================================================
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(1, 1, 'Organic Turmeric Powder', 'SM-TURM-001', 'Premium organic turmeric powder sourced from India, 500g pack. Rich in curcumin.', 8.99, 150, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', 1),
(1, 1, 'Himalayan Pink Salt', 'SM-SALT-001', 'Pure Himalayan pink salt, hand-mined from ancient salt deposits, 1kg', 12.99, 200, 'https://images.unsplash.com/photo-1599909533922-61b47e6f4966?w=400', 1),
(1, 1, 'Whole Black Pepper', 'SM-PEPP-001', 'Premium Tellicherry black pepper, 250g. Bold flavor and aroma.', 15.49, 100, 'https://images.unsplash.com/photo-1596040033229-a0b3b64d6d6e?w=400', 1),
(1, 1, 'Indian Garam Masala', 'SM-GARA-001', 'Authentic Indian spice blend with 12 spices, 200g. Perfect for curries.', 9.99, 80, 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400', 1),
(1, 1, 'Saffron Threads', 'SM-SAFF-001', 'Premium Spanish saffron threads, 5g. The world finest spice.', 49.99, 30, 'https://images.unsplash.com/photo-1600298882525-d05c5678ae8d?w=400', 1),
(1, 1, 'Ground Cumin', 'SM-CUMI-001', 'Fresh ground cumin with earthy flavor, 300g. Essential for Mexican and Indian cuisine.', 7.49, 120, 'https://images.unsplash.com/photo-1599909533922-61b47e6f4966?w=400', 1),
(1, 1, 'Smoked Paprika', 'SM-PAPR-001', 'Spanish smoked paprika, 200g. Adds depth to any dish.', 8.49, 90, 'https://images.unsplash.com/photo-1599909533922-61b47e6f4966?w=400', 1),
(1, 1, 'Cinnamon Sticks', 'SM-CINN-001', 'Ceylon cinnamon sticks, 100g. True cinnamon with subtle sweetness.', 11.99, 70, 'https://images.unsplash.com/photo-1600298882525-d05c5678ae8d?w=400', 1),
(1, 1, 'Red Chili Flakes', 'SM-CHIL-001', 'Crushed red chili flakes, 150g. Perfect heat level for pizzas and pastas.', 6.99, 110, 'https://images.unsplash.com/photo-1596040033229-a0b3b64d6d6e?w=400', 1),
(1, 1, 'Cardamom Pods', 'SM-CARD-001', 'Green cardamom pods from Guatemala, 100g. Aromatic and flavorful.', 18.99, 50, 'https://images.unsplash.com/photo-1600298882525-d05c5678ae8d?w=400', 1),
(1, 1, 'Curry Powder', 'SM-CURR-001', 'Traditional Madras curry powder blend, 250g. Medium heat.', 8.99, 95, 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400', 1),
(1, 1, 'Dried Oregano', 'SM-OREG-001', 'Mediterranean dried oregano, 100g. Perfect for Italian dishes.', 5.99, 130, 'https://images.unsplash.com/photo-1600298882525-d05c5678ae8d?w=400', 1);

-- =====================================================
-- Products for FRESH HARVEST (Vendor ID: 2) - 12 Products
-- =====================================================
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(2, 1, 'Organic Avocados', 'FH-AVO-001', 'Fresh organic Hass avocados, perfectly ripe, 4 count', 7.99, 100, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400', 1),
(2, 1, 'Baby Spinach', 'FH-SPIN-001', 'Organic baby spinach leaves, pre-washed and ready to eat, 500g', 4.99, 75, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', 1),
(2, 1, 'Cherry Tomatoes', 'FH-TOM-001', 'Sweet vine-ripened cherry tomatoes, 500g', 5.49, 90, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 1),
(2, 1, 'Organic Bananas', 'FH-BAN-001', 'Ripe organic bananas from Ecuador, 6 count', 3.99, 120, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', 1),
(2, 1, 'Mixed Berries Pack', 'FH-BER-001', 'Fresh mixed berries - strawberries, blueberries, raspberries, 300g', 8.99, 60, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400', 1),
(2, 1, 'Organic Kale', 'FH-KALE-001', 'Fresh curly kale, organic and locally grown, 400g bunch', 4.49, 80, 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400', 1),
(2, 1, 'Red Bell Peppers', 'FH-BELL-001', 'Crisp red bell peppers, 3 count', 5.99, 70, 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', 1),
(2, 1, 'Fresh Mangoes', 'FH-MANG-001', 'Sweet Ataulfo mangoes from Mexico, 4 count', 9.99, 55, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', 1),
(2, 1, 'Organic Carrots', 'FH-CARR-001', 'Organic baby carrots, ready to snack, 500g', 3.49, 100, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', 1),
(2, 1, 'Fresh Broccoli', 'FH-BROC-001', 'Fresh broccoli crowns, 500g', 4.29, 85, 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400', 1),
(2, 1, 'Organic Apples', 'FH-APPL-001', 'Organic Honeycrisp apples, 6 count', 7.49, 95, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 1),
(2, 1, 'Fresh Lemons', 'FH-LEMN-001', 'Meyer lemons, 6 count. Perfect for cooking and drinks.', 4.99, 110, 'https://images.unsplash.com/photo-1582087463261-ddea03f80e5d?w=400', 1);

-- =====================================================
-- Products for TECH STORE PLUS (Vendor ID: 3) - 12 Products
-- =====================================================
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(3, 2, 'Wireless Mouse Pro', 'TS-MOUSE-001', 'Ergonomic wireless mouse with USB receiver, 2.4GHz connection, 6 buttons', 29.99, 50, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1),
(3, 2, 'USB-C Hub 7-in-1', 'TS-HUB-001', '7-in-1 USB-C hub with HDMI 4K, SD card reader, 3 USB ports', 45.99, 35, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', 1),
(3, 2, 'Bluetooth Headphones ANC', 'TS-HEAD-001', 'Over-ear wireless headphones with active noise cancellation, 30hr battery', 129.99, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1),
(3, 2, 'Portable Power Bank 20K', 'TS-CHRG-001', '20000mAh power bank with 65W fast charging, USB-C PD', 39.99, 40, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 1),
(3, 2, 'HD Webcam 1080p', 'TS-CAM-001', '1080p HD webcam with built-in microphone, auto light correction', 59.99, 30, 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400', 1),
(3, 2, 'Mechanical Keyboard RGB', 'TS-KEYB-001', 'Mechanical gaming keyboard with RGB backlight, blue switches', 79.99, 28, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', 1),
(3, 2, 'Wireless Earbuds Pro', 'TS-EARBUD-001', 'True wireless earbuds with ANC, 8hr battery, waterproof IPX5', 89.99, 45, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 1),
(3, 2, 'Laptop Stand Aluminum', 'TS-STAND-001', 'Adjustable aluminum laptop stand, ergonomic design, fits 10-17 inch', 34.99, 55, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', 1),
(3, 2, 'Smart Watch Fitness', 'TS-WATCH-001', 'Fitness smart watch with heart rate monitor, GPS, 7-day battery', 149.99, 20, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1),
(3, 2, 'USB Flash Drive 128GB', 'TS-USB-001', '128GB USB 3.0 flash drive, metal casing, up to 150MB/s', 19.99, 80, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', 1),
(3, 2, 'Wireless Charging Pad', 'TS-WCHG-001', '15W fast wireless charging pad, Qi compatible, LED indicator', 24.99, 60, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 1),
(3, 2, 'Bluetooth Speaker', 'TS-SPKR-001', 'Portable Bluetooth speaker, 360 sound, waterproof IPX7, 12hr battery', 49.99, 38, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 1);

-- =====================================================
-- Products for HOME ESSENTIALS (Vendor ID: 4) - 12 Products
-- =====================================================
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(4, 4, 'Non-Stick Cookware Set', 'HE-COOK-001', '10-piece non-stick cookware set with glass lids, dishwasher safe', 89.99, 20, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', 1),
(4, 4, 'Stainless Steel Kettle', 'HE-KETT-001', '2L stainless steel whistling kettle, cool-touch handle', 34.99, 30, 'https://images.unsplash.com/photo-1563596774952-d5c86a2f5f75?w=400', 1),
(4, 4, 'Ceramic Dinnerware Set', 'HE-DIN-001', '16-piece ceramic dinnerware set, microwave safe, elegant design', 79.99, 15, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400', 1),
(4, 4, 'Glass Storage Containers', 'HE-STOR-001', '5-piece glass storage container set with airtight lids', 29.99, 40, 'https://images.unsplash.com/photo-1584990347449-7d7f5e2f5c0e?w=400', 1),
(4, 4, 'Professional Knife Set', 'HE-KNIF-001', 'Professional 8-piece knife set with wooden block, German steel', 69.99, 25, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400', 1),
(4, 4, 'Stand Mixer 5-Quart', 'HE-MIXR-001', '5-quart stand mixer with 10 speeds, dough hook, and whisk attachments', 199.99, 12, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', 1),
(4, 4, 'Cotton Bath Towel Set', 'HE-TOWL-001', '6-piece premium cotton bath towel set, highly absorbent', 44.99, 35, 'https://images.unsplash.com/photo-1564996219829-dfe2ad3f7379?w=400', 1),
(4, 4, 'Memory Foam Pillow', 'HE-PILW-001', 'Cooling memory foam pillow, cervical support, washable cover', 39.99, 42, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400', 1),
(4, 4, 'Air Fryer 5.8 Quart', 'HE-AIRFR-001', '5.8 quart air fryer with digital display, 8 presets, easy clean', 79.99, 18, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', 1),
(4, 4, 'Bamboo Cutting Board Set', 'HE-CUTB-001', '3-piece bamboo cutting board set, various sizes, juice groove', 24.99, 50, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400', 1),
(4, 4, 'Vacuum Storage Bags', 'HE-VACB-001', '10-pack vacuum storage bags for clothes and bedding, space saver', 19.99, 65, 'https://images.unsplash.com/photo-1584990347449-7d7f5e2f5c0e?w=400', 1),
(4, 4, 'Scented Candle Set', 'HE-CAND-001', '4-piece luxury scented candle set, 50hr burn time each', 34.99, 30, 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400', 1);

-- =====================================================
-- Products for FASHION HUB (Vendor ID: 5) - 12 Products
-- =====================================================
INSERT INTO products (vendor_id, category_id, name, sku, description, price, stock_qty, image_url, active) VALUES
(5, 3, 'Premium Cotton T-Shirt', 'FH-TS-001', 'Premium 100% cotton t-shirt, comfortable fit, available in multiple colors', 24.99, 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 1),
(5, 3, 'Classic Denim Jeans', 'FH-JEAN-001', 'Classic fit denim jeans, stretch comfort, medium wash', 59.99, 60, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 1),
(5, 3, 'Genuine Leather Wallet', 'FH-WAL-001', 'Genuine leather bifold wallet, RFID blocking, multiple card slots', 39.99, 45, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 1),
(5, 3, 'Canvas Sneakers Unisex', 'FH-SHOE-001', 'Casual canvas sneakers, unisex design, rubber sole, all sizes', 49.99, 70, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 1),
(5, 3, 'Polarized Sunglasses', 'FH-SUN-001', 'UV400 protection polarized sunglasses, lightweight metal frame', 79.99, 35, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 1),
(5, 3, 'Wool Blend Sweater', 'FH-SWTR-001', 'Soft wool blend sweater, crew neck, perfect for layering', 69.99, 40, 'https://images.unsplash.com/photo-1580331452314-74f76c028b95?w=400', 1),
(5, 3, 'Leather Belt Classic', 'FH-BELT-001', 'Genuine leather belt with classic buckle, 1.5 inch width', 34.99, 55, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400', 1),
(5, 3, 'Sports Hoodie', 'FH-HOOD-001', 'Comfortable sports hoodie with kangaroo pocket, fleece lined', 54.99, 48, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 1),
(5, 3, 'Chino Pants Slim Fit', 'FH-CHIN-001', 'Slim fit chino pants, stretch fabric, business casual style', 44.99, 52, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 1),
(5, 3, 'Casual Watch Silver', 'FH-WTCH-001', 'Elegant casual watch with stainless steel band, water resistant', 89.99, 25, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 1),
(5, 3, 'Backpack Canvas', 'FH-BKPK-001', 'Vintage canvas backpack, laptop compartment, multiple pockets', 59.99, 38, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 1),
(5, 3, 'Silk Tie Collection', 'FH-TIE-001', '3-piece silk tie set with gift box, classic patterns', 49.99, 30, 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=400', 1);

-- =====================================================
-- Sample Reviews
-- =====================================================
INSERT INTO reviews (user_id, reviewable_type, reviewable_id, rating, comment) VALUES
-- Product reviews
(7, 'product', 1, 5, 'Excellent quality turmeric! Very fresh and aromatic. Will buy again.'),
(8, 'product', 1, 4, 'Good product, packaging could be better but quality is great.'),
(9, 'product', 2, 5, 'Best Himalayan salt I have tried. Beautiful pink color!'),
(10, 'product', 13, 5, 'Perfect avocados! Arrived ripe and ready to eat.'),
(7, 'product', 14, 4, 'Fresh spinach, great for salads. Lasted a week in fridge.'),
(8, 'product', 25, 5, 'Amazing headphones! Noise cancellation is top notch.'),
(9, 'product', 27, 4, 'Great webcam for video calls. Clear picture quality.'),
(10, 'product', 37, 5, 'This cookware set is fantastic! Non-stick really works.'),
(7, 'product', 42, 4, 'Air fryer changed my cooking game. Easy to use and clean.'),
(8, 'product', 49, 5, 'Super comfortable t-shirt. Fits perfectly, fabric is soft.'),
(9, 'product', 50, 5, 'Best jeans I have owned. Great fit and quality denim.'),
(10, 'product', 54, 4, 'Nice sunglasses, good UV protection. Stylish design.'),

-- Vendor reviews
(7, 'vendor', 1, 5, 'Spice Mart has the best selection of spices. Always fresh and aromatic!'),
(8, 'vendor', 2, 5, 'Fresh Harvest never disappoints. Produce is always farm-fresh.'),
(9, 'vendor', 3, 4, 'Tech Store Plus has competitive prices and fast shipping.'),
(10, 'vendor', 4, 5, 'Home Essentials quality is outstanding. Love their kitchenware!'),
(7, 'vendor', 5, 5, 'Fashion Hub has trendy styles at great prices. Highly recommend!'),
(8, 'vendor', 1, 4, 'Great spices, authentic flavors. Delivery was quick.'),
(9, 'vendor', 2, 5, 'Love the organic produce from Fresh Harvest. Best in the city!');

-- =====================================================
-- Sample Carts
-- =====================================================
INSERT INTO carts (user_id) VALUES (7), (8), (9);

INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 2),
(1, 13, 3),
(1, 25, 1),
(2, 37, 1),
(2, 49, 2),
(3, 14, 2),
(3, 27, 1);

-- =====================================================
-- Sample Orders
-- =====================================================
INSERT INTO orders (order_number, customer_id, vendor_id, status, subtotal, delivery_fee, total, delivery_address, delivery_lat, delivery_lng) VALUES
('ORD-2026-0001', 7, 1, 'delivered', 27.97, 5.00, 32.97, '123 Main St, San Francisco, CA 94102', 37.7799, -122.4198),
('ORD-2026-0002', 8, 2, 'delivered', 23.96, 5.00, 28.96, '456 Oak Ave, Oakland, CA 94612', 37.8108, -122.2683),
('ORD-2026-0003', 7, 3, 'out_for_delivery', 129.99, 5.00, 134.99, '123 Main St, San Francisco, CA 94102', 37.7799, -122.4198),
('ORD-2026-0004', 9, 4, 'packed', 89.99, 5.00, 94.99, '789 Pine St, Palo Alto, CA 94301', 37.4419, -122.1430),
('ORD-2026-0005', 10, 5, 'pending', 84.98, 5.00, 89.98, '321 Cedar Ln, Redwood City, CA 94063', 37.4852, -122.2364),
('ORD-2026-0006', 8, 1, 'delivered', 49.99, 5.00, 54.99, '456 Oak Ave, Oakland, CA 94612', 37.8108, -122.2683),
('ORD-2026-0007', 7, 2, 'accepted', 32.96, 5.00, 37.96, '123 Main St, San Francisco, CA 94102', 37.7799, -122.4198);

-- =====================================================
-- Sample Order Items
-- =====================================================
INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES
(1, 1, 'Organic Turmeric Powder', 8.99, 2, 17.98),
(1, 2, 'Himalayan Pink Salt', 12.99, 1, 12.99),
(2, 13, 'Organic Avocados', 7.99, 3, 23.97),
(3, 25, 'Bluetooth Headphones ANC', 129.99, 1, 129.99),
(4, 37, 'Non-Stick Cookware Set', 89.99, 1, 89.99),
(5, 49, 'Premium Cotton T-Shirt', 24.99, 2, 49.98),
(5, 50, 'Classic Denim Jeans', 59.99, 1, 59.99),
(6, 5, 'Saffron Threads', 49.99, 1, 49.99),
(7, 14, 'Baby Spinach', 4.99, 3, 14.97),
(7, 15, 'Cherry Tomatoes', 5.49, 2, 10.98),
(7, 16, 'Organic Bananas', 3.99, 2, 7.98);
