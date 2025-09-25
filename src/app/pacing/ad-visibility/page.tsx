"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  EyeIcon,
  ChartBarSquareIcon,
  CalendarIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';
import { format, parse, startOfMonth, subDays } from 'date-fns';

function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export default function AdVisibilityPage() {
  const [rows, setRows] = useState<PacingRawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  // Calculate date restrictions
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const yesterday = subDays(today, 1);

  useEffect(() => {
    fetchPacingRaw()
      .then((data: PacingRawRow[]) => {
        setRows(data);
        const dates = Array.from(new Set(data.map((row: PacingRawRow) => String(row.Date)))).sort();
        // Filter dates to only include current month up to yesterday
        const availableDates = dates.filter(date => {
          const dateObj = parse(date, 'dd/MM/yyyy', new Date());
          return dateObj >= firstDayOfMonth && dateObj <= yesterday;
        });
        setAllDates(availableDates);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  // Compute all app names from all rows for default selection
  const allAppNames = Array.from(new Set(rows.map((row: PacingRawRow) => String(row["App Name"])).filter(Boolean)));
  useEffect(() => {
    if (selectedApps.length === 0 && allAppNames.length > 0) {
      setSelectedApps(allAppNames);
    }
  }, [allAppNames.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-slate-300 text-lg">Loading visibility data...</span>
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

  if (!rows.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">No data found.</div>
      </div>
    );
  }

  // Group data: { [app]: { [campaign]: { [date]: visibility } } }
  const grouped: Record<string, Record<string, Record<string, number | null>>> = {};
  rows.forEach(row => {
    const app = String(row["App Name"] || "Unknown App");
    const campaign = String(row["Ad Name"] || "Unknown Campaign");
    const date = String(row["Date"]);
    let vis = row["Visibility"];
    vis = vis === undefined || vis === null || vis === '' ? null : cleanNumber(vis);
    if (!grouped[app]) grouped[app] = {};
    if (!grouped[app][campaign]) grouped[app][campaign] = {};
    grouped[app][campaign][date] = vis;
  });

  // Calculate statistics
  const totalCampaigns = Object.values(grouped).reduce((sum, app) => sum + Object.keys(app).length, 0);
  const uniqueApps = Object.keys(grouped).length;
  const dateRange = allDates.length > 0 ? `${allDates[0]} - ${allDates[allDates.length - 1]}` : 'No dates';

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
            <div className="p-2 bg-green-500/20 rounded-lg">
              <EyeIcon className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Visibility Metrics</h1>
              <p className="text-slate-300 mt-1">Check ad impressions and share of visibility.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <EyeIcon className="h-4 w-4 mr-1" />
              Visibility Tracking
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ChartBarSquareIcon className="h-4 w-4 mr-1" />
              {totalCampaigns} Campaigns
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
              {uniqueApps} Apps
            </Badge>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {allDates.length} Days
            </Badge>
          </div>
        </motion.div>

        {/* Visibility Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Campaign Visibility Matrix</h2>
              <p className="text-slate-400 text-sm">
                Daily visibility percentages for each campaign across all apps and dates
              </p>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-slate-600">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr className="sticky top-0 z-30">
                    <th className="px-4 py-3 text-left font-semibold text-white sticky left-0 z-20 bg-slate-700/50 border-r border-slate-600" style={{ minWidth: '180px', width: '180px' }}>
                      App Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white sticky left-[180px] z-20 bg-slate-700/50 border-r border-slate-600" style={{ minWidth: '200px', width: '200px' }}>
                      Campaign
                    </th>
                    {allDates.map(date => (
                      <th key={date} className="px-3 py-3 font-semibold text-center text-white whitespace-nowrap border-r border-slate-600 last:border-r-0">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30">
                  {Object.keys(grouped).filter(app => selectedApps.includes(app)).map(app => (
                    Object.keys(grouped[app]).map((campaign, j) => (
                      <tr key={app + campaign} className="border-b border-slate-600/50 last:border-b-0 hover:bg-slate-700/30 transition-colors">
                        {j === 0 ? (
                          <td rowSpan={Object.keys(grouped[app]).length} className="px-4 py-3 text-blue-300 font-semibold sticky left-0 z-10 bg-slate-800/50 align-top border-r border-slate-600" style={{ minWidth: '180px', width: '180px' }}>
                            {app}
                          </td>
                        ) : null}
                        <td className="px-4 py-3 text-slate-200 sticky left-[180px] z-10 bg-slate-800/50 border-r border-slate-600" style={{ minWidth: '200px', width: '200px' }}>
                          {campaign}
                        </td>
                        {allDates.map(date => {
                          const v = grouped[app][campaign][date];
                          const hasValue = v !== null && v !== undefined;
                          return (
                            <td key={date} className="px-3 py-3 text-center border-r border-slate-600/30 last:border-r-0">
                              {hasValue ? (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  v >= 80 ? 'bg-green-500/20 text-green-300' :
                                  v >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                                  v >= 40 ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {v.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}