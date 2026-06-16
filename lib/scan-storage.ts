export interface ScanRecord {
  id: string;
  value: string;
  format: string;
  timestamp: number;
}

const STORAGE_KEY = "radonova-scan-history";
const MAX_HISTORY = 10;

export function getScanHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanRecord[];
  } catch {
    return [];
  }
}

export function saveScan(value: string, format: string): ScanRecord {
  const record: ScanRecord = {
    id: crypto.randomUUID(),
    value,
    format,
    timestamp: Date.now(),
  };

  const history = getScanHistory();
  history.unshift(record);

  if (history.length > MAX_HISTORY) {
    history.pop();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return record;
}

export function clearScanHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
