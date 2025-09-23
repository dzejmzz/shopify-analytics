"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  CheckIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

type ChangeRow = {
  impressions?: string;
  clicks?: string;
  ctr?: string;
  installs?: string;
  installRate?: string;
  customers?: string;
  conversionRate?: string;
  revenue?: string;
  spend?: string;
  profit?: string;
  roas?: string;
  cpc?: string;
  cpi?: string;
  cpa?: string;
};

type DataRow = {
  app: string;
  month: string;
  impressions: string;
  clicks: string;
  ctr: string;
  installs: string;
  installRate: string;
  customers: string;
  conversionRate: string;
  revenue: string;
  spend: string;
  profit: string;
  roas: string;
  cpc: string;
  cpi: string;
  cpa: string;
  change: ChangeRow | null;
};

const appList = [
  "Address Ninja - Validator",
  "Magical Fees & Tariffs",
  "Magical Make An Offer",
];

const data: DataRow[] = [
  {
    app: "Address Ninja - Validator",
    month: "January",
    impressions: "2,008",
    clicks: "109",
    ctr: "5.43%",
    installs: "33",
    installRate: "30.28%",
    customers: "8",
    conversionRate: "24.24%",
    revenue: "$249.80",
    spend: "$237.00",
    profit: "$12.80",
    roas: "105.40%",
    cpc: "$2.17",
    cpi: "$7.18",
    cpa: "$29.63",
    change: null,
  },
  {
    app: "Address Ninja - Validator",
    month: "February",
    impressions: "2,190",
    clicks: "180",
    ctr: "8.22%",
    installs: "49",
    installRate: "27.22%",
    customers: "9",
    conversionRate: "18.37%",
    revenue: "$195.12",
    spend: "$347.00",
    profit: "-$151.88",
    roas: "56.23%",
    cpc: "$1.93",
    cpi: "$7.08",
    cpa: "$38.56",
    change: {
      impressions: "9.06%",
      clicks: "65.14%",
      ctr: "2.79%",
      installs: "48.48%",
      installRate: "-3.05%",
      customers: "12.50%",
      conversionRate: "-5.88%",
      revenue: "-21.89%",
      spend: "46.41%",
      profit: "-49.17%",
      roas: "-11.34%",
      cpc: "-10.39%",
      cpi: "-1.39%",
      cpa: "30.16%",
    },
  },
  {
    app: "Address Ninja - Validator",
    month: "March",
    impressions: "2,137",
    clicks: "179",
    ctr: "8.38%",
    installs: "54",
    installRate: "30.17%",
    customers: "17",
    conversionRate: "31.48%",
    revenue: "$314.90",
    spend: "$446.00",
    profit: "-$131.10",
    roas: "70.61%",
    cpc: "$2.49",
    cpi: "$8.26",
    cpa: "$26.20",
    change: {
      impressions: "-2.42%",
      clicks: "-0.56%",
      ctr: "0.16%",
      installs: "10.20%",
      installRate: "2.95%",
      customers: "88.89%",
      conversionRate: "13.11%",
      revenue: "61.39%",
      spend: "28.53%",
      profit: "-49.17%",
      roas: "-11.34%",
      cpc: "-10.39%",
      cpi: "-1.39%",
      cpa: "30.16%",
    },
  },
  {
    app: "Address Ninja - Validator",
    month: "April",
    impressions: "4,326",
    clicks: "370",
    ctr: "7.10%",
    installs: "101",
    installRate: "32.90%",
    customers: "26",
    conversionRate: "25.74%",
    revenue: "$329.73",
    spend: "$1,283.72",
    profit: "-$953.99",
    roas: "25.69%",
    cpc: "$3.49",
    cpi: "$12.74",
    cpa: "$39.00",
    change: {
      impressions: "102.43%",
      clicks: "71.51%",
      ctr: "-1.28%",
      installs: "87.04%",
      installRate: "2.73%",
      customers: "52.94%",
      conversionRate: "-5.74%",
      revenue: "4.71%",
      spend: "187.83%",
      profit: "-44.92%",
      roas: "-67.82%",
      cpc: "53.98%",
      cpi: "-8.00%",
      cpa: "-1.62%",
    },
  },
];

const columns = [
  { key: "month", label: "Month" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "ctr", label: "CTR" },
  { key: "installs", label: "Installs" },
  { key: "installRate", label: "Install Rate" },
  { key: "customers", label: "Customers" },
  { key: "conversionRate", label: "Conversion Rate" },
  { key: "revenue", label: "Revenue" },
  { key: "spend", label: "Spend" },
  { key: "profit", label: "Profit" },
  { key: "roas", label: "ROAS" },
  { key: "cpc", label: "CPC" },
  { key: "cpi", label: "CPI" },
  { key: "cpa", label: "CPA" },
];

const sidebarItems = [
  { name: "Overview", icon: ChartBarIcon, href: "/yearly-performance/overview" },
  { name: "Home", icon: HomeIcon, href: "/yearly-performance/home" },
  { name: "Month to Month", icon: ArrowTrendingUpIcon, href: "/yearly-performance/month-to-month" },
  { name: "Month on Month Progress", icon: ArrowTrendingUpIcon, href: "/yearly-performance/month-on-month-progress", active: true },
  { name: "Country Split", icon: ChartPieIcon, href: "/yearly-performance/country-split" },
  { name: "Device Split", icon: Squares2X2Icon, href: "/yearly-performance/device-split" },
];

