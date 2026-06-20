const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard metrics and analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    // 1. Core counters
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // 2. Wallets total balance
    const walletBalanceAggregation = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
    ]);
    const totalWalletBalance = walletBalanceAggregation[0]?.totalBalance || 0;

    // 3. Transactions volume & counts
    const txnAggregation = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
    const totalTxnVolume = txnAggregation[0]?.totalVolume || 0;
    const totalTxnCount = txnAggregation[0]?.count || 0;

    // 4. Breakdown by transaction types
    const typeBreakdown = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$transactionType',
          volume: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 5. Breakdown by categories (for charts)
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$category',
          volume: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 6. Growth stats - last 6 months transactions volume
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          volume: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          verifiedUsers,
          blockedUsers,
          totalWalletBalance,
          totalTxnVolume,
          totalTxnCount,
        },
        typeBreakdown,
        categoryBreakdown,
        monthlyStats: monthlyAggregation.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          volume: item.volume,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search and pagination)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  const { query, page = 1, limit = 10 } = req.query;

  try {
    const filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Fetch balances for these users
    const userList = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          isBlocked: user.isBlocked,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          balance: wallet ? wallet.balance : 0,
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: userList,
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

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user.id) {
      res.status(400);
      throw new Error('You cannot block your own admin account');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        userId: user._id,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions in the system
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res, next) => {
  const { type, page = 1, limit = 15 } = req.query;

  try {
    const filter = {};
    if (type) {
      filter.transactionType = type;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('senderId', 'name email phone')
      .populate('receiverId', 'name email phone');

    const total = await Transaction.countDocuments(filter);

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

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllTransactions,
};
