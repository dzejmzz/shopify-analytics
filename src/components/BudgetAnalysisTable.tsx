"use client";
import { useState, useEffect } from 'react';
import { fetchRawSheet } from '../utils/fetchRawSheet';
import React from 'react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZoM4CtqKHTAUAGLubLFG0-lsbhSrLLy7Y6qN_o62LlRcHsEHjOtDy6eyUYK0A5zCSAnA5hKwAfA7l/pub?gid=1225782318&single=true&output=csv";

// Monthly budgets for each app (edit this object to add budgets)
const MONTHLY_BUDGETS: Record<string, number> = {
  "Address Ninja - Validator": 500,
  "Magical Fees & Tariffs": 500,
  "Magical Make An Offer": 500,
  // Add more apps as needed
};

// Helper to get/set budgets in localStorage
function getStoredBudgets(apps: string[], defaults: Record<string, number>) {
  if (typeof window === 'undefined') return { ...defaults };
  const result: Record<string, number> = {};
  apps.forEach(app => {
    const stored = localStorage.getItem(`budget_${app}`);
    result[app] = stored !== null ? Number(stored) : (defaults[app] || 0);
  });
  return result;
}
function setStoredBudget(app: string, value: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`budget_${app}`, String(value));
}

// Helper to get/set daily set budgets in localStorage
function getStoredDailySetBudgets(apps: string[]) {
  if (typeof window === 'undefined') return {};
  const result: Record<string, number> = {};
  apps.forEach(app => {
    const stored = localStorage.getItem(`dailyset_${app}`);
    result[app] = stored !== null ? Number(stored) : 0;
  });
  return result;
}
function setStoredDailySetBudget(app: string, value: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`dailyset_${app}`, String(value));
}

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

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number) {
  return (value * 100).toFixed(2) + "%";
}

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

