"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
        primary: "bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200",
        secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100",
        success: "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200",
        error: "bg-red-100 text-red-800 hover:bg-red-200 border border-red-200",
        info: "bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200",
        outline: "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
        solid: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
        gradient: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md",
        popular: "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-sm hover:shadow-md",
        new: "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-sm hover:shadow-md",
      },
      size: {
        xs: "px-1.5 py-0.5 text-xs",
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
        xl: "px-5 py-2.5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };