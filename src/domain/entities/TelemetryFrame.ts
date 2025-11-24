/**
 * Domain Entity: TelemetryFrame
 * Represents a single telemetry data point from the racing dataset.
 * 
 * OOP Principles Applied:
 * - Encapsulation: Private fields with public getters
 * - Immutability: No setters, readonly properties
 * - Validation: Constructor ensures data integrity
 */
export class TelemetryFrame {
  private readonly _timestamp: Date;
  private readonly _vehicleId: string;
  private readonly _lap: number;
  private readonly _speed: number; // km/h
  private readonly _throttlePos: number; // 0-100%
  private readonly _brakePos: number; // 0-100%
  private readonly _gpsLatitude: number;
  private readonly _gpsLongitude: number;
  private readonly _steeringAngle?: number;
  private readonly _gear?: number;

  constructor(data: TelemetryFrameData) {
    // Validation
    if (!data.timestamp || isNaN(new Date(data.timestamp).getTime())) {
      throw new Error('Invalid timestamp');
    }
    if (!data.vehicleId || data.vehicleId.trim() === '') {
      throw new Error('Vehicle ID is required');
    }
    if (data.lap < 0) {
      throw new Error('Lap number must be non-negative');
    }
    if (data.speed < 0) {
      throw new Error('Speed must be non-negative');
    }
    if (data.throttlePos < 0 || data.throttlePos > 100) {
      throw new Error('Throttle position must be between 0 and 100');
    }
    if (data.brakePos < 0 || data.brakePos > 100) {
      throw new Error('Brake position must be between 0 and 100');
    }

    this._timestamp = new Date(data.timestamp);
    this._vehicleId = data.vehicleId;
    this._lap = data.lap;
    this._speed = data.speed;
    this._throttlePos = data.throttlePos;
    this._brakePos = data.brakePos;
    this._gpsLatitude = data.gpsLatitude;
    this._gpsLongitude = data.gpsLongitude;
    this._steeringAngle = data.steeringAngle;
    this._gear = data.gear;
  }

  // Getters (Encapsulation)
  get timestamp(): Date { return this._timestamp; }
  get vehicleId(): string { return this._vehicleId; }
  get lap(): number { return this._lap; }
  get speed(): number { return this._speed; }
  get throttlePos(): number { return this._throttlePos; }
  get brakePos(): number { return this._brakePos; }
  get gpsLatitude(): number { return this._gpsLatitude; }
  get gpsLongitude(): number { return this._gpsLongitude; }
  get steeringAngle(): number | undefined { return this._steeringAngle; }
  get gear(): number | undefined { return this._gear; }

  /**
   * Business Logic: Check if the driver is braking
   */
  get isBraking(): boolean {
    return this._brakePos > 5; // Threshold for braking
  }

  /**
   * Business Logic: Check if the driver is accelerating
   */
  get isAccelerating(): boolean {
    return this._throttlePos > 10 && this._brakePos < 5;
  }

  /**
   * Business Logic: Check if the driver is coasting
   */
  get isCoasting(): boolean {
    return !this.isBraking && !this.isAccelerating;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): TelemetryFrameData {
    return {
      timestamp: this._timestamp.toISOString(),
      vehicleId: this._vehicleId,
      lap: this._lap,
      speed: this._speed,
      throttlePos: this._throttlePos,
      brakePos: this._brakePos,
      gpsLatitude: this._gpsLatitude,
      gpsLongitude: this._gpsLongitude,
      steeringAngle: this._steeringAngle,
      gear: this._gear
    };
  }
}

/**
 * Data Transfer Interface for TelemetryFrame
 */
export interface TelemetryFrameData {
  timestamp: string | Date;
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
