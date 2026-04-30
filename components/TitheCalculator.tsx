import React, { useState } from 'react';

interface TitheCalculatorProps {
  amount: number;
  formatCurrency: (amount: number) => string;
  accent?: 'sky' | 'emerald';
  compact?: boolean;
}

const TitheCalculator: React.FC<TitheCalculatorProps> = ({
  amount,
  formatCurrency,
  accent = 'sky',
  compact = false
}) => {
  const [percentageInput, setPercentageInput] = useState('10');
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const parsedPercentage = parseFloat(percentageInput);
  const safePercentage = Number.isFinite(parsedPercentage) ? Math.max(10, parsedPercentage) : 10;
  const titheAmount = safeAmount * (safePercentage / 100);
  const accentClasses = accent === 'emerald'
    ? {
        border: 'border-emerald-500/25',
        background: 'from-emerald-500/10 to-cyan-500/10',
        text: 'text-emerald-300',
        value: 'text-emerald-400',
        range: 'accent-emerald-400',
        focus: 'focus-within:border-emerald-400 focus-within:ring-emerald-400/20'
      }
    : {
        border: 'border-sky-500/25',
        background: 'from-sky-500/10 to-violet-500/10',
        text: 'text-sky-300',
        value: 'text-sky-400',
        range: 'accent-sky-400',
        focus: 'focus-within:border-sky-400 focus-within:ring-sky-400/20'
      };

  const handleSliderChange = (value: string) => {
    setPercentageInput(value);
  };

  const handlePercentageInputChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setPercentageInput(value);
    }
  };

  const handlePercentageBlur = () => {
    if (!Number.isFinite(parsedPercentage) || parsedPercentage < 10) {
      setPercentageInput('10');
      return;
    }

    setPercentageInput(parsedPercentage.toString());
  };

  return (
    <div className={`mt-3 rounded-xl border ${accentClasses.border} bg-gradient-to-r ${accentClasses.background} ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm font-semibold ${accentClasses.text}`}>Tithe</p>
          <p className="mt-1 text-xs text-slate-400">Based on {safePercentage.toFixed(safePercentage % 1 === 0 ? 0 : 1)}%</p>
        </div>
        <div className="text-left sm:text-right">
          <p className={`text-lg font-bold tabular-nums ${accentClasses.value}`}>{formatCurrency(titheAmount)}</p>
          <p className="text-xs text-slate-400">from {formatCurrency(safeAmount)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_5.5rem] sm:items-center">
        <input
          type="range"
          min="10"
          max="100"
          step="0.5"
          value={Math.min(safePercentage, 100)}
          onChange={(event) => handleSliderChange(event.target.value)}
          className={`w-full ${accentClasses.range}`}
          aria-label="Tithe percentage"
        />
        <div className={`flex h-10 items-center rounded-lg border border-slate-600/60 bg-slate-800/70 transition-all focus-within:ring-2 ${accentClasses.focus}`}>
          <input
            type="text"
            inputMode="decimal"
            value={percentageInput}
            onChange={(event) => handlePercentageInputChange(event.target.value)}
            onBlur={handlePercentageBlur}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-100 outline-none tabular-nums"
            aria-label="Tithe percentage"
          />
          <span className="grid h-full w-10 place-items-center text-sm font-semibold leading-none text-slate-400">%</span>
        </div>
      </div>
    </div>
  );
};

export default TitheCalculator;