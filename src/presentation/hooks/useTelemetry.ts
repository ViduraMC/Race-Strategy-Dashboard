'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTelemetryContext } from '@/presentation/contexts/TelemetryContext';
import { RepositoryFactory } from '@/infrastructure/factories/RepositoryFactory';
import { GetVehicleTelemetry } from '@/application/use-cases/GetVehicleTelemetry';
import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';

/**
 * Custom Hook: useTelemetry
 * Provides facade for accessing telemetry data.
 * 
 * Design Pattern: Facade Pattern
 * Purpose: Simplifies complex interactions with repositories and use cases
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages telemetry access logic
 */
export function useTelemetry() {
    const context = useTelemetryContext();
    const [error, setError] = useState<string | null>(null);

    /**
     * Load telemetry for a specific vehicle and lap
     */
    const loadTelemetry = useCallback(async (vehicleId: string, lap: number): Promise<TelemetryFrame[] | null> => {
        try {
            setError(null);
            context.setLoading(true);

            // Check if already loaded
            const key = `${vehicleId}-${lap}`;
            const cached = context.telemetryData.get(key);
            if (cached) {
                context.setLoading(false);
                return cached;
            }

            // Load from repository
            const repository = RepositoryFactory.getTelemetryRepository();
            const useCase = new GetVehicleTelemetry(repository);
            const frames = await useCase.execute(vehicleId, lap);

            // Store in context
            context.setTelemetryData(vehicleId, lap, frames);
            context.setLoading(false);

            return frames;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load telemetry';
            setError(message);
            context.setLoading(false);
            return null;
        }
    }, [context]);

    /**
     * Get telemetry for selected vehicle/lap
     */
    const getSelectedTelemetry = useCallback((): TelemetryFrame[] => {
        if (!context.selectedVehicleId || context.selectedLap === null) {
            return [];
        }

        const key = `${context.selectedVehicleId}-${context.selectedLap}`;
        return context.telemetryData.get(key) || [];
    }, [context.selectedVehicleId, context.selectedLap, context.telemetryData]);

    /**
     * Get telemetry for comparison vehicle/lap
     */
    const getComparisonTelemetry = useCallback((): TelemetryFrame[] => {
        if (!context.comparisonVehicleId || context.comparisonLap === null) {
            return [];
        }

        const key = `${context.comparisonVehicleId}-${context.comparisonLap}`;
        return context.telemetryData.get(key) || [];
    }, [context.comparisonVehicleId, context.comparisonLap, context.telemetryData]);

    return {
        // Data
        selectedTelemetry: getSelectedTelemetry(),
        comparisonTelemetry: getComparisonTelemetry(),
        allVehicleIds: Array.from(context.lapData.keys()),

        // State
        selectedVehicleId: context.selectedVehicleId,
        selectedLap: context.selectedLap,
        comparisonVehicleId: context.comparisonVehicleId,
        comparisonLap: context.comparisonLap,
        isLoading: context.isLoading,
        loadingProgress: context.loadingProgress,
        error,

        // Actions
        loadTelemetry,
        selectVehicleAndLap: context.selectVehicleAndLap,
        setComparisonLap: context.setComparisonLap,
        clearComparison: context.clearComparison,
        clearAllData: context.clearAllData
    };
}
