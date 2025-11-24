/**
 * Data Transfer Object: TelemetryDTO
 * Used for transferring telemetry data between layers.
 * 
 * Design Pattern: DTO Pattern
 * Purpose: Decouples domain entities from presentation layer
 */
export interface TelemetryDTO {
    timestamp: string;
    vehicleId: string;
    lap: number;
    speed: number;
    throttlePos: number;
    brakePos: number;
    gpsLatitude: number;
    gpsLongitude: number;
    steeringAngle?: number;
    gear?: number;
}

/**
 * DTO for lap data
 */
export interface LapDTO {
    lapNumber: number;
    vehicleId: string;
    startTime: string;
    endTime: string;
    durationMs: number;
    lapTimeFormatted: string;
}

/**
 * DTO for race session overview
 */
export interface SessionOverviewDTO {
    sessionId: string;
    sessionName: string;
    trackName: string;
    totalVehicles: number;
    totalLaps: number;
    fastestLapTime: number | null;
    fastestLapVehicle: string | null;
}
