const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Vendor management
router.get('/vendors', adminController.getVendors);
router.put('/vendors/:id/verify', adminController.verifyVendor);

// Category management
router.get('/categories', adminController.getCategories);
router.post('/categories', validateCategory, adminController.createCategory);
router.put('/categories/:id', validateCategory, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Review moderation
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// Order management
router.get('/orders', adminController.getOrders);

module.exports = router;
