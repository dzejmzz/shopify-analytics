import Papa from "papaparse";

const PACING_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZoM4CtqKHTAUAGLubLFG0-lsbhSrLLy7Y6qN_o62LlRcHsEHjOtDy6eyUYK0A5zCSAnA5hKwAfA7l/pub?gid=1225782318&single=true&output=csv";

export type PacingRawRow = {
  [key: string]: string | number | null;
};

export async function fetchPacingRaw(): Promise<PacingRawRow[]> {
  const res = await fetch(PACING_CSV_URL);
  const csv = await res.text();
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data as PacingRawRow[];
} 