# UI Redesign - Code Examples & Before/After

## 1. Enhanced Dashboard Stats Cards

### BEFORE (Current)
```tsx
<button 
  onClick={() => onNavigateToSection?.('categories')}
  className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 hover:border-sky-500 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50 transform hover:scale-105"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">Active Categories</p>
      <p className="text-3xl font-bold text-sky-400 mb-2">{totalCategories}</p>
    </div>
    <div className="w-14 h-14 bg-sky-500/20 rounded-xl flex items-center justify-center">
      <svg className="w-7 h-7 text-sky-400" />
    </div>
  </div>
</button>
```

### AFTER (Proposed)
```tsx
<motion.button 
  onClick={() => onNavigateToSection?.('categories')}
  className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-700/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-600/50 hover:border-sky-400/70 shadow-xl shadow-slate-900/50 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50"
  whileHover={{ scale: 1.03, y: -4 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Animated background gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  {/* Glow effect */}
  <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-violet-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
  
  <div className="relative flex items-center justify-between">
    <div className="flex-1">
      <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide uppercase">Active Categories</p>
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-300 mb-2 tabular-nums">{totalCategories}</p>
      <div className="flex items-center text-xs text-slate-500">
        <div className="w-2 h-2 bg-sky-400 rounded-full mr-2 animate-pulse"></div>
        {totalSubcategories} subcategories
      </div>
    </div>
    
    {/* Enhanced icon container */}
    <motion.div 
      className="relative w-16 h-16 bg-gradient-to-br from-sky-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center group-hover:from-sky-500/30 group-hover:to-violet-500/30 transition-all duration-300"
      whileHover={{ rotate: 5, scale: 1.1 }}
    >
      {/* Pulsing ring */}
      <div className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping opacity-0 group-hover:opacity-75" />
      <svg className="w-8 h-8 text-sky-400 relative z-10" />
    </motion.div>
  </div>
  
  {/* Bottom accent line */}
  <motion.div 
    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
    initial={{ width: 0 }}
    whileHover={{ width: '100%' }}
    transition={{ duration: 0.3 }}
  />
</motion.button>
```

---

## 2. Enhanced Progress Bars

### BEFORE (Current)
```tsx
<div className="w-full bg-slate-600 rounded-full h-2 sm:h-3">
  <div 
    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
      allocationPercentage > 100 ? 'bg-red-500' : 'bg-sky-400'
    }`}
    style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
  ></div>
</div>
```

### AFTER (Proposed)
```tsx
<div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-slate-600/30">
  {/* Background shimmer effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
  
  {/* Progress bar with gradient */}
  <motion.div 
    className={`relative h-3 rounded-full ${
      allocationPercentage > 100 
        ? 'bg-gradient-to-r from-red-500 via-red-400 to-orange-500' 
        : 'bg-gradient-to-r from-sky-500 via-sky-400 to-violet-500'
    }`}
    initial={{ width: 0 }}
    animate={{ width: `${Math.min(allocationPercentage, 100)}%` }}
    transition={{ duration: 1, ease: "easeOut" }}
  >
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide" />
    
    {/* Glow effect */}
    <div className={`absolute inset-0 ${
      allocationPercentage > 100 ? 'shadow-lg shadow-red-500/50' : 'shadow-lg shadow-sky-500/50'
    }`} />
  </motion.div>
  
  {/* Percentage indicator */}
  {allocationPercentage > 5 && (
    <motion.div 
      className="absolute top-1/2 -translate-y-1/2 right-2 text-xs font-bold text-white drop-shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {allocationPercentage.toFixed(0)}%
    </motion.div>
  )}
</div>

{/* Add to index.html or CSS */}
<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
  .animate-slide {
    animation: slide 2s infinite;
  }
