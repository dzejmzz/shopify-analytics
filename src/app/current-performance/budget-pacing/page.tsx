"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BudgetAnalysisTable from "../../../components/BudgetAnalysisTable";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  CurrencyDollarIcon,
  ChartPieIcon,
  BanknotesIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { fetchUnifiedData, getDailyData, getMonthlyData, cleanNumber, computeTotalRatio } from '../../../utils/unifiedData';
import type { UnifiedDataRow } from '../../../utils/unifiedData';
import { format, parse, startOfMonth, subDays } from 'date-fns';

export default function BudgetTrackerPage() {
  const [rawRows, setRawRows] = useState<UnifiedDataRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate date restrictions - adjust for the data's date range (September 2025)
  const dataStartDate = new Date('2025-09-01'); // First day of data
  const dataEndDate = new Date('2025-09-30');   // Last day of data

  useEffect(() => {
    fetchUnifiedData().then((data: UnifiedDataRow[]) => {
      // Convert to daily data for current performance tracking
      const dailyData = getDailyData(data);
      setRawRows(dailyData);
      const dates = Array.from(new Set(dailyData.map((row: UnifiedDataRow) => String(row.Date)))).sort();
      // Filter dates to only include the data's date range (September 2025)
      const availableDates = dates.filter(date => {
        const dateObj = parse(date, 'yyyy-MM-dd', new Date());
        return dateObj >= dataStartDate && dateObj <= dataEndDate;
      });
      setAllDates(availableDates);
      setLoading(false);
    });
  }, []);

  // Calculate budget stats
  const totalSpend = rawRows.reduce((sum, row) => sum + (Number(row.Spend) || 0), 0);
  const totalRevenue = rawRows.reduce((sum, row) => sum + (Number(row.Revenue) || 0), 0);
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
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Budget Pacing</h1>
              <p className="text-slate-300 mt-1">Monitor spend vs. budget for the current month.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <BanknotesIcon className="h-4 w-4 mr-1" />
              Budget Analysis
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ChartPieIcon className="h-4 w-4 mr-1" />
              ${totalSpend.toLocaleString()} Total Spend
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <CalculatorIcon className="h-4 w-4 mr-1" />
              {uniqueApps} Apps Tracked
            </Badge>
          </div>
        </motion.div>

        {/* Budget Analysis Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">Budget Performance Analysis</h2>
              <p className="text-slate-400 text-sm">
                Track spending efficiency, budget utilization, and ROI across all campaigns with detailed breakdowns
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                  <span className="ml-3 text-slate-300">Loading budget data...</span>
                </div>
              ) : (
                <BudgetAnalysisTable />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}