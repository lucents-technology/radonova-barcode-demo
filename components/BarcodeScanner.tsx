"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { readBarcodes } from "zxing-wasm/reader";
import { getFormatLabel } from "@/lib/barcode-formats";
import { saveScan, getScanHistory, clearScanHistory, type ScanRecord } from "@/lib/scan-storage";

interface ScanResult {
  value: string;
  format: string;
  timestamp: number;
}

function checkCameraSupport(): boolean {
  if (typeof navigator === "undefined") return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function");
}

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const scanningRef = useRef(false);
  const scanLoopRef = useRef<{ fn: () => Promise<void> }>({ fn: async () => {} });

  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [copied, setCopied] = useState(false);

  const cameraSupported = useMemo(() => checkCameraSupport(), []);

  const stopScanning = useCallback(() => {
    scanningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState < video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      const results = await readBarcodes(imageData, { tryHarder: true, maxNumberOfSymbols: 1 });
      if (results.length > 0) {
        const result = results[0];
        saveScan(result.text, getFormatLabel(result.format));
        setHistory(getScanHistory());
        setLastResult({ value: result.text, format: result.format, timestamp: Date.now() });
        stopScanning();
      }
    } catch {
      // no barcode in this frame
    }
  }, [stopScanning]);

  const startScanning = useCallback(async () => {
    setError(null);
    setLastResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = null;
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 10000);
        video.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
        video.onerror = () => { clearTimeout(timeout); reject(new Error("video error")); };
      });

      await video.play();
      scanningRef.current = true;
      setIsScanning(true);

      const loop = async () => {
        if (!scanningRef.current) return;
        await processFrame();
        if (scanningRef.current) {
          animationRef.current = requestAnimationFrame(() => scanLoopRef.current.fn());
        }
      };
      scanLoopRef.current.fn = loop;
      animationRef.current = requestAnimationFrame(() => scanLoopRef.current.fn());
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Allow camera in your browser settings and reload.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError("Could not start camera. Try again.");
        }
      } else {
        setError("Could not start camera. Try again.");
      }
    }
    // processFrame accessed via scanLoopRef — stable through ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) return;
    saveScan(manualInput.trim(), "QR Code");
    setLastResult({ value: manualInput.trim(), format: "QRCode", timestamp: Date.now() });
    setManualInput("");
    setShowManual(false);
  }, [manualInput]);

  const copyResult = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearScanHistory();
    setHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (!cameraSupported) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Camera Not Available</h2>
            <p className="text-zinc-400 text-sm mt-1">This browser doesn&apos;t support camera access.</p>
          </div>
          <button
            onClick={() => setShowManual(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            Enter Barcode Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Camera Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 sm:w-72 sm:h-72">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
              </div>
              {/* Animated scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-scan-line" />
            </div>
          </div>
        )}

        {/* Top gradient for status */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Status bar area */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4 pt-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          {isScanning && (
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">Scanning</span>
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => { stopScanning(); setHistory(getScanHistory()); setShowHistory(true); }}
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-x-4 top-14" style={{ top: "max(3.5rem, calc(env(safe-area-inset-top) + 3.5rem))" }}>
            <div className="bg-red-500/90 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative bg-zinc-900 pb-safe">
        {/* Result Toast */}
        {lastResult && (
          <div className="absolute bottom-full left-4 right-4 mb-3 animate-slide-up">
            <div className="bg-zinc-800 rounded-2xl p-4 shadow-2xl border border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono truncate">{lastResult.value}</p>
                  <p className="text-zinc-400 text-xs">{getFormatLabel(lastResult.format)}</p>
                </div>
                <button
                  onClick={() => copyResult(lastResult.value)}
                  className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6 px-6 py-5">
          {/* Manual Entry */}
          <button
            onClick={() => setShowManual(true)}
            className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Scan / Stop Button */}
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/20 active:scale-95 transition-transform"
            >
              <div className="w-[60px] h-[60px] border-[3px] border-zinc-900 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="w-[72px] h-[72px] bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform animate-pulse-ring"
            >
              <div className="w-8 h-8 bg-white rounded-sm" />
            </button>
          )}

          {/* History */}
          <button
            onClick={() => { stopScanning(); setShowHistory(true); }}
            className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-300 transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowManual(false)}>
          <div
            className="bg-zinc-900 w-full max-w-lg rounded-t-3xl p-6 pb-8 animate-slide-up"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
            <h3 className="text-white text-lg font-semibold mb-1">Enter Barcode Manually</h3>
            <p className="text-zinc-400 text-sm mb-4">Type or paste the barcode value below</p>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              placeholder="e.g. 1234567890"
              autoFocus
              className="w-full bg-zinc-800 text-white text-lg px-4 py-3.5 rounded-xl border border-zinc-700 focus:border-cyan-500 focus:outline-none placeholder-zinc-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowManual(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-3.5 rounded-xl transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Bottom Sheet */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div
            className="bg-zinc-900 w-full max-w-lg rounded-t-3xl max-h-[75vh] flex flex-col animate-slide-up"
            style={{ paddingBottom: "max(0rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-4 pb-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-white text-lg font-semibold">Scan History</h3>
                {history.length > 0 && (
                  <span className="text-zinc-400 text-sm">{history.length} scans</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-2 shrink-0" />

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-zinc-500 text-sm">No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((record) => (
                    <div key={record.id} className="bg-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-mono truncate">{record.value}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-400">{record.format}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-500">{new Date(record.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyResult(record.value)}
                        className="shrink-0 w-9 h-9 bg-zinc-700 hover:bg-zinc-600 rounded-lg flex items-center justify-center text-zinc-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
