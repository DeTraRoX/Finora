import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Wallet,
  Send,
  History,
  Smartphone,
  Receipt,
  User,
  Shield,
  LogOut,
  X,
  QrCode,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet & Deposits', path: '/wallet', icon: Wallet },
    { name: 'Send Money', path: '/send-money', icon: Send },
    { name: 'Scan QR Code', path: '/scan-qr', icon: QrCode },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Mobile Recharge', path: '/recharge', icon: Smartphone },
    { name: 'Utility Bills', path: '/bills', icon: Receipt },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-dark-950 border-r border-dark-900 px-4 py-6">
      <div>
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between lg:hidden mb-6">
          <span className="font-bold text-dark-300 text-sm">Navigation Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-dark-400 hover:bg-dark-800 hover:text-dark-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/10'
                      : 'text-dark-400 hover:bg-dark-900 hover:text-dark-200'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}

          {/* Admin Section */}
          {user?.isAdmin && (
            <div className="pt-4 mt-4 border-t border-dark-900">
              <span className="px-4 text-[10px] font-bold text-dark-500 uppercase tracking-wider block mb-2">
                System Admin
              </span>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-primary-600 text-white shadow-lg shadow-violet-500/10'
                      : 'text-dark-400 hover:bg-dark-900 hover:text-accent-warning'
                  }`
                }
              >
                <Shield className="h-5 w-5 shrink-0" />
                Admin Panel
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-dark-900">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-accent-error/80 hover:bg-accent-error/10 hover:text-accent-error transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout Account
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Layout */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile Overlay Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop filter overlay */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />
        <div className="fixed inset-y-0 left-0 w-64 max-w-xs h-full bg-dark-950 shadow-2xl">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
