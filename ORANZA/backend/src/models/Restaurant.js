const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['starters', 'main_course', 'desserts', 'drinks', 'breads', 'sides'],
    required: true,
  },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  tags: [String],
  customizationOptions: [
    {
      title: String,
      options: [{ name: String, price: Number }],
    },
  ],
});

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: [String],
    coverImage: { type: String, default: '' },
    cuisine: [String],
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    phone: String,
    email: String,
    openingTime: { type: String, default: '09:00' },
    closingTime: { type: String, default: '23:00' },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    deliveryTime: { type: Number, default: 30 }, // minutes
    deliveryFee: { type: Number, default: 30 },
    minimumOrder: { type: Number, default: 100 },
    priceRange: { type: String, enum: ['$', '$$', '$$$'], default: '$$' },
    offers: [
      {
        title: String,
        description: String,
        discount: Number,
        code: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    menu: [menuItemSchema],
    tags: [String],
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', cuisine: 'text', tags: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
