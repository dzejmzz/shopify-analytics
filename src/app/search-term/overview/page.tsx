"use client";

import React from "react";
import { fetchYearlyRaw } from '../../../utils/yearlyraw';
import type { YearlyRawRow } from '../../../utils/yearlyraw';
import { format, parse } from 'date-fns';

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

export default function SearchTermOverview() {
  const [rawRows, setRawRows] = React.useState<YearlyRawRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [sortKey, setSortKey] = React.useState<string>('impressions');
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);
  const [selectedApp, setSelectedApp] = React.useState<string>('All Apps');
  const [showAppDropdown, setShowAppDropdown] = React.useState(false);
  const [pendingApp, setPendingApp] = React.useState<string>(selectedApp);
  const appDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchYearlyRaw().then((data: YearlyRawRow[]) => {
      setRawRows(data);
      setLoading(false);
    }).catch((error) => {
      setError('Failed to fetch data');
    });
  }, []);

  // All months in the data
  const allDates = React.useMemo(() => {
    return Array.from(new Set(rawRows.map(row => String(row["Month"]).trim()).filter(Boolean))).sort();
  }, [rawRows]);

  React.useEffect(() => {
    if (allDates.length > 0 && (!dateRange.start || !dateRange.end)) {
      setDateRange({ start: allDates[0], end: allDates[allDates.length - 1] });
    }
  }, [allDates]);

  // Group by search term, filter by date range
  const allTerms = React.useMemo(() => {
    return Array.from(new Set(rawRows.map(row => String(row["Search Term"] ?? row["Search term"] ?? row["search_term"]).trim()).filter(Boolean))).sort();
  }, [rawRows]);

  // App names
  const appNames = React.useMemo(() => {
    const names = Array.from(
      new Set(
        rawRows
          .map(row =>
            String(
              row["App Name"] ??
              row["App"] ??
              row["app_name"] ??
              row["app"]
            ).trim()
          )
          .filter(name => name && name !== 'undefined' && name !== 'null')
      )
    );
    console.log('App names:', names);
    return ['All Apps', ...names];
  }, [rawRows]);

  const filteredData = allTerms.map(term => {
    const rowsForTerm = rawRows.filter(row => {
      const rowTerm = String(row["Search Term"] ?? row["Search term"] ?? row["search_term"]).trim();
      const month = row["Month"];
      const inDateRange = month && month >= dateRange.start && month <= dateRange.end;
      const appMatch = selectedApp === 'All Apps' || row["App Name"] === selectedApp;
      return rowTerm === term && inDateRange && appMatch;
    });
    const result: any = { term };
    ALL_METRICS.forEach(m => {
      if (m.key === 'ctr') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Clicks', 'Impressions');
      } else if (m.key === 'install_rate') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Installs', 'Clicks');
      } else if (m.key === 'conversion_rate') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Customers', 'Installs');
      } else if (m.key === 'profit') {
        const totalRevenue = rowsForTerm.reduce((sum, row) => sum + cleanNumber(row['Revenue']), 0);
        const totalSpend = rowsForTerm.reduce((sum, row) => sum + cleanNumber(row['Spend']), 0);
        result[m.key] = totalRevenue - totalSpend;
      } else if (m.key === 'roas') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Revenue', 'Spend');
      } else if (m.key === 'cpc') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Spend', 'Clicks');
      } else if (m.key === 'cpi') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Spend', 'Installs');
      } else if (m.key === 'cpa') {
        result[m.key] = computeTotalRatio(rowsForTerm, 'Spend', 'Customers');
      } else if (m.csvKey) {
        result[m.key] = rowsForTerm.reduce((sum, row) => sum + cleanNumber(row[m.csvKey]), 0);
      } else {
        result[m.key] = 0;
      }
    });
    return result;
  })
  // Only show search terms with impressions > 0
  .filter(row => row.impressions > 0);

  // Sort by selected metric
  const sortedData = React.useMemo(() => {
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

  function handleMonthRangeChange(e: React.ChangeEvent<HTMLSelectElement>, which: 'start' | 'end') {
    const value = e.target.value;
    if (which === 'start') {
      setDateRange(r => ({ ...r, start: value }));
    } else {
      setDateRange(r => ({ ...r, end: value }));
    }
  }

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(v => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function handleAppSave() {
    setSelectedApp(pendingApp);
    setShowAppDropdown(false);
  }

  if (loading) return <div className="p-8 text-lg">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rawRows.length) return <div className="p-8 text-gray-600">No data found.</div>;
  if (!dateRange.start || !dateRange.end) return <div className="p-8 text-gray-600">No months available.</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <main className="flex-1 flex justify-center items-start p-10">
        <div className="w-full max-w-[2200px]">
          <h1 className="text-2xl font-bold mb-6">Search Term Overview</h1>
          {/* App Picker */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8 w-full max-w-2xl">
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <input
                      type="text"
                      value={pendingApp}
                      onChange={e => setPendingApp(e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Search apps..."
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-4 text-center text-gray-500">
                        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin align-middle mr-2"></span>
                        Loading apps...
                      </div>
                    ) : (
                      appNames
                        .filter(app => app.toLowerCase().includes(pendingApp.toLowerCase()))
                        .map(app => (
                          <button
                            key={app}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${pendingApp === app ? 'bg-blue-100 font-bold' : ''} text-gray-900`}
                            onClick={() => setPendingApp(app)}
                            type="button"
                            title={app}
                          >
                            <span className="truncate block max-w-[180px]">{app}</span>
                          </button>
                        ))
                    )}
                    {!loading && appNames.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No apps found</div>
                    )}
                  </div>
                  <div className="flex justify-end p-2 border-t">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                      onClick={handleAppSave}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Month Range Picker */}
            <div className="flex flex-col relative" style={{ minWidth: 220 }}>
              <label className="text-sm mb-1">Month Range</label>
              <div className="flex gap-2 items-center">
                <select value={dateRange.start} onChange={e => handleMonthRangeChange(e, 'start')} className="border rounded px-2 py-1 bg-white text-gray-900">
                  {allDates.map(month => (
                    <option key={month} value={month}>{typeof month === 'string' && month ? format(parse(month, 'yyyy-MM-dd', new Date()), 'MMMM yyyy') : ''}</option>
                  ))}
                </select>
                <span className="mx-1">to</span>
                <select value={dateRange.end} onChange={e => handleMonthRangeChange(e, 'end')} className="border rounded px-2 py-1 bg-white text-gray-900">
                  {allDates.map(month => (
                    <option key={month} value={month}>{typeof month === 'string' && month ? format(parse(month, 'yyyy-MM-dd', new Date()), 'MMMM yyyy') : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white shadow-lg rounded-xl border border-gray-300 mx-auto w-fit relative">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto pt-2">
              <table className="min-w-max border text-xs bg-white rounded-lg">
                <thead className="bg-gray-800 text-white">
                  <tr className="sticky top-0 z-30 bg-gray-800">
                    <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>Search Term</th>
                    {ALL_METRICS.map(m => (
                      <th
                        key={m.key}
                        className="px-2 py-2 font-bold text-center bg-gray-800 whitespace-nowrap cursor-pointer select-none hover:bg-blue-900"
                        onClick={() => handleSort(m.key)}
                      >
                        {m.label}
                        {sortKey === m.key && (
                          <span className="ml-1">{sortAsc ? '▲' : '▼'}</span>
                        )}
                      </th>
                    ))}
                    <th className="px-2 py-2 font-bold text-center bg-gray-800 whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  {sortedData.map((row, i) => (
                    <React.Fragment key={row.term}>
                      <tr className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="px-2 py-2 font-semibold sticky left-0 z-10 bg-white" style={{ minWidth: '180px', width: '180px' }}>{row.term}</td>
                        {ALL_METRICS.map(m => (
                          <td key={m.key} className="px-2 py-2 text-center whitespace-nowrap">
                            {formatValue(row[m.key], m.format)}
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          <button
                            className="text-blue-600 underline hover:text-blue-800"
                            onClick={() => setExpanded(expanded === row.term ? null : row.term)}
                          >
                            {expanded === row.term ? 'Hide' : 'Expand'}
                          </button>
                        </td>
                      </tr>
                      {expanded === row.term && (
                        <tr>
                          <td colSpan={ALL_METRICS.length + 2} className="bg-blue-50 text-blue-900 px-4 py-4">
                            {/* You can add more detailed breakdown here, e.g. by device, plan, or month for this term */}
                            <div>Details for <b>{row.term}</b> go here.</div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 