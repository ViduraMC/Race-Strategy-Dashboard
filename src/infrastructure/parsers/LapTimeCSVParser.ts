import Papa from 'papaparse';
import { Lap, LapData } from '@/domain/entities/Lap';
import { Vehicle } from '@/domain/entities/Vehicle';

/**
 * Lap Time CSV Parser
 * Parses lap timing data from COTA CSV files.
 * 
 * Strategy:
 * - COTA CSV 'value' column appears unreliable for lap duration.
 * - We calculate lap start/end times based on the 'timestamp' column.
 * - Start Time = Previous Lap's Timestamp (or End Time - 2 mins for first lap)
 * - End Time = Current Lap's Timestamp
 */
export class LapTimeCSVParser {
    /**
     * Parse lap time CSV file
     */
    async parseFile(file: File): Promise<Lap[]> {
        return new Promise((resolve, reject) => {
            const rawRows: LapCSVRow[] = [];

            Papa.parse<LapCSVRow>(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,

                step: (result) => {
                    if (result.data && this.isValidRow(result.data)) {
                        rawRows.push(result.data);
                    }
                },

                complete: () => {
                    try {
                        const laps = this.processRows(rawRows);
                        console.log(`Parsed ${laps.length} laps from ${rawRows.length} rows`);
                        resolve(laps);
                    } catch (error) {
                        reject(error);
                    }
                },

                error: (error: Error) => reject(error)
            });
        });
    }

    /**
     * Process raw rows into Lap entities
     */
    private processRows(rows: LapCSVRow[]): Lap[] {
        // 1. Group rows by vehicle
        const vehicleMap = new Map<string, LapCSVRow[]>();
        for (const row of rows) {
            if (!vehicleMap.has(row.vehicle_id)) {
                vehicleMap.set(row.vehicle_id, []);
            }
            vehicleMap.get(row.vehicle_id)!.push(row);
        }

        const laps: Lap[] = [];

        // 2. Process each vehicle's laps
        for (const [vehicleId, vehicleRows] of vehicleMap.entries()) {
            // Sort by lap number
            vehicleRows.sort((a, b) => a.lap - b.lap);

            // Filter out duplicate laps (keep max value one if duplicates exist)
            // We use a Map to ensure unique lap numbers per vehicle
            const uniqueRows = new Map<number, LapCSVRow>();
            vehicleRows.forEach(row => {
                const existing = uniqueRows.get(row.lap);
                if (!existing || row.value > existing.value) {
                    uniqueRows.set(row.lap, row);
                }
            });

            const sortedUniqueRows = Array.from(uniqueRows.values()).sort((a, b) => a.lap - b.lap);

            // 3. Convert to Lap entities
            for (let i = 0; i < sortedUniqueRows.length; i++) {
                const row = sortedUniqueRows[i];
                const prevRow = i > 0 ? sortedUniqueRows[i - 1] : null;

                try {
                    const lap = this.convertToLap(row, prevRow);
                    laps.push(lap);
                } catch (error) {
                    console.warn('Failed to parse lap:', error);
                }
            }
        }

        return laps;
    }

    private isValidRow(row: LapCSVRow): boolean {
        return !!(
            row.vehicle_id &&
            typeof row.lap === 'number' &&
            row.timestamp
        );
    }

    private convertToLap(row: LapCSVRow, prevRow: LapCSVRow | null): Lap {
        const { chassis, carNumber } = this.parseVehicleId(row.vehicle_id);
        const vehicle = new Vehicle({ chassis, carNumber });

        const endTime = new Date(row.timestamp);
        let startTime: Date;

        if (prevRow) {
            // Start time is the previous lap's end time
            startTime = new Date(prevRow.timestamp);
        } else {
            // First lap: Default to 2 minutes before end time (reasonable buffer for COTA)
            startTime = new Date(endTime.getTime() - 120000);
        }

        // Sanity check: if start >= end, force a gap
        if (startTime.getTime() >= endTime.getTime()) {
            startTime = new Date(endTime.getTime() - 120000);
        }

        const lapData: LapData = {
            lapNumber: row.lap,
            vehicle: vehicle,
            startTime: startTime,
            endTime: endTime,
            sectorTimes: this.parseSectorTimes(row)
        };

        return new Lap(lapData);
    }

    private parseVehicleId(vehicleId: string): { chassis: string; carNumber: number } {
        const parts = vehicleId.split('-');
        if (parts.length >= 3) {
            return {
                chassis: parts[1],
                carNumber: parseInt(parts[2], 10)
            };
        }
        return {
            chassis: vehicleId,
            carNumber: 0
        };
    }

    private parseSectorTimes(row: LapCSVRow): Record<string, number> {
        const sectorTimes: Record<string, number> = {};
        Object.keys(row).forEach(key => {
            if (key.startsWith('sector_') || key.toLowerCase().includes('im')) {
                const value = row[key];
                if (typeof value === 'number' && value > 0) {
                    sectorTimes[key] = value;
                }
            }
        });
        return sectorTimes;
    }
}

interface LapCSVRow {
    vehicle_id: string;
    lap: number;
    timestamp: string;
    value: number;
    [key: string]: string | number | undefined;
}
