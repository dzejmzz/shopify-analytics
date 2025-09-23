import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPacingRaw, type PacingRawRow } from '../utils/pacingraw';
import { fetchYearlyRaw, type YearlyRawRow } from '../utils/yearlyraw';

// Query keys for consistent caching
export const queryKeys = {
  pacingData: ['pacing-data'] as const,
  yearlyData: ['yearly-data'] as const,
  filteredPacingData: (filters: Record<string, any>) => ['pacing-data', 'filtered', filters] as const,
  filteredYearlyData: (filters: Record<string, any>) => ['yearly-data', 'filtered', filters] as const,
};

/**
 * Hook to fetch pacing data with React Query
 */
export function usePacingData() {
  return useQuery({
    queryKey: queryKeys.pacingData,
    queryFn: async (): Promise<PacingRawRow[]> => {
      try {
        const data = await fetchPacingRaw();
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch pacing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch yearly data with React Query
 */
export function useYearlyData() {
  return useQuery({
    queryKey: queryKeys.yearlyData,
    queryFn: async (): Promise<YearlyRawRow[]> => {
      try {
        const data = await fetchYearlyRaw();
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch yearly data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get filtered pacing data based on current filters
 */
export function useFilteredPacingData(filters: {
  dateRange?: { start: string; end: string };
  selectedApp?: string;
}) {
  const { data: rawData, ...queryResult } = usePacingData();
  
  return {
    ...queryResult,
    data: rawData ? filterPacingData(rawData, filters) : undefined,
  };
}

/**
 * Hook to get filtered yearly data based on current filters
 */
export function useFilteredYearlyData(filters: {
  dateRange?: { start: string; end: string };
  selectedApp?: string;
}) {
  const { data: rawData, ...queryResult } = useYearlyData();
  
  return {
    ...queryResult,
    data: rawData ? filterYearlyData(rawData, filters) : undefined,
  };
}

/**
 * Filter pacing data based on provided filters
 */
function filterPacingData(
  data: PacingRawRow[],
  filters: {
    dateRange?: { start: string; end: string };
    selectedApp?: string;
  }
): PacingRawRow[] {
  let filtered = [...data];
  
  // Filter by date range
  if (filters.dateRange?.start && filters.dateRange?.end) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    filtered = filtered.filter((row) => {
      const dateValue = row.Date;
      if (!dateValue) return false;
      const rowDate = new Date(dateValue);
      return rowDate >= startDate && rowDate <= endDate;
    });
  }
  
  // Filter by app
  if (filters.selectedApp && filters.selectedApp !== 'All Apps') {
    filtered = filtered.filter((row) => row.App === filters.selectedApp);
  }
  
  return filtered;
}

/**
 * Filter yearly data based on provided filters
 */
function filterYearlyData(
  data: YearlyRawRow[],
  filters: {
    dateRange?: { start: string; end: string };
    selectedApp?: string;
  }
): YearlyRawRow[] {
  let filtered = [...data];
  
  // Filter by date range (month-based for yearly data)
  if (filters.dateRange?.start && filters.dateRange?.end) {
    filtered = filtered.filter((row) => {
      const month = String(row.Month).trim();
      return month >= filters.dateRange!.start && month <= filters.dateRange!.end;
    });
  }
  
  // Filter by app
  if (filters.selectedApp && filters.selectedApp !== 'All Apps' && 'App' in filtered[0]) {
    filtered = filtered.filter((row) => row.App === filters.selectedApp);
  }
  
  return filtered;
}

/**
 * Hook to prefetch data for better UX
 */
export function usePrefetchData() {
  const queryClient = useQueryClient();
  
  const prefetchPacingData = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.pacingData,
      queryFn: fetchPacingRaw,
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchYearlyData = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.yearlyData,
      queryFn: fetchYearlyRaw,
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return {
    prefetchPacingData,
    prefetchYearlyData,
  };
}