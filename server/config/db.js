const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const autoSeed = async () => {
  try {
    const usersData = [
      { name: 'Finora Admin', email: 'admin@finora.com', phone: '9999999999', password: 'admin123', transactionPin: '1234', isAdmin: true, isVerified: true },
      { name: 'Ayush Sharma', email: 'ayush@finora.com', phone: '9876543210', password: 'user123', transactionPin: '1234', isVerified: true },
      { name: 'Rahul Verma', email: 'rahul@finora.com', phone: '8765432109', password: 'user123', transactionPin: '1234', isVerified: true },
      { name: 'Priya Patel', email: 'priya@finora.com', phone: '7654321098', password: 'user123', transactionPin: '1234', isVerified: true },
    ];

    const walletBalances = {
      'admin@finora.com': 10000.0,
      'ayush@finora.com': 5000.0,
      'rahul@finora.com': 2500.0,
      'priya@finora.com': 1500.0,
    };

    let seededCount = 0;
    for (const u of usersData) {
      const existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        const newUser = await User.create(u);
        const balance = walletBalances[newUser.email] || 0.0;
        await Wallet.create({ userId: newUser._id, balance });
        seededCount++;
      }
    }
    if (seededCount > 0) {
      console.log(`Database auto-seeded successfully! Seeded ${seededCount} test account(s).`);
    }
  } catch (err) {
    console.error('Database auto-seeding failed:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finora');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed if database is fresh/empty
    await autoSeed();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