</style>
```

---

## 3. Enhanced Category Card Header

### BEFORE (Current)
```tsx
<div className="flex items-start justify-between mb-4">
  <div className="flex items-start gap-3 min-w-0 flex-1">
    <motion.div
      className={`relative w-12 h-12 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
      whileHover={{ rotate: 5, scale: 1.1 }}
    >
      <span className="text-white font-bold text-lg">
        {category.name.charAt(0).toUpperCase()}
      </span>
    </motion.div>
  </div>
</div>
```

### AFTER (Proposed)
```tsx
<div className="flex items-start justify-between mb-4">
  <div className="flex items-start gap-3 min-w-0 flex-1">
    {/* Enhanced icon with multiple layers */}
    <motion.div
      className="relative flex-shrink-0"
      whileHover={{ scale: 1.05 }}
    >
      {/* Outer glow ring */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} rounded-2xl blur-md opacity-50`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main icon container */}
      <motion.div
        className={`relative w-14 h-14 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center shadow-xl`}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5 }}
      >
        {/* Inner shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl" />
        
        {/* Letter */}
        <span className="text-white font-bold text-xl drop-shadow-lg relative z-10">
          {category.name.charAt(0).toUpperCase()}
        </span>
        
        {/* Completion badge with particle effect */}
        {completionRate === 100 && hasSubcategories && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
            {/* Particle burst effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
    
    {/* Category info with enhanced typography */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 truncate tracking-tight">
          {category.name}
        </h3>
        {hasSubcategories && (
          <motion.button
            onClick={onToggleExpand}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <ChevronDownIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <p className="text-sm text-slate-300 font-medium tabular-nums">
          Budget: {formatCurrency(category.allocatedAmount, category.isAmountHidden)}
        </p>
        {hasSubcategories && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded-full">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{completedSubcategories}/{category.subcategories.length} done</span>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
```

---

## 4. Enhanced Modal Design

### BEFORE (Current)
```tsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
  <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-sky-400">{title}</h2>
      <button onClick={onClose}>
        <XMarkIcon className="w-7 h-7" />
      </button>
    </div>
    {children}
  </div>
</div>
```

### AFTER (Proposed)
```tsx
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
        className="relative bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-600/50 overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-violet-500 to-pink-500 animate-gradient" />
        </div>
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500" />
        
        {/* Header */}
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
            {title}
          </h2>
          <motion.button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
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
```

---

## 5. Enhanced Button Styles

### Primary Button (AFTER)
```tsx
<motion.button
  className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 group"
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Shine effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
  
  <span className="relative z-10 flex items-center gap-2">
    <PlusIcon className="w-5 h-5" />
    Add Category
  </span>
</motion.button>
```

### Secondary Button (AFTER)
```tsx
<motion.button
  className="relative overflow-hidden bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm text-slate-200 hover:text-white font-medium px-6 py-3 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all duration-300 group"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <span className="relative z-10 flex items-center gap-2">
    Cancel
  </span>
</motion.button>
```

### Icon Button (AFTER)
```tsx
<motion.button
  className="relative p-3 text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-600/50 rounded-xl transition-all duration-200 group"
  whileHover={{ scale: 1.1, rotate: 5 }}
  whileTap={{ scale: 0.9 }}
>
  {/* Ripple effect on click */}
  <motion.div
    className="absolute inset-0 bg-sky-400/20 rounded-xl"
    initial={{ scale: 0, opacity: 1 }}
    whileTap={{ scale: 2, opacity: 0 }}
    transition={{ duration: 0.4 }}
  />
  <PencilIcon className="w-5 h-5 relative z-10" />
</motion.button>
```

---

## 6. Enhanced Input Fields

### AFTER (Proposed)
```tsx
<div className="relative group">
  <label 
    htmlFor="categoryName" 
    className="block text-sm font-medium text-slate-300 mb-2 transition-colors group-focus-within:text-sky-400"
  >
    Category Name
  </label>
  
  <div className="relative">
    <input
      type="text"
      id="categoryName"
      className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 outline-none"
      placeholder="Enter category name..."
    />
    
    {/* Focus indicator line */}
    <motion.div 
      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500"
      initial={{ width: 0 }}
      whileFocus={{ width: '100%' }}
      transition={{ duration: 0.3 }}
    />
  </div>
  
  {/* Helper text */}
  <p className="mt-1.5 text-xs text-slate-400">
    Choose a descriptive name for your category
  </p>
</div>
```

---

## 7. Mobile-Specific Enhancements

### Bottom Sheet Modal (Mobile)
```tsx
<motion.div
  className="fixed inset-x-0 bottom-0 z-50 md:relative md:rounded-2xl"
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 30, stiffness: 300 }}
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  dragElastic={0.2}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.y > 100 || velocity.y > 500) {
      onClose();
    }
  }}
>
  {/* Drag handle */}
  <div className="flex justify-center pt-3 pb-2 md:hidden">
    <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
  </div>
  
  {/* Content */}
  <div className="bg-slate-800 rounded-t-3xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
    {children}
  </div>
</motion.div>
```

### Floating Action Button (Mobile)
```tsx
<motion.button
  className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center text-white z-40 md:hidden"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  drag
  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
  dragElastic={0.7}
>
  <PlusIcon className="w-6 h-6" />
  
  {/* Pulsing ring */}
  <motion.div
    className="absolute inset-0 rounded-full bg-sky-400"
    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
  />
</motion.button>
```


