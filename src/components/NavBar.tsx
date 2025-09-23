"use client";

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ChartBarIcon, CalendarDaysIcon, HomeIcon } from '@heroicons/react/24/outline';

interface NavTab {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

const tabs: NavTab[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Pacing', 
    href: '/pacing', 
    icon: ChartBarIcon,
    description: 'Performance Tracking'
  },
  { 
    name: 'Yearly Performance', 
    href: '/yearly-performance', 
    icon: CalendarDaysIcon,
    description: 'Annual Reports'
  },
];

interface NavBarProps {
  className?: string;
}

const NavBar = memo(function NavBar({ className }: NavBarProps) {
  const pathname = usePathname();

  const activeTabIndex = useMemo(() => {
    return tabs.findIndex(tab => 
      tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
    );
  }, [pathname]);

  const tabElements = useMemo(() => {
    return tabs.map((tab, index) => {
      const isActive = index === activeTabIndex;
      const Icon = tab.icon;
      
      return (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "relative group px-4 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm",
            "hover:scale-105 active:scale-95 flex items-center gap-2",
            "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900",
            isActive
              ? "text-white font-semibold shadow-lg"
              : "text-blue-100 hover:text-white hover:bg-blue-800/30"
          )}
        >
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg border border-blue-500/30"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {tab.name}
          </span>
          
          {/* Tooltip */}
          {tab.description && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {tab.description}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </Link>
      );
    });
  }, [activeTabIndex]);

  return (
    <nav className={cn(
      "w-full flex justify-center items-center mb-8",
      "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900",
      "shadow-2xl border-b border-blue-700/50",
      "h-16 sticky top-0 z-50 backdrop-blur-xl",
      className
    )}>
      <div className="flex items-center justify-between w-full max-w-7xl px-6">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <Link 
            href="/" 
            className="text-xl font-bold text-white tracking-tight select-none hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 rounded-md px-1"
          >
            Shopify Analytics
          </Link>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="flex gap-1 bg-blue-800/30 p-1 rounded-xl backdrop-blur-sm border border-blue-700/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabElements}
        </motion.div>

        {/* Right Section - User/Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
        </motion.div>
      </div>
    </nav>
  );
});

export default NavBar;