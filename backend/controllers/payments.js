const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendPaymentReceipt } = require('../utils/notification');
const User = require('../models/User');

// @desc    Process payment (Simulation)
// @route   POST /api/v1/payments
// @access  Private
exports.processPayment = async (req, res, next) => {
    try {
        const { bookingId, amount, paymentMethod } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Simulate transaction ID
        const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const payment = await Payment.create({
            booking: bookingId,
            user: req.user.id,
            amount,
            paymentMethod,
            transactionId,
            status: 'completed' // Simulated as always successful
        });

        // Update booking payment status
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });

        // Send simulated notification
        const user = await User.findById(req.user.id);
        sendPaymentReceipt(user.email, amount, transactionId);

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get user payments
// @route   GET /api/v1/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.user.id }).populate('booking');
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
