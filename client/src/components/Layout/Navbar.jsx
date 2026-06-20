import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Menu, X, Check, Trash2, User as UserIcon } from 'lucide-react';
import { markAllAsRead, clearNotifications } from '../../redux/slices/notificationSlice';
import { AnimatePresence, motion } from 'framer-motion';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FI';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section - Brand & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-dark-400 hover:bg-dark-800 hover:text-dark-100 lg:hidden focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-extrabold text-lg font-sans">F</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-white via-dark-100 to-primary-400 bg-clip-text text-transparent">
              Finora
            </span>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleNotificationClick}
              className="relative rounded-xl p-2.5 text-dark-400 hover:bg-dark-800 hover:text-dark-100 transition-colors focus:outline-none"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-success text-[10px] font-bold text-white ring-2 ring-dark-950">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-dark-800 bg-dark-900 shadow-xl overflow-hidden shadow-black/50"
                >
                  <div className="flex items-center justify-between border-b border-dark-800 bg-dark-900/50 px-4 py-3">
                    <span className="font-semibold text-dark-100 text-sm">Notifications</span>
                    <div className="flex gap-2">
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={() => dispatch(markAllAsRead())}
                            className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-800 hover:text-dark-100 text-xs flex items-center gap-1 transition-colors"
                            title="Mark all read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => dispatch(clearNotifications())}
                            className="rounded-lg p-1.5 text-accent-error/70 hover:bg-accent-error/10 hover:text-accent-error text-xs flex items-center gap-1 transition-colors"
                            title="Clear all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto divide-y divide-dark-800/50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <Bell className="h-8 w-8 text-dark-600 stroke-[1.5] mb-2" />
                        <span className="text-dark-400 text-xs font-medium">No new transactions or updates.</span>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 p-4 hover:bg-dark-800/30 transition-colors ${
                            !notif.read ? 'bg-primary-500/5' : ''
                          }`}
                        >
                          <div
                            className={`mt-1 rounded-lg p-1.5 flex items-center justify-center ${
                              notif.type === 'wallet_credit' || notif.type === 'deposit_success'
                                ? 'bg-accent-success/15 text-accent-success'
                                : 'bg-primary-500/15 text-primary-400'
                            }`}
                          >
                            <span className="text-xs font-bold font-sans">
                              {notif.type === 'wallet_credit' || notif.type === 'deposit_success' ? 'IN' : 'OUT'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-dark-300 break-words font-medium">
                              {notif.payload?.message || 'Transaction processed'}
                            </p>
                            <span className="text-[10px] text-dark-500 mt-1 block">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 border-l border-dark-800 pl-4">
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-semibold text-dark-100 leading-tight">
                {user?.name}
              </span>
              <span className="text-xs text-dark-400">
                {user?.isAdmin ? 'Administrator' : 'Verified Member'}
              </span>
            </div>
            
            <div className="relative group cursor-pointer">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover border border-dark-700 ring-2 ring-primary-500/20"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-primary-500/20 shadow-md">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
