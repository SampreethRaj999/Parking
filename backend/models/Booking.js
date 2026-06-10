const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    slot: {
        type: mongoose.Schema.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    startTime: {
        type: Date,
        required: [true, 'Please add starting time']
    },
    endTime: {
        type: Date,
        required: [true, 'Please add ending time']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    vehicleNumber: {
        type: String,
        required: [true, 'Please add vehicle number for this booking']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
