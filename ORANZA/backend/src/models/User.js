const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  street: String,
  city: String,
  state: String,
  pincode: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, minlength: 6 },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'],
      default: 'customer',
    },
    addresses: [addressSchema],
    savedRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    preferredPayment: {
      type: String,
      enum: ['upi', 'card', 'wallet', 'cod'],
      default: 'cod',
    },
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rewardPoints: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    googleId: String,
    otp: String,
    otpExpiry: Date,
    notificationToken: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateReferralCode = function () {
  return `ORANZA${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

module.exports = mongoose.model('User', userSchema);
