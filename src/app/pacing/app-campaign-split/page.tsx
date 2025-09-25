"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RawDataTable from "../../../components/RawDataTable";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  Squares2X2Icon,
  TableCellsIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { fetchPacingRaw } from '../../../utils/pacingraw';
import type { PacingRawRow } from '../../../utils/pacingraw';
import { format, parse, startOfMonth, subDays } from 'date-fns';

export default function AppCampaignSplitPage() {
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

  // Get unique app names for stats
  const uniqueApps = Array.from(new Set(rawRows.map(row => row.App))).length;
  const totalCampaigns = rawRows.length;

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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Squares2X2Icon className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Campaign Breakdown</h1>
              <p className="text-slate-300 mt-1">Compare performance across campaigns and apps.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <TableCellsIcon className="h-4 w-4 mr-1" />
              Raw Data View
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <ChartBarSquareIcon className="h-4 w-4 mr-1" />
              {uniqueApps} Apps
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {totalCampaigns} Campaigns
            </Badge>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Campaign Performance Data</h2>
              <p className="text-slate-400 text-sm">
                Interactive table with filtering and sorting capabilities for detailed campaign analysis
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-slate-300">Loading campaign data...</span>
                </div>
              ) : (
                <RawDataTable />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}