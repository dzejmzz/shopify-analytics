"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZoM4CtqKHTAUAGLubLFG0-lsbhSrLLy7Y6qN_o62LlRcHsEHjOtDy6eyUYK0A5zCSAnA5hKwAfA7l/pub?gid=1225782318&single=true&output=csv";

const sidebarItems = [
  { name: "Overview", icon: HomeIcon, href: "/pacing/overview" },
  { name: "App/Campaign Split", icon: Squares2X2Icon, href: "/pacing/app-campaign-split" },
  { name: "Install Tracker", icon: ChartBarIcon, href: "/pacing/install-tracker" },
  { name: "Budget Tracker", icon: CurrencyDollarIcon, href: "/pacing/budget-tracker" },
  { name: "Yesterday vs. Day Before", icon: ArrowTrendingUpIcon, href: "/pacing/yesterday-vs-day-before" },
  { name: "Ad Visibility", icon: EyeIcon, href: "/pacing/ad-visibility" },
];

function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export default function AdVisibilityPage() {
  const [rows, setRows] = useState<PacingRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  // Calculate date restrictions
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const yesterday = subDays(today, 1);
  const firstDayFormatted = format(firstDayOfMonth, 'yyyy-MM-dd');
  const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');

  useEffect(() => {
    fetchPacingRaw()
      .then((data: PacingRawRow[]) => {
        setRows(data);
        const dates = Array.from(new Set(data.map((row: PacingRawRow) => String(row.Date)))).sort();
        // Filter dates to only include current month up to yesterday
        const availableDates = dates.filter(date => {
          const dateObj = parse(date, 'dd/MM/yyyy', new Date());
          return dateObj >= firstDayOfMonth && dateObj <= yesterday;
        });
        setAllDates(availableDates);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  // Compute all app names from all rows for default selection
  const allAppNames = Array.from(new Set(rows.map((row: PacingRawRow) => String(row["App Name"])).filter(Boolean)));
  useEffect(() => {
    if (selectedApps.length === 0 && allAppNames.length > 0) {
      setSelectedApps(allAppNames);
    }
  }, [allAppNames.length]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rows.length) return <div className="p-8 text-gray-600">No data found.</div>;

  // Group data: { [app]: { [campaign]: { [date]: visibility } } }
  const grouped: Record<string, Record<string, Record<string, number | null>>> = {};
  rows.forEach(row => {
    const app = String(row["App Name"] || "Unknown App");
    const campaign = String(row["Ad Name"] || "Unknown Campaign");
    const date = String(row["Date"]);
    let vis = row["Visibility"];
    vis = vis === undefined || vis === null || vis === '' ? null : cleanNumber(vis);
    if (!grouped[app]) grouped[app] = {};
    if (!grouped[app][campaign]) grouped[app][campaign] = {};
    grouped[app][campaign][date] = vis;
  });

  return (
    <div className="flex min-h-screen bg-gray-900 text-white w-full overflow-x-hidden">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Ad Visibility</h2>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300 max-w-6xl mx-auto w-full">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] min-w-max border text-xs bg-white rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr className="sticky top-0 z-30 bg-gray-800">
                  <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>App Name</th>
                  <th className="px-2 py-2 text-left font-bold sticky left-[180px] z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>Campaign</th>
                  {allDates.map(date => (
                    <th key={date} className="px-2 py-2 font-bold text-center bg-gray-800 whitespace-nowrap">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(grouped).filter(app => selectedApps.includes(app)).map(app => (
                  Object.keys(grouped[app]).map((campaign, j) => (
                    <tr key={app + campaign} className="border-b last:border-b-0 hover:bg-gray-50">
                      {j === 0 ? (
                        <td rowSpan={Object.keys(grouped[app]).length} className="px-2 py-2 text-indigo-700 font-bold sticky left-0 z-10 bg-white align-top text-lg" style={{ minWidth: '180px', width: '180px' }}>{app}</td>
                      ) : null}
                      <td className="px-2 py-2 text-gray-800 sticky left-[180px] z-10 bg-white" style={{ minWidth: '180px', width: '180px' }}>{campaign}</td>
                      {allDates.map(date => {
                        const v = grouped[app][campaign][date];
                        return <td key={date} className="px-2 py-2 text-center text-gray-900">{v !== null && v !== undefined ? v.toFixed(2) + "%" : "-"}</td>;
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 