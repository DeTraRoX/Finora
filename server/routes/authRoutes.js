const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  verifyOtp,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('phone', 'Phone number is required').notEmpty().trim(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validate,
  ],
  registerUser
);

router.post(
  '/verify-otp',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('otp', 'OTP must be a 6-digit numeric code').isLength({ min: 6, max: 6 }).isNumeric(),
    validate,
  ],
  verifyOtp
);

router.post(
  '/login',
  [
    body('emailOrPhone', 'Email or phone number is required').notEmpty().trim(),
    body('password', 'Password is required').notEmpty(),
    validate,
  ],
  loginUser
);

router.get('/me', protect, getMe);

module.exports = router;
