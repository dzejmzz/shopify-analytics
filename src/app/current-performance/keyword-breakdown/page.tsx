"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SortableKeywordTable from "../../../components/SortableKeywordTable";
import AIRecommendations from "../../../components/AIRecommendations";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  Squares2X2Icon,
  TableCellsIcon,
  ChartBarSquareIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { fetchUnifiedData, getDailyData } from '../../../utils/unifiedData';
import type { UnifiedDataRow } from '../../../utils/unifiedData';
import { format, parse, startOfMonth, subDays } from 'date-fns';

export default function KeywordBreakdownPage() {
  const [rawRows, setRawRows] = useState<UnifiedDataRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states for AI recommendations
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  // Filter states for the table
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [availableApps, setAvailableApps] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Filter for keywords that ran during current month
  // Get the last/final values for each keyword as of their end date

  useEffect(() => {
    fetchUnifiedData()
      .then((data: UnifiedDataRow[]) => {
        console.log('Fetched data:', data.length, 'rows');
        
        // Use all data instead of filtering by month
        const allData = data;
        
        console.log('Processing data:', allData.length, 'rows');
        
        // Get available dates and apps for filters
        const dates = [...new Set(allData.map(row => String(row["End Date"])))].sort();
        const apps = [...new Set(allData.map(row => String(row["App Name"])))].filter(app => app && app !== "");
        
        setAvailableDates(dates);
        setAvailableApps(apps);
        
        // Set default filters
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[dates.length - 1]); // Last date
        }
        if (apps.length > 0 && selectedApps.length === 0) {
          setSelectedApps(apps); // All apps by default
        }
      
      // Apply filters
      const filteredData = allData.filter(row => {
        const rowDate = String(row["End Date"]);
        const rowApp = String(row["App Name"]);
        
        const dateMatch = !selectedDate || rowDate === selectedDate;
        const appMatch = selectedApps.length === 0 || selectedApps.includes(rowApp);
        
        return dateMatch && appMatch;
      });
      
      console.log('Filtered data:', filteredData.length, 'rows');
      console.log('Sample filtered row:', filteredData[0]);
      
      // Simple approach: group by keyword and campaign directly
      const keywordCampaignData = new Map();
      
      // Process each row once
      filteredData.forEach(row => {
        const keywordName = String(row["Keyword"] || "");
        const campaignName = String(row["Ad Name"]);
        
        if (!keywordName || keywordName === "") return; // Skip empty keywords
        
        const key = `${keywordName}|${campaignName}`;
        
        if (!keywordCampaignData.has(key)) {
          keywordCampaignData.set(key, {
            keywordName,
            campaignName,
            impressions: 0,
            clicks: 0,
            installs: 0,
            customers: 0,
            revenue: 0,
            spend: 0
          });
        }
        
        const existing = keywordCampaignData.get(key);
        existing.impressions += Number(row["Impressions"]) || 0;
        existing.clicks += Number(row["Clicks"]) || 0;
        existing.installs += Number(row["Installs"]) || 0;
        existing.customers += Number(row["Customers"]) || 0;
        existing.revenue += Number(row["Revenue"]) || 0;
        existing.spend += Number(row["Spend"]) || 0;
      });

      // Group by keyword for collapsible structure
      const keywordGroups = new Map();
      keywordCampaignData.forEach((data, key) => {
        const { keywordName, campaignName } = data;
        
        if (!keywordGroups.has(keywordName)) {
          keywordGroups.set(keywordName, []);
        }
        keywordGroups.get(keywordName).push(data);
      });

      // Convert to flat structure for display
      const keywordData = [];
      keywordGroups.forEach((campaigns, keywordName) => {
        let totalImpressions = 0;
        let totalClicks = 0;
        let totalInstalls = 0;
        let totalCustomers = 0;
        let totalRevenue = 0;
        let totalSpend = 0;

        // Add individual campaign rows
        campaigns.forEach(metrics => {
          totalImpressions += metrics.impressions;
          totalClicks += metrics.clicks;
          totalInstalls += metrics.installs;
          totalCustomers += metrics.customers;
          totalRevenue += metrics.revenue;
          totalSpend += metrics.spend;

          keywordData.push({
            "Keyword": keywordName,
            "Ad Name": metrics.campaignName,
            "Start Date": "2025-09-04",
            "End Date": "2025-09-04",
            "Impressions": metrics.impressions,
            "Clicks": metrics.clicks,
            "Installs": metrics.installs,
            "Customers": metrics.customers,
            "Revenue": metrics.revenue,
            "Spend": metrics.spend,
            "App": metrics.campaignName,
            "Date": "2025-09-04",
            "Platform": "Shopify",
            "Imps": metrics.impressions,
            "CTR": metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : "0.00",
            "InstallRate": metrics.clicks > 0 ? ((metrics.installs / metrics.clicks) * 100).toFixed(2) : "0.00",
            "ConversionRate": metrics.installs > 0 ? ((metrics.customers / metrics.installs) * 100).toFixed(2) : "0.00",
            "Profit": (metrics.revenue - metrics.spend).toFixed(2),
            "ROAS": metrics.spend > 0 ? (metrics.revenue / metrics.spend) : 0,
            "CPC": metrics.clicks > 0 ? (metrics.spend / metrics.clicks).toFixed(2) : "0.00",
            "CPI": metrics.installs > 0 ? (metrics.spend / metrics.installs).toFixed(2) : "0.00",
            "CAC": metrics.customers > 0 ? (metrics.spend / metrics.customers).toFixed(2) : "0.00",
            "isSubRow": true
          });
        });

        // Add keyword summary row
        keywordData.push({
          "Keyword": keywordName,
          "Ad Name": "TOTAL",
          "Start Date": "2025-09-04",
          "End Date": "2025-09-04",
          "Impressions": totalImpressions,
          "Clicks": totalClicks,
          "Installs": totalInstalls,
          "Customers": totalCustomers,
          "Revenue": totalRevenue,
          "Spend": totalSpend,
          "App": "TOTAL",
          "Date": "2025-09-04",
          "Platform": "Shopify",
          "Imps": totalImpressions,
          "CTR": totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00",
          "InstallRate": totalClicks > 0 ? ((totalInstalls / totalClicks) * 100).toFixed(2) : "0.00",
          "ConversionRate": totalInstalls > 0 ? ((totalCustomers / totalInstalls) * 100).toFixed(2) : "0.00",
          "Profit": (totalRevenue - totalSpend).toFixed(2),
          "ROAS": totalSpend > 0 ? (totalRevenue / totalSpend) : 0,
          "CPC": totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : "0.00",
          "CPI": totalInstalls > 0 ? (totalSpend / totalInstalls).toFixed(2) : "0.00",
          "CAC": totalCustomers > 0 ? (totalSpend / totalCustomers).toFixed(2) : "0.00",
          "isSubRow": false
        });
      });
      
      setRawRows(keywordData);
      setFilteredData(keywordData);
      setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [selectedDate, selectedApps]);

  // Update filtered data when filters change
  useEffect(() => {
    if (rawRows.length === 0) return;
    
    // Re-process data with current filters
    const allData = rawRows;
    const filteredData = allData.filter(row => {
      const rowDate = String(row["Date"] || row["End Date"]);
      const rowApp = String(row["App"] || row["App Name"]);
      
      const dateMatch = !selectedDate || rowDate === selectedDate;
      const appMatch = selectedApps.length === 0 || selectedApps.includes(rowApp);
      
      return dateMatch && appMatch;
    });
    
    setFilteredData(filteredData);
  }, [rawRows, selectedDate, selectedApps]);

  // Get unique app names for stats
  const uniqueApps = Array.from(new Set(rawRows.map(row => row.App))).length;
  const totalKeywords = Array.from(new Set(rawRows.map(row => row.Keyword))).length;

  // Define columns for the sortable table
  const columns = [
    { key: 'Keyword', label: 'Keyword', align: 'left' as const, sortable: true },
    { key: 'Ad Name', label: 'Ad Name', align: 'left' as const, sortable: true },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading keyword data...</div>
      </div>
    );
  }

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Keyword Breakdown</h1>
              <p className="text-slate-300 mt-1">Current month keyword performance - showing final values for all keywords that had impressions during the current month.</p>
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
              {totalKeywords} Keywords
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
              <h2 className="text-xl font-semibold text-white mb-2">Keyword Performance Data</h2>
              <p className="text-slate-400 text-sm">
                Interactive table with filtering and sorting capabilities for detailed keyword analysis
              </p>
            </div>
            
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-300">Date:</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 bg-slate-700 text-white border border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Dates</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              
              {/* App Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-300">App:</label>
                <select
                  value={selectedApps.length === 1 ? selectedApps[0] : ""}
                  onChange={(e) => setSelectedApps(e.target.value ? [e.target.value] : [])}
                  className="px-3 py-1 bg-slate-700 text-white border border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Apps</option>
                  {availableApps.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
              
              {/* Export Button */}
              <button className="ml-auto px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
                Export CSV
              </button>
            </div>
            
            <SortableKeywordTable 
              data={filteredData} 
              columns={columns}
              maxHeight="600px"
            />
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
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
