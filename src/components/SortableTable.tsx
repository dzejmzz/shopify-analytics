"use client";
import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface SortableTableProps {
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

export default function SortableTable({ data, columns, maxHeight = "600px" }: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle numeric values
      if (typeof aVal === 'number' || !isNaN(Number(aVal))) {
        aVal = cleanNumber(aVal);
        bVal = cleanNumber(bVal);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Calculate totals
  const totals = useMemo(() => {
    const totals: any = {};
    columns.forEach(col => {
      if (col.key !== 'Ad Name' && col.key !== 'Keyword' && col.key !== 'Platform') {
        totals[col.key] = data.reduce((sum, row) => {
          const val = cleanNumber(row[col.key]);
          return sum + val;
        }, 0);
      }
    });
    return totals;
  }, [data, columns]);

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
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => {
                  const value = row[column.key];
                  const formattedValue = column.format ? column.format(value) : value;
                  
                  // Color coding for Profit column
                  let cellClass = `px-3 py-2 text-${column.align || 'left'} text-gray-900`;
                  if (column.key === 'Profit') {
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
          </tbody>
        </table>
      </div>
      
      {/* Fixed Footer with Totals */}
      <div className="bg-gray-800 text-white sticky bottom-0">
        <table className="w-full text-sm">
          <tbody>
            <tr className="font-bold">
              {columns.map((column) => {
                if (column.key === 'Ad Name' || column.key === 'Keyword' || column.key === 'Platform') {
                  return (
                    <td key={column.key} className={`px-3 py-3 text-${column.align || 'left'}`}>
                      {column.key === 'Ad Name' || column.key === 'Keyword' ? 'TOTAL' : '-'}
                    </td>
                  );
                }
                
                const totalValue = totals[column.key];
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
