const express = require('express');
const {
    getSlots,
    getSlot,
    createSlot,
    updateSlot,
    deleteSlot
} = require('../controllers/slots');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    .get(getSlots)
    .post(protect, authorize('admin', 'staff'), createSlot);

router
    .route('/:id')
    .get(getSlot)
    .put(protect, authorize('admin', 'staff'), updateSlot)
    .delete(protect, authorize('admin'), deleteSlot);

module.exports = router;
