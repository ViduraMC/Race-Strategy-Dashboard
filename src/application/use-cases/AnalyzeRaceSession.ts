import { ILapRepository } from '@/domain/repositories/ILapRepository';
import { RaceSession } from '@/domain/entities/RaceSession';

/**
 * Use Case: AnalyzeRaceSession
 * Generates comprehensive race session analytics.
 * 
 * Design Pattern: Command Pattern
 * SOLID Principles:
 * - Single Responsibility
 * - Open/Closed: Extensible for new analysis types
 */
export class AnalyzeRaceSession {
    constructor(private readonly lapRepository: ILapRepository) { }

    /**
     * Execute race session analysis
     */
    async execute(sessionData: SessionInput): Promise<SessionAnalysis> {
        // Create race session aggregate
        const session = new RaceSession({
            sessionId: sessionData.sessionId,
            sessionName: sessionData.sessionName,
            trackName: sessionData.trackName,
            trackLengthKm: sessionData.trackLengthKm,
            sessionDate: sessionData.sessionDate
        });

        // Load all laps
        const allLaps = await this.lapRepository.getAllLaps();

        // Add laps to session
        for (const lap of allLaps) {
            session.addLap(lap);
        }

        // Get session statistics
        const stats = session.getStatistics();

        // Get fastest lap
        const fastestLap = session.getFastestLap();

        // Analyze each vehicle
        const vehicleAnalysis: VehicleAnalysis[] = [];

        for (const vehicle of session.vehicles) {
            const vehicleId = vehicle.id;
            const laps = session.getLapsByVehicle(vehicleId);
            const fastestVehicleLap = session.getFastestLapForVehicle(vehicleId);
            const avgLapTime = session.getAverageLapTime(vehicleId);
            const consistency = session.getLapConsistency(vehicleId);

            vehicleAnalysis.push({
                vehicleId,
                chassis: vehicle.chassis,
                carNumber: vehicle.carNumber,
                totalLaps: laps.length,
                fastestLapTime: fastestVehicleLap?.durationMs ?? null,
                averageLapTime: avgLapTime,
                consistency: consistency,
                gapToLeader: fastestLap && fastestVehicleLap
                    ? fastestVehicleLap.durationMs - fastestLap.durationMs
                    : null
            });
        }

        // Sort by fastest lap time
        vehicleAnalysis.sort((a, b) => {
            if (a.fastestLapTime === null) return 1;
            if (b.fastestLapTime === null) return -1;
            return a.fastestLapTime - b.fastestLapTime;
        });

        return {
            sessionStats: stats,
            vehicleAnalysis,
            trackInfo: {
                name: sessionData.trackName,
                lengthKm: sessionData.trackLengthKm
            }
        };
    }
}

export interface SessionInput {
    sessionId: string;
    sessionName: string;
    trackName: string;
    trackLengthKm: number;
    sessionDate: string | Date;
}

export interface SessionAnalysis {
    sessionStats: {
        totalVehicles: number;
        totalLaps: number;
        fastestLapTime: number | null;
        fastestLapVehicle: string | null;
        sessionDuration: number;
    };
    vehicleAnalysis: VehicleAnalysis[];
    trackInfo: {
        name: string;
        lengthKm: number;
    };
}

export interface VehicleAnalysis {
    vehicleId: string;
    chassis: string;
    carNumber: number;
    totalLaps: number;
    fastestLapTime: number | null;
    averageLapTime: number | null;
    consistency: number | null;
    gapToLeader: number | null;
}
