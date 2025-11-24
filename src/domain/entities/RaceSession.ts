import { Lap } from './Lap';
import { Vehicle } from './Vehicle';

/**
 * Domain Entity: RaceSession (Aggregate Root)
 * Represents a complete race session with all laps and vehicles.
 * 
 * Design Pattern: Aggregate Pattern (Domain-Driven Design)
 * - RaceSession is the aggregate root
 * - Controls access to child entities (Laps, Vehicles)
 * - Ensures consistency boundaries
 * 
 * OOP Principles Applied:
 * - Encapsulation: Manages internal collections privately
 * - Business Logic: Race statistics, fastest lap, consistency analysis
 */
export class RaceSession {
    private readonly _sessionId: string;
    private readonly _sessionName: string;
    private readonly _trackName: string;
    private readonly _trackLengthKm: number;
    private readonly _sessionDate: Date;
    private readonly _laps: Map<string, Lap[]>; // vehicleId -> laps[]
    private readonly _vehicles: Map<string, Vehicle>; // vehicleId -> vehicle

    constructor(data: RaceSessionData) {
        if (!data.sessionId || data.sessionId.trim() === '') {
            throw new Error('Session ID is required');
        }
        if (!data.trackName || data.trackName.trim() === '') {
            throw new Error('Track name is required');
        }
        if (data.trackLengthKm <= 0) {
            throw new Error('Track length must be positive');
        }

        this._sessionId = data.sessionId;
        this._sessionName = data.sessionName;
        this._trackName = data.trackName;
        this._trackLengthKm = data.trackLengthKm;
        this._sessionDate = new Date(data.sessionDate);
        this._laps = new Map();
        this._vehicles = new Map();
    }

    get sessionId(): string { return this._sessionId; }
    get sessionName(): string { return this._sessionName; }
    get trackName(): string { return this._trackName; }
    get trackLengthKm(): number { return this._trackLengthKm; }
    get sessionDate(): Date { return this._sessionDate; }

    /**
     * Add a lap to the session
     * Business Rule: Laps must be from registered vehicles
     */
    addLap(lap: Lap): void {
        const vehicleId = lap.vehicle.id;

        // Register vehicle if not already registered
        if (!this._vehicles.has(vehicleId)) {
            this._vehicles.set(vehicleId, lap.vehicle);
        }

        // Add lap to vehicle's lap list
        const vehicleLaps = this._laps.get(vehicleId) || [];
        vehicleLaps.push(lap);
        this._laps.set(vehicleId, vehicleLaps);
    }

    /**
     * Get all laps for a specific vehicle
     */
    getLapsByVehicle(vehicleId: string): readonly Lap[] {
        return this._laps.get(vehicleId) || [];
    }

    /**
     * Get all vehicles in the session
     */
    get vehicles(): readonly Vehicle[] {
        return Array.from(this._vehicles.values());
    }

    /**
     * Get total number of laps in the session
     */
    get totalLaps(): number {
        let total = 0;
        for (const laps of this._laps.values()) {
            total += laps.length;
        }
        return total;
    }

    /**
     * Business Logic: Find the fastest lap in the session
     */
    getFastestLap(): Lap | null {
        let fastest: Lap | null = null;

        for (const laps of this._laps.values()) {
            for (const lap of laps) {
                if (!fastest || lap.isFasterThan(fastest)) {
                    fastest = lap;
                }
            }
        }

        return fastest;
    }

    /**
     * Business Logic: Find the fastest lap for a specific vehicle
     */
    getFastestLapForVehicle(vehicleId: string): Lap | null {
        const laps = this._laps.get(vehicleId);
        if (!laps || laps.length === 0) return null;

        return laps.reduce((fastest, current) =>
            current.isFasterThan(fastest) ? current : fastest
        );
    }

    /**
     * Business Logic: Calculate average lap time for a vehicle
     */
    getAverageLapTime(vehicleId: string): number | null {
        const laps = this._laps.get(vehicleId);
        if (!laps || laps.length === 0) return null;

        const total = laps.reduce((sum, lap) => sum + lap.durationMs, 0);
        return total / laps.length;
    }

    /**
     * Business Logic: Calculate lap time consistency (standard deviation)
     * Lower values indicate more consistent lap times
     */
    getLapConsistency(vehicleId: string): number | null {
        const laps = this._laps.get(vehicleId);
        if (!laps || laps.length < 2) return null;

        const avg = this.getAverageLapTime(vehicleId);
        if (avg === null) return null;

        const variance = laps.reduce((sum, lap) => {
            const diff = lap.durationMs - avg;
            return sum + (diff * diff);
        }, 0) / laps.length;

        return Math.sqrt(variance);
    }

    /**
     * Get session summary statistics
     */
    getStatistics(): SessionStatistics {
        const fastestLap = this.getFastestLap();

        return {
            totalVehicles: this._vehicles.size,
            totalLaps: this.totalLaps,
            fastestLapTime: fastestLap?.durationMs ?? null,
            fastestLapVehicle: fastestLap?.vehicle.id ?? null,
            sessionDuration: this.calculateSessionDuration()
        };
    }

    /**
     * Calculate total session duration
     */
    private calculateSessionDuration(): number {
        let earliest: Date | null = null;
        let latest: Date | null = null;

        for (const laps of this._laps.values()) {
            for (const lap of laps) {
                if (!earliest || lap.startTime < earliest) earliest = lap.startTime;
                if (!latest || lap.endTime > latest) latest = lap.endTime;
            }
        }

        if (!earliest || !latest) return 0;
        return latest.getTime() - earliest.getTime();
    }
}

export interface RaceSessionData {
    sessionId: string;
    sessionName: string;
    trackName: string;
    trackLengthKm: number;
    sessionDate: string | Date;
}

export interface SessionStatistics {
    totalVehicles: number;
    totalLaps: number;
    fastestLapTime: number | null;
    fastestLapVehicle: string | null;
    sessionDuration: number;
}
