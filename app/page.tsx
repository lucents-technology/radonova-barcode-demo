import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-white">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mb-8">
          <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
          Radonova Scanner
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-sm leading-relaxed mb-10">
          Scan barcodes on your dosimeter devices and test kits
        </p>

        <Link
          href="/scanner"
          className="w-full max-w-xs bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold py-4 px-8 rounded-2xl transition-colors text-lg text-center flex items-center justify-center gap-3 shadow-lg shadow-cyan-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Start Scanning
        </Link>
      </div>

      {/* Features */}
      <div className="px-6 pb-12">
        <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
          {[
            { icon: "📷", title: "Camera Scanning", desc: "Real-time barcode detection with your device camera" },
            { icon: "📋", title: "Multi-Format", desc: "QR, EAN-13, UPC, Code 128, Data Matrix & more" },
            { icon: "💾", title: "Scan History", desc: "Keep track of your scans, copy with one tap" },
          ].map((feature) => (
            <div key={feature.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl mt-0.5 shrink-0">{feature.icon}</span>
              <div>
                <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-safe px-6 pb-4 text-center border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-600">
          Demo by{" "}
          <a
            href="https://radonova.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-cyan-400 transition-colors"
          >
            Radonova Instruments
          </a>
        </p>
      </div>
    </div>
  );
}
