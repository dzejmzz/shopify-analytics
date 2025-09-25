"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { InfoTooltip } from "../../../components/ui/Tooltip";
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  CheckIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { fetchUnifiedData, cleanNumber, computeTotalRatio } from '../../../utils/unifiedData';
import type { UnifiedDataRow } from '../../../utils/unifiedData';

const sidebarItems = [
  { name: "Performance Snapshot", icon: ChartBarIcon, href: "/search-term/overview", active: true },
  { name: "Keyword Trends", icon: ArrowTrendingUpIcon, href: "/search-term/month-to-month" },
  { name: "Geo Keyword Insights", icon: ChartPieIcon, href: "/search-term/country-split" },
  { name: "Keyword by Plan", icon: Squares2X2Icon, href: "/search-term/plan-split" },
  { name: "Keyword by Device", icon: Squares2X2Icon, href: "/search-term/device-split" },
  { name: "Match Type Analysis", icon: ChartBarIcon, href: "/search-term/exact-vs-broad-split" },
  { name: "Broad Match Performance", icon: MagnifyingGlassIcon, href: "/search-term/broad-term-stats" },
];

export default function SearchTermOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unifiedData, setUnifiedData] = useState<UnifiedDataRow[]>([]);
  const [keywordStats, setKeywordStats] = useState({
    totalKeywords: 0,
    topKeyword: '',
    totalImpressions: 0,
    totalClicks: 0,
    totalInstalls: 0,
    totalSpend: 0
  });

  useEffect(() => {
    fetchUnifiedData()
      .then((data) => {
        setUnifiedData(data);
        
        // Calculate keyword statistics
        const uniqueKeywords = new Set(data.map(row => row["Keyword"]).filter(Boolean));
        const keywordPerformance = Array.from(uniqueKeywords).map(keyword => {
          const keywordData = data.filter(row => row["Keyword"] === keyword);
          const impressions = keywordData.reduce((sum, row) => sum + cleanNumber(row["Impressions"]), 0);
          const clicks = keywordData.reduce((sum, row) => sum + cleanNumber(row["Clicks"]), 0);
          const installs = keywordData.reduce((sum, row) => sum + cleanNumber(row["Installs"]), 0);
          const spend = keywordData.reduce((sum, row) => sum + cleanNumber(row["Spend"]), 0);
          return { keyword, impressions, clicks, installs, spend };
        });
        
        const topKeyword = keywordPerformance.sort((a, b) => b.impressions - a.impressions)[0];
        
        setKeywordStats({
          totalKeywords: uniqueKeywords.size,
          topKeyword: topKeyword?.keyword || '',
          totalImpressions: data.reduce((sum, row) => sum + cleanNumber(row["Impressions"]), 0),
          totalClicks: data.reduce((sum, row) => sum + cleanNumber(row["Clicks"]), 0),
          totalInstalls: data.reduce((sum, row) => sum + cleanNumber(row["Installs"]), 0),
          totalSpend: data.reduce((sum, row) => sum + cleanNumber(row["Spend"]), 0)
        });
        
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-slate-300 text-lg">Loading keyword analytics...</span>
        </div>
      </div>
    );
  }

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
                  <MagnifyingGlassIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Keyword Analytics</h1>
                  <p className="text-slate-300 mt-1">Highlights of top keywords, match types, and changes.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Performance Snapshot
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Keyword Analysis
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Squares2X2Icon className="h-4 w-4 mr-1" />
                  Match Types
                </Badge>
              </div>
            </motion.div>

            {/* Content Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Keyword Performance Overview</h2>
                <div className="text-slate-300">
                  <p className="mb-4">This page will show highlights of top keywords, match types, and changes.</p>
                  <p className="text-sm text-slate-400">Coming soon: Keyword performance metrics, top performing terms, and match type analysis.</p>
                </div>
              </Card>
            </motion.div>
      </div>
    </div>
  );
}
