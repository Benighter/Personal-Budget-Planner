
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubcategoryFormProps } from '../types';
import { useToast } from '../hooks/useToast';

const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  onSubmit,
  onClose,
  existingSubcategory,
  parentCategoryName,
  maxAllocatableAmount,
  selectedCurrency
}) => {
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (existingSubcategory) {
      setName(existingSubcategory.name);
      setAllocatedAmount(existingSubcategory.allocatedAmount.toString());
    } else {
      setName('');
      setAllocatedAmount('');
    }
  }, [existingSubcategory]);

  const formatAmountForAlert = (amount: number) => {
    try {
      return amount.toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch(e) {
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocatedAmount);
    if (name.trim() && !isNaN(amount) && amount >= 0) {
      if (maxAllocatableAmount !== undefined && amount > maxAllocatableAmount) {
        addToast(
          `The allocation of ${formatAmountForAlert(amount)} exceeds the available funds for this subcategory within '${parentCategoryName}'. ` +
          `The maximum you can allocate is ${formatAmountForAlert(maxAllocatableAmount)}. Please enter a smaller amount or adjust the parent category's allocation.`,
          'error'
        );
        return;
      }
      onSubmit(name.trim(), amount);
    } else {
      addToast("Please enter a valid name and a non-negative amount.", 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Parent Category Info */}
      {parentCategoryName && (
        <motion.div
          className="p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-slate-300">
            {existingSubcategory ? 'Editing subcategory in:' : 'Adding subcategory to:'}{' '}
            <span className="font-bold text-emerald-400">{parentCategoryName}</span>
          </p>
        </motion.div>
      )}

      {/* Subcategory Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label
          htmlFor="subcategoryName"
          className="block text-sm font-semibold text-slate-300 mb-2 transition-colors group-focus-within:text-emerald-400"
        >
          Subcategory Name
        </label>
        <div className="relative group">
          <input
            type="text"
            id="subcategoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 outline-none"
            placeholder="e.g., Groceries, Transport"
            required
          />
          {/* Focus indicator line */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Choose a specific name for this subcategory
        </p>
      </motion.div>

      {/* Allocated Amount Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label
          htmlFor="subcategoryAmount"
          className="block text-sm font-semibold text-slate-300 mb-2 transition-colors group-focus-within:text-emerald-400"
        >
          Allocated Amount ({selectedCurrency})
        </label>
        <div className="relative group">
          <input
            type="number"
            id="subcategoryAmount"
            value={allocatedAmount}
            onChange={(e) => setAllocatedAmount(e.target.value)}
            className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 outline-none tabular-nums"
            placeholder="e.g., 150"
            min="0"
            step="any"
            required
          />
          {/* Focus indicator line */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
        <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <p className="text-xs text-slate-400">
            Available within parent category: {formatAmountForAlert(maxAllocatableAmount)}
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row justify-end gap-3 pt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          type="button"
          onClick={onClose}
          className="relative overflow-hidden bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm text-slate-200 hover:text-white font-medium px-6 py-3 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all duration-300 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10">Cancel</span>
        </motion.button>

        <motion.button
          type="submit"
          className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

          <span className="relative z-10">
            {existingSubcategory ? 'Save Changes' : 'Add Subcategory'}
          </span>
        </motion.button>
      </motion.div>
    </form>
  );
};

export default SubcategoryForm;