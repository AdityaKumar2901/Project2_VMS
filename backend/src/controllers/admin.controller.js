const { dbRun, dbGet, dbAll } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  // Get total counts
  const stats = await dbAll(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
      (SELECT COUNT(*) FROM vendor_profiles WHERE verified = TRUE) as total_vendors,
      (SELECT COUNT(*) FROM vendor_profiles WHERE verified = FALSE) as pending_vendors,
      (SELECT COUNT(*) FROM products WHERE active = TRUE) as total_products,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
      (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'cancelled') as total_revenue,
      (SELECT COUNT(*) FROM reviews) as total_reviews
  `);

  // Get recent orders
  const recentOrders = await dbAll(
    `SELECT o.*, u.name as customer_name
     FROM orders o
     INNER JOIN users u ON o.customer_id = u.id
     ORDER BY o.placed_at DESC
     LIMIT 10`
  );

  // Get orders by status for charts
  const ordersByStatus = await dbAll(
    `SELECT status, COUNT(*) as count
     FROM orders
     GROUP BY status`
  );

  // Get revenue by month (last 12 months)
  const revenueByMonth = await dbAll(
    `SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      SUM(total) as revenue,
      COUNT(*) as order_count
    FROM orders
    WHERE status != 'cancelled'
      AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC`
  );

  // Get top vendors by orders
  const topVendors = await dbAll(
    `SELECT 
      v.id,
      v.shop_name,
      COUNT(DISTINCT oi.order_id) as order_count,
      SUM(oi.subtotal) as total_revenue,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM vendor_profiles v
    LEFT JOIN order_items oi ON v.user_id = oi.order_id
    LEFT JOIN reviews r ON v.user_id = r.vendor_id
    WHERE v.verified = 1
    GROUP BY v.id
    ORDER BY order_count DESC
    LIMIT 10`
  );

  res.json({
    success: true,
    data: {
      stats: stats[0],
      recentOrders,
      ordersByStatus,
      revenueByMonth,
      topVendors
    }
  });
});

/**
 * Get all vendors
 * GET /api/admin/vendors
 */
const getVendors = asyncHandler(async (req, res) => {
  const { verified, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let whereConditions = [];
  const params = [];

  if (verified !== undefined) {
    whereConditions.push('v.verified = ?');
    params.push(verified === 'true');
  }

  if (search) {
    whereConditions.push('(v.shop_name LIKE ? OR v.email LIKE ? OR v.city LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  params.push(parseInt(limit), offset);

  const vendors = await dbAll(
    `SELECT 
      v.*,
      u.name as owner_name,
      u.email as owner_email,
      COUNT(DISTINCT p.id) as product_count,
      COUNT(DISTINCT oi.order_id) as order_count,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM vendor_profiles v
    INNER JOIN users u ON v.user_id = u.id
    LEFT JOIN products p ON v.id = p.vendor_id
    LEFT JOIN order_items oi ON v.id = oi.vendor_id
    LEFT JOIN reviews r ON v.id = r.vendor_id
    ${whereClause}
    GROUP BY v.id
    ORDER BY v.created_at DESC
    LIMIT ? OFFSET ?`,
    params
  );

  const countParams = params.slice(0, -2);
  const totalResult = await dbAll(
    `SELECT COUNT(DISTINCT v.id) as total
     FROM vendor_profiles v
     ${whereClause}`,
    countParams
  );
  const total = totalResult[0].total;

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Verify vendor
 * PUT /api/admin/vendors/:id/verify
 */
const verifyVendor = asyncHandler(async (req, res) => {
  const vendorId = req.params.id;
  const { verified } = req.body;

  const vendors = await dbAll(
    'SELECT id FROM vendor_profiles WHERE id = ?',
    [vendorId]
  );

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  await dbRun(
    'UPDATE vendor_profiles SET verified = ? WHERE id = ?',
    [verified, vendorId]
  );

  res.json({
    success: true,
    message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`
  });
});

/**
 * Get all categories
 * GET /api/admin/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await dbAll(
    `SELECT c.*, COUNT(DISTINCT p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON c.id = p.category_id AND p.active = TRUE
     GROUP BY c.id
     ORDER BY c.name ASC`
  );

  res.json({
    success: true,
    data: { categories }
  });
});

/**
 * Create category
 * POST /api/admin/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  // Generate slug if not provided
  const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const result = await dbAll(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
    [name, categorySlug, description]
  );

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category_id: result.lastID }
  });
});

/**
 * Update category
 * PUT /api/admin/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const { name, slug, description } = req.body;

  const categories = await dbAll(
    'SELECT id FROM categories WHERE id = ?',
    [categoryId]
  );

  if (!categories) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (slug !== undefined) {
    updates.push('slug = ?');
    values.push(slug);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }

  if (!updates) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(categoryId);

  await dbRun(
    `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  res.json({
    success: true,
    message: 'Category updated successfully'
  });
});

/**
 * Delete category
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  // Check if category has products
  const products = await dbAll(
    'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
    [categoryId]
  );

  if (products[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing products'
    });
  }

  await dbRun('DELETE FROM categories WHERE id = ?', [categoryId]);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * Get all reviews (for moderation)
 * GET /api/admin/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const reviews = await dbAll(
    `SELECT 
      r.*,
      u.name as reviewer_name,
      u.email as reviewer_email,
      CASE 
        WHEN r.product_id IS NOT NULL THEN p.name
        ELSE NULL
      END as product_name,
      CASE
        WHEN r.vendor_id IS NOT NULL THEN v.shop_name
        ELSE NULL
      END as vendor_name,
      CASE
        WHEN r.vendor_id IS NOT NULL THEN 'vendor'
        ELSE 'product'
      END as review_type
    FROM reviews r
    INNER JOIN users u ON r.reviewer_user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN vendor_profiles v ON r.vendor_id = v.id
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?`,
    [parseInt(limit), offset]
  );

  const totalResult = await dbAll(
    'SELECT COUNT(*) as total FROM reviews'
  );
  const total = totalResult[0].total;

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Delete review
 * DELETE /api/admin/reviews/:id
 */
const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const reviews = await dbAll(
    'SELECT id FROM reviews WHERE id = ?',
    [reviewId]
  );

  if (!reviews) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  await dbRun('DELETE FROM reviews WHERE id = ?', [reviewId]);

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

/**
 * Get all orders
 * GET /api/admin/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params = [];

  if (status) {
    whereClause = 'WHERE o.status = ?';
    params.push(status);
  }

  params.push(parseInt(limit), offset);

  const orders = await dbAll(
    `SELECT 
      o.*,
      u.name as customer_name,
      u.email as customer_email,
      COUNT(DISTINCT oi.id) as item_count
    FROM orders o
    INNER JOIN users u ON o.customer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.placed_at DESC
    LIMIT ? OFFSET ?`,
    params
  );

  const countParams = params.slice(0, -2);
  const totalResult = await dbAll(
    `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
    countParams
  );
  const total = totalResult[0].total;

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  getDashboard,
  getVendors,
  verifyVendor,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getReviews,
  deleteReview,
  getOrders
};
