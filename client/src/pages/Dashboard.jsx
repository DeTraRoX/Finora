import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Send,
  PlusCircle,
  QrCode,
  Smartphone,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { getWalletBalance } from '../redux/slices/walletSlice';
import { getTransactionHistory } from '../redux/slices/transactionSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, currency, loading: walletLoading, error: walletError } = useSelector((state) => state.wallet);
  const { history: transactions, loading: txnLoading } = useSelector((state) => state.transaction);
  
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    dispatch(getWalletBalance());
    dispatch(getTransactionHistory({ page: 1, limit: 5 }));
  }, [dispatch]);

  // Compute stats for chart
  const getChartData = () => {
    if (!transactions || transactions.length === 0) {
      // Mockup high-fidelity dashboard charts data if user has no transactions yet
      return [
        { name: 'Mon', income: 1000, expense: 200 },
        { name: 'Tue', income: 0, expense: 150 },
        { name: 'Wed', income: 500, expense: 400 },
        { name: 'Thu', income: 1200, expense: 100 },
        { name: 'Fri', income: 0, expense: 300 },
        { name: 'Sat', income: 800, expense: 50 },
        { name: 'Sun', income: 300, expense: 120 },
      ];
    }

    // Parse real transactions (grouped by day of week)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      dataMap[dayName] = { name: dayName, income: 0, expense: 0 };
    }

    transactions.forEach((txn) => {
      const date = new Date(txn.createdAt);
      const dayName = days[date.getDay()];
      if (dataMap[dayName]) {
        const amt = txn.amount;
        if (txn.transactionType === 'deposit') {
          dataMap[dayName].income += amt;
        } else {
          dataMap[dayName].expense += amt;
        }
      }
    });

    return Object.values(dataMap);
  };

  const services = [
    { name: 'Send Money', path: '/send-money', icon: Send, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' },
    { name: 'Add Money', path: '/wallet', icon: PlusCircle, color: 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' },
    { name: 'Scan QR Code', path: '/scan-qr', icon: QrCode, color: 'text-emerald-400 bg-accent-success/10 hover:bg-accent-success/20' },
    { name: 'Mobile Recharge', path: '/recharge', icon: Smartphone, color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20' },
    { name: 'Utility Bills', path: '/bills', icon: Receipt, color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Message */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Hello, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-dark-400 mt-0.5">
            Monitor and administer your digital transactions securely.
          </p>
        </div>
        
        {/* Sign-up Bonus Banner */}
        {balance === 1000 && transactions.length === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-xs font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            <span>₹1000 Sign-up Bonus Credited! Try sending money or paying bills.</span>
          </motion.div>
        )}
      </div>

      {walletError && (
        <div className="p-4 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-semibold">
          {walletError}
        </div>
      )}

      {/* Grid Dashboard row 1: Wallet Balance & Quick Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="lg:col-span-5">
          <div className="relative glass-panel rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col justify-between aspect-[1.7/1] bg-gradient-to-br from-indigo-950 via-slate-900 to-dark-950 overflow-hidden w-full group">
            
            {/* Visual glow overlay */}
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-primary-500/10 blur-2xl group-hover:bg-primary-500/20 transition-all duration-500" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Finora Wallet</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <Badge variant="primary" className="text-[8px] px-1.5 py-0">KYC Verified</Badge>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="rounded-lg p-1.5 text-dark-400 hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="my-4">
              <span className="text-xs text-dark-400">Available Balance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-white font-sans">
                  {showBalance ? `₹${(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                </span>
                <span className="text-xs text-dark-400 font-semibold">{currency}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono tracking-widest text-dark-500">{user?.phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3') || ''}</span>
              <Link to="/wallet">
                <button className="text-[11px] font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  Add Funds <PlusCircle className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <Card className="h-full flex flex-col justify-between">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
              Quick Payment Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-auto">
              {services.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link key={svc.name} to={svc.path}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-dark-900 border border-dark-800 hover:border-dark-700 transition-colors text-center aspect-square cursor-pointer"
                    >
                      <div className={`p-3 rounded-xl mb-3 ${svc.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-dark-200">{svc.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

      </div>

      {/* Grid Dashboard row 2: Analytics & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spend Analytics Chart */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
                  Weekly Spend Metrics
                </h3>
                <span className="text-[10px] text-dark-400 mt-0.5 block">
                  {transactions.length === 0 ? 'Showing mock analytical projections' : 'Aggregating actual deposit loads vs payments'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-accent-success font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live Feed</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getChartData()}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Deposits (IN)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Payments/Debits (OUT)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
                  Recent Activities
                </h3>
                <Link
                  to="/transactions"
                  className="text-xs font-semibold text-primary-400 hover:text-primary-300"
                >
                  View All
                </Link>
              </div>

              {txnLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="sm" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="p-3 rounded-full bg-dark-900 text-dark-600 mb-3">
                    <Wallet className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <span className="text-dark-400 text-xs font-medium">No transactions logged yet.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 4).map((txn) => {
                    const isCredit =
                      txn.receiverId && txn.receiverId._id.toString() === user?._id;
                    return (
                      <div
                        key={txn.transactionId}
                        className="flex items-center justify-between p-2 hover:bg-dark-850/20 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isCredit
                                ? 'bg-accent-success/10 text-accent-success'
                                : 'bg-primary-500/10 text-primary-400'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {txn.description}
                            </h4>
                            <span className="text-[10px] text-dark-500 mt-0.5 block">
                              {new Date(txn.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-bold font-sans ${
                              isCredit ? 'text-accent-success' : 'text-white'
                            }`}
                          >
                            {isCredit ? '+' : '-'}₹{txn.amount.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-dark-500 uppercase tracking-widest block mt-0.5">
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
