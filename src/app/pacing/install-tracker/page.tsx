"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import InstallsPaceTable from '../../../components/InstallsPaceTable';
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';
import { format, parse, startOfMonth, subDays } from 'date-fns';

export default function InstallsPacePage() {
  const [rawRows, setRawRows] = useState<PacingRawRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate date restrictions
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const yesterday = subDays(today, 1);

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
      setLoading(false);
    });
  }, []);

  // Calculate total installs for stats
  const totalInstalls = rawRows.reduce((sum, row) => sum + (Number(row.Installs) || 0), 0);
  const uniqueApps = Array.from(new Set(rawRows.map(row => row.App))).length;

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
              <ChartBarIcon className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Installs Trend</h1>
              <p className="text-slate-300 mt-1">Track installs day by day against targets.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Install Tracking
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              {totalInstalls.toLocaleString()} Total Installs
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              {uniqueApps} Apps Tracked
            </Badge>
          </div>
        </motion.div>

        {/* Install Tracker Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Installation Pacing Analysis</h2>
              <p className="text-slate-400 text-sm">
                Track daily install performance against monthly targets with editable goals and real-time progress indicators
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  <span className="ml-3 text-slate-300">Loading install data...</span>
                </div>
              ) : (
                <InstallsPaceTable />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}