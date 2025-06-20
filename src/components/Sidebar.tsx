"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ChartBarIcon, CalendarIcon, MagnifyingGlassIcon, Squares2X2Icon, BoltIcon, BanknotesIcon, TableCellsIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, EyeIcon } from '@heroicons/react/24/outline';

const sidebarSections = [
  {
    name: "Overview",
    icon: HomeIcon,
    href: "/",
  },
  {
    name: "Pacing",
    icon: ChartBarIcon,
    href: "/pacing/overview",
    children: [
      { name: "Overview", href: "/pacing/overview" },
      { name: "App/Campaign Split", href: "/pacing/app-campaign-split" },
      { name: "Install Tracker", href: "/pacing/install-tracker" },
      { name: "Budget Tracker", href: "/pacing/budget-tracker" },
      { name: "Yesterday vs. Day Before", href: "/pacing/yesterday-vs-day-before" },
      { name: "Ad Visibility", href: "/pacing/ad-visibility" },
    ],
  },
  {
    name: "Yearly Performance",
    icon: CalendarIcon,
    href: "/yearly-performance/overview",
    children: [
      { name: "Overview", href: "/yearly-performance/overview" },
      { name: "Month to Month", href: "/yearly-performance/month-to-month" },
      { name: "Country Split", href: "/yearly-performance/country-split" },
      { name: "Plan Split", href: "/yearly-performance/plan-split" },
      { name: "Device Split", href: "/yearly-performance/device-split" },
    ],
  },
  {
    name: 'Search Term Report',
    icon: MagnifyingGlassIcon,
    href: '/search-term/overview',
    children: [
      { name: 'Overview', href: '/search-term/overview' },
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
    <aside className="w-64 bg-gray-800 flex flex-col px-4 py-6 min-h-screen">
      <Link href="/" legacyBehavior>
        <a className="flex items-center gap-3 mb-10 mt-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">S</div>
          <span className="text-2xl font-bold tracking-wide">Samo ROAS, Bilje mi</span>
        </a>
      </Link>
      {sidebarSections.map((section, idx) => {
        const isActive = idx === activeSectionIdx;
        return (
          <div key={section.name} className="mb-1">
            <Link href={section.href} legacyBehavior>
              <a
                className={`flex items-center gap-3 py-2 px-2 rounded-xl text-base font-medium transition-colors whitespace-nowrap truncate ${isActive ? 'bg-gray-700 text-white font-bold' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                style={{ minHeight: '44px' }}
              >
                <section.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{section.name}</span>
              </a>
            </Link>
            {/* Render children if expanded */}
            {isActive && section.children && (
              <div className="ml-6 mt-1 border-l-2 border-blue-500 pl-3 bg-gray-700/20 rounded-lg">
                {section.children.map(child => (
                  <Link href={child.href} key={child.name} legacyBehavior>
                    <a
                      className={`block py-2 px-2 rounded text-sm font-medium transition-colors whitespace-nowrap truncate ${pathname === child.href ? 'bg-blue-600 text-white font-bold' : 'text-gray-200 hover:bg-blue-600 hover:text-white'}`}
                      style={{ minHeight: '36px' }}
                    >
                      {child.name}
                    </a>
          </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
} 