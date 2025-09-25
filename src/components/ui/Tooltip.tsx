"use client";
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({ content, className = "", iconClassName = "" }: TooltipProps) {
  return (
    <div className={`relative group/tooltip ${className}`}>
      <InformationCircleIcon className={`w-4 h-4 cursor-help ${iconClassName}`} />
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50">
        <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-slate-600 whitespace-nowrap max-w-xs">
          {content}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    </div>
  );
}
