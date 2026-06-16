"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-cyan-700 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-cyan-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Radonova</h1>
              <p className="text-cyan-200 text-xs">Barcode Scanner Demo</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-cyan-600 text-white"
                  : "text-cyan-100 hover:bg-cyan-600/50 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/scanner"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/scanner"
                  ? "bg-cyan-600 text-white"
                  : "text-cyan-100 hover:bg-cyan-600/50 hover:text-white"
              }`}
            >
              Scanner
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
