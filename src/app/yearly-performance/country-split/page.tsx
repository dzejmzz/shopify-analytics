"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { format, parse } from 'date-fns';
import { fetchUnifiedData, getMonthlyData, cleanNumber, computeTotalRatio } from '../../../utils/unifiedData';
import type { UnifiedDataRow } from '../../../utils/unifiedData';
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronUpDownIcon,
  ChartPieIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

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
  { name: "Month to Month", icon: ArrowTrendingUpIcon, href: "/yearly-performance/month-to-month" },
  { name: "Month on Month Progress", icon: ArrowTrendingUpIcon, href: "/yearly-performance/month-on-month-progress" },
  { name: "Country Split", icon: ChartPieIcon, href: "/yearly-performance/country-split", active: true },
  { name: "Device Split", icon: Squares2X2Icon, href: "/yearly-performance/device-split" },
];

// cleanNumber is imported from unifiedData utility

// computeTotalRatio is imported from unifiedData utility

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatOption?: (option: string) => string;
}

function Dropdown({ label, value, options, onChange, formatOption }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative min-w-[200px]" ref={ref}>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <span className="truncate">{formatOption ? formatOption(value) : value}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map(option => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                value === option ? 'bg-blue-600/20 text-blue-300' : 'text-white'
              }`}
            >
              {formatOption ? formatOption(option) : option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CountrySplit() {
  const [rawRows, setRawRows] = useState<UnifiedDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedApp, setSelectedApp] = useState<string>('All Apps');
  const [sortKey, setSortKey] = useState<string>('impressions');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const appNames = useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"]).trim()).filter(Boolean)));
    return ['All Apps', ...names];
  }, [rawRows]);

  const allDates = useMemo(() => {
    return Array.from(new Set(rawRows.map(row => String(row["Month"]).trim()).filter(Boolean))).sort();
  }, [rawRows]);

  const allCountries = useMemo(() => {
    return Array.from(new Set(rawRows.map(row => String(row["Country"]).trim()).filter(Boolean))).sort();
  }, [rawRows]);

  useEffect(() => {
    if (allDates.length > 0 && (!dateRange.start || !dateRange.end)) {
      setDateRange({ start: allDates[0], end: allDates[allDates.length - 1] });
    }
  }, [allDates]);

  useEffect(() => {
    fetchUnifiedData().then((data: UnifiedDataRow[]) => {
      // Convert to monthly data for trends analysis
      const monthlyData = getMonthlyData(data);
      setRawRows(monthlyData);
      setLoading(false);
    }).catch((error) => {
      setError('Failed to fetch data');
      setLoading(false);
    });
  }, []);

  const filteredData = useMemo(() => {
    return allCountries.map(country => {
      const rowsForCountry = rawRows.filter(row => {
        const month = row["Month"];
        const inDateRange = month && month >= dateRange.start && month <= dateRange.end;
        const appMatch = selectedApp === 'All Apps' || row["App Name"] === selectedApp;
        return String(row["Country"]).trim() === country && inDateRange && appMatch;
      });

      const result: any = { country };
      ALL_METRICS.forEach(m => {
        if (m.key === 'ctr') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Clicks', 'Impressions');
        } else if (m.key === 'install_rate') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Installs', 'Clicks');
        } else if (m.key === 'conversion_rate') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Customers', 'Installs');
        } else if (m.key === 'profit') {
          const totalRevenue = rowsForCountry.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
          const totalSpend = rowsForCountry.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
          result[m.key] = totalRevenue - totalSpend;
        } else if (m.key === 'roas') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Revenue', 'Spend');
        } else if (m.key === 'cpc') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Spend', 'Clicks');
        } else if (m.key === 'cpi') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Spend', 'Installs');
        } else if (m.key === 'cpa') {
          result[m.key] = computeTotalRatio(rowsForCountry, 'Spend', 'Customers');
        } else if (m.csvKey) {
          result[m.key] = rowsForCountry.reduce((sum, row) => sum + cleanNumber(row[m.csvKey]), 0);
        } else {
          result[m.key] = 0;
        }
      });
      return result;
    }).filter(row => row.impressions > 0);
  }, [allCountries, rawRows, dateRange, selectedApp]);

  const sortedData = useMemo(() => {
    const arr = [...filteredData];
    arr.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (aVal === bVal) return 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
    return arr;
  }, [filteredData, sortKey, sortAsc]);

  function formatValue(value: any, format: string) {
    if (value === undefined || value === null) return '-';
    if (value === '#DIV/0!') return value;
    if (format === "NUMBER") return Number(value).toLocaleString();
    if (format === "USD") return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (format === "PERCENTAGE") return `${(Number(value) * 100).toFixed(2)}%`;
    return value;
  }

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(v => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function exportToCSV() {
    const headers = ['Country', ...ALL_METRICS.map(m => m.label)];
    const rows = sortedData.map(row => [
      row.country,
      ...ALL_METRICS.map(m => row[m.key])
    ]);
    const csvContent = [headers, ...rows]
      .map(r => r.map(val => (val === undefined || val === null ? '' : String(val).replace(/"/g, '""'))).map(val => `"${val}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `country-split-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatMonth(month: string) {
    if (!month) return '';
    try {
      return format(parse(month, 'yyyy-MM-dd', new Date()), 'MMMM yyyy');
    } catch {
      return month;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading country data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-xl text-red-400">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!rawRows.length || !dateRange.start || !dateRange.end) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-xl text-slate-400">No data available</p>
        </motion.div>
      </div>
    );
  }

  const totalCountries = sortedData.length;
  const totalRevenue = sortedData.reduce((sum, row) => sum + (row.revenue || 0), 0);
  const totalSpend = sortedData.reduce((sum, row) => sum + (row.spend || 0), 0);

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
                  <GlobeAltIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Geo Insights</h1>
                  <p className="text-slate-300 mt-1">Compare installs and spend by country.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  Geographic Analysis
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <ChartPieIcon className="h-4 w-4 mr-1" />
                  {totalCountries} Countries
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatMonth(dateRange.start)} - {formatMonth(dateRange.end)}
                </Badge>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  ${totalRevenue.toLocaleString()} Revenue
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-5 w-5 text-slate-300" />
                    <h2 className="text-xl font-semibold text-white">Filters & Export</h2>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Dropdown
                    label="App"
                    value={selectedApp}
                    options={appNames}
                    onChange={setSelectedApp}
                  />
                  <Dropdown
                    label="Start Month"
                    value={dateRange.start}
                    options={allDates}
                    onChange={(value) => setDateRange(r => ({ ...r, start: value }))}
                    formatOption={formatMonth}
                  />
                  <Dropdown
                    label="End Month"
                    value={dateRange.end}
                    options={allDates}
                    onChange={(value) => setDateRange(r => ({ ...r, end: value }))}
                    formatOption={formatMonth}
                  />
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                    <div className="flex gap-2">
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-3 text-white"
                      >
                        {ALL_METRICS.map(metric => (
                          <option key={metric.key} value={metric.key}>{metric.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSortAsc(v => !v)}
                        className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors"
                      >
                        {sortAsc ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
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
                  <h2 className="text-xl font-semibold text-white mb-2">Country Performance Data</h2>
                  <p className="text-slate-300 text-sm">Click column headers to sort by different metrics</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-slate-700/40 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="border-b border-slate-600/50 bg-slate-600/50">
                        <th className="text-left py-4 px-4 font-semibold text-slate-100 sticky left-0 bg-slate-600/60 backdrop-blur-sm z-10 min-w-[140px]">
                          Country
                        </th>
                        {ALL_METRICS.map(metric => (
                          <th
                            key={metric.key}
                            onClick={() => handleSort(metric.key)}
                            className="text-center py-4 px-3 font-semibold text-slate-100 whitespace-nowrap min-w-[100px] cursor-pointer hover:bg-slate-500/40 transition-colors"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{metric.label}</span>
                              {sortKey === metric.key ? (
                                sortAsc ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />
                              ) : (
                                <ChevronUpDownIcon className="h-3 w-3 opacity-50" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((row, i) => (
                        <tr key={row.country} className="border-b border-slate-600/30 hover:bg-slate-600/30 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-100 sticky left-0 bg-slate-700/50 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🌍</span>
                              <span>{row.country}</span>
                            </div>
                          </td>
                          {ALL_METRICS.map(metric => (
                            <td key={metric.key} className="py-4 px-3 text-center text-slate-200">
                              {formatValue(row[metric.key], metric.format)}
                            </td>
                          ))}
                        </tr>
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