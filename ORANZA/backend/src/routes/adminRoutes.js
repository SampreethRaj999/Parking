const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus, getAnalytics, getPendingRestaurants } = require('../controllers/adminController');
const { approveRestaurant } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/analytics', getAnalytics);
router.get('/restaurants/pending', getPendingRestaurants);
router.put('/restaurants/:id/approve', approveRestaurant);

module.exports = router;
