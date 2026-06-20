const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  getAllTransactions,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin check to all routes in this router
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/transactions', getAllTransactions);

module.exports = router;
