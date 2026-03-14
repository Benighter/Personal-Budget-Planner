import React, { memo } from 'react';
import { Category } from '../types';
import { AppSection } from '../services/navigationService';

interface DashboardProps {
  totalAllocated: number;
  categories?: Category[];
  onAddCategory?: () => void;
  onNavigateToSection?: (section: AppSection) => void;
}

const categoryCardStyles = [
  {
    gradient: 'from-sky-400 to-blue-500',
    background: 'from-sky-500/10 to-blue-500/10',
    border: 'border-sky-500/20 hover:border-sky-400/40',
  },
  {
    gradient: 'from-emerald-400 to-green-500',
    background: 'from-emerald-500/10 to-green-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
  },
  {
    gradient: 'from-purple-400 to-violet-500',
    background: 'from-purple-500/10 to-violet-500/10',
    border: 'border-purple-500/20 hover:border-purple-400/40',
  },
] as const;

const Dashboard: React.FC<DashboardProps> = ({
  totalAllocated,
  categories = [],
  onAddCategory,
  onNavigateToSection,
}) => {
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (sum, category) => sum + category.subcategories.length,
    0
  );

  const topCategories = [...categories]
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div
        className="text-center py-6"
        style={{ animation: 'fadeUp 0.4s ease both' }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-white mb-2 tracking-tight">
          Budget Dashboard
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">Get a clear overview of your financial health</p>
      </div>

      <div className="max-w-lg">
        <button
          onClick={() => onNavigateToSection?.('categories')}
          className="relative overflow-hidden bg-slate-800 p-6 rounded-2xl border border-slate-600/50 active:border-sky-400/70 shadow-xl shadow-slate-900/50 active:scale-95 transition-transform duration-100 group text-left w-full focus:outline-none"
          style={{ animation: 'fadeUp 0.3s ease both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 opacity-0 group-active:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 tracking-wide uppercase">Active Categories</p>
              <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-300 mb-2 tabular-nums">
                {totalCategories}
              </p>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 bg-sky-400 rounded-full mr-2"></div>
                {totalSubcategories} subcategories
              </div>
            </div>

            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center transition-transform duration-200 group-active:scale-105">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full w-0 group-active:w-full transition-[width] duration-300" />
        </button>
      </div>

      {topCategories.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-600/50 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Top Categories</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Budget allocation breakdown</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToSection?.('categories')}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-400 hover:text-sky-300 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-sky-500/30 hover:border-sky-400/50 transition-all duration-300 group backdrop-blur-sm text-sm"
            >
              <span className="font-medium">View All</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {topCategories.map((category, index) => {
              const percentage = totalAllocated > 0 ? (category.allocatedAmount / totalAllocated) * 100 : 0;
              const style = categoryCardStyles[index] ?? categoryCardStyles[categoryCardStyles.length - 1];

              return (
                <button
                  key={category.id}
                  onClick={() => onNavigateToSection?.('categories')}
                  className={`w-full group relative overflow-hidden bg-gradient-to-r ${style.background} backdrop-blur-sm border ${style.border} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-lg hover:shadow-xl`}
                >
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`relative w-10 h-10 bg-gradient-to-br ${style.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="text-white font-bold text-sm relative z-10">{category.name.charAt(0)}</span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h4 className="text-white font-bold text-base group-hover:text-sky-100 transition-colors duration-200 truncate">{category.name}</h4>
                          <p className="text-slate-400 text-xs font-medium">{percentage.toFixed(1)}% of budget</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${style.gradient} flex-shrink-0`}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-16 sm:w-20 bg-slate-600/50 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{category.subcategories.length} items</span>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${style.gradient} px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-slate-900/30`}>
                          Top {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className={`relative w-14 h-14 bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="text-white font-bold text-lg relative z-10">{category.name.charAt(0)}</span>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h4 className="text-white font-bold text-lg group-hover:text-sky-100 transition-colors duration-200 truncate">{category.name}</h4>
                          <p className="text-slate-400 text-sm font-medium">{percentage.toFixed(1)}% of budget</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-12 bg-slate-600/50 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-500`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500">{category.subcategories.length} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${style.gradient} px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-slate-900/30`}>
                          Top {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4 sm:px-8 bg-gradient-to-br from-sky-900/30 to-purple-900/30 rounded-xl sm:rounded-2xl border border-sky-500/30">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Welcome to Your Budget Dashboard!</h3>
          <p className="text-slate-300 text-base sm:text-lg mb-6 max-w-md mx-auto">
            Take control of your finances by creating your first budget category.
          </p>
          <button
            onClick={onAddCategory}
            className="bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Create Your First Category
          </button>
        </div>
      )}
    </div>
  );
};

const DashboardMemo: React.FC<DashboardProps> = (props) => (
  <>
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <Dashboard {...props} />
  </>
);

export default memo(DashboardMemo);
