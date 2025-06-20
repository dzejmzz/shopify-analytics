"use client";
import React from "react";
import { format, parse } from 'date-fns';
import { fetchYearlyRaw } from '../../../utils/yearlyraw';
import type { YearlyRawRow } from '../../../utils/yearlyraw';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

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
  return denominator ? numerator / denominator : null;
}

export default function MonthToMonth() {
  const [rawRows, setRawRows] = React.useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [selectedApp, setSelectedApp] = React.useState<string>('All Apps');
  const [showAppDropdown, setShowAppDropdown] = React.useState(false);
  const [pendingApp, setPendingApp] = React.useState<string>(selectedApp);

  const appDropdownRef = React.useRef<HTMLDivElement>(null);

  const appNames = React.useMemo(() => {
    const names = Array.from(new Set(rawRows.map(row => String(row["App Name"])).filter(Boolean)));
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
  const filteredData = allMonths.filter(m => m >= dateRange.start && m <= dateRange.end).map(month => {
    const rowsForDate = rawRows.filter(row => String(row["Month"]) === month && (selectedApp === 'All Apps' || row["App Name"] === selectedApp));
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
        result[m.key] = rowsForDate.reduce((sum, row) => sum + cleanNumber(row[m.csvKey]), 0);
      } else {
        result[m.key] = 0;
      }
    });
    return result;
  });

  React.useEffect(() => {
    fetchYearlyRaw().then((data: YearlyRawRow[]) => {
      setRawRows(data);
      setLoading(false);
      console.log('DEBUG: Raw data first 5 rows:', data.slice(0, 5));
      console.log('DEBUG: All unique Month values:', Array.from(new Set(data.map(row => row["Month"]))).sort());
      console.log('DEBUG: All unique App Names:', Array.from(new Set(data.map(row => row["App Name"]))).sort());
    }).catch((error) => {
      console.error('DEBUG: Error fetching data:', error);
      setError('Failed to fetch data');
    });
  }, []);

  // Add logging for filtered data
  React.useEffect(() => {
    console.log('DEBUG: Current dateRange:', dateRange);
    console.log('DEBUG: Current selectedApp:', selectedApp);
    console.log('DEBUG: Filtered data:', filteredData);
    console.log('DEBUG: First row of filtered data:', filteredData[0]);
  }, [dateRange, selectedApp, filteredData]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rawRows.length) return <div className="p-8 text-gray-600">No data found.</div>;
  if (!dateRange.start || !dateRange.end) return <div className="p-8 text-gray-600">No months available.</div>;

  function handleMonthRangeChange(e: React.ChangeEvent<HTMLSelectElement>, which: 'start' | 'end') {
    const value = e.target.value;
    if (which === 'start') {
      setDateRange(r => ({ ...r, start: value }));
    } else {
      setDateRange(r => ({ ...r, end: value }));
    }
  }

  function formatMonth(monthStr: string) {
    const d = parse(monthStr, 'yyyy-MM-dd', new Date());
    return format(d, 'MMMM yyyy');
  }

  function handleAppSave() {
    setSelectedApp(pendingApp);
    setShowAppDropdown(false);
  }

  function formatValue(value: any, format: string) {
    if (value === undefined || value === null) return '-';
    if (value === '#DIV/0!') return value;
    if (format === "NUMBER") return Number(value).toLocaleString();
    if (format === "USD") return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (format === "PERCENTAGE") return `${(Number(value) * 100).toFixed(2)}%`;
    return value;
  }

  const sidebarItems = [
    { name: "Overview", icon: HomeIcon, href: "/yearly-performance/overview" },
    { name: "Month to Month", icon: HomeIcon, href: "/yearly-performance/month-to-month" },
  ];

  // Get current path for highlighting
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
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
          </div>
          {/* Table */}
          <div className="w-full flex justify-center">
            <div className="bg-white shadow-lg rounded-xl border border-gray-300 mx-auto w-fit">
              <div className="overflow-x-auto">
                <table className="min-w-max border text-xs bg-white rounded-lg">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '140px', width: '140px' }}>Month</th>
                      {ALL_METRICS.map(m => (
                        <th key={m.key} className="px-2 py-2 font-bold text-center bg-gray-800 whitespace-nowrap">{m.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {filteredData.map((row, i) => {
                      const prev = i > 0 ? filteredData[i - 1] : null;
                      return (
                        <React.Fragment key={row.month}>
                          <tr className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-2 py-2 font-semibold sticky left-0 z-10 bg-white" style={{ minWidth: '140px', width: '140px' }}>{formatMonth(row.month)}</td>
                            {ALL_METRICS.map(m => (
                              <td key={m.key} className="px-2 py-2 text-center whitespace-nowrap">
                                {formatValue(row[m.key], m.format)}
                              </td>
                            ))}
                          </tr>
                          {/* MoM % Change Row: only render if not the first row */}
                          {i > 0 && (
                            <tr className="border-b last:border-b-0">
                              <td className="px-2 py-1 text-xs italic text-gray-500 bg-gray-50">change from previous month %</td>
                              {ALL_METRICS.map(m => {
                                if (!prev || prev[m.key] === 0 || prev[m.key] === undefined || prev[m.key] === null) {
                                  return <td key={m.key} className="px-2 py-1 text-center text-xs bg-gray-50">-</td>;
                                }
                                const currVal = row[m.key];
                                const prevVal = prev[m.key];
                                if (currVal === undefined || currVal === null || currVal === 0) {
                                  return <td key={m.key} className="px-2 py-1 text-center text-xs bg-gray-50">-</td>;
                                }
                                const pctChange = (currVal - prevVal) / Math.abs(prevVal);
                                // Metrics where a decrease is good (cost metrics)
                                const costMetrics = ['spend', 'cpc', 'cpi', 'cpa'];
                                const isCost = costMetrics.includes(m.key);
                                let color = '';
                                if (isCost) {
                                  color = pctChange < 0 ? 'text-green-600' : pctChange > 0 ? 'text-red-600' : '';
                                } else {
                                  color = pctChange > 0 ? 'text-green-600' : pctChange < 0 ? 'text-red-600' : '';
                                }
                                return (
                                  <td key={m.key} className={`px-2 py-1 text-center text-xs font-semibold bg-gray-50 ${color}`}>
                                    {isFinite(pctChange) ? (pctChange * 100).toFixed(2) + '%' : '-'}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 