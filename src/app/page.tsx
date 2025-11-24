import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Race Strategy Dashboard
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Toyota GR Cup Telemetry Analysis
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg shadow-2xl hover:bg-blue-50 transition-all hover:scale-105"
        >
          Launch Dashboard →
        </Link>
      </div>
    </div>
  );
}
