import Papa from "papaparse";

const YEARLY_CSV_URL = "https://docs.google.com/spreadsheets/d/1dOFq1GZZPhA8umIn2bN68w-g56Gzq0kcj4YnNKwi4IQ/export?format=csv&gid=0";

export type YearlyRawRow = {
  [key: string]: string | number | null;
};

export async function fetchYearlyRaw(): Promise<YearlyRawRow[]> {
  const res = await fetch(YEARLY_CSV_URL);
  const csv = await res.text();
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data as YearlyRawRow[];
} 