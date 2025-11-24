'use client';

import React from 'react';
import { TelemetryProvider } from '@/presentation/contexts/TelemetryContext';
import LapSelector from '@/presentation/components/dashboard/LapSelector';
import TelemetryCharts from '@/presentation/components/dashboard/TelemetryCharts';
import TrackMap from '@/presentation/components/dashboard/TrackMap';

/**
 * Main Dashboard Page
 * Assembles all dashboard components.
 */
export default function DashboardPage() {
    return (
        <TelemetryProvider>
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Race Strategy Dashboard
                        </h1>
                        <p className="mt-1 text-blue-100">
                            Hack the Track 2025 - Toyota GR Cup Telemetry Analysis
                        </p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar: Data Selection */}
                        <div className="lg:col-span-1">
                            <LapSelector />
                        </div>

                        {/* Main Content: Charts and Map */}
                        <div className="lg:col-span-2 space-y-8">
                            <TrackMap />
                            <TelemetryCharts />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            <p>Built with Clean Architecture | SOLID Principles | Design Patterns</p>
                            <p className="mt-1">Next.js 14 • TypeScript • Recharts • TailwindCSS</p>
                        </div>
                    </div>
                </footer>
            </div>
        </TelemetryProvider>
    );
}
