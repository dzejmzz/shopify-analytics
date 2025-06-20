"use client";
import React, { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DateRange } from 'react-date-range';
import { format, parse, startOfMonth, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';

const ALL_METRICS = [
  { key: "impressions", csvKey: "Imps", label: "Impressions", format: "NUMBER" },
  { key: "clicks", csvKey: "Clicks", label: "Clicks", format: "NUMBER" },
  { key: "installs", csvKey: "Installs", label: "Installs", format: "NUMBER" },
  { key: "customers", csvKey: "Customers", label: "Customers", format: "NUMBER" },
  { key: "revenue", csvKey: "Revenue", label: "Revenue", format: "USD" },
  { key: "spend", csvKey: "Spend", label: "Spend", format: "USD" },
  { key: "ctr", label: "CTR", format: "PERCENTAGE", compute: (row: any) => {
    const imps = Number(row["Imps"]);
    const clicks = Number(row["Clicks"]);
    return imps ? clicks / imps : 0;
  } },
  { key: "install_rate", label: "Install Rate", format: "PERCENTAGE", compute: (row: any) => {
    const imps = Number(row["Imps"]);
    const installs = Number(row["Installs"]);
    return imps ? installs / imps : 0;
  } },
  { key: "conversion_rate", label: "Conversion Rate", format: "PERCENTAGE", compute: (row: any) => {
    const installs = Number(row["Installs"]);
    const customers = Number(row["Customers"]);
    return installs ? customers / installs : 0;
  } },
  { key: "profit", label: "Profit", format: "USD", compute: (row: any) => {
    const revenue = cleanNumber(row["Revenue"]);
    const cost = cleanNumber(row["Spend"]);
    return revenue - cost;
  } },
  { key: "roas", label: "ROAS", format: "PERCENTAGE", compute: (row: any) => {
    const cost = cleanNumber(row["Spend"]);
    const revenue = cleanNumber(row["Revenue"]);
    return cost ? revenue / cost : 0;
  } },
  { key: "cpc", label: "CPC", format: "USD", compute: (row: any) => {
    const clicks = cleanNumber(row["Clicks"]);
    const cost = cleanNumber(row["Spend"]);
    return clicks ? cost / clicks : 0;
  } },
  { key: "cpi", label: "CPI", format: "USD", compute: (row: any) => {
    const installs = cleanNumber(row["Installs"]);
    const cost = cleanNumber(row["Spend"]);
    return installs ? cost / installs : 0;
  } },
  { key: "cpa", label: "CPA", format: "USD", compute: (row: any) => {
    const customers = cleanNumber(row["Customers"]);
    const cost = cleanNumber(row["Spend"]);
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
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start p-10">
        <div className="w-full max-w-[2200px]">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
            {/* App Picker (styled dropdown) */}
            <div className="flex flex-col relative" style={{ minWidth: 180 }} ref={appDropdownRef}>
              <label className="text-sm mb-1">App</label>
              <button
                className="rounded px-2 py-1 bg-white text-black border border-gray-300 min-w-[180px] text-left h-[44px] flex items-center"
                onClick={() => setShowAppDropdown(v => !v)}
                type="button"
              >
                {appNames.find(app => app === selectedApp) || "Select app"}
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
            {/* Date Range Picker (single dropdown calendar) */}
            <div className="flex flex-col relative" style={{ minWidth: 220 }} ref={dateDropdownRef}>
              <label className="text-sm mb-1">Date Range</label>
              <button
                className="flex gap-2 items-center bg-white text-black rounded px-3 py-2 h-[44px] border border-gray-300 min-w-[220px] text-left"
                onClick={() => setShowDateDropdown(v => !v)}
                type="button"
              >
                {format(parse(dateRange.start, 'dd/MM/yyyy', new Date()), 'MMM dd, yyyy')} - {format(parse(dateRange.end, 'dd/MM/yyyy', new Date()), 'MMM dd, yyyy')}
              </button>
              {showDateDropdown && allDates.length > 0 && (
                <div className="absolute z-20 mt-2 bg-white text-black border rounded shadow-lg">
                  <DateRange
                    ranges={range}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="horizontal"
                    rangeColors={["#2563eb"]}
                    minDate={parse(allDates[0], 'dd/MM/yyyy', new Date())}
                    maxDate={parse(allDates[allDates.length-1], 'dd/MM/yyyy', new Date())}
                  />
                </div>
              )}
            </div>
            {/* Metrics Picker (custom dropdown) */}
            <div className="flex flex-col relative" style={{ minWidth: 180 }} ref={metricsDropdownRef}>
              <label className="text-sm mb-1">Metrics</label>
              <button
                className="rounded px-2 py-1 bg-white text-black border border-gray-300 min-w-[180px] text-left h-[44px] flex items-center"
                onClick={() => setShowMetricsDropdown(v => !v)}
                type="button"
              >
                {selectedMetrics.map(m => ALL_METRICS.find(am => am.key === m)?.label).join(", ") || "Select metrics"}
              </button>
              {showMetricsDropdown && (
                <div className="absolute z-10 mt-1 bg-white text-black border rounded shadow-lg w-full max-h-60 overflow-y-auto flex flex-col" style={{paddingBottom: 48}}>
                  <div className="overflow-y-auto" style={{maxHeight: 180}}>
                    {ALL_METRICS.map(metric => (
                      <label key={metric.key} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pendingMetrics.includes(metric.key)}
                          onChange={() => toggleMetric(metric.key)}
                          disabled={!pendingMetrics.includes(metric.key) && pendingMetrics.length === 4}
                          className="accent-blue-600 mr-2"
                        />
                        <span>{metric.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded-b hover:bg-blue-700 sticky bottom-0 left-0"
                    style={{position: 'absolute', bottom: 0, left: 0}}
                    onClick={handleMetricSave}
                  >Save</button>
                </div>
              )}
            </div>
          </div>
          {/* Metric cards (only 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map((meta, i) => {
              const metric = meta.key;
              let value: number | undefined = undefined;
              if (filteredData.length) {
                const lastDate = allDates[allDates.length-1];
                const lastDayRows = rawRows.filter(row => String(row.Date) === lastDate && (selectedApp === 'All Apps' || row["App Name"] === selectedApp));
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
                  } else {
                    if (meta.csvKey) {
                      value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row[meta.csvKey!]), 0);
                    } else {
                      value = 0;
                    }
                  }
                }
              }
              const isActive = activeGraphMetrics.includes(metric);
              return (
                <button
                  key={metric}
                  onClick={() => toggleGraphMetric(metric)}
                  className={`rounded-2xl p-6 flex flex-col gap-2 shadow-lg transition-colors border-2 ${isActive ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black border-gray-700 text-gray-200'} ${activeGraphMetrics.length === 4 && !isActive ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-900 hover:border-blue-400'}`}
                  disabled={!isActive && activeGraphMetrics.length === 4}
                >
                  <div className="text-lg font-semibold mb-1">{meta?.label}</div>
                  <div className="text-3xl font-bold">{formatValue(value, meta?.format || "NUMBER")}</div>
                </button>
              );
            })}
          </div>
          {/* Main chart and tabs */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg w-full">
            <div className="flex gap-8 mb-4">
              {activeGraphMetrics.map(metric => {
                const meta = ALL_METRICS.find(m => m.key === metric);
                return (
                  <div key={metric} className="font-bold text-xl text-blue-400 border-b-2 border-blue-400 pb-2">
                    {meta?.label}
                  </div>
                );
              })}
            </div>
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#a3d900" />
                  <YAxis stroke="#a3d900" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      const meta = ALL_METRICS.find(m => m.key === name);
                      // For percentage, value is already multiplied by 100
                      if (meta?.format === 'PERCENTAGE') {
                        return `${Number(value).toFixed(2)}%`;
                      }
                      return formatValue(value, meta?.format || "NUMBER");
                    }}
                  />
                  <Legend />
                  {activeGraphMetrics.map((metric, i) => (
                    <Line key={metric} type="monotone" dataKey={metric} stroke={["#3b82f6","#a259f7","#22d3ee","#a3d900"][i%4]} strokeWidth={3} dot={{ r: 6, fill: '#fff' }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 