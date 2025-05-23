"use client";
import { useState, useEffect } from 'react';
import { fetchRawSheet } from '../utils/fetchRawSheet';
import React from 'react';

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

export default function YesterdayVsDayBeforeTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState(ALL_METRICS.map(m => m.key));
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Compute allAppNames and allPlatforms from rows (not filteredRows)
  const allAppNames = Array.from(new Set(rows.map((row: any) => row["App Name"]).filter(Boolean)));
  const allPlatforms = Array.from(new Set(rows.map((row: any) => row.Platform).filter(Boolean)));

  // Set default selected apps/platforms (must be before early returns)
  useEffect(() => {
    if (selectedApps.length === 0 && allAppNames.length > 0) setSelectedApps(allAppNames);
    if (selectedPlatforms.length === 0 && allPlatforms.length > 0) setSelectedPlatforms(allPlatforms);
    // eslint-disable-next-line
  }, [allAppNames.length, allPlatforms.length]);

  useEffect(() => {
    fetchRawSheet(CSV_URL)
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rows.length) return <div className="p-8 text-gray-600">No data found.</div>;

  // Find the two most recent dates
  const allDates = Array.from(new Set(rows.map((row: any) => row.Date))).sort((a, b) => b.localeCompare(a));
  const [yesterday, dayBefore] = allDates.slice(0, 2);

  // Filter out subtotal/summary rows
  let filteredRows = rows.filter(row => {
    const adName = (row["Ad Name"] || "").toLowerCase();
    return adName && !adName.includes("total");
  });

  // Filter by selected apps/platforms
  filteredRows = filteredRows.filter(row => selectedApps.includes(row["App Name"]) && selectedPlatforms.includes(row.Platform));

  // Group by app and date
  const grouped: Record<string, Record<string, any[]>> = {};
  filteredRows.forEach(row => {
    const app = row["App Name"] || "Unknown App";
    const date = row.Date;
    if (!grouped[app]) grouped[app] = {};
    if (!grouped[app][date]) grouped[app][date] = [];
    grouped[app][date].push(row);
  });

  // Prepare table data: one row per app
  const tableRows = allAppNames.filter(app => selectedApps.includes(app)).map(app => {
    const yRows = (grouped[app]?.[yesterday] || []);
    const dbRows = (grouped[app]?.[dayBefore] || []);
    const totals: any = { app };
    ALL_METRICS.forEach(metric => {
      // Yesterday
      let yVal = 0, dbVal = 0;
      if (metric.key === 'CTR') {
        yVal = safeDivide(sumRows(yRows, "Clicks"), sumRows(yRows, "Imps"));
        dbVal = safeDivide(sumRows(dbRows, "Clicks"), sumRows(dbRows, "Imps"));
      } else if (metric.key === 'InstallRate') {
        yVal = safeDivide(sumRows(yRows, "Installs"), sumRows(yRows, "Clicks"));
        dbVal = safeDivide(sumRows(dbRows, "Installs"), sumRows(dbRows, "Clicks"));
      } else if (metric.key === 'ConversionRate') {
        yVal = safeDivide(sumRows(yRows, "Customers"), sumRows(yRows, "Installs"));
        dbVal = safeDivide(sumRows(dbRows, "Customers"), sumRows(dbRows, "Installs"));
      } else if (metric.key === 'Profit') {
        yVal = sumRows(yRows, "Revenue") - sumRows(yRows, "Spend");
        dbVal = sumRows(dbRows, "Revenue") - sumRows(dbRows, "Spend");
      } else if (metric.key === 'ROAS') {
        yVal = safeDivide(sumRows(yRows, "Revenue"), sumRows(yRows, "Spend"));
        dbVal = safeDivide(sumRows(dbRows, "Revenue"), sumRows(dbRows, "Spend"));
      } else if (metric.key === 'CPC') {
        yVal = safeDivide(sumRows(yRows, "Spend"), sumRows(yRows, "Clicks"));
        dbVal = safeDivide(sumRows(dbRows, "Spend"), sumRows(dbRows, "Clicks"));
      } else if (metric.key === 'CPI') {
        yVal = safeDivide(sumRows(yRows, "Spend"), sumRows(yRows, "Installs"));
        dbVal = safeDivide(sumRows(dbRows, "Spend"), sumRows(dbRows, "Installs"));
      } else if (metric.key === 'CAC') {
        yVal = safeDivide(sumRows(yRows, "Spend"), sumRows(yRows, "Customers"));
        dbVal = safeDivide(sumRows(dbRows, "Spend"), sumRows(dbRows, "Customers"));
      } else {
        yVal = sumRows(yRows, metric.key);
        dbVal = sumRows(dbRows, metric.key);
      }
      totals[metric.key] = { y: yVal, db: dbVal, diff: yVal - dbVal };
    });
    return totals;
  });

  // Export CSV
  function exportCSV() {
    const headers = ["App Name"];
    selectedMetrics.forEach(metric => {
      headers.push(`${metric} (Yesterday)`);
      headers.push(`${metric} (Day Before)`);
      headers.push(`${metric} (Δ)`);
    });
    const rowsToExport = tableRows.map(row => [
      row.app,
      ...selectedMetrics.flatMap(metric => {
        const m = ALL_METRICS.find(m => m.key === metric);
        const y = m?.format ? m.format(row[metric].y) : row[metric].y;
        const db = m?.format ? m.format(row[metric].db) : row[metric].db;
        const diff = m?.format ? m.format(row[metric].diff) : row[metric].diff;
        return [y, db, diff];
      })
    ]);
    const csv = [headers, ...rowsToExport]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yesterday-vs-daybefore.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full max-w-screen-lg mx-auto mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <CheckboxDropdown label="Show Apps" options={allAppNames} selected={selectedApps} setSelected={setSelectedApps} />
          <CheckboxDropdown label="Show Platforms" options={allPlatforms} selected={selectedPlatforms} setSelected={setSelectedPlatforms} />
          <CheckboxDropdown label="Show Metrics" options={ALL_METRICS.map(m => m.key)} selected={selectedMetrics} setSelected={setSelectedMetrics} />
        </div>
        <button onClick={exportCSV} className="border rounded px-3 py-1 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Export CSV</button>
      </div>
      <div className="w-full flex justify-center">
        <div className="bg-gray-100 shadow-lg rounded-xl p-4 border border-gray-300 mx-auto w-fit">
          <div className="overflow-x-auto">
            <table className="min-w-max border text-xs bg-white rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>App Name</th>
                  <th className="px-2 py-2 text-left font-bold sticky left-[180px] z-20 bg-gray-800" style={{ minWidth: '120px', width: '120px' }}>Date</th>
                  {selectedMetrics.map(metric => (
                    <th key={metric} className="px-2 py-2 font-bold text-right bg-gray-800">{ALL_METRICS.find(m => m.key === metric)?.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(row => (
                  <React.Fragment key={row.app}>
                    {/* Yesterday row */}
                    <tr className="border-b last:border-b-0 hover:bg-gray-50">
                      <td rowSpan={3} className="px-2 py-2 text-indigo-700 font-bold sticky left-0 z-10 bg-white align-top text-lg" style={{ minWidth: '180px', width: '180px' }}>{row.app}</td>
                      <td className="px-2 py-2 sticky left-[180px] z-10 bg-white text-gray-900 font-semibold" style={{ minWidth: '120px', width: '120px' }}>{yesterday}</td>
                      {selectedMetrics.map(metric => {
                        const m = ALL_METRICS.find(m => m.key === metric);
                        const y = m?.format ? m.format(row[metric].y) : row[metric].y;
                        return <td key={metric + '-y'} className="px-2 py-2 text-right text-gray-900">{y}</td>;
                      })}
                    </tr>
                    {/* Day Before row */}
                    <tr className="border-b last:border-b-0 hover:bg-gray-50">
                      {/* Empty cell for app name */}
                      <td className="px-2 py-2 sticky left-[180px] z-10 bg-white text-gray-900 font-semibold" style={{ minWidth: '120px', width: '120px' }}>{dayBefore}</td>
                      {selectedMetrics.map(metric => {
                        const m = ALL_METRICS.find(m => m.key === metric);
                        const db = m?.format ? m.format(row[metric].db) : row[metric].db;
                        return <td key={metric + '-db'} className="px-2 py-2 text-right text-gray-900">{db}</td>;
                      })}
                    </tr>
                    {/* Difference row */}
                    <tr className="border-b last:border-b-0 bg-gray-100">
                      {/* Empty cell for app name */}
                      <td className="px-2 py-2 sticky left-[180px] z-10 bg-gray-100 font-semibold text-gray-900" style={{ minWidth: '120px', width: '120px' }}>Δ</td>
                      {selectedMetrics.map(metric => {
                        const m = ALL_METRICS.find(m => m.key === metric);
                        const diff = m?.format ? m.format(row[metric].diff) : row[metric].diff;
                        return <td key={metric + '-diff'} className="px-2 py-2 text-right text-gray-900 font-semibold bg-gray-100">{diff}</td>;
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 