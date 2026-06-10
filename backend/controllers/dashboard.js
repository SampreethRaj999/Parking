const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard/stats
// @access  Private (Admin/Staff)
exports.getStats = async (req, res, next) => {
    try {
        const totalSlots = await ParkingSlot.countDocuments();
        const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
        const reservedSlots = await ParkingSlot.countDocuments({ status: 'reserved' });
        const freeSlots = await ParkingSlot.countDocuments({ status: 'available' });

        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeBookings = await Booking.countDocuments({ status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                slots: {
                    total: totalSlots,
                    occupied: occupiedSlots,
                    reserved: reservedSlots,
                    free: freeSlots
                },
                revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                activeBookings
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
