import { ITelemetryRepository } from '@/domain/repositories/ITelemetryRepository';
import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';

/**
 * In-Memory Telemetry Repository
 * Implements ITelemetryRepository using in-memory storage.
 * 
 * Design Pattern: Repository Pattern (implementation)
 * Data Structure: Map for O(1) lookups
 * 
 * SOLID Principles:
 * - Dependency Inversion: Implements domain interface
 * - Single Responsibility: Only handles telemetry storage/retrieval
 */
export class TelemetryRepository implements ITelemetryRepository {
    // Data Structure: Nested Map for efficient lookup
    // vehicleId -> lap -> TelemetryFrame[]
    private readonly data: Map<string, Map<number, TelemetryFrame[]>>;

    constructor() {
        this.data = new Map();
    }

    /**
     * Get telemetry frames for a specific vehicle and lap
     * Complexity: O(1) average case for lookup
     */
    async getTelemetryByVehicleAndLap(
        vehicleId: string,
        lap: number
    ): Promise<TelemetryFrame[]> {
        const vehicleData = this.data.get(vehicleId);
        if (!vehicleData) return [];

        const lapData = vehicleData.get(lap);
        return lapData ? [...lapData] : []; // Return copy for immutability
    }

    /**
     * Get telemetry frames within a time range
     * Complexity: O(n) where n is number of frames in lap
     */
    async getTelemetryByTimeRange(
        vehicleId: string,
        startTime: Date,
        endTime: Date
    ): Promise<TelemetryFrame[]> {
        const vehicleData = this.data.get(vehicleId);
        if (!vehicleData) return [];

        const frames: TelemetryFrame[] = [];

        // Iterate through all laps for this vehicle
        for (const lapFrames of vehicleData.values()) {
            for (const frame of lapFrames) {
                if (frame.timestamp >= startTime && frame.timestamp <= endTime) {
                    frames.push(frame);
                }
            }
        }

        // Sort by timestamp
        return frames.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    /**
     * Get all unique vehicle IDs
     * Complexity: O(1) - just return keys
     */
    async getAllVehicleIds(): Promise<string[]> {
        return Array.from(this.data.keys());
    }

    /**
     * Get maximum lap number for a vehicle
     * Complexity: O(1) for Map keys lookup
     */
    async getMaxLapNumber(vehicleId: string): Promise<number> {
        const vehicleData = this.data.get(vehicleId);
        if (!vehicleData || vehicleData.size === 0) return 0;

        return Math.max(...Array.from(vehicleData.keys()));
    }

    /**
     * Save telemetry frames
     * Complexity: O(n) where n is number of frames
     */
    async saveTelemetry(frames: TelemetryFrame[]): Promise<void> {
        for (const frame of frames) {
            const vehicleId = frame.vehicleId;
            const lap = frame.lap;

            // Get or create vehicle map
            let vehicleData = this.data.get(vehicleId);
            if (!vehicleData) {
                vehicleData = new Map();
                this.data.set(vehicleId, vehicleData);
            }

            // Get or create lap array
            let lapData = vehicleData.get(lap);
            if (!lapData) {
                lapData = [];
                vehicleData.set(lap, lapData);
            }

            // Add frame
            lapData.push(frame);
        }

        // Sort frames by timestamp within each lap
        for (const vehicleData of this.data.values()) {
            for (const lapData of vehicleData.values()) {
                lapData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }
        }
    }

    /**
     * Clear all data
     */
    async clear(): Promise<void> {
        this.data.clear();
    }

    /**
     * Get statistics about stored data
     */
    getStatistics(): RepositoryStatistics {
        let totalFrames = 0;
        let totalLaps = 0;

        for (const vehicleData of this.data.values()) {
            totalLaps += vehicleData.size;
            for (const lapData of vehicleData.values()) {
                totalFrames += lapData.length;
            }
        }

        return {
            totalVehicles: this.data.size,
            totalLaps,
            totalFrames
        };
    }
}

export interface RepositoryStatistics {
    totalVehicles: number;
    totalLaps: number;
    totalFrames: number;
}
