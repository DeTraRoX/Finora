const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendNotification } = require('../config/socket');

// @desc    Get user wallet balance
// @route   GET /api/wallet/balance
// @access  Private
const getWalletBalance = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      res.status(404);
      throw new Error('Wallet not found');
    }

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate Add Money (Razorpay Order creation or simulation)
// @route   POST /api/wallet/add-money
// @access  Private
const addMoney = async (req, res, next) => {
  const { amount } = req.body;

  try {
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid amount greater than ₹0');
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if Razorpay keys are configured
    if (keyId && keySecret) {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const options = {
          amount: Math.round(amount * 100), // Razorpay operates in paisa (sub-unit)
          currency: 'INR',
          receipt: `rcpt_${req.user.id.slice(-6)}_${Date.now().toString().slice(-6)}`,
        };

        const order = await instance.orders.create(options);

        return res.status(200).json({
          success: true,
          isSimulation: false,
          order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
          },
          key: keyId,
          user: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
          },
        });
      } catch (err) {
        console.error('Razorpay Order creation failed, falling back to simulation:', err.message);
      }
    }

    // SIMULATED FLOW
    const simOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
    res.status(200).json({
      success: true,
      isSimulation: true,
      order: {
        id: simOrderId,
        amount: amount * 100, // Show in paisa representation for parity
        currency: 'INR',
      },
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and credit wallet
// @route   POST /api/wallet/verify-payment
// @access  Private
const verifyPayment = async (req, res, next) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    isSimulation,
    amount,
  } = req.body;

  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      res.status(404);
      throw new Error('Wallet not found');
    }

    let isValid = false;

    if (isSimulation) {
      // Simulation mode bypasses cryptography check
      isValid = true;
    } else {
      // Real signature check
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text.toString())
        .digest('hex');

      if (generated_signature === razorpaySignature) {
        isValid = true;
      }
    }

    if (!isValid) {
      res.status(400);
      throw new Error('Payment signature verification failed. Transaction rejected.');
    }

    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      res.status(400);
      throw new Error('Invalid deposit amount');
    }

    // Update Wallet Balance
    wallet.balance += creditAmount;
    await wallet.save();

    // Generate custom unique Transaction ID
    const txnId = `TXN-DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create deposit transaction record
    const transaction = await Transaction.create({
      transactionId: txnId,
      senderId: null, // External deposit
      receiverId: req.user.id,
      amount: creditAmount,
      transactionType: 'deposit',
      category: 'wallet_add',
      status: 'success',
      description: isSimulation
        ? 'Loaded money via simulated Gateway'
        : 'Loaded money via Razorpay Gateway',
      razorpayOrderId,
      razorpayPaymentId,
    });

    // Send real-time Socket notification
    sendNotification(req.user.id, 'wallet_credit', {
      transactionId: txnId,
      amount: creditAmount,
      balance: wallet.balance,
      message: `₹${creditAmount.toFixed(2)} credited to your wallet.`,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and wallet credited successfully',
      data: {
        transactionId: txnId,
        newBalance: wallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletBalance,
  addMoney,
  verifyPayment,
};
