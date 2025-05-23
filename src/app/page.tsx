"use client";
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InstallsPaceTable from "../components/InstallsPaceTable";
import RawDataTable from "../components/RawDataTable";

export default function Home() {
  const [installsData, setInstallsData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ installs: 0, clicks: 0, spend: 0 });
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZoM4CtqKHTAUAGLubLFG0-lsbhSrLLy7Y6qN_o62LlRcHsEHjOtDy6eyUYK0A5hKwAfA7l/pub?gid=1225782318&single=true&output=csv";
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csv => {
        import('papaparse').then(Papa => {
          const { data } = Papa.default.parse(csv, { header: true, skipEmptyLines: true });
          setInstallsData(data);
          // Get all unique dates
          const dates = Array.from(new Set(data.map((row: any) => {
            const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
            return row[keys["date"]];
          }).filter(Boolean))).sort((a, b) => b.localeCompare(a));
          setAllDates(dates);
          setSelectedDate(dates[0]);
        });
      });
  }, []);

  useEffect(() => {
    if (!selectedDate || installsData.length === 0) return;
    // Filter rows by selected date
    const filteredRows = installsData.filter((row: any) => {
      const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
      return row[keys["date"]] === selectedDate;
    });
    // Sum metrics for that date
    let installs = 0, clicks = 0, spend = 0;
    filteredRows.forEach((row: any) => {
      const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
      installs += Number(row[keys["installs"]] || 0);
      clicks += Number(row[keys["clicks"]] || 0);
      spend += Number(row[keys["spend"]] || 0);
    });
    setSummary({ installs, clicks, spend });
  }, [selectedDate, installsData]);

  // Prepare data for the summary graph (e.g., installs per day for the selected date)
  const chartData = installsData.filter((row: any) => {
    const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
    return row[keys["date"]] === selectedDate;
  }).map((row: any, i: number) => {
    const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
    return {
      name: row[keys["ad name"]] || `Ad ${i + 1}`,
      installs: Number(row[keys["installs"]] || 0),
      clicks: Number(row[keys["clicks"]] || 0),
      spend: Number(row[keys["spend"]] || 0),
    };
  });

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Shopify Analytics Summary</h1>
          <p className="text-gray-300 mb-2">Track your app installs, clicks, and spend</p>
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="date-picker" className="font-medium text-gray-300">Date:</label>
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
        </div>
      </div>
      {/* Main grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics graph */}
        <div className="glass rounded-2xl p-4 md:col-span-2 flex flex-col gap-2">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-bold text-lg">Installs by Ad (for {selectedDate})</span>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#a3d900" />
                <YAxis stroke="#a3d900" />
                <Tooltip />
                <Line type="monotone" dataKey="installs" stroke="#a3d900" strokeWidth={3} dot={{ r: 6, fill: '#a3d900' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Apps Table (optional) */}
        <div className="glass rounded-2xl p-4 flex flex-col gap-2">
          <span className="font-bold text-lg mb-2">Top Apps (by Installs)</span>
          <div className="flex flex-col gap-1">
            {installsData.filter((row: any) => {
              const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
              return row[keys["date"]] === selectedDate;
            }).slice(0, 5).map((row: any, i: number) => {
              const keys = Object.keys(row).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {} as Record<string, string>);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate w-32 font-semibold text-gray-200">{row[keys["app name"]] || row[keys["app"]] || "-"}</span>
                  <span className="font-bold text-primary-300">{row[keys["installs"]] || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Summary cards row */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass flex flex-col items-center justify-center rounded-xl p-6 min-h-[120px]">
          <div className="text-2xl font-bold text-primary-300">{summary.installs.toLocaleString()}</div>
          <div className="text-gray-300 text-sm mt-1">Total Installs</div>
        </div>
        <div className="glass flex flex-col items-center justify-center rounded-xl p-6 min-h-[120px]">
          <div className="text-2xl font-bold text-primary-300">{summary.clicks.toLocaleString()}</div>
          <div className="text-gray-300 text-sm mt-1">Total Clicks</div>
        </div>
        <div className="glass flex flex-col items-center justify-center rounded-xl p-6 min-h-[120px]">
          <div className="text-2xl font-bold text-primary-300">${summary.spend.toLocaleString()}</div>
          <div className="text-gray-300 text-sm mt-1">Total Spend</div>
        </div>
      </div>
    </div>
  );
}
