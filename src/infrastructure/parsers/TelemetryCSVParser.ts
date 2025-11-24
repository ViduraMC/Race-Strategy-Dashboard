import Papa from 'papaparse';
import { TelemetryFrame, TelemetryFrameData } from '@/domain/entities/TelemetryFrame';

/**
 * Telemetry CSV Parser for COTA Dataset
 * Handles "long format" where each row is a single telemetry metric
 */
export class TelemetryCSVParser {
    async parseFile(
        file: File,
        options: {
            maxRows?: number;
            skipRows?: number;
            filter?: {
                vehicleId?: string;
                lap?: number;
            };
            onProgress?: (progress: number) => void;
        } = {}
    ): Promise<TelemetryFrame[]> {
        const { maxRows = 100000, skipRows = 0, filter, onProgress } = options;

        return new Promise((resolve, reject) => {
            const rawRows: TelemetryRow[] = [];
            let rowCount = 0;
            let aborted = false;
            const seenVehicleIds = new Set<string>();
            let foundVehicleButWrongLap = false;
            let gpsDebugCount = 0;

            Papa.parse<any>(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                worker: true,

                chunk: (results, parser) => {
                    if (aborted) return;

                    const rows = results.data;
                    rowCount += rows.length;

                    for (const raw of rows) {
                        if (rowCount <= skipRows) continue;

                        const row = this.normalizeRow(raw);

                        if (this.isValidRow(row)) {
                            // GLOBAL DEBUG: Check if ANY GPS data exists in the file
                            if (gpsDebugCount < 5) {
                                const name = String(row.telemetry_name).toLowerCase();
                                if (name.includes('lat') || name.includes('gps') || name.includes('lon')) {
                                    console.log('[DEBUG] Found potential GPS row (Global):', row);
                                    gpsDebugCount++;
                                }
                            }

                            // Apply Filters
                            if (filter) {
                                const rowVehicleId = this.normalizeVehicleId(row.vehicle_id);

                                if (seenVehicleIds.size < 20 && !seenVehicleIds.has(rowVehicleId)) {
                                    seenVehicleIds.add(rowVehicleId);
                                    console.log(`[DEBUG] Found Vehicle ID: '${rowVehicleId}' (Raw: '${row.vehicle_id}')`);
                                }

                                if (filter.vehicleId && rowVehicleId !== filter.vehicleId) continue;

                                if (filter.lap && row.lap !== filter.lap) {
                                    if (!foundVehicleButWrongLap) {
                                        console.log(`[DEBUG] Found Vehicle ${filter.vehicleId} but Lap ${row.lap} does not match requested Lap ${filter.lap}`);
                                        foundVehicleButWrongLap = true;
                                    }
                                    continue;
                                }
                            }

                            rawRows.push(row);

                            if (rawRows.length >= maxRows) {
                                aborted = true;
                                parser.abort();
                                console.log(`Reached limit of ${maxRows} matched rows, aborting parse.`);
                                const frames = this.pivotToFrames(rawRows);
                                resolve(frames);
                                return;
                            }
                        }
                    }

                    if (Math.floor(rowCount / 50000) > Math.floor((rowCount - rows.length) / 50000)) {
                        console.log(`Scanned ${rowCount} rows... Found ${rawRows.length} matches.`);
                        if (onProgress) onProgress(rowCount);
                    }
                },

                complete: () => {
                    if (!aborted) {
                        console.log(`Parsed ${rawRows.length} matched telemetry rows (Complete). Scanned ${rowCount} total rows.`);
                        const frames = this.pivotToFrames(rawRows);
                        resolve(frames);
                    }
                },

                error: (error: Error) => reject(error)
            });
        });
    }

    private normalizeRow(raw: any): TelemetryRow {
        return {
            timestamp: raw.timestamp || raw.Time || raw.time,
            vehicle_id: raw.vehicle_id || raw.VehicleId || raw.vehicleId,
            lap: raw.lap || raw.Lap || raw.lapNumber,
            telemetry_name: raw.telemetry_name || raw.name || raw.Parameter || raw.signal,
            telemetry_value: raw.telemetry_value ?? raw.value ?? raw.Value ?? raw.result,
            ...raw
        };
    }

    private isValidRow(row: TelemetryRow): boolean {
        return !!(
            row.telemetry_name &&
            (row.telemetry_value || row.telemetry_value === 0) &&
            row.timestamp &&
            row.vehicle_id &&
            typeof row.lap === 'number'
        );
    }

    private pivotToFrames(rows: TelemetryRow[]): TelemetryFrame[] {
        const groups = new Map<string, Map<string, number>>();

        for (const row of rows) {
            const key = `${row.timestamp}_${row.vehicle_id}_${row.lap}`;

            if (!groups.has(key)) {
                groups.set(key, new Map());
            }

            const metrics = groups.get(key)!;
            const telemetryName = String(row.telemetry_name).toLowerCase();

            metrics.set(telemetryName, row.telemetry_value);

            if (!metrics.has('_timestamp')) {
                metrics.set('_timestamp', new Date(row.timestamp).getTime());
            }
            if (!metrics.has('_vehicle_id')) {
                metrics.set('_vehicle_id', row.vehicle_id as any);
            }
            if (!metrics.has('_lap')) {
                metrics.set('_lap', row.lap);
            }
        }

        const frames: TelemetryFrame[] = [];
        let loggedKeys = false;

        for (const [key, metrics] of groups.entries()) {
            try {
                if (!loggedKeys) {
                    console.log('[DEBUG] Available telemetry keys:', Array.from(metrics.keys()).join(', '));
                    loggedKeys = true;
                }

                const frameData: TelemetryFrameData = {
                    timestamp: new Date(metrics.get('_timestamp')!),
                    vehicleId: this.normalizeVehicleId(String(metrics.get('_vehicle_id')!)),
                    lap: metrics.get('_lap')!,
                    speed: metrics.get('speed') || metrics.get('speed_can') || 0,
                    throttlePos: this.clamp(
                        metrics.get('ath') || metrics.get('throttle_pos') || metrics.get('throttle') || 0,
                        0, 100
                    ),
                    brakePos: this.clamp(
                        Math.max(
                            metrics.get('pbrake_f') || 0,
                            metrics.get('pbrake_r') || 0,
                            metrics.get('brake_pos') || 0
                        ),
                        0, 100
                    ),
                    gpsLatitude: metrics.get('gps_lat') || metrics.get('gps_latitude') || metrics.get('latitude') || 0,
                    gpsLongitude: metrics.get('gps_lon') || metrics.get('gps_longitude') || metrics.get('longitude') || 0,
                    gear: metrics.get('gear') || undefined
                };

                if (frames.length === 0) {
                    console.log('[DEBUG] First Frame GPS:', {
                        lat: frameData.gpsLatitude,
                        lon: frameData.gpsLongitude,
                        keys: Array.from(metrics.keys()).filter(k => k.includes('gps') || k.includes('lat') || k.includes('lon'))
                    });
                }

                const frame = new TelemetryFrame(frameData);
                frames.push(frame);
            } catch (error) {
                console.warn('Failed to create frame:', error);
            }
        }

        frames.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return frames;
    }

    private normalizeVehicleId(vehicleId: string): string {
        return vehicleId.replace(/^GR86-/, '');
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }
}

interface TelemetryRow {
    timestamp: string;
    vehicle_id: string;
    lap: number;
    telemetry_name: string;
    telemetry_value: number;
    [key: string]: string | number | undefined;
}
