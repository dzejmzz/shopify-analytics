"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SortableTable from "../../../components/SortableTable";
import AIRecommendations from "../../../components/AIRecommendations";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  Squares2X2Icon,
  TableCellsIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { fetchUnifiedData, getDailyData } from '../../../utils/unifiedData';
import type { UnifiedDataRow } from '../../../utils/unifiedData';
import { format, parse, startOfMonth, subDays } from 'date-fns';

export default function AppCampaignSplitPage() {
  const [rawRows, setRawRows] = useState<UnifiedDataRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states for AI recommendations
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // Filter for campaigns that ran during current month
  // Get the last/final values for each campaign as of their end date

  useEffect(() => {
    fetchUnifiedData()
      .then((data: UnifiedDataRow[]) => {
        console.log('Fetched data:', data.length, 'rows');
        
        // Filter for campaigns that ran during current month (September 2025)
        const currentMonthStart = new Date('2025-09-01');
        const currentMonthEnd = new Date('2025-09-30');
        
        const currentMonthData = data.filter(row => {
          const startDate = new Date(String(row["Start Date"]));
          const endDate = new Date(String(row["End Date"]));
          
          // Check if campaign was active during September 2025
          return startDate <= currentMonthEnd && endDate >= currentMonthStart;
        });
        
        console.log('Current month data:', currentMonthData.length, 'rows');
      
      // Get all unique campaigns and dates
      const campaigns = [...new Set(currentMonthData.map(row => String(row["Ad Name"])))];
      const dates = [...new Set(currentMonthData.map(row => String(row["End Date"])))].sort();
      
      console.log('Campaigns:', campaigns);
      console.log('Dates:', dates);
      
      // Create a record for each campaign on each date using "last values" logic
      const campaignData = [];
      const lastValues = new Map(); // Store last known values for each campaign
      
      dates.forEach(date => {
        campaigns.forEach(campaignName => {
          // Find all rows for this campaign on this date
          const campaignRows = currentMonthData.filter(row => 
            String(row["Ad Name"]) === campaignName && 
            String(row["End Date"]) === date
          );
          
          let impressions = 0;
          let clicks = 0;
          let installs = 0;
          let customers = 0;
          let revenue = 0;
          let spend = 0;
          let appName = "";
          
          // If we have data for this campaign on this date, use it and update last values
          if (campaignRows.length > 0) {
            campaignRows.forEach(row => {
              impressions += Number(row["Impressions"]) || 0;
              clicks += Number(row["Clicks"]) || 0;
              installs += Number(row["Installs"]) || 0;
              customers += Number(row["Customers"]) || 0;
              revenue += Number(row["Revenue"]) || 0;
              spend += Number(row["Spend"]) || 0;
              appName = String(row["App Name"]);
            });
            
            // Update last known values for this campaign
            lastValues.set(campaignName, {
              impressions,
              clicks,
              installs,
              customers,
              revenue,
              spend,
              appName
            });
          } else {
            // No data for this campaign on this date, use last known values
            const lastValue = lastValues.get(campaignName);
            if (lastValue) {
              impressions = lastValue.impressions;
              clicks = lastValue.clicks;
              installs = lastValue.installs;
              customers = lastValue.customers;
              revenue = lastValue.revenue;
              spend = lastValue.spend;
              appName = lastValue.appName;
            }
          }
          
          // Only create a record if we have some data (either current or last known)
          if (impressions > 0 || clicks > 0 || installs > 0 || customers > 0 || revenue > 0 || spend > 0) {
            campaignData.push({
              "App Name": appName,
              "Ad Name": campaignName,
              "Start Date": date,
              "End Date": date,
              "Impressions": impressions,
              "Clicks": clicks,
              "Installs": installs,
              "Customers": customers,
              "Revenue": revenue,
              "Spend": spend,
              "App": appName,
              "Date": date,
              "Platform": "Shopify",
              "Imps": impressions,
              "CTR": clicks > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00",
              "InstallRate": clicks > 0 ? ((installs / clicks) * 100).toFixed(2) : "0.00",
              "ConversionRate": installs > 0 ? ((customers / installs) * 100).toFixed(2) : "0.00",
              "Profit": (revenue - spend).toFixed(2),
              "ROAS": spend > 0 ? (revenue / spend) : 0,
              "CPC": clicks > 0 ? (spend / clicks).toFixed(2) : "0.00",
              "CPI": installs > 0 ? (spend / installs).toFixed(2) : "0.00",
              "CAC": customers > 0 ? (spend / customers).toFixed(2) : "0.00"
            });
          }
        });
      });
      
      setRawRows(campaignData);
      
      // Use the dates we extracted (sorted in ascending order)
      console.log('Setting dates for filter:', dates);
      setAllDates(dates);
      
      // Set the default selected date to the last (most recent) date
      if (dates.length > 0) {
        setSelectedDate(dates[dates.length - 1]);
      }
      setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Get unique app names for stats
  const uniqueApps = Array.from(new Set(rawRows.map(row => row.App))).length;
  const totalCampaigns = 4; // Fixed count for the 4 campaigns

  // Define columns for the sortable table
  const columns = [
    { key: 'Ad Name', label: 'Ad Name', align: 'left' as const, sortable: true },
    { key: 'Platform', label: 'Platform', align: 'left' as const, sortable: true },
    { key: 'Imps', label: 'Impressions', align: 'right' as const, sortable: true },
    { key: 'Clicks', label: 'Clicks', align: 'right' as const, sortable: true },
    { key: 'CTR', label: 'CTR', align: 'right' as const, sortable: true, format: (v: number) => (v * 100).toFixed(2) + '%' },
    { key: 'Installs', label: 'Installs', align: 'right' as const, sortable: true },
    { key: 'InstallRate', label: 'Install Rate', align: 'right' as const, sortable: true, format: (v: number) => (v * 100).toFixed(2) + '%' },
    { key: 'Customers', label: 'Customers', align: 'right' as const, sortable: true },
    { key: 'ConversionRate', label: 'Conversion Rate', align: 'right' as const, sortable: true, format: (v: number) => (v * 100).toFixed(2) + '%' },
    { key: 'Revenue', label: 'Revenue', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'Spend', label: 'Spend', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'Profit', label: 'Profit', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'ROAS', label: 'ROAS', align: 'right' as const, sortable: true, format: (v: number) => (v * 100).toFixed(2) + '%' },
    { key: 'CPC', label: 'CPC', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'CPI', label: 'CPI', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { key: 'CAC', label: 'CAC', align: 'right' as const, sortable: true, format: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

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
              <p className="text-slate-300 mt-1">Current month campaign performance - showing final values for all campaigns that had impressions during the current month.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              <TableCellsIcon className="h-4 w-4 mr-1" />
              September 2025
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              <ChartBarSquareIcon className="h-4 w-4 mr-1" />
              {uniqueApps} {uniqueApps === 1 ? 'App' : 'Apps'}
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
                <SortableTable 
                  data={rawRows} 
                  columns={columns}
                  maxHeight="600px"
                />
              )}
            </div>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AIRecommendations 
            data={rawRows}
            selectedDate={selectedDate}
            selectedApps={selectedApps}
            selectedPlatforms={selectedPlatforms}
            selectedMetrics={selectedMetrics}
          />
        </motion.div>
      </div>
    </div>
  );
}