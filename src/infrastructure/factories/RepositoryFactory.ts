import { ITelemetryRepository } from '@/domain/repositories/ITelemetryRepository';
import { ILapRepository } from '@/domain/repositories/ILapRepository';
import { TelemetryRepository } from '@/infrastructure/repositories/TelemetryRepository';
import { LapRepository } from '@/infrastructure/repositories/LapRepository';
import { TelemetryCache } from '@/infrastructure/cache/TelemetryCache';

/**
 * Repository Factory
 * Creates and configures repository instances.
 * 
 * Design Pattern: Factory Pattern
 * SOLID Principles:
 * - Dependency Injection support
 * - Single Responsibility: Only creates repositories
 */
export class RepositoryFactory {
    private static telemetryRepository: ITelemetryRepository | null = null;
    private static lapRepository: ILapRepository | null = null;

    /**
     * Get or create telemetry repository with caching
     * Singleton pattern for repository instances
     */
    static getTelemetryRepository(useCache: boolean = true): ITelemetryRepository {
        if (!this.telemetryRepository) {
            const baseRepository = new TelemetryRepository();

            if (useCache) {
                this.telemetryRepository = new TelemetryCache(baseRepository, 100);
            } else {
                this.telemetryRepository = baseRepository;
            }
        }

        return this.telemetryRepository;
    }

    /**
     * Get or create lap repository
     */
    static getLapRepository(): ILapRepository {
        if (!this.lapRepository) {
            this.lapRepository = new LapRepository();
        }

        return this.lapRepository;
    }

    /**
     * Reset all repositories (useful for testing)
     */
    static reset(): void {
        this.telemetryRepository = null;
        this.lapRepository = null;
    }
}
