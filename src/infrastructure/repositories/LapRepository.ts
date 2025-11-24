import { ILapRepository } from '@/domain/repositories/ILapRepository';
import { Lap } from '@/domain/entities/Lap';

/**
 * In-Memory Lap Repository
 * Implements ILapRepository using in-memory storage.
 * 
 * Design Pattern: Repository Pattern
 * Data Structure: Map<VehicleId, Lap[]>
 * 
 * SOLID Principles:
 * - Implements domain interface (Dependency Inversion)
 * - Single Responsibility
 */
export class LapRepository implements ILapRepository {
    // Data Structure: Map for O(1) vehicle lookup
    private readonly data: Map<string, Lap[]>;

    constructor() {
        this.data = new Map();
    }

    /**
     * Get all laps for a vehicle
     * Complexity: O(1) for lookup
     */
    async getLapsByVehicle(vehicleId: string): Promise<Lap[]> {
        const laps = this.data.get(vehicleId);
        return laps ? [...laps] : []; // Return copy
    }

    /**
     * Get a specific lap
     * Complexity: O(n) where n is number of laps for vehicle
     */
    async getLap(vehicleId: string, lapNumber: number): Promise<Lap | null> {
        const laps = this.data.get(vehicleId);
        if (!laps) return null;

        return laps.find(lap => lap.lapNumber === lapNumber) || null;
    }

    /**
     * Get all laps in the session
     * Complexity: O(n) where n is total laps
     */
    async getAllLaps(): Promise<Lap[]> {
        const allLaps: Lap[] = [];

        for (const laps of this.data.values()) {
            allLaps.push(...laps);
        }

        return allLaps;
    }

    /**
     * Save laps
     * Complexity: O(n) where n is number of laps
     */
    async saveLaps(laps: Lap[]): Promise<void> {
        for (const lap of laps) {
            const vehicleId = lap.vehicle.id;

            let vehicleLaps = this.data.get(vehicleId);
            if (!vehicleLaps) {
                vehicleLaps = [];
                this.data.set(vehicleId, vehicleLaps);
            }

            // Check if lap already exists
            const existingIndex = vehicleLaps.findIndex(
                l => l.lapNumber === lap.lapNumber
            );

            if (existingIndex >= 0) {
                vehicleLaps[existingIndex] = lap; // Update
            } else {
                vehicleLaps.push(lap); // Add
            }
        }

        // Sort laps by lap number
        for (const vehicleLaps of this.data.values()) {
            vehicleLaps.sort((a, b) => a.lapNumber - b.lapNumber);
        }
    }

    /**
     * Get all vehicle IDs
     */
    async getAllVehicleIds(): Promise<string[]> {
        return Array.from(this.data.keys());
    }

    /**
     * Clear all data
     */
    async clear(): Promise<void> {
        this.data.clear();
    }

    /**
     * Get statistics
     */
    getStatistics() {
        let totalLaps = 0;
        for (const laps of this.data.values()) {
            totalLaps += laps.length;
        }

        return {
            totalVehicles: this.data.size,
            totalLaps
        };
    }
}
