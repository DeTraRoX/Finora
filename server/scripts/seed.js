const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Load environment variables
dotenv.config();

const usersData = [
  {
    name: 'Finora Admin',
    email: 'admin@finora.com',
    phone: '9999999999',
    password: 'admin123',
    transactionPin: '1234',
    isAdmin: true,
    isVerified: true,
  },
  {
    name: 'Ayush Sharma',
    email: 'ayush@finora.com',
    phone: '9876543210',
    password: 'user123',
    transactionPin: '1234',
    isVerified: true,
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@finora.com',
    phone: '8765432109',
    password: 'user123',
    transactionPin: '1234',
    isVerified: true,
  },
  {
    name: 'Priya Patel',
    email: 'priya@finora.com',
    phone: '7654321098',
    password: 'user123',
    transactionPin: '1234',
    isVerified: true,
  },
];

const walletBalances = {
  'admin@finora.com': 10000.0,
  'ayush@finora.com': 5000.0,
  'rahul@finora.com': 2500.0,
  'priya@finora.com': 1500.0,
};

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finora');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Wallet.deleteMany();
    await Transaction.deleteMany();
    console.log('Existing users, wallets, and transactions cleared.');

    // Seed users and auto-create wallets
    for (const u of usersData) {
      const newUser = await User.create(u);
      console.log(`User seeded: ${newUser.name} (${newUser.email})`);

      // Create wallet
      const balance = walletBalances[newUser.email] || 0.0;
      await Wallet.create({
        userId: newUser._id,
        balance,
      });
      console.log(`Wallet seeded for ${newUser.name} with balance ₹${balance}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