export default function BudgetAnalysisTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  // Compute allAppNames from rows
  const allAppNames = Array.from(new Set(rows.map((row: any) => row["App Name"]).filter(Boolean)));

  // Editable budgets state (per app)
  const [budgets, setBudgets] = useState<Record<string, number>>(() => getStoredBudgets(allAppNames, MONTHLY_BUDGETS));
  // Editable daily set budgets state (per app)
  const [dailySetBudgets, setDailySetBudgets] = useState<Record<string, number>>(() => getStoredDailySetBudgets(allAppNames));
  // Sync budgets when app list changes
  useEffect(() => {
    setBudgets(getStoredBudgets(allAppNames, MONTHLY_BUDGETS));
    setDailySetBudgets(getStoredDailySetBudgets(allAppNames));
    // eslint-disable-next-line
  }, [allAppNames.length]);

  // Set default selected apps
  useEffect(() => {
    if (selectedApps.length === 0 && allAppNames.length > 0) {
      setSelectedApps(allAppNames);
    }
    // eslint-disable-next-line
  }, [allAppNames.length]);

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

  // Get current month's data
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = today.getDate();
  const remainingDays = daysInMonth - currentDay;

  // Filter rows for current month (handle DD/MM/YYYY)
  const monthRows = rows.filter(row => {
    if (!row.Date) return false;
    const parts = row.Date.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      const [day, month, year] = parts;
      const rowDate = new Date(`${year}-${month}-${day}`);
      return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    } else {
      // fallback: try native Date
      const rowDate = new Date(row.Date);
      return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    }
  });

  // Group by app/platform
  const appPlatformKeys = Array.from(new Set(monthRows.map(row => `${row["App Name"]}|||${row.Platform}`)));

  // For each app/platform, get the latest date and sum Spend for all rows on that date
  function getLatestDate(rows: any[]) {
    return rows.reduce((latest, row) => {
      if (!latest) return row;
      const [ld, lm, ly] = (latest.Date || '').split('/');
      const [rd, rm, ry] = (row.Date || '').split('/');
      const latestDate = new Date(`${ly}-${lm}-${ld}`);
      const rowDate = new Date(`${ry}-${rm}-${rd}`);
      return rowDate > latestDate ? row : latest;
    }, null)?.Date;
  }

  // Calculate budget summary for each app/platform
  const budgetAnalysis = appPlatformKeys
    .map(key => {
      const [app, platform] = key.split('|||');
      if (!selectedApps.includes(app)) return null;
      const appRows = monthRows.filter(row => row["App Name"] === app && row.Platform === platform);
      if (!appRows.length) return null;
      const latestDate = getLatestDate(appRows);
      if (!latestDate) return null;
      // Get all rows for this app/platform on the latest date
      const latestRows = appRows.filter(row => row.Date === latestDate);
      const mtdSpend = sumRows(latestRows, "Spend");
      // Use editable budget and daily set budget from state
      const budget = budgets[app] ?? (MONTHLY_BUDGETS[app] || 0);
      const dailySetBudget = dailySetBudgets[app] ?? 0;
      const remainingBudget = budget - mtdSpend;
      const avgDailySpend = currentDay > 0 ? mtdSpend / currentDay : 0;
      const availableDailyBudget = remainingDays > 0 ? remainingBudget / remainingDays : 0;
      const predictedSpend = avgDailySpend * daysInMonth;
      const overUnder = budget > 0 ? predictedSpend / budget : 0;
      return {
        app,
        platform,
        mtdSpend,
        availableDailyBudget,
        dailySetBudget,
        budget,
        remainingBudget,
        avgDailySpend,
        remainingDays,
        predictedSpend,
        overUnder,
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row);

  // Export CSV
  function exportCSV() {
    const headers = [
      "App Name",
      "Platform",
      "Spend",
      "Available Daily Budget",
      "Daily Set Budget",
      "Total Budget",
      "Remaining Budget",
      "Daily Spend (MTD Avg)",
      "Remaining Days",
      "Predicted Spend",
      "Over/Under %"
    ];
    const rowsToExport = budgetAnalysis.map(row => [
      row.app,
      row.platform,
      formatMoney(row.mtdSpend),
      formatMoney(row.availableDailyBudget),
      formatMoney(row.dailySetBudget),
      formatMoney(row.budget),
      formatMoney(row.remainingBudget),
      formatMoney(row.avgDailySpend),
      row.remainingDays,
      formatMoney(row.predictedSpend),
      formatPercent(row.overUnder)
    ]);
    const csv = [headers, ...rowsToExport]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getOverUnderClass(val: number) {
    if (val > 1) return 'bg-yellow-200 text-red-700 font-bold';
    if (val > 0.8) return 'bg-yellow-100 text-yellow-800 font-bold';
    return 'text-green-700 font-bold';
  }

  // Handler for editing budget
  function handleBudgetEdit(app: string, value: number) {
    setBudgets(prev => {
      const updated = { ...prev, [app]: value };
      setStoredBudget(app, value);
      return updated;
    });
  }
  // Handler for editing daily set budget
  function handleDailySetBudgetEdit(app: string, value: number) {
    setDailySetBudgets(prev => {
      const updated = { ...prev, [app]: value };
      setStoredDailySetBudget(app, value);
      return updated;
    });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full max-w-screen-lg mx-auto mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <CheckboxDropdown
            label="Show Apps"
            options={allAppNames}
            selected={selectedApps}
            setSelected={setSelectedApps}
          />
        </div>
        <button
          onClick={exportCSV}
          className="border rounded px-3 py-1 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Export CSV
        </button>
      </div>
      <div className="w-full flex justify-center">
        <div className="bg-gray-100 shadow-lg rounded-xl p-4 border border-gray-300 mx-auto w-fit">
          <div className="overflow-x-auto">
            <table className="min-w-max border text-xs bg-white rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-2 py-2 text-left font-bold sticky left-0 z-20 bg-gray-800" style={{ minWidth: '180px', width: '180px' }}>App Name</th>
                  <th className="px-2 py-2 text-left font-bold bg-gray-800" style={{ minWidth: '120px', width: '120px' }}>Platform</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Spend</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Available Daily Budget</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Daily Set Budget</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Total Budget</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Remaining Budget</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Daily Spend (MTD Avg)</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Remaining Days</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Predicted Spend</th>
                  <th className="px-2 py-2 font-bold text-right bg-gray-800">Over/Under</th>
                </tr>
              </thead>
              <tbody>
                {budgetAnalysis.map(row => (
                  <tr key={row.app + row.platform} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-2 py-2 text-indigo-700 font-bold sticky left-0 z-10 bg-white text-lg" style={{ minWidth: '180px', width: '180px' }}>{row.app}</td>
                    <td className="px-2 py-2 text-gray-800" style={{ minWidth: '120px', width: '120px' }}>{row.platform}</td>
                    <td className="px-2 py-2 text-right text-gray-900">{formatMoney(row.mtdSpend)}</td>
                    <td className="px-2 py-2 text-right text-gray-900">{formatMoney(row.availableDailyBudget)}</td>
                    <td className="px-2 py-2 text-right editable-cell">
                      <EditableDailySetBudgetCell app={row.app} value={row.dailySetBudget} onChange={handleDailySetBudgetEdit} />
                    </td>
                    <td className="px-2 py-2 text-right editable-cell">
                      <EditableBudgetCell app={row.app} value={row.budget} onChange={handleBudgetEdit} />
                    </td>
                    <td className="px-2 py-2 text-right text-gray-900">{formatMoney(row.remainingBudget)}</td>
                    <td className="px-2 py-2 text-right text-gray-900">{formatMoney(row.avgDailySpend)}</td>
                    <td className="px-2 py-2 text-right text-gray-900">{row.remainingDays}</td>
                    <td className="px-2 py-2 text-right text-gray-900">{formatMoney(row.predictedSpend)}</td>
                    <td className={`px-2 py-2 text-right ${getOverUnderClass(row.overUnder)}`}>{formatPercent(row.overUnder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableBudgetCell({ app, value, onChange }: { app: string, value: number, onChange: (app: string, v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  useEffect(() => { setInputValue(value.toString()); }, [value]);
  const handleBlur = () => {
    const num = Number(inputValue);
    if (!isNaN(num) && num >= 0) {
      onChange(app, num);
    } else {
      setInputValue(value.toString());
    }
    setEditing(false);
  };
  return editing ? (
    <input
      type="number"
      className="border-none outline-none px-1 py-0.5 w-20 text-right bg-transparent text-base text-black font-bold underline"
      value={inputValue}
      autoFocus
      onChange={e => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') handleBlur(); }}
    />
  ) : (
    <span className="cursor-pointer text-black font-bold underline" onClick={() => setEditing(true)}>{formatMoney(value)}</span>
  );
}

// Editable cell for daily set budget
function EditableDailySetBudgetCell({ app, value, onChange }: { app: string, value: number, onChange: (app: string, v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  useEffect(() => { setInputValue(value.toString()); }, [value]);
  const handleBlur = () => {
    const num = Number(inputValue);
    if (!isNaN(num) && num >= 0) {
      onChange(app, num);
    } else {
      setInputValue(value.toString());
    }
    setEditing(false);
  };
  return editing ? (
    <input
      type="number"
      className="border-none outline-none px-1 py-0.5 w-20 text-right bg-transparent text-base text-black font-bold underline"
      value={inputValue}
      autoFocus
      onChange={e => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => { if (e.key === 'Enter') handleBlur(); }}
    />
  ) : (
    <span className="cursor-pointer text-black font-bold underline" onClick={() => setEditing(true)}>{formatMoney(value)}</span>
  );
}
