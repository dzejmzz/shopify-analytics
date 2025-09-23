import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DateRange, FilterState } from '../types';

interface AppState {
  // Global filters
  globalFilters: FilterState;
  setGlobalFilters: (filters: Partial<FilterState>) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
  
  // Selected metrics for charts
  selectedMetrics: string[];
  setSelectedMetrics: (metrics: string[]) => void;
  toggleMetric: (metric: string) => void;
  
  // Date range helpers
  setDateRange: (range: DateRange) => void;
  
  // Reset functions
  resetFilters: () => void;
  resetError: () => void;
}

const defaultFilters: FilterState = {
  dateRange: { start: '', end: '' },
  selectedApp: 'All Apps',
  selectedMetrics: ['installs', 'install_rate', 'cpi', 'spend'],
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      globalFilters: defaultFilters,
      sidebarCollapsed: false,
      theme: 'dark',
      isLoading: false,
      error: null,
      selectedMetrics: defaultFilters.selectedMetrics,
      
      // Actions
      setGlobalFilters: (filters) =>
        set(
          (state) => ({
            globalFilters: { ...state.globalFilters, ...filters },
          }),
          false,
          'setGlobalFilters'
        ),
      
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      
      setTheme: (theme) =>
        set({ theme }, false, 'setTheme'),
      
      setIsLoading: (loading) =>
        set({ isLoading: loading }, false, 'setIsLoading'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),
      
      setSelectedMetrics: (metrics) =>
        set(
          (state) => ({
            selectedMetrics: metrics,
            globalFilters: { ...state.globalFilters, selectedMetrics: metrics },
          }),
          false,
          'setSelectedMetrics'
        ),
      
      toggleMetric: (metric) =>
        set(
          (state) => {
            const currentMetrics = state.selectedMetrics;
            const newMetrics = currentMetrics.includes(metric)
              ? currentMetrics.filter((m) => m !== metric)
              : [...currentMetrics, metric];
            
            return {
              selectedMetrics: newMetrics,
              globalFilters: { ...state.globalFilters, selectedMetrics: newMetrics },
            };
          },
          false,
          'toggleMetric'
        ),
      
      setDateRange: (range) =>
        set(
          (state) => ({
            globalFilters: { ...state.globalFilters, dateRange: range },
          }),
          false,
          'setDateRange'
        ),
      
      resetFilters: () =>
        set(
          {
            globalFilters: defaultFilters,
            selectedMetrics: defaultFilters.selectedMetrics,
          },
          false,
          'resetFilters'
        ),
      
      resetError: () =>
        set({ error: null }, false, 'resetError'),
    }),
    {
      name: 'shopify-analytics-store',
    }
  )
);