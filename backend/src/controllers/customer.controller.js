const { dbRun, dbGet, dbAll } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get customer's cart
 * GET /api/cart
 */
const getCart = asyncHandler(async (req, res) => {
  const customerId = req.user.id;

  // Get or create cart
  let carts = await dbAll(
    'SELECT id FROM carts WHERE user_id = ?',
    [customerId]
  );

  let cartId;
  if (!carts || carts.length === 0) {
    const result = await dbRun(
      'INSERT INTO carts (user_id) VALUES (?)',
      [customerId]
    );
    cartId = result.lastID;
  } else {
    cartId = carts[0].id;
  }

  // Get cart items with product details
  const items = await dbAll(
    `SELECT 
      ci.id,
      ci.quantity,
      p.id as product_id,
      p.name,
      p.price,
      p.image_url,
      p.stock_qty,
      p.active,
      v.id as vendor_id,
      v.shop_name
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    INNER JOIN vendor_profiles v ON p.vendor_id = v.id
    WHERE ci.cart_id = ?
    ORDER BY ci.added_at DESC`,
    [cartId]
  );

  // Calculate totals
  const cartItems = items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    success: true,
    data: {
      cart: {
        id: cartId,
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount
      }
    }
  });
});

/**
 * Add item to cart
 * POST /api/cart/items
 */
const addToCart = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid product ID and quantity required'
    });
  }

  // Check if product exists and is active
  const products = await dbAll(
    'SELECT id, price, stock_qty, active FROM products WHERE id = ?',
    [product_id]
  );

  if (!products || products.length === 0 || !products[0].active) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or unavailable'
    });
  }

  const product = products[0];

  if (product.stock_qty < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock_qty} items available in stock`
    });
  }

  // Get or create cart
  let carts = await dbAll(
    'SELECT id FROM carts WHERE user_id = ?',
    [customerId]
  );

  let cartId;
  if (!carts || carts.length === 0) {
    const result = await dbRun(
      'INSERT INTO carts (user_id) VALUES (?)',
      [customerId]
    );
    cartId = result.lastID;
  } else {
    cartId = carts[0].id;
  }

  // Check if item already in cart
  const existing = await dbAll(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, product_id]
  );

  if (existing && existing.length > 0) {
    // Update quantity
    const newQty = existing[0].quantity + quantity;
    if (newQty > product.stock_qty) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Only ${product.stock_qty} available.`
      });
    }

    await dbRun(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [newQty, existing[0].id]
    );
  } else {
    // Add new item
    await dbRun(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cartId, product_id, quantity]
    );
  }

  res.status(201).json({
    success: true,
    message: 'Item added to cart'
  });
});

/**
 * Remove item from cart
 * DELETE /api/cart/items/:id
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const itemId = req.params.id;

  // Verify item belongs to customer's cart
  const items = await dbAll(
    `SELECT ci.id 
     FROM cart_items ci
     INNER JOIN carts c ON ci.cart_id = c.id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, customerId]
  );

  if (!items || items.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  await dbRun('DELETE FROM cart_items WHERE id = ?', [itemId]);

  res.json({
    success: true,
    message: 'Item removed from cart'
  });
});

/**
 * Create order from cart
 * POST /api/orders
 */
