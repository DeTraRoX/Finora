import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
import { getWalletBalance } from './redux/slices/walletSlice';
import { addNotification } from './redux/slices/notificationSlice';
import { connectSocket, disconnectSocket } from './services/socketService';

// Layouts
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import SendMoney from './pages/SendMoney';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Recharge from './pages/Recharge';
import Bills from './pages/Bills';
import AdminDashboard from './pages/AdminDashboard';
import ScanQR from './pages/ScanQR';

// Toast Notifications Component
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Initial Load: Load user session from local token
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // 2. Fetch wallet balance on auth success
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWalletBalance());
    }
  }, [isAuthenticated, dispatch]);

  // 3. Socket.io setup upon successful authentication
  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Connect to Socket server
      const socket = connectSocket(token, (notif) => {
        // Log notification to Redux
        dispatch(addNotification(notif));

        // Trigger dynamic Toast popups
        setToastMessage(notif.payload?.message);

        // Fetch wallet balance to update client values automatically
        dispatch(getWalletBalance());
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token, user, dispatch]);

  // Clear Toast messages automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading && localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="mt-4 text-dark-300 font-medium">Restoring secure session...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col bg-mesh bg-cover">
        
        {/* Real-time Toast Overlay */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
            >
              <div className="glass-panel border-accent-success/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xl shadow-accent-success/5 bg-dark-900/90 text-white">
                <div className="h-2 w-2 rounded-full bg-accent-success animate-ping" />
                <div className="flex-1 text-sm font-semibold leading-normal">
                  {toastMessage}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Routes>
          {/* Landing page (unprotected) */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
            }
          />

          {/* Auth pages (Redirect to dashboard if logged in) */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
            }
          />

          {/* Core App Layout Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                  <div className="flex flex-1">
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/send-money" element={<SendMoney />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/recharge" element={<Recharge />} />
                        <Route path="/bills" element={<Bills />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/scan-qr" element={<ScanQR />} />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute adminOnly={true}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
