import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';
import { Lap } from '@/domain/entities/Lap';

/**
 * Chart Data Adapter
 * Converts domain entities to format required by Recharts library.
 * 
 * Design Pattern: Adapter Pattern
 * Purpose: Bridge between domain model and UI library
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles data transformation
 * - Open/Closed: Can extend for new chart types without modification
 */
export class ChartDataAdapter {
    /**
     * Convert telemetry frames to line chart data
     */
    static toLineChartData(frames: TelemetryFrame[]): ChartDataPoint[] {
        return frames.map((frame, index) => ({
            index,
            timestamp: frame.timestamp.toISOString(),
            speed: frame.speed,
            throttle: frame.throttlePos,
            brake: frame.brakePos,
            latitude: frame.gpsLatitude,
            longitude: frame.gpsLongitude,
            gear: frame.gear,
            isBraking: frame.isBraking,
            isAccelerating: frame.isAccelerating
        }));
    }

    /**
     * Convert laps to table data
     */
    static toLapTableData(laps: Lap[]): LapTableRow[] {
        return laps.map(lap => ({
            lapNumber: lap.lapNumber,
            vehicleId: lap.vehicle.id,
            chassis: lap.vehicle.chassis,
            carNumber: lap.vehicle.carNumber,
            startTime: lap.startTime.toISOString(),
            endTime: lap.endTime.toISOString(),
            durationMs: lap.durationMs,
            lapTime: lap.lapTimeFormatted,
            sectorTimes: Object.fromEntries(lap.sectorTimes)
        }));
    }

    /**
     * Convert telemetry to speed heatmap data
     */
    static toSpeedHeatmap(frames: TelemetryFrame[]): HeatmapPoint[] {
        return frames.map(frame => ({
            lat: frame.gpsLatitude,
            lng: frame.gpsLongitude,
            value: frame.speed,
            timestamp: frame.timestamp.toISOString()
        }));
    }

    /**
     * Calculate speed distribution for histogram
     */
    static toSpeedHistogram(frames: TelemetryFrame[], binSize: number = 10): HistogramBin[] {
        const bins: Map<number, number> = new Map();

        for (const frame of frames) {
            const bin = Math.floor(frame.speed / binSize) * binSize;
            bins.set(bin, (bins.get(bin) || 0) + 1);
        }

        return Array.from(bins.entries())
            .map(([speed, count]) => ({ speed, count }))
            .sort((a, b) => a.speed - b.speed);
    }

    /**
     * Convert telemetry for scatter plot (speed vs throttle)
     */
    static toScatterData(frames: TelemetryFrame[]): ScatterPoint[] {
        return frames.map(frame => ({
            throttle: frame.throttlePos,
            speed: frame.speed,
            brake: frame.brakePos
        }));
    }
}

// Type Definitions
export interface ChartDataPoint {
    index: number;
    timestamp: string;
    speed: number;
    throttle: number;
    brake: number;
    latitude: number;
    longitude: number;
    gear?: number;
    isBraking: boolean;
    isAccelerating: boolean;
}

export interface LapTableRow {
    lapNumber: number;
    vehicleId: string;
    chassis: string;
    carNumber: number;
    startTime: string;
    endTime: string;
    durationMs: number;
    lapTime: string;
    sectorTimes: Record<string, number>;
}

export interface HeatmapPoint {
    lat: number;
    lng: number;
    value: number;
    timestamp: string;
}

export interface HistogramBin {
    speed: number;
    count: number;
}

export interface ScatterPoint {
    throttle: number;
    speed: number;
    brake: number;
}
