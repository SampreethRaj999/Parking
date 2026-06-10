const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// @desc    Place a new order
// @route   POST /api/orders
const placeOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, couponCode, scheduledFor, specialInstructions } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isApproved || !restaurant.isOpen)
      return res.status(400).json({ success: false, message: 'Restaurant is not available' });

    // Calculate subtotal
    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem) throw new Error(`Item ${item.menuItemId} not found`);
      const basePrice = menuItem.discountedPrice || menuItem.price;
      const customExtra = (item.customizations || []).reduce((sum, c) => sum + (c.extraPrice || 0), 0);
      const itemTotal = (basePrice + customExtra) * item.quantity;
      subtotal += itemTotal;
      return { ...item, name: menuItem.name, price: basePrice + customExtra, image: menuItem.image, isVeg: menuItem.isVeg };
    });

    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.validUntil > Date.now() && subtotal >= coupon.minOrderAmount && !coupon.usedBy.includes(req.user._id)) {
        if (coupon.discountType === 'percentage') {
          discount = Math.min((coupon.discountValue / 100) * subtotal, coupon.maxDiscount || Infinity);
        } else {
          discount = coupon.discountValue;
        }
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }

    const taxes = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + restaurant.deliveryFee + taxes - discount;

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: enrichedItems,
      deliveryAddress,
      paymentMethod,
      couponCode,
      subtotal,
      deliveryFee: restaurant.deliveryFee,
      discount,
      taxes,
      totalAmount,
      scheduledFor,
      specialInstructions,
      estimatedDeliveryTime: restaurant.deliveryTime,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    restaurant.totalOrders += 1;
    await restaurant.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.to(`restaurant_${restaurantId}`).emit('new_order', { orderId: order._id, items: enrichedItems });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) { next(err); }
};

// @desc    Get customer's order history
// @route   GET /api/orders/my
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name coverImage cuisine')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments({ customer: req.user._id });
    res.json({ success: true, total, orders });
  } catch (err) { next(err); }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name coverImage phone address')
      .populate('customer', 'name phone')
      .populate('deliveryPartner', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorize only involved parties
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isOwner = req.user.role === 'restaurant_owner';
    const isAdmin = req.user.role === 'admin';
    const isPartner = req.user.role === 'delivery_partner';
    if (!isCustomer && !isOwner && !isAdmin && !isPartner)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @desc    Restaurant owner: get pending orders
// @route   GET /api/orders/restaurant
const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'No restaurant found' });

    const { status, page = 1, limit = 20 } = req.query;
    const query = { restaurant: restaurant._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, total, orders });
  } catch (err) { next(err); }
};

// @desc    Update order status (restaurant owner / delivery partner)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'delivered') order.actualDeliveryTime = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`order_${order._id}`).emit('order_status_update', { orderId: order._id, status });

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @desc    Rate and review an order
// @route   POST /api/orders/:id/rate
const rateOrder = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id, status: 'delivered' });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or not delivered' });
    if (order.isRated) return res.status(400).json({ success: false, message: 'Already rated' });

    order.rating = rating;
    order.review = review;
    order.isRated = true;
    await order.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurant);
    const totalRatings = restaurant.totalRatings + 1;
    restaurant.rating = ((restaurant.rating * restaurant.totalRatings) + rating) / totalRatings;
    restaurant.totalRatings = totalRatings;
    await restaurant.save();

    res.json({ success: true, message: 'Review submitted' });
  } catch (err) { next(err); }
};

// @desc    Delivery partner: get available orders to accept
// @route   GET /api/orders/delivery/available
const getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'confirmed', deliveryPartner: null })
      .populate('restaurant', 'name address')
      .populate('customer', 'name')
      .limit(10);
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @desc    Delivery partner: accept an order
// @route   PUT /api/orders/:id/accept-delivery
const acceptDelivery = async (req, res, next) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: 'confirmed', deliveryPartner: null },
      { deliveryPartner: req.user._id, status: 'picked_up', $push: { statusHistory: { status: 'picked_up', note: 'Delivery partner accepted' } } },
      { new: true }
    );
    if (!order) return res.status(400).json({ success: false, message: 'Order not available' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @desc    Admin: get all orders for analytics
// @route   GET /api/orders/admin/all
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('restaurant', 'name')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(query);

    // Revenue stats
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.json({ success: true, total, orders, revenue: revenue[0] || { total: 0, count: 0 } });
  } catch (err) { next(err); }
};

module.exports = {
  placeOrder, getMyOrders, getOrderById, getRestaurantOrders,
  updateOrderStatus, rateOrder, getAvailableOrders, acceptDelivery, getAllOrders,
};