const createOrder = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const {
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip,
    shipping_country = 'USA',
    notes
  } = req.body;

  // Get cart items
  const carts = await dbAll(
    'SELECT id FROM carts WHERE user_id = ?',
    [customerId]
  );

  if (!carts || carts.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  const cartId = carts[0].id;

  const items = await dbAll(
    `SELECT 
      ci.product_id,
      ci.quantity,
      p.name as product_name,
      p.price,
      p.stock_qty,
      p.vendor_id
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ? AND p.active = 1`,
    [cartId]
  );

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty or contains unavailable products'
    });
  }

  // Check stock availability
  for (const item of items) {
    if (item.stock_qty < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.product_name}`
      });
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${customerId}`;

  // Get vendor_id from first item (simplified - assumes single vendor per order)
  const vendorId = items[0].vendor_id;

  // Build delivery address string
  const deliveryAddress = `${shipping_address}, ${shipping_city}, ${shipping_state} ${shipping_zip}, ${shipping_country}`;

  // Create order
  const orderResult = await dbRun(
    `INSERT INTO orders (
      order_number, customer_id, vendor_id, status, subtotal, delivery_fee, total,
      delivery_address, notes
    ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      customerId,
      vendorId,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      notes || ''
    ]
  );

  const orderId = orderResult.lastID;

  // Create order items and update stock
  for (const item of items) {
    const itemSubtotal = item.quantity * item.price;

    await dbRun(
      `INSERT INTO order_items (
        order_id, product_id, product_name, price, quantity, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.product_name, item.price, item.quantity, itemSubtotal]
    );

    // Reduce stock
    await dbRun(
      'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
  }

  // Clear cart
  await dbRun('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: {
      order_id: orderId,
      order_number: orderNumber,
      total
    }
  });
});

/**
 * Get customer's orders
 * GET /api/orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const orders = await dbAll(
    `SELECT 
      o.id,
      o.order_number,
      o.status,
      o.total as total_amount,
      o.placed_at,
      o.delivery_address as shipping_address,
      COUNT(DISTINCT oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.customer_id = ?
    GROUP BY o.id
    ORDER BY o.placed_at DESC
    LIMIT ? OFFSET ?`,
    [customerId, parseInt(limit), offset]
  );

  const totalResult = await dbAll(
    'SELECT COUNT(*) as total FROM orders WHERE customer_id = ?',
    [customerId]
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

/**
 * Get order details
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const orderId = req.params.id;

  const orders = await dbAll(
    `SELECT 
      o.id,
      o.order_number,
      o.status,
      o.subtotal,
      o.delivery_fee,
      o.total as total_amount,
      o.delivery_address as shipping_address,
      o.notes,
      o.placed_at
    FROM orders o
    WHERE o.id = ? AND o.customer_id = ?`,
    [orderId, customerId]
  );

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const items = await dbAll(
    `SELECT 
      oi.id,
      oi.quantity,
      oi.price as unit_price,
      oi.subtotal,
      oi.product_name,
      p.image_url,
      v.shop_name
    FROM order_items oi
    INNER JOIN products p ON oi.product_id = p.id
    INNER JOIN vendor_profiles v ON p.vendor_id = v.user_id
    WHERE oi.order_id = ?`,
    [orderId]
  );

  res.json({
    success: true,
    data: {
      order: { ...orders[0], items }
    }
  });
});

/**
 * Create product review
 * POST /api/reviews/product/:productId
 */
const createProductReview = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const productId = req.params.productId;
  const { rating, comment } = req.body;

  // Check if product exists
  const products = await dbAll(
    'SELECT id FROM products WHERE id = ?',
    [productId]
  );

  if (!products) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if user already reviewed this product
  const existing = await dbAll(
    'SELECT id FROM reviews WHERE reviewer_user_id = ? AND product_id = ?',
    [customerId, productId]
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  // Create review
  await dbRun(
    'INSERT INTO reviews (reviewer_user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
    [customerId, productId, rating, comment]
  );

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully'
  });
});

/**
 * Create vendor review
 * POST /api/reviews/vendor/:vendorId
 */
const createVendorReview = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const vendorId = req.params.vendorId;
  const { rating, comment } = req.body;

  // Check if vendor exists
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

  // Check if user already reviewed this vendor
  const existing = await dbAll(
    'SELECT id FROM reviews WHERE reviewer_user_id = ? AND vendor_id = ?',
    [customerId, vendorId]
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You have already reviewed this vendor'
    });
  }

  // Create review
  await dbRun(
    'INSERT INTO reviews (reviewer_user_id, vendor_id, rating, comment) VALUES (?, ?, ?, ?)',
    [customerId, vendorId, rating, comment]
  );

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully'
  });
});

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  createOrder,
  getOrders,
  getOrderById,
  createProductReview,
  createVendorReview
};
