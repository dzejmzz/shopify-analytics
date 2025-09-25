"use client";
import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SortableKeywordTableProps {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
    sortable?: boolean;
  }>;
  maxHeight?: string;
}

function cleanNumber(val: any) {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number) {
  return (value * 100).toFixed(2) + "%";
}

export default function SortableKeywordTable({ data, columns, maxHeight = "600px" }: SortableKeywordTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleKeyword = (keyword: string) => {
    const newExpanded = new Set(expandedKeywords);
    if (newExpanded.has(keyword)) {
      newExpanded.delete(keyword);
    } else {
      newExpanded.add(keyword);
    }
    setExpandedKeywords(newExpanded);
  };

  // Group data by keyword
  const groupedData = useMemo(() => {
    const groups = data.reduce((acc, row) => {
      if (!acc[row.Keyword]) {
        acc[row.Keyword] = [];
      }
      acc[row.Keyword].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    return groups;
  }, [data]);

  // Sort the grouped data
  const sortedGroupedData = useMemo(() => {
    if (!sortConfig) return groupedData;

    const sortedGroups: Record<string, any[]> = {};
    const sortedKeywords = Object.keys(groupedData).sort((a, b) => {
      let aVal = a;
      let bVal = b;

      if (sortConfig.key === 'Keyword') {
        aVal = a.toLowerCase();
        bVal = b.toLowerCase();
      } else {
        // For other columns, we need to calculate totals for each keyword
        const aTotal = groupedData[a].reduce((sum, row) => sum + cleanNumber(row[sortConfig.key]), 0);
        const bTotal = groupedData[b].reduce((sum, row) => sum + cleanNumber(row[sortConfig.key]), 0);
        aVal = aTotal;
        bVal = bTotal;
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    sortedKeywords.forEach(keyword => {
      sortedGroups[keyword] = groupedData[keyword];
    });

    return sortedGroups;
  }, [groupedData, sortConfig]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    const totalImpressions = data.reduce((sum, row) => sum + cleanNumber(row.Impressions), 0);
    const totalClicks = data.reduce((sum, row) => sum + cleanNumber(row.Clicks), 0);
    const totalInstalls = data.reduce((sum, row) => sum + cleanNumber(row.Installs), 0);
    const totalCustomers = data.reduce((sum, row) => sum + cleanNumber(row.Customers), 0);
    const totalRevenue = data.reduce((sum, row) => sum + cleanNumber(row.Revenue), 0);
    const totalSpend = data.reduce((sum, row) => sum + cleanNumber(row.Spend), 0);
    
    return {
      Impressions: totalImpressions,
      Clicks: totalClicks,
      Installs: totalInstalls,
      Customers: totalCustomers,
      Revenue: totalRevenue,
      Spend: totalSpend,
      CTR: totalImpressions > 0 ? (totalClicks / totalImpressions) : 0,
      InstallRate: totalClicks > 0 ? (totalInstalls / totalClicks) : 0,
      ConversionRate: totalInstalls > 0 ? (totalCustomers / totalInstalls) : 0,
      Profit: totalRevenue - totalSpend,
      ROAS: totalSpend > 0 ? (totalRevenue / totalSpend) : 0,
      CPC: totalClicks > 0 ? (totalSpend / totalClicks) : 0,
      CPI: totalInstalls > 0 ? (totalSpend / totalInstalls) : 0,
      CAC: totalCustomers > 0 ? (totalSpend / totalCustomers) : 0
    };
  }, [data]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 text-${column.align || 'left'} font-semibold text-gray-900 ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.label}</span>
                    {column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUpIcon 
                          className={`w-3 h-3 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <ChevronDownIcon 
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(sortedGroupedData).map(([keyword, rows]) => {
              const isExpanded = expandedKeywords.has(keyword);
              
              // Calculate totals for this keyword
              const totalImpressions = rows.reduce((sum, row) => sum + cleanNumber(row.Impressions), 0);
              const totalClicks = rows.reduce((sum, row) => sum + cleanNumber(row.Clicks), 0);
              const totalInstalls = rows.reduce((sum, row) => sum + cleanNumber(row.Installs), 0);
              const totalCustomers = rows.reduce((sum, row) => sum + cleanNumber(row.Customers), 0);
              const totalRevenue = rows.reduce((sum, row) => sum + cleanNumber(row.Revenue), 0);
              const totalSpend = rows.reduce((sum, row) => sum + cleanNumber(row.Spend), 0);
              
              const keywordTotals = {
                Impressions: totalImpressions,
                Clicks: totalClicks,
                Installs: totalInstalls,
                Customers: totalCustomers,
                Revenue: totalRevenue,
                Spend: totalSpend
              };

              return (
                <React.Fragment key={keyword}>
                  {/* Keyword Summary Row */}
                  <tr 
                    className="bg-gray-100 hover:bg-gray-200 cursor-pointer border-b border-gray-200"
                    onClick={() => toggleKeyword(keyword)}
                  >
                    {columns.map((column) => {
                      if (column.key === 'Keyword') {
                        return (
                          <td key={column.key} className="px-3 py-2 text-left font-semibold text-gray-900 flex items-center">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 mr-1" />
                            )}
                            {keyword}
                          </td>
                        );
                      } else if (column.key === 'Ad Name') {
                        return (
                          <td key={column.key} className="px-3 py-2 text-left font-semibold text-gray-900">
                            TOTAL
                          </td>
                        );
                      } else {
                        let value = keywordTotals[column.key] || 0;
                        
                        // Calculate derived metrics for totals
                        if (column.key === 'CTR') {
                          value = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
                        } else if (column.key === 'InstallRate') {
                          value = totalClicks > 0 ? (totalInstalls / totalClicks) : 0;
                        } else if (column.key === 'ConversionRate') {
                          value = totalInstalls > 0 ? (totalCustomers / totalInstalls) : 0;
                        } else if (column.key === 'Profit') {
                          value = totalRevenue - totalSpend;
                        } else if (column.key === 'ROAS') {
                          value = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
                        } else if (column.key === 'CPC') {
                          value = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
                        } else if (column.key === 'CPI') {
                          value = totalInstalls > 0 ? (totalSpend / totalInstalls) : 0;
                        } else if (column.key === 'CAC') {
                          value = totalCustomers > 0 ? (totalSpend / totalCustomers) : 0;
                        }
                        
                        const formattedValue = column.format ? column.format(value) : value;
                        
                        let cellClass = `px-3 py-2 text-${column.align || 'left'} text-gray-900`;
                        if (column.key === 'Profit') {
                          if (value > 0) cellClass += ' text-green-600 font-semibold';
                          else if (value < 0) cellClass += ' text-red-600 font-semibold';
                          else cellClass += ' text-yellow-600 font-semibold';
                        }
                        
                        return (
                          <td key={column.key} className={cellClass}>
                            {formattedValue}
                          </td>
                        );
                      }
                    })}
                  </tr>

                  {/* Campaign Rows (when expanded) */}
                  {isExpanded && rows.map((row, index) => (
                    <tr key={`${keyword}-${index}`} className="bg-gray-50 hover:bg-gray-100 border-b border-gray-100">
                      {columns.map((column) => {
                        const value = row[column.key];
                        const formattedValue = column.format ? column.format(value) : value;
                        
                        let cellClass = `px-3 py-2 text-${column.align || 'left'} text-gray-700`;
                        if (column.key === 'Keyword') {
                          return (
                            <td key={column.key} className="px-3 py-2 text-left text-gray-700 pl-8">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </td>
                          );
                        } else if (column.key === 'Profit') {
                          const profitValue = cleanNumber(value);
                          if (profitValue > 0) cellClass += ' text-green-600 font-semibold';
                          else if (profitValue < 0) cellClass += ' text-red-600 font-semibold';
                          else cellClass += ' text-yellow-600 font-semibold';
                        }
                        
                        return (
                          <td key={column.key} className={cellClass}>
                            {formattedValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Fixed Footer with Grand Totals */}
      <div className="bg-gray-800 text-white sticky bottom-0">
        <table className="w-full text-sm">
          <tbody>
            <tr className="font-bold">
              {columns.map((column) => {
                if (column.key === 'Ad Name' || column.key === 'Keyword' || column.key === 'Platform') {
                  return (
                    <td key={column.key} className={`px-3 py-3 text-${column.align || 'left'}`}>
                      {column.key === 'Keyword' ? 'GRAND TOTAL' : '-'}
                    </td>
                  );
                }
                
                const totalValue = grandTotals[column.key] || 0;
                const formattedTotal = column.format ? column.format(totalValue) : totalValue;
                
                let cellClass = `px-3 py-3 text-${column.align || 'left'} font-bold`;
                if (column.key === 'Profit') {
                  if (totalValue > 0) cellClass += ' text-green-400';
                  else if (totalValue < 0) cellClass += ' text-red-400';
                  else cellClass += ' text-yellow-400';
                }
                
                return (
                  <td key={column.key} className={cellClass}>
                    {formattedTotal}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
