"use client";
import React from "react";
import Link from "next/link";
import {
  HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  { name: "Overview", icon: HomeIcon, href: "/pacing/overview" },
  { name: "App/Campaign Split", icon: Squares2X2Icon, href: "/pacing/app-campaign-split" },
  { name: "Install Tracker", icon: ChartBarIcon, href: "/pacing/install-tracker" },
  { name: "Budget Tracker", icon: CurrencyDollarIcon, href: "/pacing/budget-tracker" },
  { name: "Yesterday vs. Day Before", icon: ArrowTrendingUpIcon, href: "/pacing/yesterday-vs-day-before" },
];

export default function PacingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white w-full">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-800 p-6 flex flex-col gap-1">
        <Link href="/" legacyBehavior>
          <a className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">S</div>
            <span className="text-2xl font-bold tracking-wide">SNOWUI</span>
          </a>
        </Link>
        {sidebarItems.map((item, idx) => (
          <Link href={item.href} key={item.name} legacyBehavior>
            <a
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-base font-medium transition-colors w-full whitespace-nowrap truncate ${idx === 0 ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              style={{ minHeight: '44px' }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </a>
          </Link>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex justify-start items-start p-4">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 