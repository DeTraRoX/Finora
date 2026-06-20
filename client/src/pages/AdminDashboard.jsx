import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminStats, getAdminUsers, getAdminTransactions, toggleBlockUser } from '../redux/slices/adminSlice';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import Input from '../components/UI/Input';
import {
  Users,
  Wallet,
  Activity,
  UserCheck,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Building,
  TrendingUp,
  History,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users, transactions, pagination, loading, success } = useSelector(
    (state) => state.admin
  );

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'transactions'
  const [searchQuery, setSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [txnPage, setTxnPage] = useState(1);

  useEffect(() => {
    dispatch(getAdminStats());
  }, [dispatch]);

  // Load active tab dependencies
  useEffect(() => {
    if (activeTab === 'users') {
      dispatch(getAdminUsers({ query: searchQuery, page: userPage, limit: 8 }));
    } else if (activeTab === 'transactions') {
      dispatch(getAdminTransactions({ page: txnPage, limit: 12 }));
    }
  }, [activeTab, searchQuery, userPage, txnPage, dispatch]);

  // Handle Search Debounce for Users
  useEffect(() => {
    if (activeTab === 'users') {
      const delay = setTimeout(() => {
        setUserPage(1);
        dispatch(getAdminUsers({ query: searchQuery, page: 1, limit: 8 }));
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [searchQuery]);

  const handleToggleBlock = (userId) => {
    dispatch(toggleBlockUser(userId));
  };

  // Chart Color Palettes
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#8b5cf6'];

  const getPieChartData = () => {
    if (!stats || !stats.categoryBreakdown) return [];
    return stats.categoryBreakdown.map((item) => ({
      name: item._id ? item._id.toUpperCase() : 'OTHER',
      value: item.volume,
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Admin Panel <Badge variant="warning">ADMIN PRIVILEGES</Badge>
          </h1>
          <p className="text-xs text-dark-400 mt-0.5">
            Oversee system transactions, audit users, and view analytics.
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex gap-2 bg-dark-900 p-1.5 rounded-xl border border-dark-800">
          {[
            { id: 'overview', label: 'Analytics' },
            { id: 'users', label: 'Users Audit' },
            { id: 'transactions', label: 'System Feed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-dark-800 text-white border border-dark-700'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !stats && (
        <div className="flex justify-center items-center py-20">
          <Loader size="md" />
        </div>
      )}

      {/* RENDER TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          
          {/* Counters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-dark-450 uppercase font-bold tracking-widest block">Total Users</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.summary.totalUsers}</span>
                <span className="text-[9px] text-dark-500 block">{stats.summary.verifiedUsers} Verified Users</span>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Wallet className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-dark-450 uppercase font-bold tracking-widest block">System Deposits</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">
                  ₹{stats.summary.totalWalletBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-dark-500 block">Sum of all active wallets</span>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success flex items-center justify-center shrink-0">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-dark-450 uppercase font-bold tracking-widest block">Volume (Success)</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">
                  ₹{stats.summary.totalTxnVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-dark-500 block">{stats.summary.totalTxnCount} total operations</span>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-accent-error/10 border border-accent-error/20 text-accent-error flex items-center justify-center shrink-0">
                <AlertCircle className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] text-dark-450 uppercase font-bold tracking-widest block">Blocked Accounts</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">{stats.summary.blockedUsers}</span>
                <span className="text-[9px] text-dark-500 block">Restricted from system access</span>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Category Pie Chart */}
            <Card className="lg:col-span-5 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
                Volume Distribution by Category
              </h3>
              
              <div className="h-64 w-full my-auto flex justify-center">
                {getPieChartData().length === 0 ? (
                  <div className="text-center py-20 text-dark-500 text-xs">No analytics data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '11px', color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Growth Over Time Chart */}
            <Card className="lg:col-span-7">
              <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">
                Transaction Volume Growth (6 Months)
              </h3>
              
              <div className="h-64 w-full">
                {stats.monthlyStats.length === 0 ? (
                  <div className="text-center py-20 text-dark-500 text-xs">No chronological data seeded yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.monthlyStats}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '11px', color: '#fff' }}
                      />
                      <Bar dataKey="volume" fill="#6366f1" radius={[8, 8, 0, 0]} name="Volume (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* RENDER TAB 2: USER AUDIT MANAGEMENT */}
      {activeTab === 'users' && (
        <Card className="p-0 overflow-hidden">
          
          {/* Table Search Header */}
          <div className="p-5 border-b border-dark-800 bg-dark-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
              Manage Users Accounts
            </h3>
            
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Search name, email, phone"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="py-2.5 h-[40px] text-xs"
              />
            </div>
          </div>

          {loading && users.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader size="sm" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-dark-500 text-xs">No users match query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-dark-950/40 text-dark-400 font-bold border-b border-dark-850 uppercase tracking-wider">
                    <th className="p-4">Name & Profile</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Mobile</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-850">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-dark-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center">
                            {item.name ? item.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{item.name}</span>
                            {item.isAdmin && <Badge variant="warning" className="text-[7px] py-0 px-1 mt-0.5">ADMIN</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-dark-300">{item.email}</td>
                      <td className="p-4 text-dark-300">{item.phone}</td>
                      <td className="p-4">
                        <Badge variant={item.isVerified ? 'success' : 'dark'}>
                          {item.isVerified ? 'VERIFIED' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-white">₹{item.balance.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        {item.isAdmin ? (
                          <span className="text-[10px] text-dark-500 font-semibold italic pr-3">Protected</span>
                        ) : (
                          <Button
                            variant={item.isBlocked ? 'success' : 'danger'}
                            size="sm"
                            className="py-1 px-3 h-8 text-[11px]"
                            onClick={() => handleToggleBlock(item._id)}
                            icon={item.isBlocked ? Unlock : Lock}
                          >
                            {item.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-dark-800 bg-dark-950/20">
              <span className="text-xs text-dark-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={userPage === 1}
                  onClick={() => setUserPage(userPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={userPage === pagination.pages}
                  onClick={() => setUserPage(userPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </Card>
      )}

      {/* RENDER TAB 3: SYSTEM TRANSACTION AUDIT FEED */}
      {activeTab === 'transactions' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-dark-800 bg-dark-950/20">
            <h3 className="text-xs font-bold text-dark-300 uppercase tracking-wider">
              System Wide Operations Feed
            </h3>
          </div>

          {loading && transactions.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader size="sm" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 text-dark-500 text-xs">No transactions logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-dark-950/40 text-dark-400 font-bold border-b border-dark-850 uppercase tracking-wider">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Sender</th>
                    <th className="p-4">Receiver</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-850">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-dark-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-dark-200">{txn.transactionId}</td>
                      <td className="p-4 font-semibold uppercase">{txn.transactionType}</td>
                      <td className="p-4 text-dark-300">
                        {txn.senderId ? txn.senderId.name : <span className="text-dark-500 italic">None (Deposit)</span>}
                      </td>
                      <td className="p-4 text-dark-300">
                        {txn.receiverId ? txn.receiverId.name : <span className="text-dark-500 italic">None (Biller/External)</span>}
                      </td>
                      <td className="p-4 text-dark-450 truncate max-w-[150px]" title={txn.description}>
                        {txn.description}
                      </td>
                      <td className="p-4 font-extrabold text-white">₹{txn.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={txn.status === 'success' ? 'success' : 'error'}>
                          {txn.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-dark-800 bg-dark-950/20">
              <span className="text-xs text-dark-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txnPage === 1}
                  onClick={() => setTxnPage(txnPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txnPage === pagination.pages}
                  onClick={() => setTxnPage(txnPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </Card>
      )}

    </div>
  );
};

export default AdminDashboard;
