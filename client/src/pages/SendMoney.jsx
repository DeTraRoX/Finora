import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { transferMoney, resetTransactionStatus, clearTransactionError } from '../redux/slices/transactionSlice';
import api from '../services/api';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loader from '../components/UI/Loader';
import Badge from '../components/UI/Badge';
import { Search, Send, ArrowLeft, ShieldAlert, CheckCircle, ArrowRight, UserCheck, Calendar, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const SendMoney = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { loading: txnLoading, transferSuccess, error: txnError, successData } = useSelector(
    (state) => state.transaction
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');

  const [formErrors, setFormErrors] = useState({});

  // Pre-populate recipient if redirected from QR Scanner
  useEffect(() => {
    if (location.state?.recipient) {
      setSelectedUser(location.state.recipient);
    }
  }, [location]);

  useEffect(() => {
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
    return () => {
      dispatch(clearTransactionError());
      dispatch(resetTransactionStatus());
    };
  }, [dispatch]);

  // Debounced/Triggered Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Trigger Confetti on successful P2P send
  useEffect(() => {
    if (transferSuccess) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [transferSuccess]);

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const res = await api.get(`/users/search?query=${searchQuery}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error('User search failed:', err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = (targetUser) => {
    setSelectedUser(targetUser);
    dispatch(clearTransactionError());
    setFormErrors({});
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
    setAmount('');
    setDescription('');
    setPin('');
    setFormErrors({});
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
  };

  const handleFormValidation = () => {
    const errors = {};
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      errors.amount = 'Please enter a valid amount greater than ₹0';
    }
    if (!pin || pin.length !== 4 || isNaN(pin)) {
      errors.pin = 'PIN must be a 4-digit numeric code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!handleFormValidation()) return;

    dispatch(
      transferMoney({
        receiverId: selectedUser._id,
        amount: Number(amount),
        transactionPin: pin,
        description: description || `Sent to ${selectedUser.name}`,
      })
    );
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FI';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Send Money
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Transfer money instantly to any verified Finora user.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* State 1: Transaction Success Receipt */}
        {transferSuccess && successData && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border border-accent-success/30 text-center overflow-hidden">
              {/* Receipt Top header banner */}
              <div className="bg-accent-success/5 py-6 flex flex-col items-center border-b border-dark-800">
                <CheckCircle className="h-14 w-14 text-accent-success stroke-[1.5] mb-2.5" />
                <Badge variant="success">PAYMENT SUCCESSFUL</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-4 font-sans">
                  ₹{successData.amount.toFixed(2)}
                </h2>
                <p className="text-xs text-dark-450 mt-1">Sent securely to {successData.receiverName}</p>
              </div>

              {/* Receipt Details Body */}
              <div className="p-6 space-y-4 text-left divide-y divide-dark-800">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-dark-400 flex items-center gap-1.5"><UserCheck className="h-4 w-4" /> Recipient Name</span>
                  <span className="font-semibold text-white">{selectedUser?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Hash className="h-4 w-4" /> Transaction ID</span>
                  <span className="font-mono text-dark-200 select-all">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Date & Time</span>
                  <span className="text-dark-200">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 bg-dark-950/20 flex gap-3 border-t border-dark-800">
                <Button variant="primary" fullWidth onClick={handleBackToSearch}>
                  Send More Money
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* State 2: Select Recipient / Search */}
        {!transferSuccess && !selectedUser && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
                Search Recipient
              </h3>
              
              <Input
                placeholder="Search by name, email, or mobile number"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="mb-4"
              />

              {/* Search result view list */}
              <div className="mt-4 divide-y divide-dark-800 max-h-80 overflow-y-auto pr-1">
                {searchLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader size="sm" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-10 text-dark-500 text-xs">
                    {searchQuery.trim().length >= 2
                      ? 'No users found matching query'
                      : 'Type 2 or more characters to start searching.'}
                  </div>
                ) : (
                  searchResults.map((targetUser) => (
                    <div
                      key={targetUser._id}
                      onClick={() => handleUserSelect(targetUser)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-dark-850/20 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {targetUser.profileImage ? (
                          <img
                            src={targetUser.profileImage}
                            alt={targetUser.name}
                            className="h-9 w-9 rounded-full object-cover border border-dark-750"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                            {getInitials(targetUser.name)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{targetUser.name}</h4>
                          <span className="text-[10px] text-dark-400 mt-0.5 block">
                            {targetUser.email} &bull; {targetUser.phone}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" icon={Send} className="h-8 py-0">
                        Pay
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* State 3: Pay Transfer Form */}
        {!transferSuccess && selectedUser && (
          <motion.div
            key="transfer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              {/* Back to search */}
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white mb-6 font-semibold transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Search
              </button>

              {/* Target User Details header */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-dark-900 border border-dark-800 mb-6">
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    className="h-11 w-11 rounded-full object-cover border border-dark-700"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center">
                    {getInitials(selectedUser.name)}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider block">PAYING RECIPIENT</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{selectedUser.name}</h4>
                  <span className="text-xs text-dark-400 leading-none block mt-0.5">{selectedUser.phone}</span>
                </div>
              </div>

              {/* Transfer Form fields */}
              <form onSubmit={handleTransferSubmit} className="space-y-4">
                
                {/* Error Banner */}
                {txnError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{txnError}</div>
                  </div>
                )}

                <Input
                  label="Transfer Amount (INR)"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                  }}
                  placeholder="Enter amount to send (e.g. 250)"
                  error={formErrors.amount}
                  required
                  disabled={txnLoading}
                  className="text-lg font-bold"
                />

                <Input
                  label="Description / Note"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a payment note (e.g. Dinner share)"
                  disabled={txnLoading}
                />

                <Input
                  label="Transaction PIN"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (formErrors.pin) setFormErrors({ ...formErrors, pin: '' });
                  }}
                  placeholder="Enter 4-digit PIN"
                  error={formErrors.pin}
                  required
                  disabled={txnLoading}
                  className="text-center font-mono tracking-widest text-lg"
                />

                 {/* Info Tip about Pin */}
                {!currentUser?.hasPin && (
                  <div className="p-3 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-[11px] text-accent-warning font-medium">
                    You haven't set a transaction PIN yet. Please navigate to Profile page to configure it first.
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    fullWidth
                    disabled={txnLoading}
                    onClick={handleBackToSearch}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={txnLoading}
                    disabled={!currentUser?.hasPin}
                    icon={Send}
                  >
                    Send Payment
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default SendMoney;
