const express = require('express');
const { body } = require('express-validator');
const {
  getWalletBalance,
  addMoney,
  verifyPayment,
} = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/balance', protect, getWalletBalance);

router.post(
  '/add-money',
  protect,
  [
    body('amount', 'Deposit amount must be a positive number greater than 0').isFloat({ gt: 0 }),
    validate,
  ],
  addMoney
);

router.post(
  '/verify-payment',
  protect,
  [
    body('razorpayOrderId', 'Razorpay Order ID is required').notEmpty(),
    body('amount', 'Amount is required').notEmpty(),
    // Payment verified status requires either signature or isSimulation true
    validate,
  ],
  verifyPayment
);

module.exports = router;
