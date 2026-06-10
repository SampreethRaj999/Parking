const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  image: String,
  isVeg: Boolean,
  customizations: [{ title: String, option: String, extraPrice: Number }],
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    deliveryAddress: {
      label: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'wallet', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: String,
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    estimatedDeliveryTime: Number, // minutes
    actualDeliveryTime: Date,
    scheduledFor: Date,
    specialInstructions: String,
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    isRated: { type: Boolean, default: false },
    deliveryLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

orderSchema.index({ deliveryLocation: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
