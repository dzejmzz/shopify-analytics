"use client";
import { useState, useEffect } from 'react';
import { fetchRawSheet } from '../utils/fetchRawSheet';
import React from 'react';

// Updated to use the provided published CSV link from Google Sheets
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZoM4CtqKHTAUAGLubLFG0-lsbhSrLLy7Y6qN_o62LlRcHsEHjOtDy6eyUYK0A5zCSAnA5hKwAfA7l/pub?gid=1225782318&single=true&output=csv";

function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function sumRows(rows: any[], field: string) {
  return rows.reduce((sum, row) => {
    const num = cleanNumber(row[field]);
    return sum + num;
  }, 0);
}

function safeDivide(numerator: number, denominator: number) {
  if (!denominator || isNaN(denominator)) return 0;
  return numerator / denominator;
}

function formatPercent(value: number) {
  return (value * 100).toFixed(2) + "%";
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Define all possible metrics
const ALL_METRICS = [
  { key: 'Imps', label: 'Impressions', align: 'right' },
  { key: 'Clicks', label: 'Clicks', align: 'right' },
  { key: 'CTR', label: 'CTR', align: 'right', format: formatPercent },
  { key: 'Installs', label: 'Installs', align: 'right' },
  { key: 'InstallRate', label: 'Install Rate', align: 'right', format: formatPercent },
  { key: 'Customers', label: 'Customers', align: 'right' },
  { key: 'ConversionRate', label: 'Conversion Rate', align: 'right', format: formatPercent },
  { key: 'Revenue', label: 'Revenue', align: 'right', format: formatMoney },
  { key: 'Spend', label: 'Spend', align: 'right', format: formatMoney },
  { key: 'Profit', label: 'Profit', align: 'right', format: formatMoney },
  { key: 'ROAS', label: 'ROAS', align: 'right', format: (v: number) => v.toFixed(2) },
  { key: 'CPC', label: 'CPC', align: 'right', format: formatMoney },
  { key: 'CPI', label: 'CPI', align: 'right', format: formatMoney },
  { key: 'CAC', label: 'CAC', align: 'right', format: formatMoney },
];

// Simple custom dropdown with checkboxes
function CheckboxDropdown({ label, options, selected, setSelected }: { label: string, options: string[], selected: string[], setSelected: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);
  const handleChange = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };
  const allSelected = selected.length === options.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected([...options]);
    }
  };
  const summary = selected.length === 0
    ? 'None'
    : selected.length === options.length
      ? 'All'
      : selected.length === 1
        ? options.find(o => o === selected[0])
        : `${selected.length} selected`;
  return (
    <div className="relative inline-block text-left min-w-[180px] text-black">
      <button type="button" onClick={toggle} className="border rounded px-2 py-1 bg-white text-black w-full flex items-center justify-between">
        <span className="truncate text-left">{label}: <span className="font-semibold">{summary}</span></span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto text-black">
          <label className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-black font-semibold border-b border-gray-200">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="accent-indigo-600 mr-2"
            />
            <span className="truncate text-black">{allSelected ? 'Deselect All' : 'Select All'}</span>
          </label>
          {options.map(option => (
            <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-black">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleChange(option)}
                className="accent-indigo-600 mr-2"
              />
              <span className="truncate text-black">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RawDataTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState(ALL_METRICS.map(m => m.key));
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sortMetric, setSortMetric] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRawSheet(CSV_URL)
      .then((data) => {
        setRows(data);
        const dates = Array.from(new Set(data.map((row: any) => row.Date))).sort((a, b) => b.localeCompare(a));
        setAllDates(dates);
        setSelectedDate(dates[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  // Get all unique platforms for filter (must be before early returns)
  let allPlatforms: string[] = [];
  if (rows.length) {
    let filteredRowsForPlatforms = rows.filter((row) => row.Date === selectedDate);
    filteredRowsForPlatforms = filteredRowsForPlatforms.filter(row => {
      const adName = (row["Ad Name"] || "").toLowerCase();
      return adName && !adName.includes("total");
    });
    allPlatforms = Array.from(new Set(filteredRowsForPlatforms.map(row => row.Platform).filter(Boolean)));
  }

  useEffect(() => {
    if (selectedPlatforms.length === 0 && allPlatforms.length > 0) {
      setSelectedPlatforms(allPlatforms);
    }
    // eslint-disable-next-line
  }, [allPlatforms.length]);

  // Compute all app names from all rows for default selection
  const allAppNames = Array.from(new Set(rows.map((row: any) => row["App Name"]).filter(Boolean)));

  // Set default selected apps to all apps
  useEffect(() => {
    if (selectedApps.length === 0 && allAppNames.length > 0) {
      setSelectedApps(allAppNames);
    }
    // eslint-disable-next-line
  }, [allAppNames.length]);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rows.length) return <div className="p-8 text-gray-600">No data found.</div>;

  let filteredRows = rows.filter((row) => row.Date === selectedDate);
  // Filter out subtotal/summary rows: only keep rows where 'Ad Name' is not empty and does not contain 'Total'
  filteredRows = filteredRows.filter(row => {
    const adName = (row["Ad Name"] || "").toLowerCase();
    return adName && !adName.includes("total");
  });
  // Sort by App Name, then Ad Name to ensure grouping is correct
  filteredRows.sort((a, b) => {
    const appA = (a["App Name"] || "").toLowerCase();
    const appB = (b["App Name"] || "").toLowerCase();
    if (appA < appB) return -1;
    if (appA > appB) return 1;
    const adA = (a["Ad Name"] || "").toLowerCase();
    const adB = (b["Ad Name"] || "").toLowerCase();
    if (adA < adB) return -1;
    if (adA > adB) return 1;
    return 0;
  });

  // Group by App Name (filteredRows)
  const grouped = filteredRows.reduce((acc, row) => {
    const app = row["App Name"] || "Unknown App";
    if (!acc[app]) acc[app] = [];
    acc[app].push(row);
    return acc;
  }, {} as Record<string, any[]>);
  const appNames = Object.keys(grouped);

  // Grand totals (filteredRows)
  const grandTotals: any = {
    Imps: sumRows(filteredRows, "Imps"),
    Clicks: sumRows(filteredRows, "Clicks"),
    Installs: sumRows(filteredRows, "Installs"),
    Customers: sumRows(filteredRows, "Customers"),
    Revenue: sumRows(filteredRows, "Revenue"),
    Spend: sumRows(filteredRows, "Spend"),
  };
  grandTotals.Profit = grandTotals.Revenue - grandTotals.Spend;
  grandTotals.CTR = safeDivide(grandTotals.Clicks, grandTotals.Imps);
  grandTotals.InstallRate = safeDivide(grandTotals.Installs, grandTotals.Clicks);
  grandTotals.ConversionRate = safeDivide(grandTotals.Customers, grandTotals.Installs);
  grandTotals.ROAS = safeDivide(grandTotals.Revenue, grandTotals.Spend);
  grandTotals.CPC = safeDivide(grandTotals.Spend, grandTotals.Clicks);
  grandTotals.CPI = safeDivide(grandTotals.Spend, grandTotals.Installs);
  grandTotals.CAC = safeDivide(grandTotals.Spend, grandTotals.Customers);

  // Debug: log the first 3 rows to check field names and values
  if (typeof window !== 'undefined') {
    console.log('Sample filteredRows:', filteredRows.slice(0, 3));
  }
  // If you see unexpected field names or values, check your Google Sheet column headers and update the code accordingly.

  // Helper to export visible data as CSV
  function exportCSV() {
    // Header
    const headers = [
      'App Name',
      'Platform',
      'Ad Name',
      ...ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(m => m.label)
    ];
    // Rows
    const rowsToExport: string[][] = [];
    appNames.filter(app => selectedApps.includes(app)).forEach(app => {
      const ads = grouped[app];
      ads.forEach((row: any) => {
        const rowData = [
          app,
          row.Platform,
          row["Ad Name"],
          ...ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(metric => {
            let value;
            if (metric.key === 'Customers') value = cleanNumber(row.Customers);
            else if (metric.key === 'Revenue') value = cleanNumber(row.Revenue);
            else value = row[metric.key];
            if (metric.key === 'CTR') value = safeDivide(cleanNumber(row.Clicks), cleanNumber(row.Imps));
            if (metric.key === 'InstallRate') value = safeDivide(cleanNumber(row.Installs), cleanNumber(row.Clicks));
            if (metric.key === 'ConversionRate') value = safeDivide(cleanNumber(row.Customers), cleanNumber(row.Installs));
            if (metric.key === 'Profit') value = cleanNumber(row.Revenue) - cleanNumber(row.Spend);
            if (metric.key === 'ROAS') value = safeDivide(cleanNumber(row.Revenue), cleanNumber(row.Spend));
            if (metric.key === 'CPC') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Clicks));
            if (metric.key === 'CPI') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Installs));
            if (metric.key === 'CAC') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Customers));
            if (metric.format) value = metric.format(value);
            else value = value?.toLocaleString?.() ?? value;
            return String(value);
          })
        ];
        rowsToExport.push(rowData as string[]);
      });
    });
    // CSV string
    const csv = [headers, ...rowsToExport]
      .map((row: string[]) => row.map((val: string) => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-ads-${selectedDate || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full max-w-screen-lg mx-auto mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* App selector dropdown with checkboxes */}
          <CheckboxDropdown
            label="Show Apps"
            options={allAppNames}
            selected={selectedApps}
            setSelected={setSelectedApps}
          />
          {/* Platform selector dropdown with checkboxes */}
          <CheckboxDropdown
            label="Show Platforms"
            options={allPlatforms}
            selected={selectedPlatforms}
            setSelected={setSelectedPlatforms}
          />
          {/* Metrics selector dropdown with checkboxes */}
          <CheckboxDropdown
            label="Show Metrics"
            options={ALL_METRICS.map(m => m.key)}
            selected={selectedMetrics}
            setSelected={setSelectedMetrics}
          />
        </div>
        <div className="flex flex-row items-center gap-4">
          {/* Date picker */}
          <div className="flex items-center gap-2">
            <label htmlFor="date-picker" className="font-medium text-gray-700">Date:</label>
            <select
              id="date-picker"
              value={selectedDate ?? ''}
              onChange={e => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 bg-white text-gray-900"
            >
              {allDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          {/* Export button */}
          <button
            onClick={exportCSV}
            className="border rounded px-3 py-1 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="bg-gray-100 shadow-lg rounded-xl p-4 border border-gray-300 mx-auto w-fit">
          <div className="overflow-x-auto">
            <table className="min-w-max border text-xs bg-white rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr className="sticky top-0 z-30 bg-gray-800">
                  <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>Ad Name</th>
                  <th className="px-2 py-2 text-left font-bold sticky left-[180px] z-20 bg-gray-800" style={{ minWidth: '100px', width: '100px' }}>Platform</th>
                  {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(metric => (
                    <th
                      key={metric.key}
                      className={`px-2 py-2 font-bold text-${metric.align} cursor-pointer select-none`}
                      onClick={() => {
                        if (sortMetric === metric.key) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortMetric(metric.key);
                          setSortOrder('desc');
                        }
                      }}
                    >
                      {metric.label}
                      {sortMetric === metric.key && (
                        <span className="ml-1 align-middle">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appNames.filter(app => selectedApps.includes(app)).map((app) => {
                  let ads = grouped[app];
                  // Sort ads by selected metric
                  if (sortMetric) {
                    ads = [...ads].sort((a, b) => {
                      let aVal, bVal;
                      switch (sortMetric) {
                        case 'CTR':
                          aVal = safeDivide(cleanNumber(a.Clicks), cleanNumber(a.Imps));
                          bVal = safeDivide(cleanNumber(b.Clicks), cleanNumber(b.Imps));
                          break;
                        case 'InstallRate':
                          aVal = safeDivide(cleanNumber(a.Installs), cleanNumber(a.Clicks));
                          bVal = safeDivide(cleanNumber(b.Installs), cleanNumber(b.Clicks));
                          break;
                        case 'ConversionRate':
                          aVal = safeDivide(cleanNumber(a.Customers), cleanNumber(a.Installs));
                          bVal = safeDivide(cleanNumber(b.Customers), cleanNumber(b.Installs));
                          break;
                        case 'Profit':
                          aVal = cleanNumber(a.Revenue) - cleanNumber(a.Spend);
                          bVal = cleanNumber(b.Revenue) - cleanNumber(b.Spend);
                          break;
                        case 'ROAS':
                          aVal = safeDivide(cleanNumber(a.Revenue), cleanNumber(a.Spend));
                          bVal = safeDivide(cleanNumber(b.Revenue), cleanNumber(b.Spend));
                          break;
                        case 'CPC':
                          aVal = safeDivide(cleanNumber(a.Spend), cleanNumber(a.Clicks));
                          bVal = safeDivide(cleanNumber(b.Spend), cleanNumber(b.Clicks));
                          break;
                        case 'CPI':
                          aVal = safeDivide(cleanNumber(a.Spend), cleanNumber(a.Installs));
                          bVal = safeDivide(cleanNumber(b.Spend), cleanNumber(b.Installs));
                          break;
                        case 'CAC':
                          aVal = safeDivide(cleanNumber(a.Spend), cleanNumber(a.Customers));
                          bVal = safeDivide(cleanNumber(b.Spend), cleanNumber(b.Customers));
                          break;
                        default:
                          aVal = cleanNumber(a[sortMetric]);
                          bVal = cleanNumber(b[sortMetric]);
                      }
                      if (sortOrder === 'asc') return aVal - bVal;
                      return bVal - aVal;
                    });
                  }
                  const appTotals: any = {
                    Imps: sumRows(ads, "Imps"),
                    Clicks: sumRows(ads, "Clicks"),
                    Installs: sumRows(ads, "Installs"),
                    Customers: sumRows(ads, "Customers"),
                    Revenue: sumRows(ads, "Revenue"),
                    Spend: sumRows(ads, "Spend"),
                  };
                  appTotals.Profit = appTotals.Revenue - appTotals.Spend;
                  appTotals.CTR = safeDivide(appTotals.Clicks, appTotals.Imps);
                  appTotals.InstallRate = safeDivide(appTotals.Installs, appTotals.Clicks);
                  appTotals.ConversionRate = safeDivide(appTotals.Customers, appTotals.Installs);
                  appTotals.ROAS = safeDivide(appTotals.Revenue, appTotals.Spend);
                  appTotals.CPC = safeDivide(appTotals.Spend, appTotals.Clicks);
                  appTotals.CPI = safeDivide(appTotals.Spend, appTotals.Installs);
                  appTotals.CAC = safeDivide(appTotals.Spend, appTotals.Customers);
                  return (
                    <React.Fragment key={app}>
                      {/* App name header row */}
                      <tr className="bg-white">
                        <td className="font-bold text-lg text-indigo-700 px-2 py-2 border-t border-b text-left sticky left-0 z-10 bg-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ minWidth: '180px', width: '180px' }}>{app}</td>
                        <td className="border-t border-b sticky left-[180px] z-10 bg-white" style={{ minWidth: '100px', width: '100px' }}></td>
                        <td colSpan={selectedMetrics.length}></td>
                      </tr>
                      {/* Ad rows */}
                      {ads.map((row: any, i: number) => {
                        // Parse numbers for calculations
                        const imps = cleanNumber(row.Imps);
                        const clicks = cleanNumber(row.Clicks);
                        const installs = cleanNumber(row.Installs);
                        const customers = cleanNumber(row.Customers);
                        const revenue = cleanNumber(row.Revenue);
                        const spend = cleanNumber(row.Spend);
                        const profit = revenue - spend;
                        const ctr = safeDivide(clicks, imps);
                        const installRate = safeDivide(installs, clicks);
                        const conversionRate = safeDivide(customers, installs);
                        const roas = safeDivide(revenue, spend);
                        const cpc = safeDivide(spend, clicks);
                        const cpi = safeDivide(spend, installs);
                        const cac = safeDivide(spend, customers);
                        return (
                          <tr key={row["Ad Name"] + i} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-2 py-2 text-gray-800 sticky left-0 z-10 bg-white" style={{ minWidth: '180px', width: '180px' }}>{row["Ad Name"]}</td>
                            <td className="px-2 py-2 text-gray-800 sticky left-[180px] z-10 bg-white" style={{ minWidth: '100px', width: '100px' }}>{row.Platform}</td>
                            {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(metric => {
                              let value;
                              if (metric.key === 'Customers') value = cleanNumber(row.Customers);
                              else if (metric.key === 'Revenue') value = cleanNumber(row.Revenue);
                              else value = row[metric.key];
                              if (metric.key === 'CTR') value = safeDivide(cleanNumber(row.Clicks), cleanNumber(row.Imps));
                              if (metric.key === 'InstallRate') value = safeDivide(cleanNumber(row.Installs), cleanNumber(row.Clicks));
                              if (metric.key === 'ConversionRate') value = safeDivide(cleanNumber(row.Customers), cleanNumber(row.Installs));
                              if (metric.key === 'Profit') value = cleanNumber(row.Revenue) - cleanNumber(row.Spend);
                              if (metric.key === 'ROAS') value = safeDivide(cleanNumber(row.Revenue), cleanNumber(row.Spend));
                              if (metric.key === 'CPC') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Clicks));
                              if (metric.key === 'CPI') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Installs));
                              if (metric.key === 'CAC') value = safeDivide(cleanNumber(row.Spend), cleanNumber(row.Customers));
                              if (metric.format) value = metric.format(value);
                              else value = value?.toLocaleString?.() ?? value;
                              return <td key={metric.key} className={`px-2 py-2 text-${metric.align} text-gray-900`}>{value}</td>;
                            })}
                          </tr>
                        );
                      })}
                      {/* App subtotal row */}
                      <tr className="font-bold bg-indigo-50 border-t">
                        <td className="px-2 py-2 text-right text-black sticky left-0 z-10 bg-indigo-50" style={{ minWidth: '180px', width: '180px' }}></td>
                        <td className="px-2 py-2 sticky left-[180px] z-10 bg-indigo-50" style={{ minWidth: '100px', width: '100px' }}></td>
                        {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(metric => {
                          let value = appTotals[metric.key];
                          if (metric.format) value = metric.format(value);
                          else value = value?.toLocaleString?.() ?? value;
                          return <td key={metric.key} className={`px-2 py-2 text-right text-black`}>{value}</td>;
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
                {/* Grand total row */}
                <tr className="font-bold bg-indigo-200 border-t-2">
                  <td className="px-2 py-2 text-right text-black sticky left-0 z-10 bg-indigo-200" style={{ minWidth: '180px', width: '180px' }} colSpan={1}>Grand Total</td>
                  <td className="px-2 py-2 text-right text-black sticky left-[180px] z-10 bg-indigo-200" style={{ minWidth: '100px', width: '100px' }}></td>
                  {ALL_METRICS.filter(m => selectedMetrics.includes(m.key)).map(metric => {
                    let value = grandTotals[metric.key];
                    if (metric.format) value = metric.format(value);
                    else value = value?.toLocaleString?.() ?? value;
                    return <td key={metric.key} className={`px-2 py-2 text-right text-black`}>{value}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 