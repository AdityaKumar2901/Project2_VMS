const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateOrder, validateReview } = require('../middleware/validation');

// All routes require customer authentication
router.use(authenticate);
router.use(authorize('customer'));

// Cart routes
router.get('/cart', customerController.getCart);
router.post('/cart/items', customerController.addToCart);
router.delete('/cart/items/:id', customerController.removeFromCart);

// Order routes
router.post('/orders', validateOrder, customerController.createOrder);
router.get('/orders', customerController.getOrders);
router.get('/orders/:id', customerController.getOrderById);

// Review routes
router.post('/reviews/product/:productId', validateReview, customerController.createProductReview);
router.post('/reviews/vendor/:vendorId', validateReview, customerController.createVendorReview);

module.exports = router;
