"use client";

import { useState, useEffect, useRef } from "react";
import { getScanHistory, clearScanHistory, type ScanRecord } from "@/lib/scan-storage";

export default function ScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setHistory(getScanHistory());
    }

    const handleStorage = () => {
      setHistory(getScanHistory());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleClear = () => {
    clearScanHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Scan History
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No scans yet. Scan a barcode to see history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Scan History
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
        >
          Clear All
        </button>
      </div>

      <ul className="space-y-3">
        {history.map((record) => (
          <li
            key={record.id}
            className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-zinc-900 dark:text-zinc-100 break-all">
                  {record.value}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                    {record.format}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(record.value)}
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
