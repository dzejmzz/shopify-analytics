"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HomeIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';

interface SidebarSection {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description?: string;
  children?: Array<{
    name: string;
    href: string;
    description?: string;
  }>;
}

const sidebarSections: SidebarSection[] = [
  {
    name: "Dashboard",
    icon: HomeIcon,
    href: "/",
    description: "Main overview and analytics",
  },
  {
    name: "Pacing",
    icon: ChartBarIcon,
    href: "/pacing/overview",
    description: "Performance tracking and monitoring",
    children: [
      { name: "Overview", href: "/pacing/overview", description: "General pacing metrics" },
      { name: "App/Campaign Split", href: "/pacing/app-campaign-split", description: "Campaign performance breakdown" },
      { name: "Install Tracker", href: "/pacing/install-tracker", description: "Installation tracking" },
      { name: "Budget Tracker", href: "/pacing/budget-tracker", description: "Budget monitoring" },
      { name: "Yesterday vs. Day Before", href: "/pacing/yesterday-vs-day-before", description: "Daily comparisons" },
      { name: "Ad Visibility", href: "/pacing/ad-visibility", description: "Advertisement visibility metrics" },
    ],
  },
  {
    name: "Yearly Performance",
    icon: CalendarIcon,
    href: "/yearly-performance/overview",
    description: "Annual performance analysis",
    children: [
      { name: "Overview", href: "/yearly-performance/overview", description: "Annual summary" },
      { name: "Month to Month", href: "/yearly-performance/month-to-month", description: "Monthly comparisons" },
      { name: "Country Split", href: "/yearly-performance/country-split", description: "Geographic performance" },
      { name: "Plan Split", href: "/yearly-performance/plan-split", description: "Plan-based analysis" },
      { name: "Device Split", href: "/yearly-performance/device-split", description: "Device performance breakdown" },
    ],
  },
  {
    name: 'Search Term Report',
    icon: MagnifyingGlassIcon,
    href: '/search-term/overview',
    description: "Search term analytics",
    children: [
      { name: 'Overview', href: '/search-term/overview', description: "Search term summary" },
    ],
  },
];

// Helper to get the base path (e.g., '/pacing' from '/pacing/overview')
function getBasePath(href: string) {
  const parts = href.split('/').filter(Boolean);
  return parts.length > 0 ? '/' + parts[0] : href;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Find which section is active
  const activeSectionIdx = sidebarSections.findIndex((section, idx) => {
    const basePath = getBasePath(section.href);
    if (idx === 0 && section.href === '/') {
      // Only match root Overview if exactly on '/'
      return pathname === '/';
    }
    if (section.children) {
      // Expand if on the section's base path, overview, or any child page
      if (pathname === section.href || pathname.startsWith(basePath)) return true;
      return section.children.some(child => pathname === child.href || pathname.startsWith(child.href));
    }
    return pathname === section.href || pathname.startsWith(section.href);
  });

  return (
    <motion.aside 
      className={cn(
        "flex flex-col min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950",
        "border-r border-blue-800/50 shadow-2xl backdrop-blur-xl",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-800/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Analytics</h1>
                <p className="text-xs text-blue-200">Dashboard</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg bg-blue-800/30 hover:bg-blue-700/50 text-blue-200 hover:text-white",
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <Bars3Icon className="w-5 h-5" />
            ) : (
              <XMarkIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarSections.map((section, idx) => {
          const isActive = idx === activeSectionIdx;
          const Icon = section.icon;
          const hasChildren = section.children && section.children.length > 0;
          
          return (
            <div key={section.name} className="space-y-1">
              {/* Main Section Link */}
              <Link href={section.href} className="block">
                <motion.div
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    "hover:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-blue-400",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg" 
                      : "text-blue-100 hover:text-white"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          isActive ? "text-white" : "text-blue-100 group-hover:text-white"
                        )}>
                          {section.name}
                        </p>
                        {section.description && (
                          <p className={cn(
                            "text-xs truncate mt-0.5",
                            isActive ? "text-blue-100" : "text-blue-300 group-hover:text-blue-200"
                          )}>
                            {section.description}
                          </p>
                        )}
                      </div>
                      
                      {hasChildren && (
                        <motion.div
                          animate={{ rotate: isActive ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRightIcon className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive ? "text-white" : "text-blue-300 group-hover:text-white"
                          )} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>

              {/* Children Links */}
              <AnimatePresence>
                {!isCollapsed && isActive && hasChildren && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-8 space-y-1 border-l-2 border-blue-600/50 pl-4"
                  >
                    {section.children!.map(child => (
                      <Link href={child.href} key={child.name} className="block">
                        <motion.div
                          className={cn(
                            "group flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                            "hover:bg-blue-700/30 focus:outline-none focus:ring-2 focus:ring-blue-400",
                            pathname === child.href
                              ? "bg-blue-700/50 text-white shadow-md"
                              : "text-blue-200 hover:text-white"
                          )}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            pathname === child.href ? "bg-white" : "bg-blue-400 group-hover:bg-white"
                          )} />
                          
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              pathname === child.href ? "text-white" : "text-blue-200 group-hover:text-white"
                            )}>
                              {child.name}
                            </p>
                            {child.description && (
                              <p className={cn(
                                "text-xs truncate mt-0.5",
                                pathname === child.href ? "text-blue-100" : "text-blue-300 group-hover:text-blue-200"
                              )}>
                                {child.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-blue-800/30"
        >
          <div className="flex items-center gap-3 p-3 bg-blue-800/20 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-blue-300 truncate">admin@shopify.com</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}