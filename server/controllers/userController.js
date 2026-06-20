const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are provided in env
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// @desc    Search active, verified users by name, email, or phone
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res, next) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Search query matches email, phone, or name
    // Exclude current logged in user, blocked users, and unverified users
    const users = await User.find({
      _id: { $ne: req.user.id },
      isVerified: true,
      isBlocked: false,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    }).select('name email phone profileImage');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  const { name, phone } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if phone number is already taken by another user
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneExists) {
        res.status(400);
        throw new Error('Phone number is already in use');
      }
      user.phone = phone;
    }

    if (name) user.name = name;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isBlocked: user.isBlocked,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        hasPin: !!user.transactionPin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture (Simulated base64 fallback or Cloudinary)
// @route   POST /api/users/profile-image
// @access  Private
const updateProfileImage = async (req, res, next) => {
  const { image } = req.body; // Image as base64 string

  try {
    if (!image) {
      res.status(400);
      throw new Error('Please provide an image payload');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let imageUrl = '';

    // Check if Cloudinary is configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'finora_profiles',
          transformation: [{ width: 300, height: 300, crop: 'thumb', gravity: 'face' }],
        });
        imageUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error('Cloudinary Upload Failed. Falling back to local Base64 storage:', err.message);
        imageUrl = image; // Fallback to raw base64 if upload fails
      }
    } else {
      // Fallback: store base64 in Mongo directly for development/offline testing
      imageUrl = image;
    }

    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set 4-digit transaction PIN
// @route   POST /api/users/set-pin
// @access  Private
const setTransactionPin = async (req, res, next) => {
  const { pin } = req.body;

  try {
    if (!pin || pin.length !== 4 || isNaN(pin)) {
      res.status(400);
      throw new Error('PIN must be a 4-digit numeric code');
    }

    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.transactionPin) {
      res.status(400);
      throw new Error('PIN already set. Use change-pin to update.');
    }

    user.transactionPin = pin;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction PIN set successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change 4-digit transaction PIN
// @route   PUT /api/users/change-pin
// @access  Private
const changeTransactionPin = async (req, res, next) => {
  const { oldPin, newPin } = req.body;

  try {
    if (!oldPin || !newPin || newPin.length !== 4 || isNaN(newPin)) {
      res.status(400);
      throw new Error('Invalid input. Both old and new 4-digit PINs are required.');
    }

    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.transactionPin) {
      res.status(400);
      throw new Error('No PIN set yet. Use set-pin endpoint.');
    }

    // Match old PIN
    const isMatch = await user.comparePin(oldPin);
    if (!isMatch) {
      res.status(400);
      throw new Error('Incorrect old PIN');
    }

    user.transactionPin = newPin;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction PIN changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  updateProfile,
  updateProfileImage,
  setTransactionPin,
  changeTransactionPin,
};
