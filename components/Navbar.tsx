import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  Bars3Icon,
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '../constants';
import UserDropdown from './UserDropdown';
import Logo from './Logo';
import NetworkStatusIndicator from './NetworkStatusIndicator';

import { AppSection } from '../services/navigationService';

interface NavbarProps {
  onNewCategory: () => void;
  currentSection?: AppSection;
  onSectionChange?: (section: AppSection) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNewCategory,
  currentSection = 'dashboard',
  onSectionChange
}) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Enhanced navigation items with better icons (removed Dashboard since logo will handle it)
  const navItems = [
    { id: 'categories', label: 'Categories', icon: TagIcon, href: '#categories', description: 'Manage categories' },
    { id: 'planning', label: 'Planning', icon: CalendarIcon, href: '#planning', description: 'Budget planning' },
    { id: 'history', label: 'History', icon: DocumentTextIcon, href: '#history', description: 'Transaction history' },
    { id: 'savings', label: 'Savings', icon: CurrencyDollarIcon, href: '#savings', description: 'Savings Calculator' },
  ];

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange && (sectionId === 'dashboard' || sectionId === 'categories' || sectionId === 'planning' || sectionId === 'history' || sectionId === 'savings')) {
      onSectionChange(sectionId as AppSection);
    }
  };

  const handleLogoClick = () => {
    if (onSectionChange) {
      onSectionChange('dashboard');
    }
  };

  if (!user) return null;

  return (
    <nav
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50'
          : 'bg-slate-900/90 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Logo
              size="medium"
              variant="full"
              onClick={handleLogoClick}
            />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(item => (
                <motion.button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`relative px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                    currentSection === item.id
                      ? 'text-sky-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.description}
                >
                  {/* Active indicator background */}
                  {currentSection === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-lg border border-sky-500/20"
                      layoutId="activeNav"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover background */}
                  <motion.div
                    className="absolute inset-0 bg-slate-800/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                  />

                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Side - Network Status, Add Button and User */}
          <div className="flex items-center space-x-3">
            {/* Network Status Indicator */}
            <NetworkStatusIndicator className="hidden md:block" />

            {/* Add Category Button */}
            <motion.button
              onClick={onNewCategory}
              className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-200 relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <PlusIcon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Add Category</span>
            </motion.button>

            {/* User Dropdown */}
            <UserDropdown
              user={user}
              navItems={navItems}
              currentSection={currentSection}
              onSectionChange={handleSectionClick}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
