import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  children,
  isOpen,
  onClose,
  title = '',
  size = 'md', // sm, md, lg, xl
  closeOnClickOutside = true,
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnClickOutside ? onClose : undefined}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`relative w-full ${sizes[size]} rounded-2xl bg-dark-900 border border-dark-800 p-6 shadow-2xl z-10 shadow-black/80`}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-dark-100 uppercase tracking-wider">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-dark-400 hover:bg-dark-800 hover:text-dark-100 transition-colors focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="mt-2 text-dark-200">
              {children}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
