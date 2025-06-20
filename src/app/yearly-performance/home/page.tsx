"use client";
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DateRange } from 'react-date-range';
import { format, parse, parseISO } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { fetchYearlyRaw } from '../../../utils/yearlyraw';
import type { YearlyRawRow } from '../../../utils/yearlyraw';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

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

export default function YearlyPerformanceHome() {
  const [rawRows, setRawRows] = React.useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [allDates, setAllDates] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(DEFAULT_METRICS);
  const [selectedApp, setSelectedApp] = React.useState<string>('All Apps');
  const [showMetricsDropdown, setShowMetricsDropdown] = React.useState(false);
  const [showAppDropdown, setShowAppDropdown] = React.useState(false);
  const [showDateDropdown, setShowDateDropdown] = React.useState(false);
  const [pendingMetrics, setPendingMetrics] = React.useState<string[]>(selectedMetrics);
  const [pendingApp, setPendingApp] = React.useState<string>(selectedApp);
  const [activeGraphMetrics, setActiveGraphMetrics] = React.useState<string[]>(DEFAULT_METRICS);

  const metricsDropdownRef = React.useRef<HTMLDivElement>(null);
  const appDropdownRef = React.useRef<HTMLDivElement>(null);
  const dateDropdownRef = React.useRef<HTMLDivElement>(null);

  const appNames = React.useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"])))).filter(Boolean);
    return ['All Apps', ...names];
  }, [rawRows]);

  const allMonths = React.useMemo(() => {
    return Array.from(new Set(rawRows.map(row => String(row["Month"])).filter(Boolean))).sort();
  }, [rawRows]);

  React.useEffect(() => {
    if (allMonths.length > 0 && (!dateRange.start || !dateRange.end)) {
      setDateRange({ start: allMonths[0], end: allMonths[allMonths.length - 1] });
    }
  }, [allMonths]);

  React.useEffect(() => {
    fetchYearlyRaw().then((data: YearlyRawRow[]) => {
      setRawRows(data);
      setLoading(false);
    }).catch(() => setError('Failed to fetch data'));
  }, []);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rawRows.length) return <div className="p-8 text-gray-600">No data found.</div>;
  if (!dateRange.start || !dateRange.end) return <div className="p-8 text-gray-600">No months available.</div>;

  const range = [{
    startDate: parse(dateRange.start, 'yyyy-MM-dd', new Date()),
    endDate: parse(dateRange.end, 'yyyy-MM-dd', new Date()),
    key: 'selection',
  }];

  function handleDateRangeChange(ranges: any) {
    setDateRange({
      start: format(ranges.selection.startDate, 'yyyy-MM-dd'),
      end: format(ranges.selection.endDate, 'yyyy-MM-dd'),
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
      } else if (m.csvKey) {
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row[m.csvKey!]), 0);
      } else {
        result[m.key] = 0;
      }
    });
    return result;
  });

  const chartData = filteredData.map(row => {
    const newRow: any = { ...row };
    ALL_METRICS.forEach(m => {
      if (m.format === 'PERCENTAGE' && typeof newRow[m.key] === 'number') {
        newRow[m.key] = newRow[m.key] * 100;
      }
    });
    return newRow;
  });

  // Cards: show only the sum for the last day in the selected range
  const lastDay = filteredData.length ? filteredData[filteredData.length-1] : undefined;

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

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col px-4 py-6">
        <Link href="/" legacyBehavior>
          <a className="flex items-center gap-3 mb-10 mt-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">S</div>
            <span className="text-2xl font-bold tracking-wide">Samo ROAS, Bilje mi</span>
          </a>
        </Link>
        <Link href="/yearly-performance/overview" legacyBehavior>
          <a className="flex items-center gap-3 py-2 px-2 mb-2 rounded-xl text-base font-medium transition-colors whitespace-nowrap truncate bg-gray-700 text-white font-bold" style={{ minHeight: '44px' }}>
            <HomeIcon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Overview</span>
          </a>
        </Link>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start p-10">
        <div className="w-full max-w-[2200px]">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
            {/* App Picker */}
            <div className="flex flex-col relative" style={{ minWidth: 180 }} ref={appDropdownRef}>
              <label className="text-sm mb-1">App</label>
              <button
                className="rounded px-2 py-1 bg-white text-black border border-gray-300 min-w-[180px] text-left h-[44px] flex items-center"
                onClick={() => setShowAppDropdown(v => !v)}
                type="button"
              >
                {selectedApp}
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
            {/* Month Range Picker */}
            <div className="flex flex-col relative" style={{ minWidth: 220 }}>
              <label className="text-sm mb-1">Month Range</label>
              <div className="flex gap-2 items-center">
                <select value={dateRange.start} onChange={e => handleMonthRangeChange(e, 'start')} className="border rounded px-2 py-1 bg-white text-gray-900">
                  {allMonths.map(month => (
                    <option key={month} value={month}>{formatMonth(month)}</option>
                  ))}
                </select>
                <span className="mx-1">to</span>
                <select value={dateRange.end} onChange={e => handleMonthRangeChange(e, 'end')} className="border rounded px-2 py-1 bg-white text-gray-900">
                  {allMonths.map(month => (
                    <option key={month} value={month}>{formatMonth(month)}</option>
                ))}
              </select>
              </div>
            </div>
            {/* Metrics Picker */}
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
                  } else if (meta.csvKey) {
                    value = lastDayRows.reduce((sum, row) => sum + cleanNumber(row[meta.csvKey!]), 0);
                  } else {
                    value = 0;
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