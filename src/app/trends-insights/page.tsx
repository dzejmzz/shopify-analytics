"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from 'next/link';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  Squares2X2Icon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { InfoTooltip } from '../../components/ui/Tooltip';

const sidebarItems = [
  { name: "Performance Snapshot", icon: ChartBarIcon, href: "/trends-insights/snapshot" },
  { name: "Monthly Trends", icon: ArrowTrendingUpIcon, href: "/trends-insights/trends" },
  { name: "Geo Insights", icon: ChartPieIcon, href: "/trends-insights/geo" },
  { name: "Plan Performance", icon: Squares2X2Icon, href: "/trends-insights/plans" },
  { name: "Device Performance", icon: Squares2X2Icon, href: "/trends-insights/devices" },
];

export default function TrendsInsights() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Trends & Insights</h1>
              <InfoTooltip 
                content="Annual performance analysis"
                iconClassName="w-5 h-5 text-blue-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-20"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Select a Report</h2>
          <p className="text-slate-300 mb-8">Choose from the sidebar to view specific trend analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {sidebarItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:text-blue-300" />
                <h3 className="text-white font-medium mb-2">{item.name}</h3>
                <p className="text-slate-400 text-sm">Click to view report</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
