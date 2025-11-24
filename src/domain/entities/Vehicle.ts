/**
 * Domain Entity: Vehicle
 * Represents a racing vehicle with its identity and metadata.
 * 
 * OOP Principles Applied:
 * - Encapsulation: Private fields with controlled access
 * - Immutability: Readonly properties
 * - Value Object Pattern: Represents vehicle identity
 */
export class Vehicle {
    private readonly _chassis: string;
    private readonly _carNumber: number;
    private readonly _id: string;

    constructor(data: VehicleData) {
        if (!data.chassis || data.chassis.trim() === '') {
            throw new Error('Chassis number is required');
        }
        if (data.carNumber < 0) {
            throw new Error('Car number must be non-negative');
        }

        this._chassis = data.chassis;
        this._carNumber = data.carNumber;
        // Composite ID: chassis-carNumber
        this._id = `${data.chassis}-${data.carNumber}`;
    }

    get chassis(): string { return this._chassis; }
    get carNumber(): number { return this._carNumber; }
    get id(): string { return this._id; }

    /**
     * Business Logic: Check if car number is assigned
     * In the dataset, car number 000 means unassigned
     */
    get isNumberAssigned(): boolean {
        return this._carNumber !== 0;
    }

    /**
     * Equality check based on chassis (unique identifier)
     */
    equals(other: Vehicle): boolean {
        return this._chassis === other._chassis;
    }

    toJSON(): VehicleData {
        return {
            chassis: this._chassis,
            carNumber: this._carNumber
        };
    }

    toString(): string {
        return `Vehicle(chassis=${this._chassis}, number=#${this._carNumber})`;
    }
}

export interface VehicleData {
    chassis: string;
    carNumber: number;
}
