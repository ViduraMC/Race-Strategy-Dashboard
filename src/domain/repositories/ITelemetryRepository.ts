import { TelemetryFrame } from '../entities/TelemetryFrame';

/**
 * Repository Interface: ITelemetryRepository
 * Defines contract for telemetry data access.
 * 
 * Design Pattern: Repository Pattern
 * - Interface defined in Domain layer (Dependency Inversion Principle)
 * - Implementation will be in Infrastructure layer
 * - Abstracts data access details from business logic
 * 
 * SOLID Principles:
 * - Dependency Inversion: Depend on abstraction, not concrete implementation
 * - Interface Segregation: Focused interface for telemetry operations only
 */
export interface ITelemetryRepository {
    /**
     * Get all telemetry frames for a specific vehicle and lap
     * @param vehicleId Vehicle identifier
     * @param lap Lap number
     * @returns Promise resolving to array of telemetry frames
     */
    getTelemetryByVehicleAndLap(vehicleId: string, lap: number): Promise<TelemetryFrame[]>;

    /**
     * Get telemetry frames within a time range
     * @param vehicleId Vehicle identifier
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @returns Promise resolving to array of telemetry frames
     */
    getTelemetryByTimeRange(
        vehicleId: string,
        startTime: Date,
        endTime: Date
    ): Promise<TelemetryFrame[]>;

    /**
     * Get all unique vehicle IDs in the dataset
     * @returns Promise resolving to array of vehicle IDs
     */
    getAllVehicleIds(): Promise<string[]>;

    /**
     * Get the maximum lap number for a vehicle
     * @param vehicleId Vehicle identifier
     * @returns Promise resolving to maximum lap number
     */
    getMaxLapNumber(vehicleId: string): Promise<number>;

    /**
     * Save telemetry frames to the repository
     * @param frames Array of telemetry frames to save
     */
    saveTelemetry(frames: TelemetryFrame[]): Promise<void>;

    /**
     * Clear all telemetry data (useful for testing or reloading data)
     */
    clear(): Promise<void>;
}
