'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTelemetryContext } from '@/presentation/contexts/TelemetryContext';
import { TelemetryCSVParser } from '@/infrastructure/parsers/TelemetryCSVParser';
import { LapTimeCSVParser } from '@/infrastructure/parsers/LapTimeCSVParser';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';

export default function LapSelector() {
    const context = useTelemetryContext();
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [telemetryFile, setTelemetryFile] = useState<File | null>(null);
    const [loadedRows, setLoadedRows] = useState(0);


    const handleTelemetryUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setTelemetryFile(file);
        setLoadedRows(0);
        setUploadStatus('File selected. Select a vehicle and lap to load data.');
    }, []);

    const loadTelemetryData = useCallback(async (vehicleId: string, lap: number) => {
        if (!telemetryFile) return;

        setUploadStatus(`Searching for Vehicle ${vehicleId} Lap ${lap}...`);
        context.setLoading(true);

        try {
            const parser = new TelemetryCSVParser();
            // Load specifically for this vehicle and lap
            // Use a large maxRows for the MATCHED data (e.g. 100k frames is plenty for one lap)
            const frames = await parser.parseFile(telemetryFile, {
                maxRows: 100000,
                filter: { vehicleId, lap }
            });

            if (frames.length === 0) {
                setUploadStatus(`⚠ No telemetry found for Vehicle ${vehicleId} Lap ${lap}`);
                context.setLoading(false);
                return;
            }

            console.log(`Loaded ${frames.length} frames for ${vehicleId} Lap ${lap}`);

            const repository = RepositoryFactory.getTelemetryRepository();
            await repository.saveTelemetry(frames);

            // Update context
            context.setTelemetryData(vehicleId, lap, frames);

            setUploadStatus(`✓ Loaded ${frames.length} frames for Lap ${lap}`);
            context.setLoading(false);
        } catch (error) {
            setUploadStatus(`✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
            console.error('Telemetry load error:', error);
            context.setLoading(false);
        }
    }, [telemetryFile, context]);

    // Trigger load when selection changes
    useEffect(() => {
        if (context.selectedVehicleId && context.selectedLap !== null && telemetryFile) {
            const key = `${context.selectedVehicleId}-${context.selectedLap}`;
            const hasData = context.telemetryData.has(key);

            if (!hasData) {
                loadTelemetryData(context.selectedVehicleId, context.selectedLap);
            }
        }
    }, [context.selectedVehicleId, context.selectedLap, telemetryFile, context.telemetryData, loadTelemetryData]);

    const handleLapTimeUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadStatus('Parsing lap times...');
            context.setLoading(true);

            const parser = new LapTimeCSVParser();
            const laps = await parser.parseFile(file);

            const repository = RepositoryFactory.getLapRepository();
            await repository.saveLaps(laps);

            const vehicleMap = new Map<string, typeof laps>();
            for (const lap of laps) {
                const vehicleId = lap.vehicle.id;
                const existing = vehicleMap.get(vehicleId) || [];
                existing.push(lap);
                vehicleMap.set(vehicleId, existing);
            }

            for (const [vehicleId, vehicleLaps] of vehicleMap.entries()) {
                context.setLapData(vehicleId, vehicleLaps);
            }

            console.log('Loaded lap data for vehicles:', Array.from(vehicleMap.keys()));
            setUploadStatus(`✓ Loaded ${laps.length} laps for ${vehicleMap.size} vehicles`);
            context.setLoading(false);
        } catch (error) {
            setUploadStatus(`✗ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
            context.setLoading(false);
        }
    }, [context]);

    const vehicleIds = Array.from(context.lapData.keys());
    const selectedVehicleLaps = context.selectedVehicleId
        ? context.lapData.get(context.selectedVehicleId) || []
        : [];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Selection</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                        Upload Telemetry CSV
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleTelemetryUpload}
                        className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>



                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                        Upload Lap Times CSV
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleLapTimeUpload}
                        className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                </div>

                {uploadStatus && (
                    <div className={`text-sm p-2 rounded ${uploadStatus.startsWith('✓') ? 'bg-green-100 text-green-800' :
                        uploadStatus.startsWith('✗') ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {uploadStatus}
                    </div>
                )}
            </div>

            {vehicleIds.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                        Select Vehicle
                    </label>
                    <select
                        value={context.selectedVehicleId || ''}
                        onChange={(e) => {
                            const laps = context.lapData.get(e.target.value);
                            const firstLap = laps && laps.length > 0 ? laps[0].lapNumber : 1;
                            context.selectVehicleAndLap(e.target.value, firstLap);
                        }}
                        className="block w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md"
                    >
                        <option value="">-- Select Vehicle --</option>
                        {vehicleIds.map(id => (
                            <option key={id} value={id}>{id}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedVehicleLaps.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                        Select Lap
                    </label>
                    <select
                        value={context.selectedLap || ''}
                        onChange={(e) => {
                            if (context.selectedVehicleId) {
                                context.selectVehicleAndLap(context.selectedVehicleId, parseInt(e.target.value));
                            }
                        }}
                        className="block w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md"
                    >
                        <option value="">-- Select Lap --</option>
                        {selectedVehicleLaps.map(lap => (
                            <option key={lap.lapNumber} value={lap.lapNumber}>
                                Lap {lap.lapNumber} ({lap.lapTimeFormatted})
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
