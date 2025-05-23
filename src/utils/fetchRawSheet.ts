import Papa from "papaparse";

export async function fetchRawSheet(csvUrl: string) {
  const res = await fetch(csvUrl);
  const csv = await res.text();
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data;
} 