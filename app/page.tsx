import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl mb-6">
          <svg
            className="w-12 h-12 text-cyan-600 dark:text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Radonova Barcode Scanner
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          A demo application for scanning barcodes on Radonova dosimeter devices
          and radon test kits. Use your device camera to quickly identify and
          track your equipment.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Camera Scanning
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Use your device camera to scan barcodes in real-time. Supports both
            front and back cameras.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Multi-Format Support
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Supports QR codes, EAN-13, UPC-A, Code 128, Data Matrix, and many
            more barcode formats.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6">
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-cyan-600 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Scan History
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Keep track of your scans with a local history. Copy results to
            clipboard with one tap.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/scanner"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Start Scanning
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This is a demo application for Radonova Instruments.{" "}
          <a
            href="https://radonova.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Visit Radonova.com
          </a>{" "}
          for professional radon measurement solutions.
        </p>
      </footer>
    </div>
  );
}
