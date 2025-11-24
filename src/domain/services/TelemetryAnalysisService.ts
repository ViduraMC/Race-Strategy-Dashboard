import { Lap } from '../entities/Lap';
import { TelemetryFrame } from '../entities/TelemetryFrame';

/**
 * Domain Service: TelemetryAnalysisService
 * Provides advanced analysis operations on telemetry data.
 * 
 * Domain Service Pattern:
 * - Contains business logic that doesn't naturally belong to a single entity
 * - Stateless service that operates on domain entities
 * 
 * SOLID Principles:
 * - Single Responsibility: Focused on telemetry analysis only
 * - Open/Closed: Extensible with new analysis methods
 */
export class TelemetryAnalysisService {
    /**
     * Calculate average speed across telemetry frames
     */
    calculateAverageSpeed(frames: TelemetryFrame[]): number {
        if (frames.length === 0) return 0;

        const totalSpeed = frames.reduce((sum, frame) => sum + frame.speed, 0);
        return totalSpeed / frames.length;
    }

    /**
     * Find all braking points in telemetry data
     * A braking point is when brake increases significantly
     */
    findBrakingPoints(frames: TelemetryFrame[]): BrakingPoint[] {
        const brakingPoints: BrakingPoint[] = [];

        for (let i = 1; i < frames.length; i++) {
            const prev = frames[i - 1];
            const curr = frames[i];

            // Detect braking: brake position increases by >20% and driver was not braking before
            if (!prev.isBraking && curr.isBraking && curr.brakePos > 20) {
                brakingPoints.push({
                    timestamp: curr.timestamp,
                    speed: curr.speed,
                    brakePos: curr.brakePos,
                    latitude: curr.gpsLatitude,
                    longitude: curr.gpsLongitude
                });
            }
        }

        return brakingPoints;
    }

    /**
     * Compare two laps and calculate time differences
     * Algorithm: Time-series alignment
     */
    compareLaps(lap1Frames: TelemetryFrame[], lap2Frames: TelemetryFrame[]): LapComparison {
        if (lap1Frames.length === 0 || lap2Frames.length === 0) {
            throw new Error('Cannot compare empty laps');
        }

        // Calculate delta in key metrics
        const avgSpeed1 = this.calculateAverageSpeed(lap1Frames);
        const avgSpeed2 = this.calculateAverageSpeed(lap2Frames);

        const avgThrottle1 = this.calculateAverageThrottle(lap1Frames);
        const avgThrottle2 = this.calculateAverageThrottle(lap2Frames);

        const avgBrake1 = this.calculateAverageBrake(lap1Frames);
        const avgBrake2 = this.calculateAverageBrake(lap2Frames);

        return {
            speedDelta: avgSpeed1 - avgSpeed2,
            throttleDelta: avgThrottle1 - avgThrottle2,
            brakeDelta: avgBrake1 - avgBrake2,
            lap1Stats: {
                avgSpeed: avgSpeed1,
                avgThrottle: avgThrottle1,
                avgBrake: avgBrake1
            },
            lap2Stats: {
                avgSpeed: avgSpeed2,
                avgThrottle: avgThrottle2,
                avgBrake: avgBrake2
            }
        };
    }

    /**
     * Calculate throttle application percentage
     */
    private calculateAverageThrottle(frames: TelemetryFrame[]): number {
        if (frames.length === 0) return 0;
        const total = frames.reduce((sum, frame) => sum + frame.throttlePos, 0);
        return total / frames.length;
    }

    /**
     * Calculate brake application percentage
     */
    private calculateAverageBrake(frames: TelemetryFrame[]): number {
        if (frames.length === 0) return 0;
        const total = frames.reduce((sum, frame) => sum + frame.brakePos, 0);
        return total / frames.length;
    }

    /**
     * Find the point of minimum speed in a lap (typically apex of corners)
     */
    findMinimumSpeedPoints(frames: TelemetryFrame[], threshold: number = 80): SpeedPoint[] {
        const minPoints: SpeedPoint[] = [];

        for (let i = 1; i < frames.length - 1; i++) {
            const prev = frames[i - 1];
            const curr = frames[i];
            const next = frames[i + 1];

            // Local minimum: speed lower than neighbors and below threshold
            if (curr.speed < prev.speed && curr.speed < next.speed && curr.speed < threshold) {
                minPoints.push({
                    timestamp: curr.timestamp,
                    speed: curr.speed,
                    latitude: curr.gpsLatitude,
                    longitude: curr.gpsLongitude
                });
            }
        }

        return minPoints;
    }

    /**
     * Calculate total distance where the driver was on throttle
     * Useful for understanding racing line efficiency
     */
    calculateThrottleDistance(frames: TelemetryFrame[]): number {
        let throttleTime = 0;

        for (let i = 1; i < frames.length; i++) {
            const curr = frames[i];
            const prev = frames[i - 1];

            if (curr.isAccelerating) {
                const timeDelta = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000; // seconds
                const avgSpeed = (curr.speed + prev.speed) / 2; // km/h
                const distance = (avgSpeed * timeDelta) / 3600; // km
                throttleTime += distance;
            }
        }

        return throttleTime;
    }
}

export interface BrakingPoint {
    timestamp: Date;
    speed: number;
    brakePos: number;
    latitude: number;
    longitude: number;
}

export interface SpeedPoint {
    timestamp: Date;
    speed: number;
    latitude: number;
    longitude: number;
}

export interface LapComparison {
    speedDelta: number;
    throttleDelta: number;
    brakeDelta: number;
    lap1Stats: {
        avgSpeed: number;
        avgThrottle: number;
        avgBrake: number;
    };
    lap2Stats: {
        avgSpeed: number;
        avgThrottle: number;
        avgBrake: number;
    };
}
