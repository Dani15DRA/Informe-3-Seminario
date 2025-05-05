const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

router.post('/', authenticateJWT, orderController.createOrder);
router.get('/', authenticateJWT, orderController.getOrders);
router.get('/:id', authenticateJWT, orderController.getOrderById);
router.put('/:id/status', authenticateJWT, orderController.updateOrderStatus);
router.put('/:id/receive', authenticateJWT, orderController.updateReceivedItems);

module.exports = router;