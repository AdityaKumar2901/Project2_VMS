/**
 * Validation helper functions
 */

const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const isPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

const isLatitude = (lat) => {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
};

const isLongitude = (lng) => {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
};

/**
 * Validate registration data
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !isStrongPassword(password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  if (role && !['customer', 'vendor'].includes(role)) {
    errors.push('Role must be either customer or vendor');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate vendor profile data
 */
const validateVendorProfile = (req, res, next) => {
  const { shop_name, phone, lat, lng } = req.body;
  const errors = [];

  if (shop_name && shop_name.trim().length < 2) {
    errors.push('Shop name must be at least 2 characters');
  }

  if (phone && !isPhone(phone)) {
    errors.push('Invalid phone number format');
  }

  if (lat !== undefined && !isLatitude(parseFloat(lat))) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (lng !== undefined && !isLongitude(parseFloat(lng))) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate product data
 */
const validateProduct = (req, res, next) => {
  const { name, category_id, price, stock_qty } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  }

  if (!category_id || isNaN(category_id)) {
    errors.push('Valid category is required');
  }

  if (!price || isNaN(price) || parseFloat(price) < 0) {
    errors.push('Valid price is required');
  }

  if (stock_qty !== undefined && (isNaN(stock_qty) || parseInt(stock_qty) < 0)) {
    errors.push('Stock quantity must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate order data
 */
const validateOrder = (req, res, next) => {
  const { shipping_address, shipping_city, shipping_state, shipping_zip } = req.body;
  const errors = [];

  if (!shipping_address || shipping_address.trim().length < 5) {
    errors.push('Shipping address is required');
  }

  if (!shipping_city || shipping_city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!shipping_state || shipping_state.trim().length < 2) {
    errors.push('State is required');
  }

  if (!shipping_zip || shipping_zip.trim().length < 5) {
    errors.push('Valid ZIP code is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate review data
 */
const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  const errors = [];

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (comment && comment.trim().length < 10) {
    errors.push('Comment must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

/**
 * Validate category data
 */
const validateCategory = (req, res, next) => {
  const { name, slug } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Category name must be at least 2 characters');
  }

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVendorProfile,
  validateProduct,
  validateOrder,
  validateReview,
  validateCategory
};
