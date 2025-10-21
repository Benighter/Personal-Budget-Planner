
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CategoryFormProps, CategoryFormPropsEdit } from '../types';
import { useToast } from '../hooks/useToast';

const CategoryForm: React.FC<CategoryFormProps> = (props) => {
  const {
    onSubmit,
    onClose,
    existingCategory,
    maxAllocatableAmount,
    selectedCurrency
  } = props;

  const { addToast } = useToast();

  const minAllocatableAmountForEdit = existingCategory
    ? (props as CategoryFormPropsEdit).minAllocatableAmountForEdit
    : undefined;

  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [isCumulativeMode, setIsCumulativeMode] = useState(false);
  const [showReallocationPrompt, setShowReallocationPrompt] = useState(false);
  const [reallocationDetails, setReallocationDetails] = useState<{
    requestedAmount: number;
    shortfall: number;
    availableBudget: number;
  } | null>(null);

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setAllocatedAmount(existingCategory.allocatedAmount.toString());
    } else {
      setName('');
      setAllocatedAmount('');
    }
    setIsCumulativeMode(false);
    setShowReallocationPrompt(false);
    setReallocationDetails(null);
  }, [existingCategory]);

  const formatAmountForAlert = (amount: number) => {
    try {
      return amount.toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputAmount = parseFloat(allocatedAmount);

    if (!name.trim() || isNaN(inputAmount) || inputAmount < 0) {
      addToast("Please enter a valid name and a non-negative amount.", 'error');
      return;
    }

    // Calculate final amount based on cumulative mode
    let finalAmount = inputAmount;
    if (existingCategory && isCumulativeMode) {
      finalAmount = existingCategory.allocatedAmount + inputAmount;
    }

    // Check minimum allocation for subcategories
    if (existingCategory && minAllocatableAmountForEdit !== undefined && finalAmount < minAllocatableAmountForEdit) {
      addToast(
        `The new allocation of ${formatAmountForAlert(finalAmount)} is less than the total amount already allocated to its subcategories (${formatAmountForAlert(minAllocatableAmountForEdit)}). ` +
        `Please adjust subcategories first or increase this category's allocation.`,
        'error'
      );
      return;
    }

    // Check if exceeds available budget
    if (maxAllocatableAmount !== undefined && finalAmount > maxAllocatableAmount) {
      const shortfall = finalAmount - maxAllocatableAmount;

      // Check if there's any unallocated budget available (this would be in the parent component)
      // For now, we'll show the reallocation prompt
      setReallocationDetails({
        requestedAmount: finalAmount,
        shortfall: shortfall,
        availableBudget: maxAllocatableAmount
      });
      setShowReallocationPrompt(true);
      return;
    }

    onSubmit(name.trim(), finalAmount);
  };

  const handleReallocationConfirm = () => {
    if (reallocationDetails) {
      // Submit with the requested amount - the parent will handle the reallocation
      onSubmit(name.trim(), reallocationDetails.requestedAmount);
      setShowReallocationPrompt(false);
      setReallocationDetails(null);
    }
  };

  const handleReallocationCancel = () => {
    setShowReallocationPrompt(false);
    setReallocationDetails(null);
  };

  return (
    <>
      {/* Reallocation Confirmation Modal */}
      {showReallocationPrompt && reallocationDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 text-amber-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Budget Reallocation Required
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  The allocation of {formatAmountForAlert(reallocationDetails.requestedAmount)} exceeds the available budget by {formatAmountForAlert(reallocationDetails.shortfall)}.
                  {'\n\n'}
                  Would you like to automatically reallocate {formatAmountForAlert(reallocationDetails.shortfall)} from the remaining available budget to cover this allocation?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleReallocationCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReallocationConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-all duration-200"
                  >
                    Reallocate Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label
            htmlFor="categoryName"
            className="block text-sm font-semibold text-slate-300 mb-2 transition-colors group-focus-within:text-sky-400"
          >
            Category Name
          </label>
          <div className="relative group">
            <input
              type="text"
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 outline-none"
              placeholder="e.g., Savings, Expenses"
              required
            />
            {/* Focus indicator line */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Choose a descriptive name for your category
          </p>
        </motion.div>

      {/* Allocated Amount Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label
          htmlFor="categoryAmount"
          className="block text-sm font-semibold text-slate-300 mb-2 transition-colors group-focus-within:text-sky-400"
        >
          {isCumulativeMode && existingCategory ? 'Amount to Add' : 'Allocated Amount'} ({selectedCurrency})
        </label>
        <div className="relative group">
          <input
            type="number"
            id="categoryAmount"
            value={allocatedAmount}
            onChange={(e) => setAllocatedAmount(e.target.value)}
            className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 outline-none tabular-nums"
            placeholder="e.g., 500"
            min="0"
            step="any"
            required
          />
          {/* Focus indicator line */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* Cumulative Mode Toggle - Only show when editing */}
        {existingCategory && (
          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isCumulativeMode}
                onChange={(e) => setIsCumulativeMode(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <span className="ml-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                Add to existing amount ({formatAmountForAlert(existingCategory.allocatedAmount)})
              </span>
            </label>
            {isCumulativeMode && allocatedAmount && (
              <p className="mt-2 text-xs text-emerald-400 font-semibold">
                New total will be: {formatAmountForAlert(existingCategory.allocatedAmount + (parseFloat(allocatedAmount) || 0))}
              </p>
            )}
          </div>
        )}

        <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <p className="text-xs text-slate-400">
            {existingCategory && minAllocatableAmountForEdit !== undefined
              ? `Max based on income: ${formatAmountForAlert(maxAllocatableAmount)}. Min for subcategories: ${formatAmountForAlert(minAllocatableAmountForEdit ?? 0)}`
              : `Available for new category: ${formatAmountForAlert(maxAllocatableAmount)}`}
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
          className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

          <span className="relative z-10">
            {existingCategory ? 'Save Changes' : 'Add Category'}
          </span>
        </motion.button>
      </motion.div>
    </form>
    </>
  );
};

export default CategoryForm;