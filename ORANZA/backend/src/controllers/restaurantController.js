const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get all approved restaurants (with filters)
// @route   GET /api/restaurants
const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, rating, lat, lng, maxDistance = 10000, page = 1, limit = 20 } = req.query;
    let query = { isApproved: true, isActive: true };

    if (search) query.$text = { $search: search };
    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (rating) query.rating = { $gte: parseFloat(rating) };

    let restaurants;
    if (lat && lng) {
      restaurants = await Restaurant.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(maxDistance),
          },
        },
      })
        .select('-menu')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      restaurants = await Restaurant.find(query)
        .select('-menu')
        .sort({ rating: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await Restaurant.countDocuments(query);
    res.json({ success: true, total, page: parseInt(page), restaurants });
  } catch (err) { next(err); }
};

// @desc    Get single restaurant with full menu
// @route   GET /api/restaurants/:id
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');
    if (!restaurant || !restaurant.isApproved) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, restaurant });
  } catch (err) { next(err); }
};

// @desc    Get featured / trending restaurants
// @route   GET /api/restaurants/featured
const getFeaturedRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: true, isActive: true, rating: { $gte: 4 } })
      .select('-menu')
      .sort({ totalOrders: -1 })
      .limit(8);
    res.json({ success: true, restaurants });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: create restaurant
// @route   POST /api/restaurants
const createRestaurant = async (req, res, next) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a registered restaurant' });

    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id, isApproved: false });
    res.status(201).json({ success: true, message: 'Restaurant submitted for approval', restaurant });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: update restaurant info
// @route   PUT /api/restaurants/:id
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found or not authorized' });

    const disallowedFields = ['owner', 'isApproved', 'totalOrders'];
    disallowedFields.forEach((f) => delete req.body[f]);

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json({ success: true, restaurant });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: add menu item
// @route   POST /api/restaurants/:id/menu
const addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    restaurant.menu.push(req.body);
    await restaurant.save();
    res.status(201).json({ success: true, menu: restaurant.menu });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
const updateMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Not authorized' });

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

    Object.assign(item, req.body);
    await restaurant.save();
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
const deleteMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Not authorized' });

    restaurant.menu.pull(req.params.itemId);
    await restaurant.save();
    res.json({ success: true, message: 'Menu item removed' });
  } catch (err) { next(err); }
};

// @desc    Get owner's restaurant dashboard data
// @route   GET /api/restaurants/owner/dashboard
const getOwnerDashboard = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'No restaurant found' });
    res.json({ success: true, restaurant });
  } catch (err) { next(err); }
};

// @desc    Admin: approve restaurant
// @route   PUT /api/restaurants/:id/approve
const approveRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, message: 'Restaurant approved', restaurant });
  } catch (err) { next(err); }
};

// @desc    Toggle save/unsave restaurant for user
// @route   POST /api/restaurants/:id/save
const toggleSaveRestaurant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const index = user.savedRestaurants.indexOf(req.params.id);
    if (index > -1) {
      user.savedRestaurants.splice(index, 1);
    } else {
      user.savedRestaurants.push(req.params.id);
    }
    await user.save();
    res.json({ success: true, savedRestaurants: user.savedRestaurants });
  } catch (err) { next(err); }
};

module.exports = {
  getRestaurants, getRestaurantById, getFeaturedRestaurants,
  createRestaurant, updateRestaurant,
  addMenuItem, updateMenuItem, deleteMenuItem,
  getOwnerDashboard, approveRestaurant, toggleSaveRestaurant,
};
