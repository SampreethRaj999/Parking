const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const { validateBooking } = require('../utils/validation');
const { sendBookingConfirmation } = require('../utils/notification');

// @desc    Create a booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { error } = validateBooking(req.body);
        if (error) {
            return res.status(400).json({ success: false, error: error.details[0].message });
        }

        req.body.user = req.user.id;

        const { slot: slotId, startTime, endTime } = req.body;

        // Check if slot exists
        const slot = await ParkingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ success: false, error: 'Parking slot not found' });
        }

        // Check if slot is available
        if (slot.status !== 'available') {
            return res.status(400).json({ success: false, error: 'Slot is not available' });
        }

        // Prevent double booking (basic check for current slot status)
        // In a real app, we'd check overlapping time ranges in the Booking collection
        const overlapping = await Booking.findOne({
            slot: slotId,
            status: 'active',
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ success: false, error: 'Slot is already booked for this time period' });
        }

        const booking = await Booking.create(req.body);

        // Update slot status
        await ParkingSlot.findByIdAndUpdate(slotId, {
            status: 'reserved',
            currentBooking: booking._id
        });

        // Emit socket event
        const io = req.app.get('io');
        io.emit('slotUpdated', { _id: slotId, status: 'reserved' });
        io.emit('bookingCreated', booking);

        // Send simulated notification
        const populatedBooking = await Booking.findById(booking._id).populate('slot').populate('user');
        sendBookingConfirmation(populatedBooking.user.email, {
            slotNumber: populatedBooking.slot.slotNumber,
            endTime: populatedBooking.endTime
        });

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    try {
        let query;

        // If not admin/staff, only get user's bookings
        if (req.user.role !== 'admin' && req.user.role !== 'staff') {
            query = Booking.find({ user: req.user.id }).populate('slot');
        } else {
            query = Booking.find().populate('slot').populate('user', 'username email');
        }

        const bookings = await query;

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Ensure user owns booking or is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to cancel this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });

        // Release the slot
        await ParkingSlot.findByIdAndUpdate(booking.slot, {
            status: 'available',
            currentBooking: null
        });

        // Emit socket event
        const io = req.app.get('io');
        io.emit('slotUpdated', { _id: booking.slot, status: 'available' });
        io.emit('bookingCancelled', booking);

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
