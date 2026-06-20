const express = require('express');
const { body } = require('express-validator');
const {
  searchUsers,
  updateProfile,
  updateProfileImage,
  setTransactionPin,
  changeTransactionPin,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/search', protect, searchUsers);

router.put(
  '/profile',
  protect,
  [
    body('name', 'Name cannot be empty if provided').optional().notEmpty().trim(),
    body('phone', 'Phone cannot be empty if provided').optional().notEmpty().trim(),
    validate,
  ],
  updateProfile
);

router.post(
  '/profile-image',
  protect,
  [body('image', 'Image data is required').notEmpty(), validate],
  updateProfileImage
);

router.post(
  '/set-pin',
  protect,
  [
    body('pin', 'PIN must be a 4-digit numeric code').isLength({ min: 4, max: 4 }).isNumeric(),
    validate,
  ],
  setTransactionPin
);

router.put(
  '/change-pin',
  protect,
  [
    body('oldPin', 'Old PIN must be a 4-digit numeric code').isLength({ min: 4, max: 4 }).isNumeric(),
    body('newPin', 'New PIN must be a 4-digit numeric code').isLength({ min: 4, max: 4 }).isNumeric(),
    validate,
  ],
  changeTransactionPin
);

module.exports = router;
