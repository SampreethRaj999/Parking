const express = require('express');
const router = express.Router();
const {
  getRestaurants, getRestaurantById, getFeaturedRestaurants,
  createRestaurant, updateRestaurant,
  addMenuItem, updateMenuItem, deleteMenuItem,
  getOwnerDashboard, approveRestaurant, toggleSaveRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', getRestaurants);
router.get('/featured', getFeaturedRestaurants);
router.get('/owner/dashboard', protect, authorize('restaurant_owner'), getOwnerDashboard);
router.get('/:id', getRestaurantById);

router.post('/', protect, authorize('restaurant_owner'), createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateRestaurant);
router.put('/:id/approve', protect, authorize('admin'), approveRestaurant);
router.post('/:id/save', protect, toggleSaveRestaurant);

router.post('/:id/menu', protect, authorize('restaurant_owner'), addMenuItem);
router.put('/:id/menu/:itemId', protect, authorize('restaurant_owner'), updateMenuItem);
router.delete('/:id/menu/:itemId', protect, authorize('restaurant_owner'), deleteMenuItem);

module.exports = router;
