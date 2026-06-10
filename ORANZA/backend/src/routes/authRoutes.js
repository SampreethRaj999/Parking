const express = require('express');
const router = express.Router();
const { register, login, sendOTP, verifyOTP, googleAuth, getMe, updateMe, addAddress } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/address', protect, addAddress);

module.exports = router;
