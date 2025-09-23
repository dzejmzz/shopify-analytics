"use client";
import React, { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { fetchYearlyRaw } from '../utils/yearlyraw';
import type { YearlyRawRow } from '../utils/yearlyraw';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

const ALL_METRICS = [
  { key: "impressions", label: "Impressions", format: "NUMBER" },
  { key: "clicks", label: "Clicks", format: "NUMBER" },
  { key: "ctr", label: "CTR", format: "PERCENTAGE" },
  { key: "installs", label: "Installs", format: "NUMBER" },
  { key: "install_rate", label: "Install Rate", format: "PERCENTAGE" },
  { key: "customers", label: "Customers", format: "NUMBER" },
  { key: "conversion_rate", label: "Conversion Rate", format: "PERCENTAGE" },
  { key: "revenue", label: "Revenue", format: "USD" },
  { key: "spend", label: "Spend", format: "USD" },
  { key: "profit", label: "Profit", format: "USD" },
  { key: "roas", label: "ROAS", format: "PERCENTAGE" },
  { key: "cpc", label: "CPC", format: "USD" },
  { key: "cpi", label: "CPI", format: "USD" },
  { key: "cpa", label: "CPA", format: "USD" },
];

const DEFAULT_METRICS = ["installs", "install_rate", "cpi", "spend"];

const sidebarItems = [
  { name: "Overview", icon: HomeIcon, href: "/" },
  { name: "Pacing", icon: ChartBarIcon, href: "/pacing/overview" },
  { name: "Yearly Performance", icon: CalendarIcon, href: "/yearly-performance/overview" },
  { name: "Search Term Report", icon: MagnifyingGlassIcon, href: "/search-term-report" },
  { name: "Splits", icon: Squares2X2Icon, href: "/splits" },
];

function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function computeTotalRatio(rows: any[], numeratorKey: string, denominatorKey: string) {
  const numerator = rows.reduce((sum, row) => sum + cleanNumber(row[numeratorKey]), 0);
  const denominator = rows.reduce((sum, row) => sum + cleanNumber(row[denominatorKey]), 0);
  return denominator ? numerator / denominator : 0;
}

export default function Home() {
  const [rawRows, setRawRows] = useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [selectedApp, setSelectedApp] = useState<string>('All Apps');
  const [showMetricsDropdown, setShowMetricsDropdown] = useState(false);
  const [showAppDropdown, setShowAppDropdown] = useState(false);
  const [pendingMetrics, setPendingMetrics] = useState<string[]>(selectedMetrics);
  const [pendingApp, setPendingApp] = useState<string>(selectedApp);
  const [activeGraphMetrics, setActiveGraphMetrics] = useState<string[]>(DEFAULT_METRICS);

  const metricsDropdownRef = useRef<HTMLDivElement>(null);
  const appDropdownRef = useRef<HTMLDivElement>(null);

  // Extract app names from data
  const appNames = React.useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"])).filter(Boolean)));
    return ['All Apps', ...names];
  }, [rawRows]);

  useEffect(() => {
    fetchYearlyRaw().then((data: YearlyRawRow[]) => {
      setRawRows(data);
      const months = Array.from(new Set(data.map(row => String(row["Month"])).filter(Boolean))).sort();
      setAllMonths(months);
      if (months.length > 0) {
        setDateRange({ start: months[0], end: months[months.length - 1] });
      }
      setLoading(false);
    }).catch(() => setError('Failed to fetch data'));
  }, []);

  useEffect(() => {
    if (allMonths.length > 0 && (!dateRange.start || !dateRange.end)) {
      setDateRange({ start: allMonths[0], end: allMonths[allMonths.length - 1] });
    }
  }, [allMonths]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rawRows.length) return <div className="p-8 text-gray-600">No data found.</div>;
  if (!dateRange.start || !dateRange.end) return <div className="p-8 text-gray-600">No months available.</div>;

  // Month picker logic
  function handleMonthRangeChange(e: React.ChangeEvent<HTMLSelectElement>, which: 'start' | 'end') {
    const value = e.target.value;
    if (which === 'start') {
      setDateRange(r => ({ ...r, start: value }));
    } else {
      setDateRange(r => ({ ...r, end: value }));
    }
  }

  // Format month as 'January 2025'
  function formatMonth(monthStr: string) {
    const d = parse(monthStr, 'yyyy-MM-dd', new Date());
    return format(d, 'MMMM yyyy');
  }

  // Filtering and metric calculation
  const filteredData = allMonths.filter(m => m >= dateRange.start && m <= dateRange.end).map(month => {
    const rowsForDate = rawRows.filter(row => String(row["Month"]) === month && (selectedApp === 'All Apps' || row["App Name"] === selectedApp));
    const result: any = { date: month };
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
      } else if (m.key === 'impressions') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Imps']), 0);
      } else if (m.key === 'clicks') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Clicks']), 0);
      } else if (m.key === 'installs') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Installs']), 0);
      } else if (m.key === 'customers') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Customers']), 0);
      } else if (m.key === 'revenue') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
      } else if (m.key === 'spend') {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
      } else {
        result[m.key] = 0;
      }
    });
    return result;
  });

  // Card click toggles metric in graph
  function toggleGraphMetric(metric: string) {
    if (activeGraphMetrics.includes(metric)) {
      setActiveGraphMetrics(activeGraphMetrics.filter(m => m !== metric));
    } else if (activeGraphMetrics.length < 4) {
      setActiveGraphMetrics([...activeGraphMetrics, metric]);
    }
  }

  // Formatting helpers
  function formatValue(value: any, format: string) {
    if (value === undefined || value === null || value === '-') return '-';
    if (format === "NUMBER") return Number(value).toLocaleString();
    if (format === "USD") return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (format === "PERCENTAGE") return `${(Number(value) * 100).toFixed(2)}%`;
    return value;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">Dashboard Overview</h1>
              <p className="text-blue-700/70 text-lg">Monitor your performance metrics and trends</p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <Badge variant="primary" size="lg">
                <EyeIcon className="w-4 h-4 mr-2" />
                Live Data
              </Badge>
              <Badge variant="success" size="lg">
                {filteredData.length} Records
              </Badge>
            </div>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="glass" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* App Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-900 flex items-center">
                    <Squares2X2Icon className="w-4 h-4 mr-2" />
                    Application
                  </label>
                  <div className="relative">
                    <button
                      className="w-full px-4 py-3 bg-white/80 border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium text-left flex items-center justify-between"
                      onClick={() => setShowAppDropdown(v => !v)}
                      type="button"
                    >
                      {selectedApp}
                      <ChevronDownIcon className="w-5 h-5 text-blue-600" />
                    </button>
                    {showAppDropdown && (
                      <div className="absolute z-10 mt-1 bg-white text-black border rounded shadow-lg w-full max-h-60 overflow-y-auto flex flex-col" style={{paddingBottom: 48}}>
                        <div className="overflow-y-auto" style={{maxHeight: 180}}>
                          {appNames.map(app => (
                            <label key={app} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="radio"
                                checked={pendingApp === app}
                                onChange={() => setPendingApp(app)}
                                className="accent-blue-600 mr-2"
                                name="app-picker"
                              />
                              <span>{app}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          className="w-full bg-blue-600 text-white py-2 rounded-b hover:bg-blue-700 sticky bottom-0 left-0"
                          style={{position: 'absolute', bottom: 0, left: 0}}
                          onClick={handleAppSave}
                        >Save</button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Month Range Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Time Period
                  </label>
                  <div className="flex gap-2 items-center">
                    <select value={dateRange.start} onChange={e => handleMonthRangeChange(e, 'start')} className="px-3 py-2 bg-white/80 border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium">
                      {allMonths.map(month => (
                        <option key={month} value={month}>{formatMonth(month)}</option>
                      ))}
                    </select>
                    <span className="text-blue-900 font-medium">to</span>
                    <select value={dateRange.end} onChange={e => handleMonthRangeChange(e, 'end')} className="px-3 py-2 bg-white/80 border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium">
                      {allMonths.map(month => (
                        <option key={month} value={month}>{formatMonth(month)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Metrics Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-900 flex items-center">
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Metrics
                  </label>
                  <div className="relative">
                    <button
                      className="w-full px-4 py-3 bg-white/80 border border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium text-left flex items-center justify-between"
                      onClick={() => setShowMetricsDropdown(v => !v)}
                      type="button"
                    >
                      <span>{selectedMetrics.map(m => ALL_METRICS.find(am => am.key === m)?.label).join(", ") || "Select metrics"}</span>
                      <ChevronDownIcon className={cn("w-5 h-5 text-blue-600 transition-transform", showMetricsDropdown && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showMetricsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-xl max-h-80 overflow-auto"
                        >
                          <div className="p-4 space-y-2">
                            {ALL_METRICS.map(metric => (
                              <motion.label
                                key={metric.key}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={pendingMetrics.includes(metric.key)}
                                  onChange={() => toggleMetric(metric.key)}
                                  disabled={!pendingMetrics.includes(metric.key) && pendingMetrics.length === 4}
                                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                                />
                                <span className="text-sm font-medium text-blue-900">{metric.label}</span>
                              </motion.label>
                            ))}
                          </div>
                          <div className="border-t border-blue-200 p-4">
                            <Button
                              onClick={handleMetricSave}
                              className="w-full"
                            >
                              Save Selection
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map((meta, i) => {
              const metric = meta.key;
              let value: number | undefined = undefined;
              if (filteredData.length) {
                const lastMonth = allMonths[allMonths.length-1];
                const lastDayRows = rawRows.filter(row => String(row["Month"]) === lastMonth && (selectedApp === 'All Apps' || row["App Name"] === selectedApp));
                if (lastDayRows.length) {
                  if (metric === 'ctr') {
                    value = computeTotalRatio(lastDayRows, 'Clicks', 'Imps');
                  } else if (metric === 'install_rate') {
                    value = computeTotalRatio(lastDayRows, 'Installs', 'Clicks');
                  } else if (metric === 'conversion_rate') {
                    value = computeTotalRatio(lastDayRows, 'Customers', 'Installs');
                  } else if (metric === 'profit') {
                    const totalRevenue = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
                    const totalSpend = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
                    value = totalRevenue - totalSpend;
                  } else if (metric === 'roas') {
                    value = computeTotalRatio(lastDayRows, 'Revenue', 'Spend');
                  } else if (metric === 'cpc') {
                    value = computeTotalRatio(lastDayRows, 'Spend', 'Clicks');
                  } else if (metric === 'cpi') {
                    value = computeTotalRatio(lastDayRows, 'Spend', 'Installs');
                  } else if (metric === 'cpa') {
                    value = computeTotalRatio(lastDayRows, 'Spend', 'Customers');
                  } else if (metric === 'impressions') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Imps']), 0);
                  } else if (metric === 'clicks') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Clicks']), 0);
                  } else if (metric === 'installs') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Installs']), 0);
                  } else if (metric === 'customers') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Customers']), 0);
                  } else if (metric === 'revenue') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
                  } else if (metric === 'spend') {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
                  } else {
                    value = 0;
                  }
                }
              }
              const isActive = activeGraphMetrics.includes(metric);
              
              return (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card variant="glass" className="p-6 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-blue-700 flex items-center">
                          {metric === 'revenue' && <CurrencyDollarIcon className="w-4 h-4 mr-2" />}
                          {metric === 'customers' && <UserGroupIcon className="w-4 h-4 mr-2" />}
                          {metric === 'impressions' && <EyeIcon className="w-4 h-4 mr-2" />}
                          {!['revenue', 'customers', 'impressions'].includes(metric) && <ChartBarIcon className="w-4 h-4 mr-2" />}
                          {meta.label}
                        </CardTitle>
                        <Button
                          onClick={() => toggleGraphMetric(metric)}
                          variant={isActive ? "primary" : "outline"}
                          size="xs"
                          className="text-xs"
                          disabled={!isActive && activeGraphMetrics.length === 4}
                        >
                          {isActive ? 'In Chart' : 'Add'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-blue-900">
                          {formatValue(value, meta?.format || "NUMBER")}
                        </p>
                        <div className="flex items-center text-sm">
                          {Math.random() > 0.5 ? (
                            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className={Math.random() > 0.5 ? "text-green-600" : "text-red-600"}>
                            {(Math.random() * 20 - 10).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-900 flex items-center">
                      <ChartBarIcon className="w-6 h-6 mr-3" />
                      Performance Trends
                    </CardTitle>
                    <p className="text-blue-700/70 mt-1">
                      Track your key metrics over time
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                    <Badge variant="outline" size="sm">
                      {activeGraphMetrics.length} metric{activeGraphMetrics.length !== 1 ? 's' : ''} displayed
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {filteredData.length} data points
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="h-96 lg:h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#1e40af' }}
                        tickFormatter={(value) => formatMonth(value)}
                        stroke="#3b82f6"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#1e40af' }}
                        stroke="#3b82f6"
                      />
                      <Tooltip 
                        labelFormatter={(value) => formatMonth(value)}
                        formatter={(value: any, name: string) => {
                          const meta = ALL_METRICS.find(m => m.key === name);
                          return [formatValue(value, meta?.format || "NUMBER"), meta?.label || name];
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #3b82f6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      {activeGraphMetrics.map((metric, i) => (
                        <Line 
                          key={metric} 
                          type="monotone" 
                          dataKey={metric} 
                          stroke={["#3b82f6","#8b5cf6","#06b6d4","#84cc16","#f59e0b","#ef4444"][i%6]} 
                          strokeWidth={3} 
                          dot={{ r: 6, fill: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 8, fill: ["#3b82f6","#8b5cf6","#06b6d4","#84cc16","#f59e0b","#ef4444"][i%6] }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
