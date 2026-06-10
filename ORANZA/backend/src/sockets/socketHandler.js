const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.user?.name} [${socket.id}]`);

    // Customer: join order tracking room
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User ${socket.user.name} joined order room: order_${orderId}`);
    });

    // Restaurant owner: join restaurant room to receive new orders
    socket.on('join_restaurant_room', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Owner joined restaurant room: restaurant_${restaurantId}`);
    });

    // Delivery partner: broadcast live location
    socket.on('update_location', ({ orderId, lat, lng }) => {
      io.to(`order_${orderId}`).emit('partner_location', { lat, lng });
    });

    // Delivery partner: update order status
    socket.on('update_order_status', ({ orderId, status }) => {
      io.to(`order_${orderId}`).emit('order_status_update', { orderId, status });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user?.name}`);
    });
  });
};

module.exports = socketHandler;
