import Papa from "papaparse";

const UNIFIED_CSV_URL = "/Unified%20Data%20Source%20-%202025-09-24-shopify-app-store-ads-search-terms%20(6).csv";

export type UnifiedDataRow = {
  [key: string]: string | number | null;
};

export async function fetchUnifiedData(): Promise<UnifiedDataRow[]> {
  const res = await fetch(UNIFIED_CSV_URL);
  const csv = await res.text();
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data as UnifiedDataRow[];
}


// Helper function to get data by date range
export function filterDataByDateRange(data: UnifiedDataRow[], startDate: string, endDate: string): UnifiedDataRow[] {
  return data.filter(row => {
    const rowStartDate = String(row["Start Date"]);
    const rowEndDate = String(row["End Date"]);
    return rowStartDate >= startDate && rowEndDate <= endDate;
  });
}

// Helper function to get data by app
export function filterDataByApp(data: UnifiedDataRow[], appName: string): UnifiedDataRow[] {
  if (appName === 'All Apps') return data;
  return data.filter(row => String(row["App Name"]) === appName);
}

// Helper function to get monthly aggregated data
export function getMonthlyData(data: UnifiedDataRow[]): UnifiedDataRow[] {
  const monthlyData: Record<string, any> = {};
  
  data.forEach(row => {
    const startDate = String(row["Start Date"]);
    if (!startDate || startDate === 'undefined' || startDate === 'null') return;
    
    const month = startDate.substring(0, 7); // YYYY-MM format
    
    if (!monthlyData[month]) {
      monthlyData[month] = {
        Month: month,
        "App Name": row["App Name"] || "Unknown",
        "Impressions": 0,
        "Clicks": 0,
        "Installs": 0,
        "Customers": 0,
        "Revenue": 0,
        "Spend": 0,
        "Search Term": row["Search Term"] || "",
        "Keyword": row["Keyword"] || "",
        "Match Type": row["Match Type"] || "",
        "Shop Plan": row["Shop Plan"] || "",
        "Device Type": row["Device Type"] || "",
        "Country Code": row["Country Code"] || ""
      };
    }
    
    // Aggregate numeric fields using cleanNumber
    monthlyData[month]["Impressions"] += cleanNumber(row["Impressions"]);
    monthlyData[month]["Clicks"] += cleanNumber(row["Clicks"]);
    monthlyData[month]["Installs"] += cleanNumber(row["Installs"]);
    monthlyData[month]["Customers"] += cleanNumber(row["Customers"]);
    monthlyData[month]["Revenue"] += cleanNumber(row["Revenue"]);
    monthlyData[month]["Spend"] += cleanNumber(row["Spend"]);
  });
  
  return Object.values(monthlyData).sort((a, b) => a.Month.localeCompare(b.Month));
}

// Helper function to get daily data
export function getDailyData(data: UnifiedDataRow[]): UnifiedDataRow[] {
  return data.map(row => ({
    ...row,
    Date: row["Start Date"], // Use Start Date as the primary date
    Imps: row["Impressions"],
    "Ad Name": row["Ad Name"],
    Platform: "Shopify" // Default platform since it's not in the unified data
  })).sort((a, b) => String(a.Date).localeCompare(String(b.Date)));
}

// Helper function to clean number values
export function cleanNumber(val: any): number {
  if (typeof val !== 'string' && typeof val !== 'number') return 0;
  let str = String(val).replace(/[$,]/g, '').trim();
  if (str === '' || str === '#DIV/0!' || str === 'NaN' || str === 'null' || str === 'undefined') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// Helper function to compute ratios
export function computeTotalRatio(rows: any[], numeratorKey: string, denominatorKey: string): number {
  const numerator = rows.reduce((sum, row) => sum + cleanNumber(row[numeratorKey]), 0);
  const denominator = rows.reduce((sum, row) => sum + cleanNumber(row[denominatorKey]), 0);
  return denominator ? numerator / denominator : 0;
}
