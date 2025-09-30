# BudgetFlow UI Style Guide

## Design Philosophy
**Modern • Elegant • Accessible • Delightful**

This style guide defines the visual language for BudgetFlow, ensuring consistency across all components and screens while maintaining excellent mobile responsiveness.

---

## Color Palette

### Primary Colors
```css
/* Sky Blue - Primary Brand Color */
--color-primary-50:  #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;  /* Main accent */
--color-primary-500: #0ea5e9;  /* Primary */
--color-primary-600: #0284c7;  /* Hover states */
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;
```

### Secondary Colors
```css
/* Violet - Secondary Accent */
--color-secondary-400: #a78bfa;
--color-secondary-500: #8b5cf6;
--color-secondary-600: #7c3aed;

/* Emerald - Success */
--color-success-400: #34d399;
--color-success-500: #10b981;
--color-success-600: #059669;

/* Amber - Warning */
--color-warning-400: #fbbf24;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Red - Danger */
--color-danger-400: #f87171;
--color-danger-500: #ef4444;
--color-danger-600: #dc2626;

/* Cyan - Info */
--color-info-400: #22d3ee;
--color-info-500: #06b6d4;
--color-info-600: #0891b2;
```

### Neutral Colors (Dark Theme)
```css
/* Slate - Base Colors */
--color-slate-50:  #f8fafc;
--color-slate-100: #f1f5f9;
--color-slate-200: #e2e8f0;
--color-slate-300: #cbd5e1;
--color-slate-400: #94a3b8;  /* Muted text */
--color-slate-500: #64748b;
--color-slate-600: #475569;  /* Borders */
--color-slate-700: #334155;  /* Elevated surfaces */
--color-slate-800: #1e293b;  /* Cards */
--color-slate-900: #0f172a;  /* Background */
--color-slate-950: #020617;
```

### Gradient Combinations
```css
/* Primary Gradients */
--gradient-primary: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
--gradient-vibrant: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%);

/* Glass Morphism */
--glass-light: rgba(30, 41, 59, 0.7);
--glass-medium: rgba(51, 65, 85, 0.5);
--glass-heavy: rgba(71, 85, 105, 0.3);
```

---

## Typography

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes (Mobile-First)
```css
/* Base sizes (mobile) */
--text-xs:   0.75rem;  /* 12px */
--text-sm:   0.875rem; /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg:   1.125rem; /* 18px */
--text-xl:   1.25rem;  /* 20px */
--text-2xl:  1.5rem;   /* 24px */
--text-3xl:  1.875rem; /* 30px */
--text-4xl:  2.25rem;  /* 36px */

/* Tablet (640px+) - Scale up by 1.1x */
@media (min-width: 640px) {
  --text-base: 1.1rem;
  --text-lg:   1.25rem;
  --text-xl:   1.375rem;
  --text-2xl:  1.65rem;
  --text-3xl:  2.0625rem;
  --text-4xl:  2.475rem;
}

/* Desktop (1024px+) - Scale up by 1.25x */
@media (min-width: 1024px) {
  --text-base: 1.125rem;
  --text-lg:   1.4rem;
  --text-xl:   1.5625rem;
  --text-2xl:  1.875rem;
  --text-3xl:  2.34375rem;
  --text-4xl:  2.8125rem;
}
```

### Font Weights
```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight:   1.25;  /* Headings */
--leading-snug:    1.375; /* Subheadings */
--leading-normal:  1.5;   /* Body text */
--leading-relaxed: 1.625; /* Large body text */
--leading-loose:   1.75;  /* Spacious text */
```

### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight:   -0.025em; /* Headings */
--tracking-normal:   0em;
--tracking-wide:     0.025em; /* Uppercase labels */
--tracking-wider:    0.05em;
```

### Typography Scale Usage
```tsx
// Display (Hero sections)
className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"

// Heading 1 (Page titles)
className="text-2xl sm:text-3xl font-bold tracking-tight"

// Heading 2 (Section titles)
className="text-xl sm:text-2xl font-semibold"

// Heading 3 (Card titles)
className="text-lg sm:text-xl font-semibold"

// Body Large
className="text-base sm:text-lg font-normal leading-relaxed"

// Body (Default)
className="text-sm sm:text-base font-normal leading-normal"

// Caption
className="text-xs sm:text-sm font-medium"

// Micro (Helper text)
className="text-xs text-slate-400"

