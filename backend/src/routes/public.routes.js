const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Vendor routes
router.get('/vendors', publicController.getVendors);
router.get('/vendors/:id', publicController.getVendorById);

// Product routes
router.get('/products', publicController.getProducts);
router.get('/products/:id', publicController.getProductById);

// Category routes
router.get('/categories', publicController.getCategories);

module.exports = router;
