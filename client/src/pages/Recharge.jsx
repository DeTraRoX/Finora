import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { payMobileRecharge, resetTransactionStatus, clearTransactionError } from '../redux/slices/transactionSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import { Smartphone, CheckCircle, ShieldAlert, ArrowLeft, ArrowRight, Hash, PhoneCall, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Recharge = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, paymentSuccess, error, successData } = useSelector(
    (state) => state.transaction
  );

  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('Jio');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const mockPlans = [
    { id: 'p1', amount: '239', validity: '28 Days', data: '1.5 GB / Day', description: 'Unlimited Voice Calls + 100 SMS/Day' },
    { id: 'p2', amount: '299', validity: '28 Days', data: '2.0 GB / Day', description: 'Unlimited Voice Calls + 100 SMS/Day + Prime Mock access' },
    { id: 'p3', amount: '666', validity: '84 Days', data: '1.5 GB / Day', description: 'Unlimited Voice Calls + 100 SMS/Day + Disney+ Mock subscription' },
    { id: 'p4', amount: '749', validity: '90 Days', data: '2.0 GB / Day', description: 'Unlimited Voice Calls + 100 SMS/Day + Hero Unlimited benefits' },
  ];

  const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];

  useEffect(() => {
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
    return () => {
      dispatch(clearTransactionError());
      dispatch(resetTransactionStatus());
    };
  }, [dispatch]);

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

    if (!phoneNumber || phoneNumber.length < 10 || isNaN(phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!amt || amt <= 0) {
      errors.amount = 'Please select a plan or enter an amount greater than 0';
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
      payMobileRecharge({
        phoneNumber,
        provider,
        amount: Number(amount),
        transactionPin: pin,
      })
    );
  };

  const handleBackToForm = () => {
    setPhoneNumber('');
    setAmount('');
    setPin('');
    setFormErrors({});
    dispatch(clearTransactionError());
    dispatch(resetTransactionStatus());
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Mobile Recharge
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Load top-ups and mobile plans instantly from your wallet.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Receipt display on paymentSuccess */}
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
                <Badge variant="success">RECHARGE SUCCESSFUL</Badge>
                <h2 className="text-3xl font-extrabold text-white mt-4 font-sans">
                  ₹{successData.amount.toFixed(2)}
                </h2>
                <p className="text-xs text-dark-450 mt-1">{successData.description}</p>
              </div>

              <div className="p-6 space-y-4 text-left divide-y divide-dark-800">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-dark-400 flex items-center gap-1.5"><PhoneCall className="h-4 w-4" /> Provider & Number</span>
                  <span className="font-semibold text-white">{provider} &bull; {phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Hash className="h-4 w-4" /> Transaction ID</span>
                  <span className="font-mono text-dark-200 select-all">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-dark-400 flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Transaction Date</span>
                  <span className="text-dark-200">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="p-6 bg-dark-950/20 border-t border-dark-800">
                <Button variant="primary" fullWidth onClick={handleBackToForm}>
                  Recharge Another Number
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Input Form Display */}
        {!paymentSuccess && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
                Enter Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{error}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number"
                    type="text"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (formErrors.phoneNumber) setFormErrors({ ...formErrors, phoneNumber: '' });
                    }}
                    placeholder="Enter 10-digit number"
                    icon={Smartphone}
                    error={formErrors.phoneNumber}
                    required
                    disabled={loading}
                  />

                  {/* Select Operator */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider">
                      Operator / Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      disabled={loading}
                      className="bg-dark-900 border border-dark-800 text-sm text-dark-100 rounded-xl px-4 py-3.5 outline-none focus:border-primary-500 hover:border-dark-750 cursor-pointer h-[50px] transition-all"
                    >
                      {operators.map((op) => (
                        <option key={op} value={op}>
                          {op} Prepaid
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Recharge Amount (INR)"
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                  }}
                  placeholder="Enter amount or pick a plan below"
                  error={formErrors.amount}
                  required
                  disabled={loading}
                  className="font-bold text-lg"
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
                  disabled={loading}
                  className="text-center font-mono tracking-widest text-lg"
                />

                {/* PIN Guard Caution */}
                {!user.hasPin && (
                  <div className="p-3 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-[11px] text-accent-warning font-medium">
                    You haven't set a transaction PIN yet. Please configure it in your Profile first.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!user.hasPin}
                  icon={Smartphone}
                  className="mt-4"
                >
                  Confirm & Pay Recharge
                </Button>
              </form>
            </Card>

            {/* Popular Plans visual list */}
            <div>
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4 pl-1">
                Popular Plans
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    hoverable
                    onClick={() => {
                      setAmount(plan.amount);
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
                    }}
                    className={`flex flex-col justify-between p-4 border transition-all ${
                      amount === plan.amount ? 'border-primary-500 bg-primary-500/5' : 'border-dark-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-lg font-extrabold text-white">₹{plan.amount}</span>
                        <Badge variant="primary" className="text-[8px] font-bold">{plan.validity}</Badge>
                      </div>
                      <p className="text-[10px] text-primary-400 font-semibold mt-1">Data: {plan.data}</p>
                      <p className="text-[11px] text-dark-300 mt-2 leading-relaxed">{plan.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Recharge;
