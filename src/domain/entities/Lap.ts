import { Vehicle } from './Vehicle';

/**
 * Domain Entity: Lap
 * Represents a single lap in a race with timing and sector data.
 * 
 * OOP Principles Applied:
 * - Encapsulation: Private fields with getters
 * - Business Logic: Calculated properties (duration, pace)
 * - Value Object Pattern: LapTime is a value object
 */
export class Lap {
    private readonly _lapNumber: number;
    private readonly _vehicle: Vehicle;
    private readonly _startTime: Date;
    private readonly _endTime: Date;
    private readonly _sectorTimes: Map<string, number>; // sector -> milliseconds

    constructor(data: LapData) {
        if (data.lapNumber < 0) {
            throw new Error('Lap number must be non-negative');
        }
        if (!data.vehicle) {
            throw new Error('Vehicle is required');
        }
        if (!data.startTime || isNaN(new Date(data.startTime).getTime())) {
            throw new Error('Invalid start time');
        }
        if (!data.endTime || isNaN(new Date(data.endTime).getTime())) {
            throw new Error('Invalid end time');
        }
        if (new Date(data.endTime) <= new Date(data.startTime)) {
            throw new Error('End time must be after start time');
        }

        this._lapNumber = data.lapNumber;
        this._vehicle = data.vehicle;
        this._startTime = new Date(data.startTime);
        this._endTime = new Date(data.endTime);
        this._sectorTimes = new Map(Object.entries(data.sectorTimes || {}));
    }

    get lapNumber(): number { return this._lapNumber; }
    get vehicle(): Vehicle { return this._vehicle; }
    get startTime(): Date { return this._startTime; }
    get endTime(): Date { return this._endTime; }

    /**
     * Business Logic: Calculate lap duration in milliseconds
     */
    get durationMs(): number {
        return this._endTime.getTime() - this._startTime.getTime();
    }

    /**
     * Business Logic: Get lap time in formatted string (MM:SS.mmm)
     */
    get lapTimeFormatted(): string {
        const totalMs = this.durationMs;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const milliseconds = totalMs % 1000;
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    /**
     * Business Logic: Get average speed if distance is known
     */
    calculateAverageSpeed(trackLengthKm: number): number {
        const durationHours = this.durationMs / (1000 * 60 * 60);
        return trackLengthKm / durationHours; // km/h
    }

    /**
     * Get sector time by sector ID
     */
    getSectorTime(sectorId: string): number | undefined {
        return this._sectorTimes.get(sectorId);
    }

    /**
     * Get all sector times
     */
    get sectorTimes(): ReadonlyMap<string, number> {
        return this._sectorTimes;
    }

    /**
     * Compare lap time with another lap (for sorting)
     */
    compareTo(other: Lap): number {
        return this.durationMs - other.durationMs;
    }

    /**
     * Check if this lap is faster than another
     */
    isFasterThan(other: Lap): boolean {
        return this.durationMs < other.durationMs;
    }

    toJSON(): LapDataJSON {
        return {
            lapNumber: this._lapNumber,
            vehicle: this._vehicle.toJSON(),
            startTime: this._startTime.toISOString(),
            endTime: this._endTime.toISOString(),
            durationMs: this.durationMs,
            sectorTimes: Object.fromEntries(this._sectorTimes)
        };
    }
}

export interface LapData {
    lapNumber: number;
    vehicle: Vehicle;
    startTime: string | Date;
    endTime: string | Date;
    sectorTimes?: Record<string, number>;
}

export interface LapDataJSON {
    lapNumber: number;
    vehicle: { chassis: string; carNumber: number };
    startTime: string;
    endTime: string;
    durationMs: number;
    sectorTimes: Record<string, number>;
}
