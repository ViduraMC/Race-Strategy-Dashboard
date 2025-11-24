'use client';

import React, { useEffect, useRef } from 'react';
import { useTelemetry } from '@/presentation/hooks/useTelemetry';

/**
 * TrackMap Component
 * Visualizes the racing track with car position marker.
 * 
 * Design Pattern: Observer Pattern (subscribes to telemetry updates)
 * OOP: Component composition
 */
export default function TrackMap() {
    const { selectedTelemetry } = useTelemetry();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || selectedTelemetry.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Extract GPS coordinates
        const coordinates = selectedTelemetry.map(frame => ({
            lat: frame.gpsLatitude,
            lng: frame.gpsLongitude,
            speed: frame.speed
        }));

        if (coordinates.length === 0) return;

        // Calculate bounds
        const lats = coordinates.map(c => c.lat);
        const lngs = coordinates.map(c => c.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Scale to canvas
        const padding = 40;
        const scaleX = (canvas.width - 2 * padding) / (maxLng - minLng);
        const scaleY = (canvas.height - 2 * padding) / (maxLat - minLat);
        const scale = Math.min(scaleX, scaleY);

        const toCanvasX = (lng: number) => padding + (lng - minLng) * scale;
        const toCanvasY = (lat: number) => canvas.height - padding - (lat - minLat) * scale;

        // Draw track line with speed gradient
        for (let i = 1; i < coordinates.length; i++) {
            const prev = coordinates[i - 1];
            const curr = coordinates[i];

            // Color based on speed (gradient from blue to red)
            const speedRatio = curr.speed / 200; // Normalize to max ~200 km/h
            const hue = 240 - (speedRatio * 240); // Blue (240) to Red (0)
            ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(toCanvasX(prev.lng), toCanvasY(prev.lat));
            ctx.lineTo(toCanvasX(curr.lng), toCanvasY(curr.lat));
            ctx.stroke();
        }

        // Draw start/finish marker
        const start = coordinates[0];
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(toCanvasX(start.lng), toCanvasY(start.lat), 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add legend
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Speed:', 10, 20);

        // Speed gradient legend
        const gradientWidth = 100;
        const gradient = ctx.createLinearGradient(70, 10, 70 + gradientWidth, 10);
        gradient.addColorStop(0, 'hsl(240, 80%, 50%)'); // Low speed (blue)
        gradient.addColorStop(1, 'hsl(0, 80%, 50%)');   // High speed (red)

        ctx.fillStyle = gradient;
        ctx.fillRect(70, 10, gradientWidth, 15);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(70, 10, gradientWidth, 15);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Low', 70, 40);
        ctx.fillText('High', 140, 40);

    }, [selectedTelemetry]);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Track Map</h3>
            {selectedTelemetry.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                    <p className="text-zinc-500">Select a lap to view track map</p>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-auto bg-zinc-800 rounded"
                />
            )}
        </div>
    );
}
