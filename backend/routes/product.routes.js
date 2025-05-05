const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

router.post('/', authenticateJWT, isAdmin, productController.createProduct);
router.get('/', authenticateJWT, productController.getProducts);
router.get('/:id', authenticateJWT, productController.getProductById);
router.put('/:id', authenticateJWT, isAdmin, productController.updateProduct);
router.delete('/:id', authenticateJWT, isAdmin, productController.deleteProduct);

module.exports = router;