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
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';
import { InfoTooltip } from './ui/Tooltip';

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
    name: "Welcome Hub",
    icon: HomeIcon,
    href: "/",
    description: "Highlights of setup status and shortcuts to key reports.",
  },
  {
    name: "Current Performance",
    icon: ChartBarIcon,
    href: "/current-performance",
    description: "Performance tracking and monitoring",
    children: [
      { name: "Performance Snapshot", href: "/current-performance/snapshot", description: "Today's installs, spend, and pacing at a glance." },
      { name: "Campaign Breakdown", href: "/current-performance/campaign-breakdown", description: "Compare performance across campaigns and apps." },
      { name: "Keyword Breakdown", href: "/current-performance/keyword-breakdown", description: "Analyze performance by individual keywords and search terms." },
      { name: "Installs Trend", href: "/current-performance/installs-trend", description: "Track installs day by day against targets." },
      { name: "Budget Pacing", href: "/current-performance/budget-pacing", description: "Monitor spend vs. budget for the current month." },
      { name: "Daily Changes", href: "/current-performance/daily-changes", description: "See differences between any two days." },
      { name: "Visibility Metrics", href: "/current-performance/visibility-metrics", description: "Check ad impressions and share of visibility." },
    ],
  },
  {
    name: "Trends & Insights",
    icon: CalendarIcon,
    href: "/trends-insights",
    description: "Annual performance analysis",
    children: [
      { name: "Performance Snapshot", href: "/trends-insights/snapshot", description: "Highlights of yearly installs, spend, and ROAS trends." },
      { name: "Monthly Trends", href: "/trends-insights/trends", description: "See month-over-month changes." },
      { name: "Geo Insights", href: "/trends-insights/geo", description: "Compare installs and spend by country." },
      { name: "Plan Performance", href: "/trends-insights/plans", description: "Measure results across pricing plans." },
      { name: "Device Performance", href: "/trends-insights/devices", description: "Break down performance by device type." },
    ],
  },
  {
    name: 'Keyword Analytics',
    icon: MagnifyingGlassIcon,
    href: '/keyword-analytics',
    description: "Search term analytics",
    children: [
      { name: 'Performance Snapshot', href: '/keyword-analytics/snapshot', description: "Highlights of top keywords, match types, and changes." },
      { name: 'Keyword Trends', href: '/keyword-analytics/trends', description: "Track keyword results month by month." },
      { name: 'Geo Keyword Insights', href: '/keyword-analytics/geo', description: "See which terms work best in each country." },
      { name: 'Keyword by Plan', href: '/keyword-analytics/plans', description: "Match search terms to subscription plans." },
      { name: 'Keyword by Device', href: '/keyword-analytics/devices', description: "Check keyword results across devices." },
      { name: 'Match Type Analysis', href: '/keyword-analytics/match-types', description: "Compare exact vs. broad match keywords." },
      { name: 'Broad Match Performance', href: '/keyword-analytics/broad-performance', description: "Deep dive into broad match terms." },
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
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <p className={cn(
                          "font-medium truncate",
                          isActive ? "text-white" : "text-blue-100 group-hover:text-white"
                        )}>
                          {section.name}
                        </p>
                        {section.description && (
                          <InfoTooltip 
                            content={section.description}
                            iconClassName={cn(
                              "flex-shrink-0",
                              isActive ? "text-blue-200" : "text-blue-400 group-hover:text-blue-300"
                            )}
                          />
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
                          
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              pathname === child.href ? "text-white" : "text-blue-200 group-hover:text-white"
                            )}>
                              {child.name}
                            </p>
                            {child.description && (
                              <InfoTooltip 
                                content={child.description}
                                iconClassName={cn(
                                  "w-3 h-3 flex-shrink-0",
                                  pathname === child.href ? "text-blue-200" : "text-blue-400 group-hover:text-blue-300"
                                )}
                              />
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