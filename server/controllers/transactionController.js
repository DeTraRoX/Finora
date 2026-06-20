const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../config/socket');

// @desc    Transfer money to another user (Peer-to-Peer)
// @route   POST /api/transactions/transfer
// @access  Private
const transferMoney = async (req, res, next) => {
  const { receiverId, amount, transactionPin, description } = req.body;

  try {
    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid amount greater than ₹0');
    }

    if (receiverId === req.user.id) {
      res.status(400);
      throw new Error('You cannot transfer money to yourself');
    }

    // Load sender details (with PIN)
    const sender = await User.findById(req.user.id).select('+transactionPin');
    if (!sender.transactionPin) {
      res.status(400);
      throw new Error('Please set a transaction PIN in Profile settings first');
    }

    // Verify PIN
    const isPinMatch = await sender.comparePin(transactionPin);
    if (!isPinMatch) {
      res.status(400);
      throw new Error('Invalid 4-digit transaction PIN');
    }

    // Find receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404);
      throw new Error('Receiver account not found');
    }

    if (receiver.isBlocked) {
      res.status(400);
      throw new Error('Receiver account is blocked/restricted');
    }

    if (!receiver.isVerified) {
      res.status(400);
      throw new Error('Receiver account is not verified yet');
    }

    // CONCURRENCY-SAFE ATOMIC DEBIT (Standalone MongoDB compatible)
    // Decrement sender balance only if it is >= amount
    const senderWalletUpdate = await Wallet.findOneAndUpdate(
      { userId: sender._id, balance: { $gte: transferAmount } },
      { $inc: { balance: -transferAmount } },
      { new: true }
    );

    if (!senderWalletUpdate) {
      res.status(400);
      throw new Error('Insufficient balance');
    }

    // Increment receiver balance
    const receiverWalletUpdate = await Wallet.findOneAndUpdate(
      { userId: receiver._id },
      { $inc: { balance: transferAmount } },
      { new: true }
    );

    // Rollback sender's money in the rare event that receiver wallet updates fail
    if (!receiverWalletUpdate) {
      await Wallet.findOneAndUpdate(
        { userId: sender._id },
        { $inc: { balance: transferAmount } }
      );
      res.status(500);
      throw new Error('Payment routing failed. Money returned to wallet.');
    }

    // Generate Unique Transaction ID
    const txnId = `TXN-TRF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Transaction Log
    const transaction = await Transaction.create({
      transactionId: txnId,
      senderId: sender._id,
      receiverId: receiver._id,
      amount: transferAmount,
      transactionType: 'transfer',
      category: 'transfer',
      status: 'success',
      description: description || `Transferred to ${receiver.name}`,
    });

    // Emits Socket notifications to both sender and receiver
    // 1. Alert Sender
    sendNotification(sender._id, 'wallet_debit', {
      transactionId: txnId,
      amount: transferAmount,
      balance: senderWalletUpdate.balance,
      message: `₹${transferAmount.toFixed(2)} sent to ${receiver.name}.`,
    });

    // 2. Alert Receiver
    sendNotification(receiver._id, 'wallet_credit', {
      transactionId: txnId,
      amount: transferAmount,
      balance: receiverWalletUpdate.balance,
      message: `₹${transferAmount.toFixed(2)} received from ${sender.name}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Transaction completed successfully',
      data: {
        transactionId: txnId,
        amount: transferAmount,
        senderBalance: senderWalletUpdate.balance,
        receiverName: receiver.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transaction history (Incoming & Outgoing)
// @route   GET /api/transactions/history
// @access  Private
const getTransactionHistory = async (req, res, next) => {
  const { type, category, page = 1, limit = 10 } = req.query;

  try {
    const query = {
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    };

    // Filter by type
    if (type) {
      query.transactionType = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch transactions, populating sender/receiver profiles
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('senderId', 'name email phone profileImage')
      .populate('receiverId', 'name email phone profileImage');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction details
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionDetails = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      $or: [
        { transactionId: req.params.id },
        // Try looking up by Mongoose ObjectId if not found by string key
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : []),
      ],
    })
      .populate('senderId', 'name email phone profileImage')
      .populate('receiverId', 'name email phone profileImage');

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction details not found');
    }

    // Verify ownership
    const isSender = transaction.senderId && transaction.senderId._id.toString() === req.user.id;
    const isReceiver = transaction.receiverId && transaction.receiverId._id.toString() === req.user.id;

    if (!isSender && !isReceiver) {
      res.status(403);
      throw new Error('Access denied to view this transaction');
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  transferMoney,
  getTransactionHistory,
  getTransactionDetails,
};
