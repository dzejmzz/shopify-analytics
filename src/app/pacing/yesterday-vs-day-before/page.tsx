"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import YesterdayVsDayBeforeTable from "../../../components/YesterdayVsDayBeforeTable";
import {
  HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';
import { format, parse, startOfMonth, subDays } from 'date-fns';

const sidebarItems = [
  { name: "Overview", icon: HomeIcon, href: "/pacing/overview" },
  { name: "App/Campaign Split", icon: Squares2X2Icon, href: "/pacing/app-campaign-split" },
  { name: "Install Tracker", icon: ChartBarIcon, href: "/pacing/install-tracker" },
  { name: "Budget Tracker", icon: CurrencyDollarIcon, href: "/pacing/budget-tracker" },
  { name: "Yesterday vs. Day Before", icon: ArrowTrendingUpIcon, href: "/pacing/yesterday-vs-day-before" },
  { name: "Ad Visibility", icon: EyeIcon, href: "/pacing/ad-visibility" },
];

export default function YesterdayVsDayBeforePage() {
  const [rawRows, setRawRows] = useState<PacingRawRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);

  // Calculate date restrictions
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const yesterday = subDays(today, 1);
  const firstDayFormatted = format(firstDayOfMonth, 'yyyy-MM-dd');
  const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');

  useEffect(() => {
    fetchPacingRaw().then((data: PacingRawRow[]) => {
      setRawRows(data);
      const dates = Array.from(new Set(data.map((row: PacingRawRow) => String(row.Date)))).sort();
      // Filter dates to only include current month up to yesterday
      const availableDates = dates.filter(date => {
        const dateObj = parse(date, 'dd/MM/yyyy', new Date());
        return dateObj >= firstDayOfMonth && dateObj <= yesterday;
      });
      setAllDates(availableDates);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white w-full">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Yesterday vs Day Before</h2>
        <div className="bg-gray-800 rounded-2xl p-4 shadow-lg overflow-x-auto">
        <YesterdayVsDayBeforeTable />
      </div>
      </main>
    </div>
  );
} 