function getChangeColor(val: string | undefined): string {
  if (!val || val === "") return "text-slate-400";
  if (val === "0%" || val === "0.00%") return "text-slate-400";
  if (val.startsWith("-")) return "text-red-400";
  return "text-green-400";
}

function getChangeIcon(val: string | undefined) {
  if (!val || val === "" || val === "0%" || val === "0.00%") return MinusIcon;
  if (val.startsWith("-")) return ArrowDownIcon;
  return ArrowUpIcon;
}

interface AppMultiSelectProps {
  selected: string[];
  setSelected: (apps: string[]) => void;
}

function AppMultiSelect({ selected, setSelected }: AppMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const allSelected = selected.length === appList.length;
  const handleChange = (app: string) => {
    if (app === "All") {
      setSelected(allSelected ? [] : appList);
    } else if (selected.includes(app)) {
      setSelected(selected.filter(a => a !== app));
    } else {
      setSelected([...selected, app]);
    }
  };

  let summary = allSelected
    ? "All Apps"
    : selected.length === 0
    ? "No Apps Selected"
    : selected.length === 1
    ? selected[0]
    : `${selected.length} Apps Selected`;

  return (
    <div className="relative min-w-[200px]" ref={ref}>
      <label className="block text-sm font-medium text-slate-300 mb-2">Apps</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <span className="truncate">{summary}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <label className="flex items-center px-4 py-3 hover:bg-slate-700 cursor-pointer text-white font-semibold border-b border-slate-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => handleChange("All")}
              className="accent-blue-500 mr-3"
            />
            <span className="truncate">{allSelected ? "Deselect All" : "Select All"}</span>
          </label>
          {appList.map(app => (
            <label key={app} className="flex items-center px-4 py-3 hover:bg-slate-700 cursor-pointer text-white">
              <input
                type="checkbox"
                checked={selected.includes(app)}
                onChange={() => handleChange(app)}
                className="accent-blue-500 mr-3"
              />
              <span className="truncate">{app}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function YearlyPerformanceMonthOnMonth() {
  const [selectedApps, setSelectedApps] = useState<string[]>(appList);
  const filteredData = data.filter(row => selectedApps.includes(row.app));

  const uniqueApps = Array.from(new Set(filteredData.map(row => row.app))).length;
  const totalMonths = filteredData.length;
  const totalMetrics = columns.length - 1; // Excluding month column

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col px-4 py-6"
      >
        <Link href="/" className="flex items-center gap-3 mb-10 mt-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg">
            S
          </div>
          <span className="text-xl font-bold tracking-wide text-white group-hover:text-blue-300 transition-colors">
            Shopify Analytics
          </span>
        </Link>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                item.active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Month-on-Month Progress</h1>
                  <p className="text-slate-300 mt-1">Track detailed monthly performance with change indicators</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Progress Tracking
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Squares2X2Icon className="h-4 w-4 mr-1" />
                  {uniqueApps} Apps
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {totalMonths} Records
                </Badge>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  {totalMetrics} Metrics
                </Badge>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AppMultiSelect selected={selectedApps} setSelected={setSelectedApps} />
                </div>
              </Card>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Performance Data</h2>
                  <p className="text-slate-300 text-sm">Monthly values with month-over-month change indicators</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-slate-700/40 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-600/50 bg-slate-600/50">
                        <th className="text-left py-4 px-4 font-semibold text-slate-100 sticky left-0 bg-slate-600/60 backdrop-blur-sm z-10 min-w-[120px]">
                          App / Month
                        </th>
                        {columns.slice(1).map(col => (
                          <th key={col.key} className="text-center py-4 px-3 font-semibold text-slate-100 whitespace-nowrap min-w-[100px]">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, i) => (
                        <React.Fragment key={row.app + row.month}>
                          {/* Main data row */}
                          <tr className="border-b border-slate-600/30 hover:bg-slate-600/30 transition-colors">
                            <td className="py-4 px-4 font-medium text-slate-100 sticky left-0 bg-slate-700/50 backdrop-blur-sm z-10">
                              <div className="flex flex-col">
                                <span className="text-slate-300 text-xs font-medium">{row.app}</span>
                                <span className="text-slate-100 font-semibold">{row.month}</span>
                              </div>
                            </td>
                            {columns.slice(1).map(col => {
                              const value = row[col.key as keyof DataRow];
                              return (
                                <td key={col.key} className="py-4 px-3 text-center text-slate-200">
                                  {typeof value === "string" ? value : ""}
                                </td>
                              );
                            })}
                          </tr>
                          
                          {/* Change row - only show if change data exists */}
                          {row.change && (
                            <tr className="border-b border-slate-600/20 bg-slate-800/40">
                              <td className="py-2 px-4 text-xs italic text-slate-300 sticky left-0 bg-slate-800/60 backdrop-blur-sm z-10">
                                vs previous month
                              </td>
                              {columns.slice(1).map(col => {
                                const changeVal = row.change![col.key as keyof ChangeRow];
                                const colorClass = getChangeColor(changeVal);
                                const Icon = getChangeIcon(changeVal);
                                
                                return (
                                  <td key={col.key} className="py-2 px-3 text-center">
                                    <div className={`flex items-center justify-center gap-1 ${colorClass}`}>
                                      <Icon className="h-3 w-3" />
                                      <span className="font-medium text-xs">
                                        {changeVal || "-"}
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}