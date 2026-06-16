"use client";

import { type BarcodeFormat } from "@zxing/library";
import { getFormatLabel } from "@/lib/barcode-formats";

interface ScanResultProps {
  value: string;
  format: BarcodeFormat;
  timestamp: number;
}

export default function ScanResult({ value, format, timestamp }: ScanResultProps) {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Scanned Result
          </p>
          <p className="mt-1 text-lg font-mono text-green-900 dark:text-green-200 break-all">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
              {getFormatLabel(format)}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="ml-4 shrink-0 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
