"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { format, parse } from 'date-fns';
import { fetchYearlyRaw } from '../../../utils/yearlyraw';
import type { YearlyRawRow } from '../../../utils/yearlyraw';

const ALL_METRICS = [
  { key: "impressions", csvKey: "Imps", label: "Impressions", format: "NUMBER" },
  { key: "clicks", csvKey: "Clicks", label: "Clicks", format: "NUMBER" },
  { key: "installs", csvKey: "Installs", label: "Installs", format: "NUMBER" },
  { key: "customers", csvKey: "Customers", label: "Customers", format: "NUMBER" },
  { key: "revenue", csvKey: "Revenue", label: "Revenue", format: "USD" },
  { key: "spend", csvKey: "Spend", label: "Spend", format: "USD" },
  { key: "ctr", label: "CTR", format: "PERCENTAGE" },
  { key: "install_rate", label: "Install Rate", format: "PERCENTAGE" },
  { key: "conversion_rate", label: "Conversion Rate", format: "PERCENTAGE" },
  { key: "profit", label: "Profit", format: "USD" },
  { key: "roas", label: "ROAS", format: "PERCENTAGE" },
  { key: "cpc", label: "CPC", format: "USD" },
  { key: "cpi", label: "CPI", format: "USD" },
  { key: "cpa", label: "CPA", format: "USD" },
];

const DEFAULT_METRICS = ["installs", "install_rate", "cpi", "spend"];

