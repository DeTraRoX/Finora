const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../config/socket');

// Helper to process utility/recharge billing
const processUtilityPayment = async (req, res, next, {
  amount,
  transactionPin,
  billingType, // 'recharge' or 'bill'
  category, // 'mobile', 'electricity', 'dth', 'gas', 'water'
  provider,
  referenceId, // e.g. Phone number or bill consumer ID
}) => {
  try {
    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid amount greater than ₹0');
    }

    if (!provider || !referenceId) {
      res.status(400);
      throw new Error('Provider name and consumer/phone reference ID are required');
    }

    // Load user (with PIN)
    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user.transactionPin) {
      res.status(400);
      throw new Error('Please set a transaction PIN in Profile settings first');
    }

    // Verify PIN
    const isPinMatch = await user.comparePin(transactionPin);
    if (!isPinMatch) {
      res.status(400);
      throw new Error('Invalid 4-digit transaction PIN');
    }

    // Concurrency-safe atomic wallet debit
    const walletUpdate = await Wallet.findOneAndUpdate(
      { userId: user._id, balance: { $gte: paymentAmount } },
      { $inc: { balance: -paymentAmount } },
      { new: true }
    );

    if (!walletUpdate) {
      res.status(400);
      throw new Error('Insufficient balance');
    }

    // Generate custom transaction code
    const typeCode = billingType === 'recharge' ? 'RCH' : 'BIL';
    const txnId = `TXN-${typeCode}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const desc = billingType === 'recharge'
      ? `${provider} Mobile Recharge for ${referenceId}`
      : `${provider} ${category.toUpperCase()} Bill Payment for A/C ${referenceId}`;

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: txnId,
      senderId: user._id,
      receiverId: null, // Billers are external/mock
      amount: paymentAmount,
      transactionType: billingType,
      category,
      status: 'success',
      description: desc,
    });

    // Notify user of debit
    sendNotification(user._id, 'wallet_debit', {
      transactionId: txnId,
      amount: paymentAmount,
      balance: walletUpdate.balance,
      message: `₹${paymentAmount.toFixed(2)} paid for ${category} (${provider}).`,
    });

    res.status(200).json({
      success: true,
      message: `${billingType === 'recharge' ? 'Recharge' : 'Bill payment'} processed successfully`,
      data: {
        transactionId: txnId,
        amount: paymentAmount,
        newBalance: walletUpdate.balance,
        description: desc,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mobile Recharge
// @route   POST /api/payment/recharge
// @access  Private
const processMobileRecharge = async (req, res, next) => {
  const { amount, transactionPin, provider, phoneNumber } = req.body;
  await processUtilityPayment(req, res, next, {
    amount,
    transactionPin,
    billingType: 'recharge',
    category: 'mobile',
    provider,
    referenceId: phoneNumber,
  });
};

// @desc    Utility Bill Payments (Electricity, DTH, Gas, Water)
// @route   POST /api/payment/bill
// @access  Private
const processBillPayment = async (req, res, next) => {
  const { amount, transactionPin, provider, accountNumber, category } = req.body;
  
  const validCategories = ['electricity', 'dth', 'gas', 'water'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid bill category. Must be one of: ${validCategories.join(', ')}`,
    });
  }

  await processUtilityPayment(req, res, next, {
    amount,
    transactionPin,
    billingType: 'bill',
    category,
    provider,
    referenceId: accountNumber,
  });
};

module.exports = {
  processMobileRecharge,
  processBillPayment,
};
