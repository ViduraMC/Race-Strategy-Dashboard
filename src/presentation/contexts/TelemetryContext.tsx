'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';
import { Lap } from '@/domain/entities/Lap';

/**
 * Telemetry Context
 * Global state management for telemetry and lap data.
 * 
 * Design Pattern: Observer/Pub-Sub Pattern (React Context API)
 * State Management: Immutable state updates
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages telemetry state only
 */

interface TelemetryContextState {
    // Data
    telemetryData: Map<string, TelemetryFrame[]>; // vehicleId-lap -> frames
    lapData: Map<string, Lap[]>; // vehicleId -> laps

    // Selection state
    selectedVehicleId: string | null;
    selectedLap: number | null;
    comparisonVehicleId: string | null;
    comparisonLap: number | null;

    // Loading state
    isLoading: boolean;
    loadingProgress: number;

    // Actions
    setTelemetryData: (vehicleId: string, lap: number, frames: TelemetryFrame[]) => void;
    setLapData: (vehicleId: string, laps: Lap[]) => void;
    selectVehicleAndLap: (vehicleId: string, lap: number) => void;
    setComparisonLap: (vehicleId: string, lap: number) => void;
    clearComparison: () => void;
    setLoading: (loading: boolean, progress?: number) => void;
    clearAllData: () => void;
}

const TelemetryContext = createContext<TelemetryContextState | undefined>(undefined);

interface TelemetryProviderProps {
    children: React.ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
    // State
    const [telemetryData, setTelemetryDataState] = useState<Map<string, TelemetryFrame[]>>(new Map());
    const [lapData, setLapDataState] = useState<Map<string, Lap[]>>(new Map());
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [selectedLap, setSelectedLap] = useState<number | null>(null);
    const [comparisonVehicleId, setComparisonVehicleId] = useState<string | null>(null);
    const [comparisonLap, setComparisonLap] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Actions
    const setTelemetryData = useCallback((vehicleId: string, lap: number, frames: TelemetryFrame[]) => {
        const key = `${vehicleId}-${lap}`;
        setTelemetryDataState(prev => {
            const newMap = new Map(prev); // Immutable update
            newMap.set(key, frames);
            return newMap;
        });
    }, []);

    const setLapData = useCallback((vehicleId: string, laps: Lap[]) => {
        setLapDataState(prev => {
            const newMap = new Map(prev);
            newMap.set(vehicleId, laps);
            return newMap;
        });
    }, []);

    const selectVehicleAndLap = useCallback((vehicleId: string, lap: number) => {
        setSelectedVehicleId(vehicleId);
        setSelectedLap(lap);
    }, []);

    const setComparisonLapHandler = useCallback((vehicleId: string, lap: number) => {
        setComparisonVehicleId(vehicleId);
        setComparisonLap(lap);
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonVehicleId(null);
        setComparisonLap(null);
    }, []);

    const setLoading = useCallback((loading: boolean, progress: number = 0) => {
        setIsLoading(loading);
        setLoadingProgress(progress);
    }, []);

    const clearAllData = useCallback(() => {
        setTelemetryDataState(new Map());
        setLapDataState(new Map());
        setSelectedVehicleId(null);
        setSelectedLap(null);
        setComparisonVehicleId(null);
        setComparisonLap(null);
        setLoadingProgress(0);
    }, []);

    const value: TelemetryContextState = {
        telemetryData,
        lapData,
        selectedVehicleId,
        selectedLap,
        comparisonVehicleId,
        comparisonLap,
        isLoading,
        loadingProgress,
        setTelemetryData,
        setLapData,
        selectVehicleAndLap,
        setComparisonLap: setComparisonLapHandler,
        clearComparison,
        setLoading,
        clearAllData
    };

    return (
        <TelemetryContext.Provider value={value}>
            {children}
        </TelemetryContext.Provider>
    );
}

/**
 * Hook to access telemetry context
 * Throws error if used outside provider
 */
export function useTelemetryContext() {
    const context = useContext(TelemetryContext);
    if (!context) {
        throw new Error('useTelemetryContext must be used within a TelemetryProvider');
    }
    return context;
}
