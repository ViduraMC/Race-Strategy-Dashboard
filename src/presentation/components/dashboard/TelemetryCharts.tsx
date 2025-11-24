'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTelemetry } from '@/presentation/hooks/useTelemetry';
import { ChartDataAdapter } from '@/presentation/services/ChartDataAdapter';

/**
 * TelemetryCharts Component
 * Displays synchronized telemetry data charts.
 * 
 * Design Pattern: Observer Pattern (reacts to selected lap changes via Context)
 * SOLID Principles:
 * - Single Responsibility: Focused on chart rendering
 * - Open/Closed: Can extend with new chart types
 */
export default function TelemetryCharts() {
    const { selectedTelemetry, comparisonTelemetry, isLoading } = useTelemetry();

    // Convert domain entities to chart data (Adapter Pattern)
    const chartData = useMemo(() => {
        return ChartDataAdapter.toLineChartData(selectedTelemetry);
    }, [selectedTelemetry]);

    const comparisonData = useMemo(() => {
        if (comparisonTelemetry.length === 0) return null;
        return ChartDataAdapter.toLineChartData(comparisonTelemetry);
    }, [comparisonTelemetry]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-zinc-500">Select a vehicle and lap to view telemetry</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Speed Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Speed (km/h)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="index"
                            stroke="#9CA3AF"
                            label={{ value: 'Data Point', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="speed"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                            name="Speed (Main)"
                        />
                        {comparisonData && (
                            <Line
                                type="monotone"
                                data={comparisonData}
                                dataKey="speed"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 5"
                                name="Speed (Comparison)"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Throttle & Brake Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Throttle & Brake (%)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="index"
                            stroke="#9CA3AF"
                            label={{ value: 'Data Point', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="throttle"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={false}
                            name="Throttle"
                        />
                        <Line
                            type="monotone"
                            dataKey="brake"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={false}
                            name="Brake"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Statistics Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm opacity-90">Data Points</p>
                        <p className="text-2xl font-bold">{chartData.length}</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Max Speed</p>
                        <p className="text-2xl font-bold">
                            {Math.max(...chartData.map(d => d.speed)).toFixed(0)} km/h
                        </p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Avg Speed</p>
                        <p className="text-2xl font-bold">
                            {(chartData.reduce((sum, d) => sum + d.speed, 0) / chartData.length).toFixed(0)} km/h
                        </p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Braking Events</p>
                        <p className="text-2xl font-bold">
                            {chartData.filter(d => d.isBraking).length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
