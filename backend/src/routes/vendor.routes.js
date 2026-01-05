const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateVendorProfile, validateProduct } = require('../middleware/validation');

// All routes require vendor authentication
router.use(authenticate);
router.use(authorize('vendor'));

// Vendor profile routes
router.get('/me', vendorController.getVendorProfile);
router.put('/me', validateVendorProfile, vendorController.updateVendorProfile);

// Product routes
router.get('/products', vendorController.getVendorProducts);
router.post('/products', validateProduct, vendorController.createProduct);
router.put('/products/:id', validateProduct, vendorController.updateProduct);
router.delete('/products/:id', vendorController.deleteProduct);

// Order routes
router.get('/orders', vendorController.getVendorOrders);
router.put('/orders/:id/status', vendorController.updateOrderStatus);

// Review routes
router.get('/reviews', vendorController.getVendorReviews);
router.post('/reviews/:reviewId/reply', vendorController.replyToReview);

module.exports = router;
