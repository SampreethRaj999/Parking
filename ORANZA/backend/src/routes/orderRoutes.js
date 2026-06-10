const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById, getRestaurantOrders,
  updateOrderStatus, rateOrder, getAvailableOrders, acceptDelivery, getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('customer'), placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/restaurant', protect, authorize('restaurant_owner'), getRestaurantOrders);
router.get('/delivery/available', protect, authorize('delivery_partner'), getAvailableOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('restaurant_owner', 'delivery_partner', 'admin'), updateOrderStatus);
router.post('/:id/rate', protect, authorize('customer'), rateOrder);
router.put('/:id/accept-delivery', protect, authorize('delivery_partner'), acceptDelivery);

module.exports = router;
