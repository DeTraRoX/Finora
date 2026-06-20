const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'finora_super_secret_jwt_key_12345_67890', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Unverified, sends OTP simulation)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email or phone already exists');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });

    // Output simulated OTP to server console
    console.log('\n=================================================');
    console.log(`[SIMULATED OTP] SMS/Email to ${name} (${phone}/${email})`);
    console.log(`Verification Code: ${otp}`);
    console.log('=================================================\n');

    res.status(201).json({
      success: true,
      message: 'Registration initiated. OTP sent to mobile/email.',
      data: {
        email: user.email,
        phone: user.phone,
        // Send OTP back in response during development so the client UI can auto-populate/display it for convenience!
        devOtp: otp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP & Create Wallet (with starting balance)
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isVerified) {
      res.status(400);
      throw new Error('Account is already verified');
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || new Date() > user.otpExpires) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Update user status
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Check if wallet already exists (defensive check)
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      // Create wallet with ₹1000.00 mock sign-up balance
      wallet = await Wallet.create({
        userId: user._id,
        balance: 1000.0,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account verified successfully. Wallet created with ₹1000 bonus!',
      token: generateToken(user._id),
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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    }).select('+password +transactionPin'); // Explicitly include password and PIN hashes

    if (!user) {
      res.status(401);
      throw new Error('Invalid email/phone or password');
    }

    // Check if account is verified
    if (!user.isVerified) {
      res.status(400);
      throw new Error('Please verify your account first');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(403);
      throw new Error('This account has been blocked. Please contact support.');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email/phone or password');
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
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

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
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

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  getMe,
};
