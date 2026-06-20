const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for external deposits
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for mobile recharge, utility bills, etc.
    },
    amount: {
      type: Number,
      required: [true, 'Please add transaction amount'],
      min: [1, 'Amount must be at least ₹1'],
    },
    transactionType: {
      type: String,
      required: true,
      enum: ['transfer', 'deposit', 'recharge', 'bill'],
    },
    category: {
      type: String,
      required: true,
      enum: ['transfer', 'wallet_add', 'mobile', 'electricity', 'dth', 'gas', 'water', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    description: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes to speed up history queries
TransactionSchema.index({ senderId: 1, createdAt: -1 });
TransactionSchema.index({ receiverId: 1, createdAt: -1 });
TransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
