import { ITelemetryRepository } from '@/domain/repositories/ITelemetryRepository';
import { TelemetryAnalysisService, LapComparison } from '@/domain/services/TelemetryAnalysisService';

/**
 * Use Case: CompareLaps
 * Compares telemetry data between two laps.
 * 
 * Design Pattern: Command Pattern
 * Algorithm: Time-series alignment and delta calculation
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles lap comparison
 * - Dependency Inversion: Depends on interfaces
 */
export class CompareLaps {
    private readonly analysisService: TelemetryAnalysisService;

    constructor(private readonly telemetryRepository: ITelemetryRepository) {
        this.analysisService = new TelemetryAnalysisService();
    }

    /**
     * Execute lap comparison
     */
    async execute(request: CompareLapsRequest): Promise<CompareLapsResponse> {
        // Validate request
        this.validateRequest(request);

        // Fetch telemetry for both laps
        const [lap1Frames, lap2Frames] = await Promise.all([
            this.telemetryRepository.getTelemetryByVehicleAndLap(
                request.vehicleId1,
                request.lap1
            ),
            this.telemetryRepository.getTelemetryByVehicleAndLap(
                request.vehicleId2,
                request.lap2
            )
        ]);

        // Validate data
        if (lap1Frames.length === 0) {
            throw new Error(`No telemetry data found for vehicle ${request.vehicleId1}, lap ${request.lap1}`);
        }
        if (lap2Frames.length === 0) {
            throw new Error(`No telemetry data found for vehicle ${request.vehicleId2}, lap ${request.lap2}`);
        }

        // Perform comparison
        const comparison = this.analysisService.compareLaps(lap1Frames, lap2Frames);

        return {
            vehicleId1: request.vehicleId1,
            lap1: request.lap1,
            vehicleId2: request.vehicleId2,
            lap2: request.lap2,
            comparison,
            lap1FrameCount: lap1Frames.length,
            lap2FrameCount: lap2Frames.length
        };
    }

    private validateRequest(request: CompareLapsRequest): void {
        if (!request.vehicleId1 || request.vehicleId1.trim() === '') {
            throw new Error('Vehicle ID 1 is required');
        }
        if (!request.vehicleId2 || request.vehicleId2.trim() === '') {
            throw new Error('Vehicle ID 2 is required');
        }
        if (request.lap1 < 0) {
            throw new Error('Lap 1 must be non-negative');
        }
        if (request.lap2 < 0) {
            throw new Error('Lap 2 must be non-negative');
        }
    }
}

export interface CompareLapsRequest {
    vehicleId1: string;
    lap1: number;
    vehicleId2: string;
    lap2: number;
}

export interface CompareLapsResponse {
    vehicleId1: string;
    lap1: number;
    vehicleId2: string;
    lap2: number;
    comparison: LapComparison;
    lap1FrameCount: number;
    lap2FrameCount: number;
}
