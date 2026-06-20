const express = require('express');
const { body } = require('express-validator');
const {
  transferMoney,
  getTransactionHistory,
  getTransactionDetails,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/transfer',
  protect,
  [
    body('receiverId', 'Receiver ID is required').notEmpty(),
    body('amount', 'Transfer amount must be greater than 0').isFloat({ gt: 0 }),
    body('transactionPin', '4-digit transaction PIN is required').isLength({ min: 4, max: 4 }).isNumeric(),
    validate,
  ],
  transferMoney
);

router.get('/history', protect, getTransactionHistory);
router.get('/:id', protect, getTransactionDetails);

module.exports = router;
