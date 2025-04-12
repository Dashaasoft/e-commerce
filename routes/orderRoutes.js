const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Шинэ захиалга үүсгэх
router.post('/', auth, orderController.createOrder);

// Хэрэглэгчийн захиалгуудыг авах
router.get('/user/:userId', auth, orderController.getUserOrders);

// Захиалгын дэлгэрэнгүй мэдээлэл авах
router.get('/:orderId', auth, orderController.getOrderDetails);

// Захиалгын төлөв шинэчлэх (админ)
router.put('/:orderId/status', auth, orderController.updateOrderStatus);

// Төлбөрийн төлөв шинэчлэх
router.put('/:orderId/payment', auth, orderController.updatePaymentStatus);

module.exports = router; 