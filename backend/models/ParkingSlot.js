const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: [true, 'Please add a slot number'],
        unique: true
    },
    type: {
        type: String,
        enum: ['bike', 'car', 'ev', 'vip'],
        required: [true, 'Please specify slot type']
    },
    floor: {
        type: Number,
        required: [true, 'Please specify floor']
    },
    zone: {
        type: String,
        required: [true, 'Please specify zone']
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available'
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Please specify price per hour']
    },
    currentBooking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
