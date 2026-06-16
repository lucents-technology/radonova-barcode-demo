"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, Exception } from "@zxing/library";
import { getFormatLabel } from "@/lib/barcode-formats";
import { saveScan } from "@/lib/scan-storage";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface ScanResult {
  value: string;
  format: BarcodeFormat;
  timestamp: number;
}

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const controlsRef = useRef<IScannerControls | null>(null);

  const handleScanResult = useCallback((result: ScanResult) => {
    setLastResult(result);
    saveScan(result.value, getFormatLabel(result.format));
  }, []);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
  }, []);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((videoInputDevices) => {
        const deviceList = videoInputDevices.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        }));
        setDevices(deviceList);

        if (deviceList.length > 0) {
          const backCamera = deviceList.find((d) =>
            d.label.toLowerCase().includes("back")
          );
          setSelectedDevice(backCamera?.deviceId ?? deviceList[0].deviceId);
        }
      })
      .catch(() => {
        setError("No camera devices found.");
      });

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!codeReaderRef.current || !videoRef.current || !selectedDevice) return;

    setError(null);
    setIsScanning(true);

    try {
      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        selectedDevice,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleScanResult({
              value: result.getText(),
              format: result.getBarcodeFormat(),
              timestamp: Date.now(),
            });
          }
          if (err && !(err instanceof Exception)) {
            setError("Scanning error occurred.");
          }
        }
      );

      controlsRef.current = controls;
    } catch {
      setError("Failed to start camera. Please check permissions.");
      setIsScanning(false);
    }
  }, [selectedDevice, handleScanResult]);

  const toggleTorch = useCallback(() => {
    if (controlsRef.current?.switchTorch) {
      controlsRef.current.switchTorch(!torchOn);
      setTorchOn((prev) => !prev);
    }
  }, [torchOn]);

  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) return;

    handleScanResult({
      value: manualInput.trim(),
      format: BarcodeFormat.QR_CODE,
      timestamp: Date.now(),
    });

    setManualInput("");
  }, [manualInput, handleScanResult]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        {/* Camera Section */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted
          />

          {/* Scanner Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-cyan-400 rounded-lg relative">
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
                  Scanning...
                </span>
              </div>
            </div>
          )}

          {/* No Camera Placeholder */}
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p>Click Start to begin scanning</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Device Selection */}
          {devices.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Camera
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={isScanning}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Scan Controls */}
          <div className="flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!selectedDevice}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Start Scanning
              </button>
            ) : (
              <>
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={toggleTorch}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    torchOn
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {torchOn ? "Torch On" : "Torch Off"}
                </button>
              </>
            )}
          </div>

          {/* Manual Entry */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              Or enter barcode manually:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                placeholder="Enter barcode value"
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Result Display */}
      {lastResult && (
        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Scanned Result
              </p>
              <p className="mt-1 text-lg font-mono text-green-900 dark:text-green-200 break-all">
                {lastResult.value}
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                Format: {getFormatLabel(lastResult.format)}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(lastResult.value)}
              className="ml-4 shrink-0 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
