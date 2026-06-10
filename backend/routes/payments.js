const express = require('express');
const { processPayment, getPayments } = require('../controllers/payments');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getPayments)
    .post(processPayment);

module.exports = router;
