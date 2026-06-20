import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { payUtilityBill, resetTransactionStatus, clearTransactionError } from '../redux/slices/transactionSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import {
  Lightbulb,
  Tv,
  Flame,
  Droplet,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Receipt,
  Hash,
  Calendar,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Bills = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, paymentSuccess, error, successData } = useSelector(
    (state) => state.transaction
  );

  const [category, setCategory] = useState('electricity');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    { name: 'electricity', label: 'Electricity', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10' },
    { name: 'dth', label: 'DTH / TV', icon: Tv, color: 'text-blue-400 bg-blue-500/10' },
    { name: 'gas', label: 'Piped Gas', icon: Flame, color: 'text-rose-400 bg-rose-500/10' },
    { name: 'water', label: 'Water', icon: Droplet, color: 'text-cyan-400 bg-cyan-500/10' },
  ];

  const providers = {
    electricity: ['Tata Power', 'BESCOM Bengaluru', 'BSES Rajdhani Delhi', 'MSEDCL Maharashtra'],
    dth: ['Tata Play', 'Dish TV', 'Airtel Digital TV', 'Sun Direct DTH'],
    gas: ['Indane Gas Cylinders', 'HP Gas Cylinders', 'Bharat Gas', 'Adani Gas Ltd'],
    water: ['Delhi Jal Board (DJB)', 'Bangalore Water Board (BWSSB)', 'MCGM Mumbai Water', 'PHED Rajasthan'],
  };

  // Set default provider on category modification
  useEffect(() => {
    setProvider(providers[category][0]);
    setAccountNumber('');
    setAmount('');
    setPin('');
    setFormErrors({});
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
  }, [category, dispatch]);

  useEffect(() => {
    if (paymentSuccess) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [paymentSuccess]);

  const handleValidation = () => {
    const errors = {};
    const amt = Number(amount);

    if (!accountNumber.trim()) {
      errors.accountNumber = `Please enter a valid Customer Account ID or Consumer Number`;
    }
    if (!amt || amt <= 0) {
      errors.amount = 'Please enter a valid bill amount greater than ₹0';
    }
    if (!pin || pin.length !== 4 || isNaN(pin)) {
      errors.pin = 'PIN must be a 4-digit numeric code';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    dispatch(
      payUtilityBill({
        category,
        provider,
        accountNumber,
        amount: Number(amount),
        transactionPin: pin,
      })
    );
  };

  const handleBackToForm = () => {
    setAccountNumber('');
    setAmount('');
    setPin('');
    setFormErrors({});
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
  };

  const ActiveIcon = categories.find((c) => c.name === category)?.icon || Receipt;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Utility Bill Payments
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Settle electricity, gas, water, and DTH bills with instant updates.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* State 1: Bill Success Receipt */}
        {paymentSuccess && successData && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border border-accent-success/30 text-center overflow-hidden">
              <div className="bg-accent-success/5 py-6 flex flex-col items-center border-b border-dark-800">
                <CheckCircle className="h-14 w-14 text-accent-success stroke-[1.5] mb-2.5" />
                <Badge variant="success">BILL PAYMENT SUCCESSFUL</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-4 font-sans">
                  ₹{successData.amount.toFixed(2)}
                </h2>
                <p className="text-xs text-dark-450 mt-1">{successData.description}</p>
              </div>

              <div className="p-6 space-y-4 text-left divide-y divide-dark-800">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-dark-400 flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Biller Account</span>
                  <span className="font-semibold text-white">{provider} &bull; {accountNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Hash className="h-4 w-4" /> Transaction ID</span>
                  <span className="font-mono text-dark-200 select-all">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Payment Date</span>
                  <span className="text-dark-200">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="p-6 bg-dark-950/20 border-t border-dark-800">
                <Button variant="primary" fullWidth onClick={handleBackToForm}>
                  Pay Another Bill
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* State 2: Bill Input Form */}
        {!paymentSuccess && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Category Tab select grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                        : 'bg-dark-900 border-dark-800 text-dark-450 hover:bg-dark-850 hover:text-dark-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <Card>
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ActiveIcon className="h-4 w-4 text-primary-400" />
                Pay {category.charAt(0).toUpperCase() + category.slice(1)} Bill
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{error}</div>
                  </div>
                )}

                {/* Biller Select list */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider pl-1">
                    Biller Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    disabled={loading}
                    className="bg-dark-900 border border-dark-800 text-sm text-dark-100 rounded-xl px-4 py-3.5 outline-none focus:border-primary-500 hover:border-dark-750 cursor-pointer h-[50px] transition-all"
                  >
                    {providers[category].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={category === 'dth' ? 'DTH Subscriber ID' : 'Consumer / Account Number'}
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      if (formErrors.accountNumber) setFormErrors({ ...formErrors, accountNumber: '' });
                    }}
                    placeholder={category === 'dth' ? 'e.g. 1002394857' : 'e.g. ELEC-98283-9382'}
                    error={formErrors.accountNumber}
                    required
                    disabled={loading}
                  />

                  <Input
                    label="Bill Amount (INR)"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                    }}
                    placeholder="Enter bill amount"
                    error={formErrors.amount}
                    required
                    disabled={loading}
                    className="font-bold"
                  />
                </div>

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
                  disabled={loading}
                  className="text-center font-mono tracking-widest text-lg"
                />

                {!user?.hasPin && (
                  <div className="p-3 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-[11px] text-accent-warning font-medium">
                    You haven't set a transaction PIN yet. Please configure it in your Profile first.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!user?.hasPin}
                  icon={Receipt}
                  className="mt-4"
                >
                  Pay Utility Bill
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Bills;
