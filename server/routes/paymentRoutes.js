const express = require('express');
const { body } = require('express-validator');
const {
  processMobileRecharge,
  processBillPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/recharge',
  protect,
  [
    body('amount', 'Recharge amount must be greater than 0').isFloat({ gt: 0 }),
    body('transactionPin', '4-digit transaction PIN is required').isLength({ min: 4, max: 4 }).isNumeric(),
    body('provider', 'Operator provider name is required').notEmpty().trim(),
    body('phoneNumber', 'Valid mobile number is required').isLength({ min: 10, max: 15 }).isNumeric(),
    validate,
  ],
  processMobileRecharge
);

router.post(
  '/bill',
  protect,
  [
    body('amount', 'Bill amount must be greater than 0').isFloat({ gt: 0 }),
    body('transactionPin', '4-digit transaction PIN is required').isLength({ min: 4, max: 4 }).isNumeric(),
    body('provider', 'Biller/Provider name is required').notEmpty().trim(),
    body('accountNumber', 'Biller Account/Consumer ID is required').notEmpty().trim(),
    body('category', 'Category is required (electricity, dth, gas, water)').isIn([
      'electricity',
      'dth',
      'gas',
      'water',
    ]),
    validate,
  ],
  processBillPayment
);

module.exports = router;
