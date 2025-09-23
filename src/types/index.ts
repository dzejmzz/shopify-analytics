// Shared TypeScript interfaces for the analytics application

export interface MetricDefinition {
  key: string;
  csvKey?: string;
  label: string;
  format: 'NUMBER' | 'PERCENTAGE' | 'USD';
  compute?: (row: any) => number;
}

export interface PacingRawRow {
  Date: string;
  App: string;
  Campaign: string;
  Imps: string | number;
  Clicks: string | number;
  Installs: string | number;
  Customers: string | number;
  Revenue: string | number;
  Spend: string | number;
  [key: string]: string | number;
}

export interface YearlyRawRow {
  Month: string;
  App?: string;
  Campaign?: string;
  Country?: string;
  Device?: string;
  Plan?: string;
  'Search Term'?: string;
  Impressions?: string | number;
  Clicks?: string | number;
  Installs?: string | number;
  Customers?: string | number;
  Revenue?: string | number;
  Spend?: string | number;
  'Click Through Rate'?: string | number;
  'Install Rate'?: string | number;
  'Conversion Rate'?: string | number;
  'Return On Spend'?: string | number;
  'Cost Per Click'?: string | number;
  'Cost Per Install'?: string | number;
  'Cost Per Customer'?: string | number;
  [key: string]: string | number | undefined;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterState {
  dateRange: DateRange;
  selectedApp: string;
  selectedMetrics: string[];
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}