import { ITelemetryRepository } from '@/domain/repositories/ITelemetryRepository';
import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';

/**
 * Use Case: GetVehicleTelemetry
 * Retrieves telemetry data for a specific vehicle and lap.
 * 
 * Design Pattern: Command Pattern (encapsulates request)
 * SOLID Principles:
 * - Single Responsibility: One use case per class
 * - Dependency Inversion: Depends on ITelemetryRepository interface
 */
export class GetVehicleTelemetry {
    constructor(private readonly telemetryRepository: ITelemetryRepository) { }

    /**
     * Execute the use case
     * @param vehicleId Vehicle identifier
     * @param lap Lap number
     * @returns Promise resolving to telemetry frames
     */
    async execute(vehicleId: string, lap: number): Promise<TelemetryFrame[]> {
        // Validation
        if (!vehicleId || vehicleId.trim() === '') {
            throw new Error('Vehicle ID is required');
        }
        if (lap < 0) {
            throw new Error('Lap number must be non-negative');
        }

        // Retrieve data
        const frames = await this.telemetryRepository.getTelemetryByVehicleAndLap(
            vehicleId,
            lap
        );

        // Business rule: Return sorted by timestamp
        return frames.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
}
