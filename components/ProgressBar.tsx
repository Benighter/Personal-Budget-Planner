
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  gradientClass?: string;
  heightClass?: string;
  showPercentage?: boolean;
  showShine?: boolean;
  showGlow?: boolean;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  colorClass = 'bg-sky-500',
  gradientClass = 'from-sky-500 via-sky-400 to-violet-500',
  heightClass = 'h-2',
  showPercentage = false,
  showShine = true,
  showGlow = true,
  animated = true
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const cappedPercentage = Math.max(0, Math.min(100, percentage));
  const isOverLimit = percentage > 100;

  // Determine colors based on percentage
  const getGradientClass = () => {
    if (isOverLimit) {
      return 'from-red-500 via-red-400 to-orange-500';
    }
    return gradientClass;
  };

  const getShadowClass = () => {
    if (isOverLimit) {
      return 'shadow-lg shadow-red-500/50';
    }
    return 'shadow-lg shadow-sky-500/50';
  };

  return (
    <div className="relative w-full">
      <div className={`relative w-full bg-slate-700/50 rounded-full ${heightClass} overflow-hidden backdrop-blur-sm border border-slate-600/30`}>
        {/* Background shimmer effect */}
        {showShine && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}

        {/* Progress bar with gradient */}
        {animated ? (
          <motion.div
            className={`relative ${heightClass} rounded-full bg-gradient-to-r ${getGradientClass()}`}
            initial={{ width: 0 }}
            animate={{ width: `${cappedPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Shine effect */}
            {showShine && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
            )}

            {/* Glow effect */}
            {showGlow && (
              <div className={`absolute inset-0 ${getShadowClass()}`} />
            )}
          </motion.div>
        ) : (
          <div
            className={`relative ${heightClass} rounded-full bg-gradient-to-r ${getGradientClass()} transition-all duration-500 ease-out`}
            style={{ width: `${cappedPercentage}%` }}
          >
            {/* Shine effect */}
            {showShine && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
            )}

            {/* Glow effect */}
            {showGlow && (
              <div className={`absolute inset-0 ${getShadowClass()}`} />
            )}
          </div>
        )}

        {/* Percentage indicator */}
        {showPercentage && cappedPercentage > 5 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 right-2 text-xs font-bold text-white drop-shadow-lg tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {percentage.toFixed(0)}%
          </motion.div>
        )}
      </div>

      {/* External percentage display for smaller bars */}
      {showPercentage && cappedPercentage <= 5 && (
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 tabular-nums">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
