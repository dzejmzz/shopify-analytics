"use client";
import { useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AIRecommendationsProps {
  data: any[];
  selectedDate?: string;
  selectedApps?: string[];
  selectedPlatforms?: string[];
  selectedMetrics?: string[];
}

interface Recommendation {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AIRecommendations({ 
  data, 
  selectedDate, 
  selectedApps, 
  selectedPlatforms, 
  selectedMetrics 
}: AIRecommendationsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecommendations = analyzeData(data, selectedDate, selectedApps, selectedPlatforms, selectedMetrics);
    setRecommendations(newRecommendations);
    setShowRecommendations(true);
    setIsGenerating(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  return (
    <Card className="mt-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get intelligent insights based on your current data and filters
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating || data.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                Analyzing...
              </>
            ) : (
              <>
                🤖 Generate Recommendations
              </>
            )}
          </Button>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No data available for analysis. Please adjust your filters.
          </div>
        )}

        {showRecommendations && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No specific recommendations found for the current data.
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'success' ? 'border-green-500 bg-green-50' :
                    rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    rec.type === 'error' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{rec.description}</p>
                      {rec.action && (
                        <div className="text-sm text-gray-600 italic">
                          💡 {rec.action}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function analyzeData(
  data: any[], 
  selectedDate?: string, 
  selectedApps?: string[], 
  selectedPlatforms?: string[], 
  selectedMetrics?: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (data.length === 0) return recommendations;

  // Calculate totals
  const totals = data.reduce((acc, row) => {
    acc.impressions += Number(row.Impressions) || 0;
    acc.clicks += Number(row.Clicks) || 0;
    acc.installs += Number(row.Installs) || 0;
    acc.customers += Number(row.Customers) || 0;
    acc.revenue += Number(row.Revenue) || 0;
    acc.spend += Number(row.Spend) || 0;
    return acc;
  }, { impressions: 0, clicks: 0, installs: 0, customers: 0, revenue: 0, spend: 0 });

  // Calculate metrics
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const installRate = totals.clicks > 0 ? (totals.installs / totals.clicks) * 100 : 0;
  const conversionRate = totals.installs > 0 ? (totals.customers / totals.installs) * 100 : 0;
  const roas = totals.spend > 0 ? (totals.revenue / totals.spend) * 100 : 0;
  const profit = totals.revenue - totals.spend;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpi = totals.installs > 0 ? totals.spend / totals.installs : 0;
  const cac = totals.customers > 0 ? totals.spend / totals.customers : 0;

  // CTR Analysis
  if (ctr < 1) {
    recommendations.push({
      type: 'warning',
      title: 'Low Click-Through Rate',
      description: `Your CTR is ${ctr.toFixed(2)}%, which is below the industry average of 2-3%. This suggests your ad creative or targeting may need improvement.`,
      action: 'Consider A/B testing different ad creatives, improving ad copy, or refining your target audience.',
      priority: 'high'
    });
  } else if (ctr > 5) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Click-Through Rate',
      description: `Your CTR of ${ctr.toFixed(2)}% is outstanding! This indicates strong ad relevance and audience targeting.`,
      action: 'Consider scaling this successful campaign or applying similar strategies to other campaigns.',
      priority: 'low'
    });
  }

  // Install Rate Analysis
  if (installRate < 10) {
    recommendations.push({
      type: 'warning',
      title: 'Low Install Rate',
      description: `Your install rate is ${installRate.toFixed(2)}%, which is below the typical 15-25% range for app installs.`,
      action: 'Review your app store listing, improve app screenshots, or optimize your landing page.',
      priority: 'high'
    });
  }

  // ROAS Analysis
  if (roas < 200) {
    recommendations.push({
      type: 'error',
      title: 'Poor Return on Ad Spend',
      description: `Your ROAS is ${roas.toFixed(2)}%, meaning you're spending more than you're earning. This is unsustainable.`,
      action: 'Immediately review your bidding strategy, pause underperforming campaigns, or improve your conversion funnel.',
      priority: 'high'
    });
  } else if (roas > 400) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Return on Ad Spend',
      description: `Your ROAS of ${roas.toFixed(2)}% is excellent! You're generating strong returns on your ad investment.`,
      action: 'Consider increasing budget for high-performing campaigns to scale your success.',
      priority: 'low'
    });
  }

  // Profit Analysis
  if (profit < 0) {
    recommendations.push({
      type: 'error',
      title: 'Negative Profit',
      description: `You're losing $${Math.abs(profit).toFixed(2)} in profit. This needs immediate attention.`,
      action: 'Pause unprofitable campaigns, reduce bids, or improve your conversion rates.',
      priority: 'high'
    });
  } else if (profit > 1000) {
    recommendations.push({
      type: 'success',
      title: 'Strong Profitability',
      description: `You're generating $${profit.toFixed(2)} in profit. Great work!`,
      action: 'Consider scaling successful campaigns or exploring new markets.',
      priority: 'low'
    });
  }

  // Campaign Performance Analysis
  const campaignPerformance = data.reduce((acc, row) => {
    const campaign = row["Ad Name"];
    if (!acc[campaign]) {
      acc[campaign] = {
        impressions: 0,
        clicks: 0,
        installs: 0,
        revenue: 0,
        spend: 0
      };
    }
    acc[campaign].impressions += Number(row.Impressions) || 0;
    acc[campaign].clicks += Number(row.Clicks) || 0;
    acc[campaign].installs += Number(row.Installs) || 0;
    acc[campaign].revenue += Number(row.Revenue) || 0;
    acc[campaign].spend += Number(row.Spend) || 0;
    return acc;
  }, {} as Record<string, any>);

  // Find best and worst performing campaigns
  const campaignMetrics = Object.entries(campaignPerformance).map(([name, metrics]: [string, any]) => ({
    name,
    roas: metrics.spend > 0 ? (metrics.revenue / metrics.spend) * 100 : 0,
    profit: metrics.revenue - metrics.spend,
    ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
  }));

  const bestCampaign = campaignMetrics.reduce((best, current) => 
    current.roas > best.roas ? current : best
  );
  const worstCampaign = campaignMetrics.reduce((worst, current) => 
    current.roas < worst.roas ? current : worst
  );

  if (bestCampaign.roas > 300 && bestCampaign !== worstCampaign) {
    recommendations.push({
      type: 'info',
      title: 'Top Performing Campaign',
      description: `"${bestCampaign.name}" is your best performer with ${bestCampaign.roas.toFixed(2)}% ROAS.`,
      action: 'Consider increasing budget allocation to this campaign or replicating its strategy.',
      priority: 'medium'
    });
  }

  if (worstCampaign.roas < 150 && worstCampaign !== bestCampaign) {
    recommendations.push({
      type: 'warning',
      title: 'Underperforming Campaign',
      description: `"${worstCampaign.name}" is underperforming with ${worstCampaign.roas.toFixed(2)}% ROAS.`,
      action: 'Review this campaign\'s targeting, creative, or consider pausing it.',
      priority: 'high'
    });
  }

  // Data Quality Recommendations
  if (totals.impressions === 0) {
    recommendations.push({
      type: 'error',
      title: 'No Impressions Data',
      description: 'No impression data found for the selected filters.',
      action: 'Check your date range, app selection, or platform filters.',
      priority: 'high'
    });
  }

  if (data.length < 3) {
    recommendations.push({
      type: 'info',
      title: 'Limited Data Sample',
      description: `Only ${data.length} campaign(s) found. Recommendations may be less accurate with limited data.`,
      action: 'Consider expanding your date range or including more campaigns for better insights.',
      priority: 'medium'
    });
  }

  return recommendations;
}