"use client";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import React, { useState, useRef, useEffect } from "react";

type ChangeRow = {
  impressions?: string;
  clicks?: string;
  ctr?: string;
  installs?: string;
  installRate?: string;
  customers?: string;
  conversionRate?: string;
  revenue?: string;
  spend?: string;
  profit?: string;
  roas?: string;
  cpc?: string;
  cpi?: string;
  cpa?: string;
};

type DataRow = {
  app: string;
  month: string;
  impressions: string;
  clicks: string;
  ctr: string;
  installs: string;
  installRate: string;
  customers: string;
  conversionRate: string;
  revenue: string;
  spend: string;
  profit: string;
  roas: string;
  cpc: string;
  cpi: string;
  cpa: string;
  change: ChangeRow | null;
};

const appList = [
  "Address Ninja - Validator",
  "Magical Fees & Tariffs",
  "Magical Make An Offer",
];

const data: DataRow[] = [
  {
    app: "Address Ninja - Validator",
    month: "January",
    impressions: "2,008",
    clicks: "109",
    ctr: "5.43%",
    installs: "33",
    installRate: "30.28%",
    customers: "8",
    conversionRate: "24.24%",
    revenue: "$249.80",
    spend: "$237.00",
    profit: "$12.80",
    roas: "105.40%",
    cpc: "$2.17",
    cpi: "$7.18",
    cpa: "$29.63",
    change: null,
  },
  {
    app: "Address Ninja - Validator",
    month: "February",
    impressions: "2,190",
    clicks: "180",
    ctr: "8.22%",
    installs: "49",
    installRate: "27.22%",
    customers: "9",
    conversionRate: "18.37%",
    revenue: "$195.12",
    spend: "$347.00",
    profit: "-$151.88",
    roas: "56.23%",
    cpc: "$1.93",
    cpi: "$7.08",
    cpa: "$38.56",
    change: {
      impressions: "9.06%",
      clicks: "65.14%",
      ctr: "2.79%",
      installs: "48.48%",
      installRate: "-3.05%",
      customers: "12.50%",
      conversionRate: "-5.88%",
      revenue: "-21.89%",
      spend: "46.41%",
      profit: "-49.17%",
      roas: "-11.34%",
      cpc: "-10.39%",
      cpi: "-1.39%",
      cpa: "30.16%",
    },
  },
  {
    app: "Address Ninja - Validator",
    month: "March",
    impressions: "2,137",
    clicks: "179",
    ctr: "8.38%",
    installs: "54",
    installRate: "30.17%",
    customers: "17",
    conversionRate: "31.48%",
    revenue: "$314.90",
    spend: "$446.00",
    profit: "-$131.10",
    roas: "70.61%",
    cpc: "$2.49",
    cpi: "$8.26",
    cpa: "$26.20",
    change: {
      impressions: "-2.42%",
      clicks: "-0.56%",
      ctr: "0.16%",
      installs: "10.20%",
      installRate: "2.95%",
      customers: "88.89%",
      conversionRate: "13.11%",
      revenue: "61.39%",
      spend: "28.53%",
      profit: "-49.17%",
      roas: "-11.34%",
      cpc: "-10.39%",
      cpi: "-1.39%",
      cpa: "30.16%",
    },
  },
  {
    app: "Address Ninja - Validator",
    month: "April",
    impressions: "4,326",
    clicks: "370",
    ctr: "7.10%",
    installs: "101",
    installRate: "32.90%",
    customers: "26",
    conversionRate: "25.74%",
    revenue: "$329.73",
    spend: "$1,283.72",
    profit: "-$953.99",
    roas: "25.69%",
    cpc: "$3.49",
    cpi: "$12.74",
    cpa: "$39.00",
    change: {
      impressions: "102.43%",
      clicks: "71.51%",
      ctr: "-1.28%",
      installs: "87.04%",
      installRate: "2.73%",
      customers: "52.94%",
      conversionRate: "-5.74%",
      revenue: "4.71%",
      spend: "187.83%",
      profit: "-44.92%",
      roas: "-67.82%",
      cpc: "53.98%",
      cpi: "-8.00%",
      cpa: "-1.62%",
    },
  },
  // Add more app data here as needed
];

const columns = [
  { key: "month", label: "Month" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "ctr", label: "CTR" },
  { key: "installs", label: "Installs" },
  { key: "installRate", label: "Install Rate" },
  { key: "customers", label: "Customers" },
  { key: "conversionRate", label: "Conversion Rate" },
  { key: "revenue", label: "Revenue" },
  { key: "spend", label: "Spend" },
  { key: "profit", label: "Profit" },
  { key: "roas", label: "ROAS" },
  { key: "cpc", label: "CPC" },
  { key: "cpi", label: "CPI" },
  { key: "cpa", label: "CPA" },
];

function getChangeColor(val: string | undefined) {
  if (!val || val === "") return "";
  if (val === "0%" || val === "0.00%") return "text-gray-500";
  if (val.startsWith("-")) return "text-red-600 font-bold";
  return "text-green-700 font-bold";
}

function AppMultiSelect({ selected, setSelected }: { selected: string[]; setSelected: (apps: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const allSelected = selected.length === appList.length;
  const handleChange = (app: string) => {
    if (app === "All") {
      setSelected(allSelected ? [] : appList);
    } else if (selected.includes(app)) {
      setSelected(selected.filter(a => a !== app));
    } else {
      setSelected([...selected, app]);
    }
  };
  let summary = allSelected
    ? "All"
    : selected.length === 0
    ? "None"
    : selected.length === 1
    ? appList.find(a => a === selected[0])
    : `${selected.length} selected`;
  return (
    <div className="relative min-w-[180px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="border rounded px-3 py-2 bg-white text-black w-full flex items-center justify-between"
      >
        <span className="truncate text-left">App: <span className="font-semibold">{summary}</span></span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto text-black">
          <label className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-black font-semibold border-b border-gray-200">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => handleChange("All")}
              className="accent-indigo-600 mr-2"
            />
            <span className="truncate text-black">{allSelected ? "Deselect All" : "Select All"}</span>
          </label>
          {appList.map(app => (
            <label key={app} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-black">
              <input
                type="checkbox"
                checked={selected.includes(app)}
                onChange={() => handleChange(app)}
                className="accent-indigo-600 mr-2"
              />
              <span className="truncate text-black">{app}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function YearlyPerformanceLanding() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        {/* <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">Yearly Performance</h1> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <Link
            href="/yearly-performance/month-on-month-progress"
            className="block rounded-xl shadow-lg bg-white hover:bg-indigo-50 border border-gray-200 p-8 transition group text-center"
          >
            <div className="text-2xl font-bold text-indigo-700 group-hover:underline mb-2">MoM Progress</div>
            <div className="text-gray-600">View your monthly performance trends and changes for the year.</div>
          </Link>
        </div>
      </div>
    </main>
  );
} 