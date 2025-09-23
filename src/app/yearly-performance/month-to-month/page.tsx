"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { format, parse } from 'date-fns';
import { fetchYearlyRaw } from '../../../utils/yearlyraw';
import type { YearlyRawRow } from '../../../utils/yearlyraw';

const ALL_METRICS = [
  { key: "impressions", csvKey: "Impressions", label: "Impressions", format: "NUMBER" },
  { key: "clicks", csvKey: "Clicks", label: "Clicks", format: "NUMBER" },
  { key: "ctr", csvKey: "Click Through Rate", label: "CTR", format: "PERCENTAGE" },
  { key: "installs", csvKey: "Installs", label: "Installs", format: "NUMBER" },
  { key: "install_rate", csvKey: "Install Rate", label: "Install Rate", format: "PERCENTAGE" },
  { key: "customers", csvKey: "Customers", label: "Customers", format: "NUMBER" },
  { key: "conversion_rate", csvKey: "Conversion Rate", label: "Conversion Rate", format: "PERCENTAGE" },
  { key: "revenue", csvKey: "Revenue", label: "Revenue", format: "USD" },
  { key: "spend", csvKey: "Spend", label: "Spend", format: "USD" },
  { key: "profit", label: "Profit", format: "USD" },
  { key: "roas", csvKey: "Return On Spend", label: "ROAS", format: "PERCENTAGE" },
  { key: "cpc", csvKey: "Cost Per Click", label: "CPC", format: "USD" },
  { key: "cpi", csvKey: "Cost Per Install", label: "CPI", format: "USD" },
  { key: "cpa", csvKey: "Cost Per Customer", label: "CPA", format: "USD" },
];

const sidebarItems = [
  { name: "Overview", icon: ChartBarIcon, href: "/yearly-performance/overview" },
  { name: "Home", icon: HomeIcon, href: "/yearly-performance/home" },
  { name: "Month to Month", icon: ArrowTrendingUpIcon, href: "/yearly-performance/month-to-month", active: true },
  { name: "Country Split", icon: ChartPieIcon, href: "/yearly-performance/country-split" },
  { name: "Device Split", icon: Squares2X2Icon, href: "/yearly-performance/device-split" },
];

function cleanNumber(val: any): number {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function computeTotalRatio(rows: any[], numeratorKey: string, denominatorKey: string): number | null {
  const numerator = rows.reduce((sum, row) => sum + cleanNumber(row[numeratorKey]), 0);
  const denominator = rows.reduce((sum, row) => sum + cleanNumber(row[denominatorKey]), 0);
  return denominator ? numerator / denominator : null;
}

function formatValue(value: any, format: string): string {
  if (value === undefined || value === null) return '-';
  if (value === '#DIV/0!') return value;
  if (format === "NUMBER") return Number(value).toLocaleString();
  if (format === "USD") return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (format === "PERCENTAGE") return `${(Number(value) * 100).toFixed(2)}%`;
  return String(value);
}

function formatMonth(monthStr: string): string {
  const d = parse(monthStr, 'yyyy-MM-dd', new Date());
  return format(d, 'MMMM yyyy');
}

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatOption?: (option: string) => string;
}

function Dropdown({ label, value, options, onChange, formatOption }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <span>{formatOption ? formatOption(value) : value}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <span>{formatOption ? formatOption(option) : option}</span>
              {value === option && <CheckIcon className="h-4 w-4 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChangeIndicator({ value, isCostMetric }: { value: number; isCostMetric: boolean }) {
  if (!isFinite(value) || value === 0) {
    return (
      <div className="flex items-center gap-1 text-slate-400">
        <MinusIcon className="h-3 w-3" />
        <span>-</span>
      </div>
    );
  }

  const isPositive = value > 0;
  const isGood = isCostMetric ? !isPositive : isPositive;
  const colorClass = isGood ? 'text-green-400' : 'text-red-400';
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{Math.abs(value * 100).toFixed(2)}%</span>
    </div>
  );
}