function cleanNumber(val: any): number {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function computeTotalRatio(rows: any[], numeratorKey: string, denominatorKey: string): number {
  const numerator = rows.reduce((sum, row) => sum + cleanNumber(row[numeratorKey]), 0);
  const denominator = rows.reduce((sum, row) => sum + cleanNumber(row[denominatorKey]), 0);
  return denominator ? numerator / denominator : 0;
}

function formatValue(value: any, format: string): string {
  if (value === undefined || value === null || value === '-') return '-';
  if (format === "NUMBER") return Number(value).toLocaleString();
  if (format === "USD") return `$${Number(value).toLocaleString()}`;
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

interface MetricsDropdownProps {
  label: string;
  selectedMetrics: string[];
  onChange: (metrics: string[]) => void;
  maxSelection?: number;
}

function MetricsDropdown({ label, selectedMetrics, onChange, maxSelection = 4 }: MetricsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMetrics, setPendingMetrics] = useState(selectedMetrics);
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

  useEffect(() => {
    setPendingMetrics(selectedMetrics);
  }, [selectedMetrics]);

  const toggleMetric = (metricKey: string) => {
    if (pendingMetrics.includes(metricKey)) {
      setPendingMetrics(pendingMetrics.filter(m => m !== metricKey));
    } else if (pendingMetrics.length < maxSelection) {
      setPendingMetrics([...pendingMetrics, metricKey]);
    }
  };

  const handleSave = () => {
    onChange(pendingMetrics);
    setIsOpen(false);
  };

  const selectedLabels = selectedMetrics
    .map(key => ALL_METRICS.find(m => m.key === key)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:bg-slate-700 transition-colors"
      >
        <span className="truncate">{selectedLabels || "Select metrics"}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
          <div className="max-h-60 overflow-y-auto p-2">
            {ALL_METRICS.map((metric) => (
              <label
                key={metric.key}
                className="flex items-center px-3 py-2 hover:bg-slate-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pendingMetrics.includes(metric.key)}
                  onChange={() => toggleMetric(metric.key)}
                  disabled={!pendingMetrics.includes(metric.key) && pendingMetrics.length >= maxSelection}
                  className="mr-3 accent-blue-500"
                />
                <span className="text-white">{metric.label}</span>
              </label>
            ))}
          </div>
          <div className="border-t border-slate-600 p-2">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Save Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function YearlyPerformanceOverview() {
  const [rawRows, setRawRows] = useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [selectedApp, setSelectedApp] = useState<string>('All Apps');
  const [activeGraphMetrics, setActiveGraphMetrics] = useState<string[]>(DEFAULT_METRICS);

  const appNames = useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"])))).filter(Boolean);
    return ['All Apps', ...names];
  }, [rawRows]);

  useEffect(() => {
    fetchYearlyRaw().then((data: YearlyRawRow[]) => {
      setRawRows(data);
      const months = Array.from(new Set(data.map(row => String(row["Month"])))).sort();
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

    return rawRows.filter(row => {
      const month = String(row["Month"]);
      const app = String(row["App Name"]);
      const inDateRange = month >= dateRange.start && month <= dateRange.end;
      const inAppFilter = selectedApp === 'All Apps' || app === selectedApp;
      return inDateRange && inAppFilter;
    });
  }, [rawRows, dateRange, selectedApp]);

  const chartData = useMemo(() => {
    if (!filteredData.length) return [];

    const monthlyData: Record<string, any> = {};
    
    filteredData.forEach(row => {
      const month = String(row["Month"]);
      if (!monthlyData[month]) {
        monthlyData[month] = { date: formatMonth(month) };
        ALL_METRICS.forEach(metric => {
          monthlyData[month][metric.key] = 0;
        });
      }

      // Add raw values
      ALL_METRICS.forEach(metric => {
        if (metric.csvKey && row[metric.csvKey] !== undefined) {
          monthlyData[month][metric.key] += cleanNumber(row[metric.csvKey]);
        }
      });
    });

    // Calculate derived metrics
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.ctr = computeTotalRatio(filteredData.filter(r => String(r["Month"]) === month), "Clicks", "Imps");
      data.install_rate = computeTotalRatio(filteredData.filter(r => String(r["Month"]) === month), "Installs", "Clicks");
      data.conversion_rate = computeTotalRatio(filteredData.filter(r => String(r["Month"]) === month), "Customers", "Installs");
      data.profit = data.revenue - data.spend;
      data.roas = data.spend > 0 ? data.revenue / data.spend : 0;
      data.cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
      data.cpi = data.installs > 0 ? data.spend / data.installs : 0;
      data.cpa = data.customers > 0 ? data.spend / data.customers : 0;
    });

    return Object.values(monthlyData);
  }, [filteredData]);

  const toggleGraphMetric = (metric: string) => {
    if (activeGraphMetrics.includes(metric)) {
      setActiveGraphMetrics(activeGraphMetrics.filter(m => m !== metric));
    } else if (activeGraphMetrics.length < 4) {
      setActiveGraphMetrics([...activeGraphMetrics, metric]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-slate-300 text-lg">Loading yearly performance data...</span>
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

  const latestData = chartData.length > 0 ? chartData[chartData.length - 1] : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Yearly Performance Overview</h1>
              <p className="text-slate-300 mt-1">Comprehensive analytics and trends across all metrics</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Performance Analytics
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {allMonths.length} Months
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Squares2X2Icon className="h-4 w-4 mr-1" />
              {appNames.length - 1} Apps
            </Badge>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Filters & Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <MetricsDropdown
                label="Metrics"
                selectedMetrics={selectedMetrics}
                onChange={setSelectedMetrics}
              />
            </div>
          </Card>
        </motion.div>

        {/* Metric Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map((metric) => {
              const value = latestData[metric.key] || 0;
              const isActive = activeGraphMetrics.includes(metric.key);
              const isDisabled = !isActive && activeGraphMetrics.length >= 4;
              
              return (
                <motion.button
                  key={metric.key}
                  onClick={() => !isDisabled && toggleGraphMetric(metric.key)}
                  disabled={isDisabled}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/20 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                      : isDisabled
                      ? 'bg-slate-800/30 border-slate-600 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500'
                  }`}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium mb-2">{metric.label}</div>
                    <div className="text-2xl font-bold">{formatValue(value, metric.format)}</div>
                    {isActive && (
                      <div className="mt-2 text-xs text-blue-300">Active in chart</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Performance Trends</h2>
              <div className="flex flex-wrap gap-2">
                {activeGraphMetrics.map((metric, index) => {
                  const metricInfo = ALL_METRICS.find(m => m.key === metric);
                  const colors = ["#3b82f6", "#a259f7", "#22d3ee", "#a3d900"];
                  return (
                    <Badge 
                      key={metric} 
                      variant="secondary" 
                      className="text-white border-0"
                      style={{ backgroundColor: colors[index % 4] + '40', color: colors[index % 4] }}
                    >
                      {metricInfo?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div className="h-[500px] w-full">
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
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                    formatter={(value: any, name: string) => {
                      const meta = ALL_METRICS.find(m => m.key === name);
                      return [formatValue(value, meta?.format || "NUMBER"), meta?.label];
                    }}
                  />
                  <Legend />
                  {activeGraphMetrics.map((metric, i) => {
                    const colors = ["#3b82f6", "#a259f7", "#22d3ee", "#a3d900"];
                    return (
                      <Line 
                        key={metric} 
                        type="monotone" 
                        dataKey={metric} 
                        stroke={colors[i % 4]} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: colors[i % 4], strokeWidth: 2, stroke: '#1e293b' }}
                        activeDot={{ r: 6, fill: colors[i % 4] }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}