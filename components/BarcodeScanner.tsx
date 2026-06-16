"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { readBarcodes } from "zxing-wasm/reader";
import { getFormatLabel } from "@/lib/barcode-formats";
import { saveScan } from "@/lib/scan-storage";

interface ScanResult {
  value: string;
  format: string;
  timestamp: number;
}

function checkCameraSupport(): boolean {
  if (typeof navigator === "undefined") return false;
  return !!(
    navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const scanningRef = useRef(false);
  const scanLoopRef = useRef<() => Promise<void>>(async () => {});

  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const cameraSupported = useMemo(() => checkCameraSupport(), []);

  const log = useCallback((msg: string) => {
    console.log(`[Scanner] ${msg}`);
    setDebugInfo((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()} ${msg}`]);
  }, []);

  const stopScanning = useCallback(() => {
    log("Stopping scanner");
    scanningRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
        log(`Stopped track: ${t.kind}`);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  }, [log]);

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
      const results = await readBarcodes(imageData, {
        tryHarder: true,
        maxNumberOfSymbols: 1,
      });

      if (results.length > 0) {
        const result = results[0];
        log(`Detected: ${result.text} (${result.format})`);
        setLastResult({
          value: result.text,
          format: result.format,
          timestamp: Date.now(),
        });
        saveScan(result.text, getFormatLabel(result.format));
      }
    } catch {
      // no barcode in this frame
    }
  }, [log]);

  useEffect(() => {
    scanLoopRef.current = async () => {
      if (!scanningRef.current) return;
      await processFrame();
      if (scanningRef.current) {
        animationRef.current = requestAnimationFrame(() => scanLoopRef.current());
      }
    };
  }, [processFrame]);

  const startScanning = useCallback(async () => {
    setError(null);
    log("Start button clicked");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      log("getUserMedia not supported");
      setError("Camera API not supported in this browser.");
      return;
    }

    try {
      log("Requesting camera with facingMode: environment");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      log(`Got stream with ${stream.getTracks().length} tracks`);
      stream.getTracks().forEach((t) => log(`Track: ${t.kind} - ${t.label}`));

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        log("ERROR: videoRef is null");
        setError("Internal error: video element not found.");
        return;
      }

      video.srcObject = null;
      video.srcObject = stream;

      log("Waiting for video loadedmetadata");
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          log("Timeout waiting for metadata");
          reject(new Error("Video metadata timeout"));
        }, 10000);

        video.onloadedmetadata = () => {
          log(`Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
          clearTimeout(timeout);
          resolve();
        };
        video.onerror = (e) => {
          log(`Video error: ${e}`);
          clearTimeout(timeout);
          reject(new Error("Video element error"));
        };
      });

      log("Calling video.play()");
      await video.play();
      log(`Video playing: ${video.videoWidth}x${video.videoHeight}`);

      scanningRef.current = true;
      setIsScanning(true);
      log("Scanner started, beginning scan loop");

      animationRef.current = requestAnimationFrame(() => scanLoopRef.current());
    } catch (err) {
      console.error("[Scanner] Error:", err);
      log(`ERROR: ${err instanceof Error ? err.message : String(err)}`);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Go to Settings > Safari > Camera and allow access, then try again."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is in use by another app.");
        } else {
          setError(`Camera error (${err.name}): ${err.message}`);
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to start camera.");
      }
    }
  }, [log]);

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (!manualInput.trim()) return;
    setLastResult({
      value: manualInput.trim(),
      format: "QRCode",
      timestamp: Date.now(),
    });
    saveScan(manualInput.trim(), "QR Code");
    setManualInput("");
  }, [manualInput]);

  if (!cameraSupported) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            Camera API is not supported in this browser.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-cyan-400 rounded-lg relative">
                <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
                  Scanning...
                </span>
              </div>
            </div>
          )}

          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Tap Start to begin scanning</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-base"
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-base"
              >
                Stop
              </button>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
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

          {debugInfo.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
              <p className="text-xs font-medium text-zinc-400 mb-1">Debug log:</p>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2 max-h-32 overflow-y-auto">
                {debugInfo.map((line, i) => (
                  <p key={i} className="text-xs font-mono text-zinc-500 dark:text-zinc-400 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lastResult && (
        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Scanned Result</p>
              <p className="mt-1 text-lg font-mono text-green-900 dark:text-green-200 break-all">{lastResult.value}</p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">Format: {getFormatLabel(lastResult.format)}</p>
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
