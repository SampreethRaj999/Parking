const express = require('express');
const {
    createBooking,
    getBookings,
    cancelBooking
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All booking routes protected

router
    .route('/')
    .get(getBookings)
    .post(createBooking);

router.put('/:id/cancel', cancelBooking);

module.exports = router;
