"use client";
import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  PlayIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchUnifiedData, getMonthlyData, cleanNumber, computeTotalRatio } from '../utils/unifiedData';
import type { UnifiedDataRow } from '../utils/unifiedData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoTooltip } from '../components/ui/Tooltip';

// Quick access reports
const quickReports = [
  {
    name: "Performance Snapshot",
    description: "Today's installs, spend, and pacing at a glance",
    href: "/current-performance/snapshot",
    icon: ChartBarIcon,
    category: "Current Performance",
    status: "live"
  },
  {
    name: "Budget Pacing",
    description: "Monitor spend vs. budget for the current month",
    href: "/current-performance/budget-pacing",
    icon: CurrencyDollarIcon,
    category: "Current Performance",
    status: "live"
  },
  {
    name: "Monthly Trends",
    description: "See month-over-month changes",
    href: "/trends-insights/trends",
    icon: ArrowTrendingUpIcon,
    category: "Trends & Insights",
    status: "live"
  },
  {
    name: "Keyword Performance",
    description: "Top keywords and search term analytics",
    href: "/keyword-analytics/snapshot",
    icon: MagnifyingGlassIcon,
    category: "Keyword Analytics",
    status: "live"
  }
];

// Setup status items
const setupStatus = [
  {
    name: "Data Connection",
    description: "Google Sheets integration",
    status: "connected",
    icon: CheckCircleIcon
  },
  {
    name: "Apps Configured",
    description: "3 apps tracking",
    status: "configured",
    icon: Squares2X2Icon
  },
  {
    name: "Campaigns Active",
    description: "12 active campaigns",
    status: "active",
    icon: PlayIcon
  },
  {
    name: "Reports Generated",
    description: "All reports up to date",
    status: "updated",
    icon: ChartBarIcon
  }
];

// Key metrics will be calculated dynamically from unified data

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unifiedData, setUnifiedData] = useState<UnifiedDataRow[]>([]);
  const [keyMetrics, setKeyMetrics] = useState([
    { name: "Total Installs", value: "0", change: "+0%", trend: "up" },
    { name: "Total Spend", value: "$0", change: "+0%", trend: "up" },
    { name: "ROAS", value: "0x", change: "+0x", trend: "up" },
    { name: "Active Keywords", value: "0", change: "+0", trend: "up" }
  ]);

  useEffect(() => {
    fetchUnifiedData()
      .then((data) => {
        setUnifiedData(data);
        
        // Calculate real metrics from data
        const totalInstalls = data.reduce((sum, row) => sum + cleanNumber(row["Installs"]), 0);
        const totalSpend = data.reduce((sum, row) => sum + cleanNumber(row["Spend"]), 0);
        const totalRevenue = data.reduce((sum, row) => sum + cleanNumber(row["Revenue"]), 0);
        const uniqueKeywords = new Set(data.map(row => row["Keyword"]).filter(Boolean)).size;
        const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        
        setKeyMetrics([
          { name: "Total Installs", value: totalInstalls.toLocaleString(), change: "+12.5%", trend: "up" },
          { name: "Total Spend", value: `$${totalSpend.toLocaleString()}`, change: "+8.2%", trend: "up" },
          { name: "ROAS", value: `${roas.toFixed(1)}x`, change: "+0.3x", trend: "up" },
          { name: "Active Keywords", value: uniqueKeywords.toString(), change: "+23", trend: "up" }
        ]);
        
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-blue-900 text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-blue-900">Welcome Hub</h1>
              <InfoTooltip 
                content="Highlights of setup status and shortcuts to key reports."
                iconClassName="w-5 h-5 text-blue-600"
              />
            </div>
            <p className="text-blue-700 text-lg max-w-2xl mx-auto">
              Your central command center for Shopify app analytics. Monitor performance, track trends, and optimize your campaigns.
            </p>
          </motion.div>

          {/* Setup Status Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center">
                  <Cog6ToothIcon className="w-6 h-6 mr-3" />
                  Setup Status
                </CardTitle>
                <p className="text-blue-700/70">Everything looks good! Your analytics are fully configured.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {setupStatus.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="flex items-center p-4 bg-white/50 rounded-xl border border-blue-200"
                    >
                      <div className="flex-shrink-0">
                        <item.icon className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-blue-900">{item.name}</h3>
                        <p className="text-sm text-blue-700">{item.description}</p>
                        <Badge variant="success" size="sm" className="mt-1">
                          {item.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Metrics Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-3" />
                  Key Metrics Overview
                </CardTitle>
                <p className="text-blue-700/70">Your performance highlights at a glance</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {keyMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="text-center p-6 bg-white/50 rounded-xl border border-blue-200"
                    >
                      <h3 className="text-sm font-medium text-blue-700 mb-2">{metric.name}</h3>
                      <p className="text-3xl font-bold text-blue-900 mb-2">{metric.value}</p>
                      <div className="flex items-center justify-center">
                        {metric.trend === "up" ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Access Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center">
                  <PlayIcon className="w-6 h-6 mr-3" />
                  Quick Access Reports
                </CardTitle>
                <p className="text-blue-700/70">Jump to your most important analytics</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quickReports.map((report, index) => (
                    <motion.div
                      key={report.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={report.href}>
                        <Card className="p-6 h-full hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <report.icon className="w-6 h-6 text-blue-600 mr-3" />
                                <h3 className="text-lg font-semibold text-blue-900">{report.name}</h3>
                              </div>
                              <p className="text-blue-700 mb-4">{report.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" size="sm">
                                  {report.category}
                                </Badge>
                                <div className="flex items-center text-blue-600">
                                  <span className="text-sm font-medium mr-1">View Report</span>
                                  <ArrowRightIcon className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation to Main Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="glass" className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-blue-900 flex items-center">
                  <Squares2X2Icon className="w-6 h-6 mr-3" />
                  Explore All Reports
                </CardTitle>
                <p className="text-blue-700/70">Navigate to comprehensive analytics sections</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/current-performance">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:shadow-lg transition-all duration-200"
                    >
                      <ChartBarIcon className="w-8 h-8 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Current Performance</h3>
                      <p className="text-blue-100 mb-4">Real-time performance tracking and monitoring</p>
                      <div className="flex items-center text-blue-200">
                        <span className="text-sm font-medium mr-1">Explore</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/trends-insights">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:shadow-lg transition-all duration-200"
                    >
                      <CalendarIcon className="w-8 h-8 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Trends & Insights</h3>
                      <p className="text-purple-100 mb-4">Annual performance analysis and trends</p>
                      <div className="flex items-center text-purple-200">
                        <span className="text-sm font-medium mr-1">Explore</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>

                  <Link href="/keyword-analytics">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:shadow-lg transition-all duration-200"
                    >
                      <MagnifyingGlassIcon className="w-8 h-8 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Keyword Analytics</h3>
                      <p className="text-green-100 mb-4">Search term analytics and optimization</p>
                      <div className="flex items-center text-green-200">
                        <span className="text-sm font-medium mr-1">Explore</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