export default function MonthToMonth() {
  const [rawRows, setRawRows] = useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedApp, setSelectedApp] = useState<string>('All Apps');

  const appNames = useMemo(() => {
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
    }).catch(() => {
      setError('Failed to fetch data');
      setLoading(false);
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!rawRows.length || !dateRange.start || !dateRange.end) return [];

    return allMonths.filter(m => m >= dateRange.start && m <= dateRange.end).map(month => {
      const rowsForDate = rawRows.filter(row => 
        String(row["Month"]) === month && 
        (selectedApp === 'All Apps' || row["App Name"] === selectedApp)
      );
      
      const result: any = { month };
      
      ALL_METRICS.forEach(m => {
        if (m.key === 'ctr') {
          result[m.key] = computeTotalRatio(rowsForDate, 'Clicks', 'Impressions');
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
          result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row[m.csvKey!]), 0);
        } else {
          result[m.key] = 0;
        }
      });
      
      return result;
    });
  }, [rawRows, allMonths, dateRange, selectedApp]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-slate-300 text-lg">Loading month-to-month data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  if (!rawRows.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">No data found.</div>
      </div>
    );
  }

  const costMetrics = ['spend', 'cpc', 'cpi', 'cpa'];

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
                  <h1 className="text-3xl font-bold text-white">Month-to-Month Analysis</h1>
                  <p className="text-slate-300 mt-1">Track performance changes across months with detailed comparisons</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Trend Analysis
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {filteredData.length} Months
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Squares2X2Icon className="h-4 w-4 mr-1" />
                  {ALL_METRICS.length} Metrics
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
                  <Dropdown
                    label="App"
                    value={selectedApp}
                    options={appNames}
                    onChange={setSelectedApp}
                  />
                  <Dropdown
                    label="Start Month"
                    value={dateRange.start}
                    options={allMonths}
                    onChange={(value) => setDateRange(prev => ({ ...prev, start: value }))}
                    formatOption={formatMonth}
                  />
                  <Dropdown
                    label="End Month"
                    value={dateRange.end}
                    options={allMonths}
                    onChange={(value) => setDateRange(prev => ({ ...prev, end: value }))}
                    formatOption={formatMonth}
                  />
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
                  <h2 className="text-xl font-semibold text-white mb-2">Monthly Performance Data</h2>
                  <p className="text-slate-300 text-sm">Values and month-over-month percentage changes</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-slate-700/40 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-600/50 bg-slate-600/50">
                        <th className="text-left py-4 px-4 font-semibold text-slate-100 sticky left-0 bg-slate-600/60 backdrop-blur-sm z-10 min-w-[140px]">
                          Month
                        </th>
                        {ALL_METRICS.map(metric => (
                          <th key={metric.key} className="text-center py-4 px-3 font-semibold text-slate-100 whitespace-nowrap min-w-[120px]">
                            {metric.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, i) => {
                        const prev = i > 0 ? filteredData[i - 1] : null;
                        return (
                          <React.Fragment key={row.month}>
                            {/* Main data row */}
                            <tr className="border-b border-slate-600/30 hover:bg-slate-600/30 transition-colors">
                              <td className="py-4 px-4 font-medium text-slate-100 sticky left-0 bg-slate-700/50 backdrop-blur-sm z-10">
                                {formatMonth(row.month)}
                              </td>
                              {ALL_METRICS.map(metric => (
                                <td key={metric.key} className="py-4 px-3 text-center text-slate-200">
                                  {formatValue(row[metric.key], metric.format)}
                                </td>
                              ))}
                            </tr>
                            
                            {/* Change row - only show if not the first row */}
                            {i > 0 && (
                              <tr className="border-b border-slate-600/20 bg-slate-800/40">
                                <td className="py-2 px-4 text-xs italic text-slate-300 sticky left-0 bg-slate-800/60 backdrop-blur-sm z-10">
                                  vs previous month
                                </td>
                                {ALL_METRICS.map(metric => {
                                  if (!prev || prev[metric.key] === 0 || prev[metric.key] === undefined || prev[metric.key] === null) {
                                    return (
                                      <td key={metric.key} className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center">
                                          <span className="text-slate-500">-</span>
                                        </div>
                                      </td>
                                    );
                                  }
                                  
                                  const currVal = row[metric.key];
                                  const prevVal = prev[metric.key];
                                  
                                  if (currVal === undefined || currVal === null || currVal === 0) {
                                    return (
                                      <td key={metric.key} className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center">
                                          <span className="text-slate-500">-</span>
                                        </div>
                                      </td>
                                    );
                                  }
                                  
                                  const pctChange = (currVal - prevVal) / Math.abs(prevVal);
                                  const isCostMetric = costMetrics.includes(metric.key);
                                  
                                  return (
                                    <td key={metric.key} className="py-2 px-3">
                                      <div className="flex items-center justify-center">
                                        <ChangeIndicator value={pctChange} isCostMetric={isCostMetric} />
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
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