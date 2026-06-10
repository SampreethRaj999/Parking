const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !password) return res.status(400).json({ success: false, message: 'Name and password are required' });

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists with this email or phone' });

    const allowedRoles = ['customer', 'restaurant_owner', 'delivery_partner'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = new User({ name, email, phone, password, role: userRole });
    user.referralCode = user.generateReferralCode();
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone))
      return res.status(400).json({ success: false, message: 'Please provide credentials' });

    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, walletBalance: user.walletBalance, rewardPoints: user.rewardPoints },
    });
  } catch (err) { next(err); }
};

// @desc    Send OTP to phone (simulated)
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, name: 'User', otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    await user.save();

    // In production: integrate Fast2SMS/Twilio here
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully', ...(process.env.NODE_ENV === 'development' && { otp }) });
  } catch (err) { next(err); }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp || user.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    if (!user.referralCode) user.referralCode = user.generateReferralCode();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Phone verified successfully',
      token,
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) { next(err); }
};

// @desc    Google OAuth (simplified - in production use passport.js)
// @route   POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { googleId, name, email, avatar } = req.body;
    if (!googleId || !email) return res.status(400).json({ success: false, message: 'Google credentials missing' });

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = new User({ name, email, googleId, avatar, isVerified: true });
      user.referralCode = user.generateReferralCode();
      await user.save();
    } else {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) { next(err); }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update user profile
// @route   PUT /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const { name, email, preferredPayment, notificationToken } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, preferredPayment, notificationToken },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpiry');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Add delivery address
// @route   POST /api/auth/address
const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, pincode, coordinates } = req.body;
    const user = await User.findById(req.user._id);
    user.addresses.push({ label, street, city, state, pincode, coordinates });
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

module.exports = { register, login, sendOTP, verifyOTP, googleAuth, getMe, updateMe, addAddress };
