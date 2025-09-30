
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-600/50 overflow-hidden max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-violet-500 to-pink-500 animate-gradient bg-400%" />
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500" />

            {/* Header */}
            <div className="relative flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 tracking-tight">
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="relative">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
