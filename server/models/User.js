const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    profileImage: {
      type: String,
      default: '', // Will fall back to UI placeholder
    },
    transactionPin: {
      type: String,
      select: false, // Don't return PIN by default
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') && !this.isModified('transactionPin')) {
    return next();
  }

  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('transactionPin') && this.transactionPin) {
      const salt = await bcrypt.genSalt(10);
      this.transactionPin = await bcrypt.hash(this.transactionPin, salt);
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match user entered transaction PIN to hashed PIN in database
UserSchema.methods.comparePin = async function (enteredPin) {
  if (!this.transactionPin) return false;
  return await bcrypt.compare(enteredPin, this.transactionPin);
};

module.exports = mongoose.model('User', UserSchema);