// Currency (Financial data)
className="text-2xl sm:text-3xl font-bold tabular-nums"
```

---

## Spacing System

### Base Scale
```css
--space-0:   0;
--space-px:  1px;
--space-0-5: 0.125rem; /* 2px */
--space-1:   0.25rem;  /* 4px */
--space-1-5: 0.375rem; /* 6px */
--space-2:   0.5rem;   /* 8px */
--space-2-5: 0.625rem; /* 10px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
```

### Responsive Spacing
```tsx
// Compact (Mobile)
className="p-4 gap-3"

// Comfortable (Tablet)
className="p-4 sm:p-6 gap-3 sm:gap-4"

// Spacious (Desktop)
className="p-4 sm:p-6 lg:p-8 gap-3 sm:gap-4 lg:gap-6"
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.375rem; /* 6px */
--radius-lg:   0.5rem;   /* 8px */
--radius-xl:   0.75rem;  /* 12px */
--radius-2xl:  1rem;     /* 16px */
--radius-3xl:  1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Usage
```tsx
// Buttons
className="rounded-xl"  /* 12px */

// Cards
className="rounded-2xl" /* 16px */

// Modals
className="rounded-2xl" /* 16px */

// Pills/Badges
className="rounded-full"

// Input fields
className="rounded-xl"  /* 12px */
```

---

## Shadows

### Elevation System
```css
/* Subtle */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Default */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Elevated */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* High */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Highest */
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored Shadows (for emphasis) */
--shadow-sky: 0 10px 30px -5px rgba(14, 165, 233, 0.3);
--shadow-violet: 0 10px 30px -5px rgba(139, 92, 246, 0.3);
--shadow-emerald: 0 10px 30px -5px rgba(16, 185, 129, 0.3);
```

### Usage
```tsx
// Cards (default)
className="shadow-xl"

// Cards (hover)
className="hover:shadow-2xl hover:shadow-sky-500/20"

// Buttons
className="shadow-lg shadow-sky-500/30"

// Modals
className="shadow-2xl"

// Floating elements
className="shadow-2xl shadow-slate-900/50"
```

---

## Animation & Transitions

### Duration
```css
--duration-fast:   150ms;
--duration-normal: 200ms;
--duration-slow:   300ms;
--duration-slower: 500ms;
```

### Easing
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Animations
```tsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}

// Slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Scale in
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: "spring", damping: 20 }}

// Hover lift
whileHover={{ y: -4, scale: 1.02 }}
transition={{ duration: 0.2 }}

// Tap feedback
whileTap={{ scale: 0.95 }}

// Stagger children
variants={{
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
}}
```

---

## Component Patterns

### Glass Morphism Card
```tsx
className="
  bg-slate-800/80 
  backdrop-blur-xl 
  border border-slate-600/50 
  rounded-2xl 
  shadow-xl
"
```

### Gradient Button
```tsx
className="
  bg-gradient-to-r from-sky-500 to-violet-500
  hover:from-sky-600 hover:to-violet-600
  text-white font-semibold
  px-6 py-3 rounded-xl
  shadow-lg shadow-sky-500/30
  hover:shadow-xl hover:shadow-sky-500/40
  transition-all duration-300
"
```

### Input Field
```tsx
className="
  w-full
  bg-slate-700/50 backdrop-blur-sm
  border border-slate-600/50
  focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20
  rounded-xl px-4 py-3
  text-white placeholder-slate-400
  transition-all duration-200
  outline-none
"
```

### Progress Bar
```tsx
<div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-slate-600/30">
  <motion.div 
    className="h-3 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-violet-500 shadow-lg shadow-sky-500/50"
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ duration: 1, ease: "easeOut" }}
  />
</div>
```

---

## Accessibility

### Focus States
```tsx
className="
  focus:outline-none
  focus:ring-2 focus:ring-sky-500/50
  focus:ring-offset-2 focus:ring-offset-slate-900
"
```

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Use `text-slate-300` or lighter for body text on dark backgrounds
- Use `text-white` for headings and important text

### Touch Targets
- Minimum 44x44px for all interactive elements on mobile
- Use `p-3` (12px) minimum for buttons
- Increase spacing between interactive elements

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile First */
/* xs: 0px - 639px (default) */

/* Small tablets */
sm: 640px

/* Tablets */
md: 768px

/* Small desktops */
lg: 1024px

/* Large desktops */
xl: 1280px

/* Extra large */
2xl: 1536px
```

### Usage Pattern
```tsx
// Mobile: Stack vertically, compact spacing
// Tablet: 2 columns, comfortable spacing
// Desktop: 4 columns, spacious layout
className="
  grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4
  gap-4 sm:gap-6 lg:gap-8
  p-4 sm:p-6 lg:p-8
"
```

---

## Icon System

### Sizes
```tsx
// Small (mobile buttons)
className="w-4 h-4"

// Medium (default)
className="w-5 h-5"

// Large (feature icons)
className="w-6 h-6"

// Extra large (hero sections)
className="w-8 h-8"
```

### Colors
```tsx
// Default
className="text-slate-400"

// Hover
className="text-slate-400 hover:text-white"

// Active
className="text-sky-400"

// Success
className="text-emerald-400"

// Warning
className="text-amber-400"

// Danger
className="text-red-400"
```


