const { dbRun, dbGet, dbAll } = require('../config/db');
const { getDistanceSQL } = require('../utils/distance');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get vendors with location-based filtering
 * GET /api/public/vendors
 */
const getVendors = asyncHandler(async (req, res) => {
  const { 
    lat, 
    lng, 
    radiusKm = 50, 
    search = '', 
    page = 1, 
    limit = 20 
  } = req.query;

  const offset = (page - 1) * limit;
  let query, countQuery, params, countParams;

  if (lat && lng) {
    // With location - use Haversine distance
    const distanceSQL = getDistanceSQL(lat, lng, 'v.lat', 'v.lng');
    
    query = `
      SELECT 
        v.*,
        ${distanceSQL} as distance,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM vendor_profiles v
      LEFT JOIN products p ON v.id = p.vendor_id AND p.active = 1
      LEFT JOIN reviews r ON r.reviewable_type = 'vendor' AND r.reviewable_id = v.id
      WHERE v.verified = 1
        AND v.lat IS NOT NULL 
        AND v.lng IS NOT NULL
        ${search ? 'AND (v.shop_name LIKE ? OR v.city LIKE ? OR v.description LIKE ?)' : ''}
      GROUP BY v.id
      HAVING distance <= ?
      ORDER BY distance ASC, avg_rating DESC
      LIMIT ? OFFSET ?
    `;

    countQuery = `
      SELECT COUNT(DISTINCT v.id) as total
      FROM vendor_profiles v
      WHERE v.verified = 1
        AND v.lat IS NOT NULL 
        AND v.lng IS NOT NULL
        AND ${getDistanceSQL(lat, lng, 'v.lat', 'v.lng')} <= ?
        ${search ? 'AND (v.shop_name LIKE ? OR v.city LIKE ? OR v.description LIKE ?)' : ''}
    `;

    params = search 
      ? [`%${search}%`, `%${search}%`, `%${search}%`, radiusKm, parseInt(limit), offset]
      : [radiusKm, parseInt(limit), offset];

    countParams = search
      ? [radiusKm, `%${search}%`, `%${search}%`, `%${search}%`]
      : [radiusKm];

  } else {
    // Without location - simple query
    query = `
      SELECT 
        v.*,
        NULL as distance,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM vendor_profiles v
      LEFT JOIN products p ON v.id = p.vendor_id AND p.active = 1
      LEFT JOIN reviews r ON r.reviewable_type = 'vendor' AND r.reviewable_id = v.id
      WHERE v.verified = 1
        ${search ? 'AND (v.shop_name LIKE ? OR v.city LIKE ? OR v.description LIKE ?)' : ''}
      GROUP BY v.id
      ORDER BY avg_rating DESC, v.created_at DESC
      LIMIT ? OFFSET ?
    `;

    countQuery = `
      SELECT COUNT(DISTINCT id) as total
      FROM vendor_profiles
      WHERE verified = 1
        ${search ? 'AND (shop_name LIKE ? OR city LIKE ? OR description LIKE ?)' : ''}
    `;

    params = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`, parseInt(limit), offset]
      : [parseInt(limit), offset];

    countParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];
  }

  const vendors = await dbAll(query, params);
  const totalResult = await dbAll(countQuery, countParams);
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
 * Get vendor by ID
 * GET /api/public/vendors/:id
 */
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.query;

  let distanceSQL = 'NULL';
  if (lat && lng) {
    distanceSQL = getDistanceSQL(lat, lng, 'v.lat', 'v.lng');
  }

  const query = `
    SELECT 
      v.*,
      ${distanceSQL} as distance,
      COUNT(DISTINCT p.id) as product_count,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM vendor_profiles v
    LEFT JOIN products p ON v.id = p.vendor_id AND p.active = 1
    LEFT JOIN reviews r ON r.reviewable_type = 'vendor' AND r.reviewable_id = v.id
    WHERE v.id = ? AND v.verified = 1
    GROUP BY v.id
  `;

  const vendors = await dbAll(query, [id]);

  if (!vendors) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Get vendor products
  const products = await dbAll(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     INNER JOIN categories c ON p.category_id = c.id
     WHERE p.vendor_id = ? AND p.active = 1
     ORDER BY p.created_at DESC
     LIMIT 20`,
    [id]
  );

  // Get vendor reviews
  const reviews = await dbAll(
    `SELECT r.*, u.name as reviewer_name
     FROM reviews r
     INNER JOIN users u ON r.user_id = u.id
     WHERE r.reviewable_type = 'vendor' AND r.reviewable_id = ?
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [id]
  );

  res.json({
    success: true,
    data: {
      vendor: vendors[0],
      products,
      reviews
    }
  });
});

/**
 * Get products with filtering and sorting
 * GET /api/public/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    search = '',
    category,
    minPrice,
    maxPrice,
    lat,
    lng,
    sort = 'distance',
    page = 1,
    limit = 20
  } = req.query;

  const offset = (page - 1) * limit;
  
  let distanceSQL = 'NULL';
  let orderBy = 'p.created_at DESC';
  
  if (lat && lng) {
    distanceSQL = getDistanceSQL(lat, lng, 'v.lat', 'v.lng');
    
    if (sort === 'distance') {
      orderBy = 'distance ASC, p.created_at DESC';
    } else if (sort === 'price') {
      orderBy = 'p.price ASC';
    } else if (sort === 'rating') {
      orderBy = 'avg_rating DESC, p.created_at DESC';
    }
  } else {
    if (sort === 'price') {
      orderBy = 'p.price ASC';
    } else if (sort === 'rating') {
      orderBy = 'avg_rating DESC, p.created_at DESC';
    }
  }

  let whereConditions = ['p.active = 1', 'v.verified = 1'];
  const params = [];

  if (search) {
    whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR v.shop_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    whereConditions.push('c.slug = ?');
    params.push(category);
  }

  if (minPrice) {
    whereConditions.push('p.price >= ?');
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    whereConditions.push('p.price <= ?');
    params.push(parseFloat(maxPrice));
  }

  const whereClause = whereConditions.join(' AND ');

  const query = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      v.id as vendor_id,
      v.shop_name as vendor_name,
      v.city as vendor_city,
      v.verified as vendor_verified,
      ${distanceSQL} as distance,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN vendor_profiles v ON p.vendor_id = v.id
    LEFT JOIN reviews r ON r.reviewable_type = 'product' AND r.reviewable_id = p.id
    WHERE ${whereClause}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  params.push(parseInt(limit), offset);

  const products = await dbAll(query, params);

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN vendor_profiles v ON p.vendor_id = v.id
    WHERE ${whereClause}
  `;

  const countParams = params.slice(0, -2); // Remove limit and offset
  const totalResult = await dbAll(countQuery, countParams);
  const total = totalResult[0].total;

  res.json({
    success: true,
    data: {
      products,
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
 * Get product by ID
 * GET /api/public/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.query;

  let distanceSQL = 'NULL';
  if (lat && lng) {
    distanceSQL = getDistanceSQL(lat, lng, 'v.lat', 'v.lng');
  }

  const query = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      v.id as vendor_id,
      v.shop_name as vendor_name,
      v.phone as vendor_phone,
      v.email as vendor_email,
      v.address as vendor_address,
      v.city as vendor_city,
      v.state as vendor_state,
      v.verified as vendor_verified,
      ${distanceSQL} as distance,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN vendor_profiles v ON p.vendor_id = v.id
    LEFT JOIN reviews r ON r.reviewable_type = 'product' AND r.reviewable_id = p.id
    WHERE p.id = ? AND p.active = 1
    GROUP BY p.id
  `;

  const products = await dbAll(query, [id]);

  if (!products) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Get product reviews
  const reviews = await dbAll(
    `SELECT r.*, u.name as reviewer_name
     FROM reviews r
     INNER JOIN users u ON r.user_id = u.id
     WHERE r.reviewable_type = 'product' AND r.reviewable_id = ?
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [id]
  );

  // Get related products (same category, same vendor)
  const relatedProducts = await dbAll(
    `SELECT p.*, c.name as category_name
     FROM products p
     INNER JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = ? AND p.vendor_id = ? AND p.id != ? AND p.active = 1
     ORDER BY RANDOM()
     LIMIT 4`,
    [products[0].category_id, products[0].vendor_id, id]
  );

  res.json({
    success: true,
    data: {
      product: products[0],
      reviews,
      relatedProducts
    }
  });
});

/**
 * Get all categories
 * GET /api/public/categories
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

module.exports = {
  getVendors,
  getVendorById,
  getProducts,
  getProductById,
  getCategories
};
