import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionHistory, getTransactionDetails, resetTransactionStatus } from '../redux/slices/transactionSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import { ArrowUpRight, ArrowDownLeft, Calendar, FileSpreadsheet, Eye, Info, User, ShieldAlert, ArrowRightLeft } from 'lucide-react';

const Transactions = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { history: transactions, pagination, loading, currentTransaction } = useSelector(
    (state) => state.transaction
  );

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    page: 1,
    limit: 10,
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    dispatch(getTransactionHistory(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1, // Reset page to 1 on filter modification
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const handleRowClick = (txnId) => {
    dispatch(getTransactionDetails(txnId));
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    dispatch(resetTransactionStatus());
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'wallet_add':
        return 'Deposit Load';
      case 'transfer':
        return 'P2P Transfer';
      case 'mobile':
        return 'Mobile Recharge';
      case 'electricity':
        return 'Electricity Bill';
      case 'dth':
        return 'DTH Payment';
      case 'gas':
        return 'Gas Bill';
      case 'water':
        return 'Water Bill';
      default:
        return cat.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Transactions History
          </h1>
          <p className="text-xs text-dark-400 mt-0.5">
            Examine and track your payment receipts.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Filter Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-dark-400 uppercase tracking-widest pl-1">
              Transaction Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="bg-dark-900 border border-dark-800 text-xs text-dark-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="transfer">Transfers</option>
              <option value="deposit">Deposits</option>
              <option value="recharge">Recharges</option>
              <option value="bill">Bills</option>
            </select>
          </div>

          {/* Filter Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-dark-400 uppercase tracking-widest pl-1">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="bg-dark-900 border border-dark-800 text-xs text-dark-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="wallet_add">Wallet Adds</option>
              <option value="transfer">Transfers</option>
              <option value="mobile">Mobile Recharges</option>
              <option value="electricity">Electricity</option>
              <option value="dth">DTH</option>
              <option value="gas">Gas</option>
              <option value="water">Water</option>
            </select>
          </div>

          {/* Page Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-dark-400 uppercase tracking-widest pl-1">
              Items Per Page
            </label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="bg-dark-900 border border-dark-800 text-xs text-dark-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="10">10 Rows</option>
              <option value="20">20 Rows</option>
              <option value="50">50 Rows</option>
            </select>
          </div>

        </div>
      </Card>

      {/* Transaction List Card */}
      <Card className="p-0 overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="p-4 rounded-full bg-dark-900 text-dark-600 mb-4">
              <ArrowRightLeft className="h-8 w-8 stroke-[1.5]" />
            </div>
            <span className="text-dark-400 text-sm font-semibold">No transactions match filters.</span>
          </div>
        ) : (
          <div className="divide-y divide-dark-800/60">
            
            {/* Rows */}
            {transactions.map((txn) => {
              const isCredit = txn.receiverId && txn.receiverId._id.toString() === user._id;
              return (
                <div
                  key={txn.transactionId}
                  onClick={() => handleRowClick(txn.transactionId)}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-dark-850/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCredit
                          ? 'bg-accent-success/10 text-accent-success border-accent-success/15'
                          : 'bg-primary-500/10 text-primary-400 border-primary-500/15'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate max-w-[200px] sm:max-w-md">
                        {txn.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-dark-500">
                          {new Date(txn.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-dark-700" />
                        <Badge variant="dark" className="text-[9px] px-1.5 py-0 font-bold uppercase">
                          {getCategoryLabel(txn.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold font-sans block ${
                        isCredit ? 'text-accent-success' : 'text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </span>
                    <Badge variant={txn.status === 'success' ? 'success' : 'error'} className="text-[8px] px-1 py-0 font-bold uppercase mt-1">
                      {txn.status}
                    </Badge>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Table footer with pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-dark-800 bg-dark-950/20">
            <span className="text-xs text-dark-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </Card>

      {/* TRANSACTION DETAILS RECEIPT MODAL */}
      <Modal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        title="Transaction Receipt"
      >
        {loading && !currentTransaction ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="sm" />
          </div>
        ) : currentTransaction ? (
          <div className="space-y-6">
            
            {/* Amount details card */}
            <div className="p-6 rounded-2xl bg-dark-950 border border-dark-850 flex flex-col items-center justify-center text-center">
              <Badge variant={currentTransaction.status === 'success' ? 'success' : 'error'} className="mb-2">
                PAYMENT {currentTransaction.status.toUpperCase()}
              </Badge>
              <span className="text-3xl font-extrabold text-white font-sans mt-1">
                ₹{currentTransaction.amount.toFixed(2)}
              </span>
              <p className="text-xs text-dark-400 mt-2 max-w-xs leading-relaxed">{currentTransaction.description}</p>
            </div>

            {/* Recipient Details & Sender details grid */}
            <div className="space-y-4 divide-y divide-dark-800">
              
              {/* Sender Block */}
              {currentTransaction.senderId && (
                <div className="flex justify-between items-start pt-2 text-xs">
                  <span className="text-dark-400 font-semibold uppercase tracking-wider">Paid From</span>
                  <div className="text-right">
                    <span className="font-bold text-white block">{currentTransaction.senderId._id === user._id ? 'My Wallet' : currentTransaction.senderId.name}</span>
                    <span className="text-[10px] text-dark-500 block mt-0.5">{currentTransaction.senderId.phone}</span>
                  </div>
                </div>
              )}

              {/* Receiver Block */}
              {currentTransaction.receiverId && (
                <div className="flex justify-between items-start pt-4 text-xs">
                  <span className="text-dark-400 font-semibold uppercase tracking-wider">Paid To</span>
                  <div className="text-right">
                    <span className="font-bold text-white block">{currentTransaction.receiverId._id === user._id ? 'My Wallet' : currentTransaction.receiverId.name}</span>
                    <span className="text-[10px] text-dark-500 block mt-0.5">{currentTransaction.receiverId.phone}</span>
                  </div>
                </div>
              )}

              {/* Biller details block */}
              {!currentTransaction.receiverId && currentTransaction.transactionType !== 'deposit' && (
                <div className="flex justify-between items-start pt-4 text-xs">
                  <span className="text-dark-400 font-semibold uppercase tracking-wider">Biller details</span>
                  <div className="text-right">
                    <span className="font-bold text-white block">External Mock Merchant</span>
                    <span className="text-[10px] text-dark-500 block mt-0.5">{getCategoryLabel(currentTransaction.category)}</span>
                  </div>
                </div>
              )}

              {/* Metadata details block */}
              <div className="space-y-3 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 font-semibold uppercase tracking-wider">Receipt ID</span>
                  <span className="font-mono text-dark-200 select-all">{currentTransaction.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 font-semibold uppercase tracking-wider">Created Date</span>
                  <span className="text-dark-200">
                    {new Date(currentTransaction.createdAt).toLocaleString()}
                  </span>
                </div>
                {currentTransaction.razorpayPaymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-dark-400 font-semibold uppercase tracking-wider">Gateway Payment ID</span>
                    <span className="font-mono text-[10px] text-dark-300">{currentTransaction.razorpayPaymentId}</span>
                  </div>
                )}
              </div>

            </div>

            <Button variant="secondary" fullWidth onClick={handleCloseModal}>
              Close Receipt
            </Button>

          </div>
        ) : (
          <div className="p-4 text-center text-xs text-accent-error flex gap-2 justify-center">
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>Could not load receipt. Access denied.</span>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Transactions;
