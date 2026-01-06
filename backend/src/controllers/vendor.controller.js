const { dbRun, dbGet, dbAll } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get vendor profile
 * GET /api/vendor/me
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const vendors = await dbAll(
    `SELECT v.*, u.name, u.email as user_email
     FROM vendor_profiles v
     INNER JOIN users u ON v.user_id = u.id
     WHERE v.user_id = ?`,
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  res.json({
    success: true,
    data: { vendor: vendors[0] }
  });
});

/**
 * Update vendor profile
 * PUT /api/vendor/me
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    shop_name,
    phone,
    email,
    description,
    address,
    city,
    state,
    zip,
    country,
    lat,
    lng
  } = req.body;

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (shop_name !== undefined) {
    updates.push('shop_name = ?');
    values.push(shop_name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }
  if (city !== undefined) {
    updates.push('city = ?');
    values.push(city);
  }
  if (state !== undefined) {
    updates.push('state = ?');
    values.push(state);
  }
  if (zip !== undefined) {
    updates.push('zip = ?');
    values.push(zip);
  }
  if (country !== undefined) {
    updates.push('country = ?');
    values.push(country);
  }
  if (lat !== undefined) {
    updates.push('lat = ?');
    values.push(parseFloat(lat));
  }
  if (lng !== undefined) {
    updates.push('lng = ?');
    values.push(parseFloat(lng));
  }

  if (!updates) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(vendorId);

  await dbRun(
    `UPDATE vendor_profiles SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'Vendor profile updated successfully'
  });
});

/**
 * Get vendor products
 * GET /api/vendor/products
 */
const getVendorProducts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  const products = await dbAll(
    `SELECT p.*, c.name as category_name, c.slug as category_slug,
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) as review_count
     FROM products p
     INNER JOIN categories c ON p.category_id = c.id
     LEFT JOIN reviews r ON r.reviewable_type = 'product' AND r.reviewable_id = p.id
     WHERE p.vendor_id = ? AND p.active = 1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [vendorId]
  );

  res.json({
    success: true,
    data: { products }
  });
});

/**
 * Create product
 * POST /api/vendor/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    sku,
    description,
    category_id,
    price,
    stock_qty = 0,
    image_url,
    active = 1
  } = req.body;

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Check if category exists
  const categories = await dbAll(
    'SELECT id FROM categories WHERE id = ?',
    [category_id]
  );

  if (!categories) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  // Create product
  const result = await dbRun(
    `INSERT INTO products (
      vendor_id, category_id, name, sku, description, price, 
      stock_qty, image_url, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [vendorId, category_id, name, sku || '', description || '', price, stock_qty, image_url || '', active ? 1 : 0]
  );

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product_id: result.lastID }
  });
});

/**
 * Update product
 * PUT /api/vendor/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const {
    name,
    sku,
    description,
    category_id,
    price,
    stock_qty,
    image_url,
    active
  } = req.body;

  // Verify product belongs to vendor
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  const products = await dbAll(
    'SELECT id FROM products WHERE id = ? AND vendor_id = ?',
    [productId, vendorId]
  );

  if (!products) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (sku !== undefined) {
    updates.push('sku = ?');
    values.push(sku);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (category_id !== undefined) {
    updates.push('category_id = ?');
    values.push(category_id);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (stock_qty !== undefined) {
    updates.push('stock_qty = ?');
    values.push(stock_qty);
  }
  if (image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(image_url);
  }
  if (active !== undefined) {
    updates.push('active = ?');
    values.push(active);
  }

  if (!updates) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(productId);

  await dbRun(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'Product updated successfully'
  });
});

/**
 * Delete product
 * DELETE /api/vendor/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;

  // Verify product belongs to vendor
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  const products = await dbAll(
    'SELECT id FROM products WHERE id = ? AND vendor_id = ?',
    [productId, vendorId]
  );

  if (!products) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Soft delete by setting active = 0
  await dbRun(
    'UPDATE products SET active = 0 WHERE id = ?',
    [productId]
  );

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * Get vendor orders
 * GET /api/vendor/orders
 */
const getVendorOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Build query - vendor_id is obtained through products table
  let whereClause = 'p.vendor_id = ?';
  const params = [vendorId];

  if (status) {
    whereClause += ' AND o.status = ?';
    params.push(status);
  }

  params.push(parseInt(limit), offset);

  const orders = await dbAll(
    `SELECT DISTINCT
      o.id,
      o.order_number,
      o.status,
      o.total,
      o.delivery_address,
      o.notes,
      o.placed_at,
      u.name as customer_name,
      u.email as customer_email
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.id
    INNER JOIN users u ON o.customer_id = u.id
    WHERE ${whereClause}
    GROUP BY o.id
    ORDER BY o.placed_at DESC
    LIMIT ? OFFSET ?`,
    params
  );

  // Get items for each order
  for (const order of orders) {
    const items = await dbAll(
      `SELECT oi.*, p.vendor_id 
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ? AND p.vendor_id = ?`,
      [order.id, vendorId]
    );
    order.items = items;
  }

  res.json({
    success: true,
    data: { orders }
  });
});

/**
 * Update order status
 * PUT /api/vendor/orders/:id/status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['pending', 'accepted', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Verify order has items from this vendor (through products table)
  const orderItems = await dbAll(
    `SELECT oi.id 
     FROM order_items oi
     INNER JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ? AND p.vendor_id = ?`,
    [orderId, vendorId]
  );

  if (!orderItems || orderItems.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Update order status
  await dbRun(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId]
  );

  res.json({
    success: true,
    message: 'Order status updated successfully'
  });
});

/**
 * Get vendor reviews
 * GET /api/vendor/reviews
 */
const getVendorReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Get reviews for vendor and vendor's products
  const reviews = await dbAll(
    `SELECT 
      r.*,
      u.name as reviewer_name,
      CASE 
        WHEN r.reviewable_type = 'product' THEN p.name
        ELSE NULL
      END as product_name,
      r.reviewable_type as review_type
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.reviewable_type = 'product' AND r.reviewable_id = p.id
    WHERE (r.reviewable_type = 'vendor' AND r.reviewable_id = ?) 
       OR (r.reviewable_type = 'product' AND p.vendor_id = ?)
    ORDER BY r.created_at DESC`,
    [vendorId, vendorId]
  );

  res.json({
    success: true,
    data: { reviews }
  });
});

/**
 * Reply to review
 * POST /api/vendor/reviews/:reviewId/reply
 */
const replyToReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.reviewId;
  const { reply } = req.body;

  if (!reply || reply.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Reply must be at least 10 characters'
    });
  }

  // Get vendor ID
  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE user_id = ?',
    [userId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const vendorId = vendors[0].id;

  // Verify review belongs to vendor or vendor's products
  const reviews = await dbAll(
    `SELECT r.id
     FROM reviews r
     LEFT JOIN products p ON r.reviewable_type = 'product' AND r.reviewable_id = p.id
     WHERE r.id = ? AND (
       (r.reviewable_type = 'vendor' AND r.reviewable_id = ?) 
       OR (r.reviewable_type = 'product' AND p.vendor_id = ?)
     )`,
    [reviewId, vendorId, vendorId]
  );

  if (!reviews) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Update review with reply
  await dbRun(
    'UPDATE reviews SET vendor_reply = ?, reply_at = CURRENT_TIMESTAMP WHERE id = ?',
    [reply, reviewId]
  );

  res.json({
    success: true,
    message: 'Reply added successfully'
  });
});

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorOrders,
  updateOrderStatus,
  getVendorReviews,
  replyToReview
};
