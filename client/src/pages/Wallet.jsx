import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletBalance, addMoney, verifyPayment, resetPaymentStatus } from '../redux/slices/walletSlice';
import { getTransactionHistory } from '../redux/slices/transactionSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import { Wallet as WalletIcon, ArrowDownLeft, ShieldCheck, ArrowRight, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Wallet = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, currency, loading: walletLoading, orderData, paymentSuccess, error } = useSelector(
    (state) => state.wallet
  );
  const { history: transactions, loading: txnLoading } = useSelector((state) => state.transaction);

  const [depositAmount, setDepositAmount] = useState('');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    dispatch(getWalletBalance());
    // Load deposits-only history
    dispatch(getTransactionHistory({ page: 1, limit: 10, type: 'deposit' }));
    return () => dispatch(resetPaymentStatus());
  }, [dispatch]);

  // Handle Order success & open simulator or real Razorpay
  useEffect(() => {
    if (orderData) {
      if (orderData.isSimulation) {
        setShowSimulateModal(true);
      } else {
        // REAL RAZORPAY INTEGRATION GATED
        const options = {
          key: orderData.key,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'Finora Smart Wallet',
          description: 'Load Money into Wallet',
          order_id: orderData.order.id,
          handler: (response) => {
            dispatch(
              verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                isSimulation: false,
                amount: Number(orderData.order.amount) / 100,
              })
            );
          },
          prefill: {
            name: orderData.user.name,
            email: orderData.user.email,
            contact: orderData.user.phone,
          },
          theme: {
            color: '#6366f1',
          },
        };
        const rzpay = new window.Razorpay(options);
        rzpay.open();
      }
    }
  }, [orderData, dispatch]);

  // Handle Confetti on successful load
  useEffect(() => {
    if (paymentSuccess) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Refresh balances & histories
      dispatch(getWalletBalance());
      dispatch(getTransactionHistory({ page: 1, limit: 10, type: 'deposit' }));
      dispatch(resetPaymentStatus());
    }
  }, [paymentSuccess, dispatch]);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setAmountError('Please enter a valid amount greater than ₹0');
      return;
    }
    setAmountError('');
    dispatch(addMoney(amt));
  };

  const handleSimulatePayment = (success) => {
    setShowSimulateModal(false);
    if (success) {
      dispatch(
        verifyPayment({
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_sim_${Math.random().toString(36).substring(2, 11)}`,
          razorpaySignature: 'simulated_sig',
          isSimulation: true,
          amount: Number(orderData.order.amount) / 100,
        })
      );
    } else {
      dispatch(resetPaymentStatus());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Wallet & Deposits
        </h1>
        <p className="text-xs text-dark-400 mt-0.5">
          Fund your digital wallet and trace loading activities.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
          <XCircle className="h-4.5 w-4.5 shrink-0 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Load Funds Input Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
              Add Money to Wallet
            </h3>
            
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <Input
                label="Enter Load Amount (INR)"
                type="number"
                value={depositAmount}
                onChange={(e) => {
                  setDepositAmount(e.target.value);
                  if (amountError) setAmountError('');
                }}
                placeholder="Enter amount (e.g. 500)"
                icon={WalletIcon}
                error={amountError}
                required
                disabled={walletLoading}
                className="text-lg font-bold"
              />

              <div className="flex gap-2">
                {[100, 500, 1000, 2000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => {
                      setDepositAmount(String(quickAmt));
                      setAmountError('');
                    }}
                    className="flex-1 py-2 rounded-xl bg-dark-900 border border-dark-800 text-dark-300 font-semibold hover:border-primary-500 hover:text-white transition-all text-xs"
                  >
                    +₹{quickAmt}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={walletLoading}
                icon={ArrowRight}
                className="mt-6"
              >
                Proceed to Checkout
              </Button>
            </form>
          </Card>

          {/* Current balance review card */}
          <Card className="bg-gradient-to-tr from-primary-950/40 to-dark-900">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-dark-400 font-semibold uppercase tracking-wider block">Wallet Balance</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  ₹{(balance || 0).toFixed(2)}
                </span>
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                <WalletIcon className="h-5.5 w-5.5 text-primary-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Load History List Column */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-5">
                Deposit History
              </h3>

              {txnLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="sm" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="p-3 rounded-full bg-dark-900 text-dark-600 mb-3">
                    <ArrowDownLeft className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <span className="text-dark-400 text-xs font-medium">No deposits logged yet.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((txn) => (
                    <div
                      key={txn.transactionId}
                      className="flex items-center justify-between p-2.5 bg-dark-950/20 hover:bg-dark-850/20 rounded-xl transition-colors border border-dark-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-lg bg-accent-success/10 text-accent-success flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                            {txn.description}
                          </h4>
                          <span className="text-[10px] text-dark-500 mt-0.5 block">
                            {new Date(txn.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-accent-success font-sans">
                          +₹{txn.amount.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-dark-500 uppercase tracking-widest block mt-0.5">
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

      {/* RAZORPAY SIMULATION POPUP DIALOG */}
      <Modal
        isOpen={showSimulateModal}
        onClose={() => handleSimulatePayment(false)}
        title="Razorpay Payment Simulator"
        closeOnClickOutside={false}
      >
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-xs text-accent-warning flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">Payment Sandbox Activated</span>
              No active Razorpay credentials detected in <span className="font-mono bg-dark-950 px-1 py-0.5 rounded text-white border border-dark-800">.env</span>. Utilizing sandbox checkout simulation for test transfers.
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-950 border border-dark-850 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-dark-400">Total Due Amount</span>
            <span className="text-3xl font-extrabold text-white mt-1">
              ₹{(Number(orderData?.order?.amount) / 100).toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-dark-500 mt-1">Order ID: {orderData?.order?.id}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => handleSimulatePayment(false)}
              icon={XCircle}
            >
              Simulate Failure
            </Button>
            <Button
              variant="success"
              fullWidth
              onClick={() => handleSimulatePayment(true)}
              icon={ShieldCheck}
            >
              Simulate Success
            </Button>
          </div>

        </div>
      </Modal>

    </div>
  );
};

export default Wallet;
