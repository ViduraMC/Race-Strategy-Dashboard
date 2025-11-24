import { ITelemetryRepository } from '@/domain/repositories/ITelemetryRepository';
import { TelemetryFrame } from '@/domain/entities/TelemetryFrame';

/**
 * LRU Cache for Telemetry Data
 * Implements Least Recently Used eviction policy.
 * 
 * Design Pattern: Decorator Pattern (wraps TelemetryRepository with caching)
 * Data Structure: Map + Doubly-Linked List for LRU
 * Algorithm: O(1) get/set operations
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles caching
 * - Open/Closed: Extends functionality without modifying repository
 */
export class TelemetryCache implements ITelemetryRepository {
    private readonly repository: ITelemetryRepository;
    private readonly cache: Map<string, CacheEntry>;
    private readonly maxSize: number;
    private head: CacheNode | null = null;
    private tail: CacheNode | null = null;

    constructor(repository: ITelemetryRepository, maxSize: number = 100) {
        this.repository = repository;
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * Get telemetry with caching
     * Complexity: O(1) for cache hit, O(n) for cache miss
     */
    async getTelemetryByVehicleAndLap(
        vehicleId: string,
        lap: number
    ): Promise<TelemetryFrame[]> {
        const key = `${vehicleId}-${lap}`;

        // Check cache
        if (this.cache.has(key)) {
            this.moveToFront(key);
            return this.cache.get(key)!.data;
        }

        // Cache miss - fetch from repository
        const data = await this.repository.getTelemetryByVehicleAndLap(vehicleId, lap);

        // Add to cache
        this.set(key, data);

        return data;
    }

    /**
     * Get telemetry by time range (not cached due to variable parameters)
     */
    async getTelemetryByTimeRange(
        vehicleId: string,
        startTime: Date,
        endTime: Date
    ): Promise<TelemetryFrame[]> {
        return this.repository.getTelemetryByTimeRange(vehicleId, startTime, endTime);
    }

    async getAllVehicleIds(): Promise<string[]> {
        return this.repository.getAllVehicleIds();
    }

    async getMaxLapNumber(vehicleId: string): Promise<number> {
        return this.repository.getMaxLapNumber(vehicleId);
    }

    async saveTelemetry(frames: TelemetryFrame[]): Promise<void> {
        // Clear cache when new data is saved
        this.cache.clear();
        this.head = null;
        this.tail = null;

        return this.repository.saveTelemetry(frames);
    }

    async clear(): Promise<void> {
        this.cache.clear();
        this.head = null;
        this.tail = null;

        return this.repository.clear();
    }

    /**
     * Set cache entry with LRU eviction
     * Algorithm: LRU with doubly-linked list
     * Complexity: O(1)
     */
    private set(key: string, data: TelemetryFrame[]): void {
        // If key exists, remove it first
        if (this.cache.has(key)) {
            this.remove(key);
        }

        // If cache is full, evict LRU entry
        if (this.cache.size >= this.maxSize && this.tail) {
            this.cache.delete(this.tail.key);
            this.removeTail();
        }

        // Create new node and add to front
        const node: CacheNode = { key, prev: null, next: null };
        this.cache.set(key, { data, node });
        this.addToFront(node);
    }

    /**
     * Move accessed node to front (most recently used)
     */
    private moveToFront(key: string): void {
        const entry = this.cache.get(key);
        if (!entry) return;

        const node = entry.node;

        // Remove from current position
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;

        if (node === this.tail) this.tail = node.prev;

        // Add to front
        this.addToFront(node);
    }

    /**
     * Add node to front of list
     */
    private addToFront(node: CacheNode): void {
        node.next = this.head;
        node.prev = null;

        if (this.head) this.head.prev = node;
        this.head = node;

        if (!this.tail) this.tail = node;
    }

    /**
     * Remove node from list
     */
    private remove(key: string): void {
        const entry = this.cache.get(key);
        if (!entry) return;

        const node = entry.node;

        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;

        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;
    }

    /**
     * Remove tail node (least recently used)
     */
    private removeTail(): void {
        if (!this.tail) return;

        if (this.tail.prev) {
            this.tail.prev.next = null;
            this.tail = this.tail.prev;
        } else {
            this.head = null;
            this.tail = null;
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            utilizationPercent: (this.cache.size / this.maxSize) * 100
        };
    }
}

interface CacheEntry {
    data: TelemetryFrame[];
    node: CacheNode;
}

interface CacheNode {
    key: string;
    prev: CacheNode | null;
    next: CacheNode | null;
}

interface CacheStats {
    size: number;
    maxSize: number;
    utilizationPercent: number;
}
