const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

// @desc    Admin: get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 30 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, total, users });
  } catch (err) { next(err); }
};

// @desc    Admin: toggle user active status
// @route   PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { next(err); }
};

// @desc    Admin: get platform analytics dashboard
// @route   GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalRestaurants, totalOrders, revenueData, ordersByStatus, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments({ isApproved: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.find().populate('restaurant', 'name').populate('customer', 'name').sort({ createdAt: -1 }).limit(10),
    ]);

    // Daily revenue for last 7 days
    const last7Days = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers, totalRestaurants, totalOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        ordersByStatus, recentOrders, dailyRevenue: last7Days,
      },
    });
  } catch (err) { next(err); }
};

// @desc    Admin: get pending restaurant approvals
// @route   GET /api/admin/restaurants/pending
const getPendingRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: false }).populate('owner', 'name email phone');
    res.json({ success: true, restaurants });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, toggleUserStatus, getAnalytics, getPendingRestaurants };
