import { Lap } from '../entities/Lap';

/**
 * Repository Interface: ILapRepository
 * Defines contract for lap data access.
 * 
 * Design Pattern: Repository Pattern
 * SOLID Principles:
 * - Interface Segregation: Separate interface from ITelemetryRepository
 * - Dependency Inversion: Domain depends on abstraction
 */
export interface ILapRepository {
    /**
     * Get all laps for a specific vehicle
     * @param vehicleId Vehicle identifier
     * @returns Promise resolving to array of laps
     */
    getLapsByVehicle(vehicleId: string): Promise<Lap[]>;

    /**
     * Get a specific lap by vehicle and lap number
     * @param vehicleId Vehicle identifier
     * @param lapNumber Lap number
     * @returns Promise resolving to the lap or null if not found
     */
    getLap(vehicleId: string, lapNumber: number): Promise<Lap | null>;

    /**
     * Get all laps in the session
     * @returns Promise resolving to array of all laps
     */
    getAllLaps(): Promise<Lap[]>;

    /**
     * Save laps to the repository
     * @param laps Array of laps to save
     */
    saveLaps(laps: Lap[]): Promise<void>;

    /**
     * Get all unique vehicle IDs
     * @returns Promise resolving to array of vehicle IDs
     */
    getAllVehicleIds(): Promise<string[]>;

    /**
     * Clear all lap data
     */
    clear(): Promise<void>;
}
