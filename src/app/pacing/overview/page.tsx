"use client";
import React, { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DateRange } from 'react-date-range';
import { format, parse, startOfMonth, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';

const ALL_METRICS = [
  { key: "impressions", csvKey: "Imps", label: "Impressions", format: "NUMBER", icon: EyeIcon },
  { key: "clicks", csvKey: "Clicks", label: "Clicks", format: "NUMBER", icon: ChartBarIcon },
  { key: "installs", csvKey: "Installs", label: "Installs", format: "NUMBER", icon: ArrowTrendingUpIcon },
  { key: "customers", csvKey: "Customers", label: "Customers", format: "NUMBER", icon: HomeIcon },
  { key: "revenue", csvKey: "Revenue", label: "Revenue", format: "USD", icon: CurrencyDollarIcon },
  { key: "spend", csvKey: "Spend", label: "Spend", format: "USD", icon: CurrencyDollarIcon },
  { key: "ctr", label: "CTR", format: "PERCENTAGE", icon: ChartPieIcon, compute: (row: any) => {
    const imps = Number(row["Imps"]);
    const clicks = Number(row["Clicks"]);
    return imps ? clicks / imps : 0;
  } },
  { key: "install_rate", label: "Install Rate", format: "PERCENTAGE", icon: ArrowTrendingUpIcon, compute: (row: any) => {
    const imps = Number(row["Imps"]);
    const installs = Number(row["Installs"]);
    return imps ? installs / imps : 0;
  } },
  { key: "conversion_rate", label: "Conversion Rate", format: "PERCENTAGE", icon: ChartPieIcon, compute: (row: any) => {
    const installs = Number(row["Installs"]);
    const customers = Number(row["Customers"]);
    return installs ? customers / installs : 0;
  } },
  { key: "profit", label: "Profit", format: "USD", icon: CurrencyDollarIcon, compute: (row: any) => {
    const revenue = cleanNumber(row["Revenue"]);
    const cost = cleanNumber(row["Spend"]);
    return revenue - cost;
  } },
  { key: "roas", label: "ROAS", format: "PERCENTAGE", icon: ArrowTrendingUpIcon, compute: (row: any) => {
    const cost = cleanNumber(row["Spend"]);
    const revenue = cleanNumber(row["Revenue"]);
    return cost ? revenue / cost : 0;
  } },
  { key: "cpc", label: "CPC", format: "USD", icon: CurrencyDollarIcon, compute: (row: any) => {
    const cost = cleanNumber(row["Spend"]);
    const clicks = Number(row["Clicks"]);
    return clicks ? cost / clicks : 0;
  } },
  { key: "cpi", label: "CPI", format: "USD", icon: CurrencyDollarIcon, compute: (row: any) => {
    const cost = cleanNumber(row["Spend"]);
    const installs = Number(row["Installs"]);
    return installs ? cost / installs : 0;
  } },
  { key: "cpa", label: "CPA", format: "USD", icon: CurrencyDollarIcon, compute: (row: any) => {
    const cost = cleanNumber(row["Spend"]);
    const customers = Number(row["Customers"]);
    return customers ? cost / customers : 0;
  } },
];
const DEFAULT_METRICS = ["installs", "install_rate", "cpi", "spend"];

const sidebarItems = [
  { name: "Overview", icon: HomeIcon, href: "/pacing/overview" },
  { name: "App/Campaign Split", icon: Squares2X2Icon, href: "/pacing/app-campaign-split" },
  { name: "Install Tracker", icon: ChartBarIcon, href: "/pacing/install-tracker" },
  { name: "Budget Tracker", icon: CurrencyDollarIcon, href: "/pacing/budget-tracker" },
  { name: "Yesterday vs. Day Before", icon: ArrowTrendingUpIcon, href: "/pacing/yesterday-vs-day-before" },
  { name: "Ad Visibility", icon: EyeIcon, href: "/pacing/ad-visibility" },
];

// Utility to clean and parse numbers (handles $ and commas)
function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// Helper to compute total numerator/denominator for ratio metrics on the last day
function computeTotalRatio(rows: any[], numeratorKey: string, denominatorKey: string) {
  const numerator = rows.reduce((sum, row) => sum + cleanNumber(row[numeratorKey]), 0);
  const denominator = rows.reduce((sum, row) => sum + cleanNumber(row[denominatorKey]), 0);
  return denominator ? numerator / denominator : 0;
}

export default function PacingOverview() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [availableMetrics, setAvailableMetrics] = useState<string[]>(ALL_METRICS.map(m => m.key));
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [selectedApp, setSelectedApp] = useState<string>('All Apps');
  const [showMetricsDropdown, setShowMetricsDropdown] = useState(false);
  const [showAppDropdown, setShowAppDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [pendingMetrics, setPendingMetrics] = useState<string[]>(selectedMetrics);
  const [pendingApp, setPendingApp] = useState<string>(selectedApp);
  const [activeGraphMetrics, setActiveGraphMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [rawRows, setRawRows] = useState<PacingRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);

  const metricsDropdownRef = useRef<HTMLDivElement>(null);
  const appDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Calculate date restrictions
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const yesterday = subDays(today, 1);
  const firstDayFormatted = format(firstDayOfMonth, 'yyyy-MM-dd');
  const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showMetricsDropdown && metricsDropdownRef.current && !metricsDropdownRef.current.contains(event.target as Node)) {
        setShowMetricsDropdown(false);
      }
      if (showAppDropdown && appDropdownRef.current && !appDropdownRef.current.contains(event.target as Node)) {
        setShowAppDropdown(false);
      }
      if (showDateDropdown && dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMetricsDropdown, showAppDropdown, showDateDropdown]);

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
      if (availableDates.length > 0) {
        setDateRange({ start: availableDates[0], end: availableDates[availableDates.length - 1] });
      }
      setLoading(false);
    }).catch(() => setError('Failed to fetch data'));
  }, []);

  // Dynamically generate app list from data (must be before any early returns)
  const appNames = React.useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"])))).filter(Boolean);
    return ['All Apps', ...names];
  }, [rawRows]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rawRows.length) return <div className="p-8 text-gray-600">No data found.</div>;
  if (!dateRange.start || !dateRange.end) return <div className="p-8 text-gray-600">No dates available.</div>;

  const filteredData = allDates.filter(d => d >= dateRange.start && d <= dateRange.end).map(date => {
    const rowsForDate = rawRows.filter(row => String(row.Date) === date && (selectedApp === 'All Apps' || row["App Name"] === selectedApp));
    const result: any = { date };
    ALL_METRICS.forEach(m => {
      if (m.key === 'ctr') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Clicks', 'Imps');
      } else if (m.key === 'install_rate') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Installs', 'Clicks');
      } else if (m.key === 'conversion_rate') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Customers', 'Installs');
      } else if (m.key === 'profit') {
        const totalRevenue = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
        const totalSpend = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
        result[m.key] = totalRevenue - totalSpend;
      } else if (m.key === 'roas') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Revenue', 'Spend');
      } else if (m.key === 'cpc') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Spend', 'Clicks');
      } else if (m.key === 'cpi') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Spend', 'Installs');
      } else if (m.key === 'cpa') {
        result[m.key] = computeTotalRatio(rowsForDate, 'Spend', 'Customers');
      } else if (m.csvKey) {
        // Sum metrics: sum the column
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row[m.csvKey!]), 0);
      } else {
        result[m.key] = 0;
      }
    });
    return result;
  });

  const range = [{
    startDate: parse(dateRange.start, 'dd/MM/yyyy', new Date()),
    endDate: parse(dateRange.end, 'dd/MM/yyyy', new Date()),
    key: 'selection',
  }];

  function handleDateRangeChange(ranges: any) {
    setDateRange({
      start: format(ranges.selection.startDate, 'dd/MM/yyyy'),
      end: format(ranges.selection.endDate, 'dd/MM/yyyy'),
    });
    setShowDateDropdown(false);
  }

  function toggleMetric(metric: string) {
    if (pendingMetrics.includes(metric)) {
      setPendingMetrics(pendingMetrics.filter(m => m !== metric));
    } else if (pendingMetrics.length < 4) {
      setPendingMetrics([...pendingMetrics, metric]);
    }
  }

  function handleMetricSave() {
    setSelectedMetrics(pendingMetrics);
    setActiveGraphMetrics(activeGraphMetrics.filter(m => pendingMetrics.includes(m)).slice(0, 4));
    setShowMetricsDropdown(false);
  }

  function handleAppSave() {
    setSelectedApp(pendingApp);
    setShowAppDropdown(false);
  }

  function toggleGraphMetric(metric: string) {
    if (activeGraphMetrics.includes(metric)) {
      setActiveGraphMetrics(activeGraphMetrics.filter(m => m !== metric));
    } else if (activeGraphMetrics.length < 4) {
      setActiveGraphMetrics([...activeGraphMetrics, metric]);
    }
  }

  const dropdownHeight = '44px';
  function formatValue(value: any, format: string) {
    if (value === undefined || value === null || value === '-') return '-';
    if (format === "NUMBER") return Number(value).toLocaleString();
    if (format === "USD") return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (format === "PERCENTAGE") return `${(Number(value) * 100).toFixed(2)}%`;
    return value;
  }

  // For the graph, multiply percentage values by 100 so the y-axis is 0-100
  const chartData = filteredData.map(row => {
    const newRow: any = { ...row };
    ALL_METRICS.forEach(m => {
      if (m.format === 'PERCENTAGE' && typeof newRow[m.key] === 'number') {
        newRow[m.key] = newRow[m.key] * 100;
      }
    });
    return newRow;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pacing Overview
              </h1>
              <p className="text-slate-400 text-lg">
                Monitor your campaign performance and pacing metrics in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="gradient" size="lg" className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Live Data
              </Badge>
              <Badge variant="outline" size="lg">
                {filteredData.length} Records
              </Badge>
            </div>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                {/* App Picker */}
                <div className="flex flex-col space-y-2 min-w-[200px]" ref={appDropdownRef}>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Squares2X2Icon className="w-4 h-4" />
                    Application
                  </label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowAppDropdown(v => !v)}
                      className="w-full justify-between h-12 text-left"
                    >
                      <span className="truncate">{selectedApp}</span>
                      <ChevronDownIcon className={cn("w-4 h-4 transition-transform", showAppDropdown && "rotate-180")} />
                    </Button>
                    <AnimatePresence>
                      {showAppDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-20 mt-2 w-full bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden"
                        >
                          <div className="overflow-y-auto max-h-48 p-2">
                            {appNames.map(app => (
                              <label key={app} className="flex items-center p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  checked={pendingApp === app}
                                  onChange={() => setPendingApp(app)}
                                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2 mr-3"
                                  name="app-picker"
                                />
                                <span className="text-slate-200 truncate">{app}</span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-slate-700 p-2">
                            <Button onClick={handleAppSave} className="w-full">
                              Apply Selection
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Date Range Picker */}
                <div className="flex flex-col space-y-2 min-w-[280px]" ref={dateDropdownRef}>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Date Range
                  </label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowDateDropdown(v => !v)}
                      className="w-full justify-between h-12 text-left"
                    >
                      <span>
                        {format(parse(dateRange.start, 'dd/MM/yyyy', new Date()), 'MMM dd, yyyy')} - {format(parse(dateRange.end, 'dd/MM/yyyy', new Date()), 'MMM dd, yyyy')}
                      </span>
                      <ChevronDownIcon className={cn("w-4 h-4 transition-transform", showDateDropdown && "rotate-180")} />
                    </Button>
                    <AnimatePresence>
                      {showDateDropdown && allDates.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-20 mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl"
                        >
                          <DateRange
                            ranges={range}
                            onChange={handleDateRangeChange}
                            moveRangeOnFirstSelection={false}
                            months={1}
                            direction="horizontal"
                            rangeColors={["#3b82f6"]}
                            minDate={parse(allDates[0], 'dd/MM/yyyy', new Date())}
                            maxDate={parse(allDates[allDates.length-1], 'dd/MM/yyyy', new Date())}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Metrics Picker */}
                <div className="flex flex-col space-y-2 min-w-[250px]" ref={metricsDropdownRef}>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    Metrics
                  </label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowMetricsDropdown(v => !v)}
                      className="w-full justify-between h-12 text-left"
                    >
                      <span className="truncate">
                        {selectedMetrics.map(m => ALL_METRICS.find(am => am.key === m)?.label).join(", ") || "Select metrics"}
                      </span>
                      <ChevronDownIcon className={cn("w-4 h-4 transition-transform", showMetricsDropdown && "rotate-180")} />
                    </Button>
                    <AnimatePresence>
                      {showMetricsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-20 mt-2 w-full bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-hidden"
                        >
                          <div className="overflow-y-auto max-h-60 p-2">
                            {ALL_METRICS.map(metric => (
                              <label key={metric.key} className="flex items-center p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={pendingMetrics.includes(metric.key)}
                                  onChange={() => toggleMetric(metric.key)}
                                  disabled={!pendingMetrics.includes(metric.key) && pendingMetrics.length === 4}
                                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2 mr-3 rounded"
                                />
                                <metric.icon className="w-4 h-4 text-slate-400 mr-2" />
                                <span className="text-slate-200">{metric.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-slate-700 p-2">
                            <Button onClick={handleMetricSave} className="w-full">
                              Apply Metrics
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPendingMetrics(DEFAULT_METRICS);
                      setSelectedMetrics(DEFAULT_METRICS);
                      setActiveGraphMetrics(DEFAULT_METRICS);
                    }}
                  >
                    Default
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allKeys = ALL_METRICS.slice(0, 4).map(m => m.key);
                      setPendingMetrics(allKeys);
                      setSelectedMetrics(allKeys);
                      setActiveGraphMetrics(allKeys);
                    }}
                  >
                    All
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {selectedMetrics.map((metric, index) => {
              const meta = ALL_METRICS.find(m => m.key === metric);
              const isActive = activeGraphMetrics.includes(metric);
              
              // Calculate value for the last available date
              const lastRow = filteredData[filteredData.length - 1];
              let value: string | number = '-';
              if (lastRow && meta) {
                if (meta.compute) {
                  value = meta.compute(lastRow);
                } else if (meta.csvKey && lastRow[meta.csvKey] !== undefined) {
                  value = lastRow[meta.csvKey];
                }
              }

              // Calculate trend (compare with previous day)
              const prevRow = filteredData[filteredData.length - 2];
              let trend = 0;
              if (lastRow && prevRow && meta) {
                let currentVal = 0;
                let prevVal = 0;
                
                if (meta.compute) {
                  currentVal = meta.compute(lastRow);
                  prevVal = meta.compute(prevRow);
                } else if (meta.csvKey) {
                  currentVal = Number(lastRow[meta.csvKey]) || 0;
                  prevVal = Number(prevRow[meta.csvKey]) || 0;
                }
                
                if (prevVal !== 0) {
                  trend = ((currentVal - prevVal) / prevVal) * 100;
                }
              }

              return (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "p-6 cursor-pointer transition-all duration-300 hover:shadow-xl",
                      isActive 
                        ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/50 shadow-blue-500/25" 
                        : "hover:border-slate-600",
                      activeGraphMetrics.length === 4 && !isActive && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={() => toggleGraphMetric(metric)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {meta?.icon && <meta.icon className="w-5 h-5 text-blue-400" />}
                        <h3 className="font-semibold text-slate-200">{meta?.label}</h3>
                      </div>
                      {isActive && (
                        <Badge variant="primary" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl lg:text-3xl font-bold text-white">
                        {formatValue(value, meta?.format || "NUMBER")}
                      </div>
                      
                      {trend !== 0 && (
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          trend > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {trend > 0 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4" />
                          )}
                          <span>{Math.abs(trend).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Performance Trends</h2>
                  <p className="text-slate-400">Track your key metrics over time</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" size="sm">
                    {activeGraphMetrics.length} Metrics
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {chartData.length} Data Points
                  </Badge>
                </div>
              </div>

              {/* Active Metrics Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {activeGraphMetrics.map(metric => {
                  const meta = ALL_METRICS.find(m => m.key === metric);
                  return (
                    <Badge key={metric} variant="primary" size="lg" className="flex items-center gap-2">
                      {meta?.icon && <meta.icon className="w-4 h-4" />}
                      {meta?.label}
                    </Badge>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="w-full h-[500px] bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        borderRadius: '8px',
                        color: '#f1f5f9'
                      }}
                      formatter={(value: any, name: string) => {
                        const meta = ALL_METRICS.find(m => m.key === name);
                        if (meta?.format === 'PERCENTAGE') {
                          return `${Number(value).toFixed(2)}%`;
                        }
                        return formatValue(value, meta?.format || "NUMBER");
                      }}
                    />
                    <Legend />
                    {activeGraphMetrics.map((metric, i) => (
                      <Line 
                        key={metric} 
                        type="monotone" 
                        dataKey={metric} 
                        stroke={["#3b82f6","#8b5cf6","#06b6d4","#10b981"][i%4]} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}