"use client";

import BarcodeScanner from "@/components/BarcodeScanner";
import ScanHistory from "@/components/ScanHistory";

export default function ScannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Barcode Scanner
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Point your camera at a barcode on a Radonova device or test kit to scan
          it. You can also enter barcode values manually.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarcodeScanner />
        </div>
        <div className="lg:col-span-1">
          <ScanHistory />
        </div>
      </div>
    </div>
  );
}
