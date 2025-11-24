/**
 * Abstract Base Class: CSVParser
 * Template Method Pattern for CSV parsing operations.
 * 
 * Design Pattern: Template Method
 * - Defines the skeleton of the parsing algorithm
 * - Subclasses override specific steps
 * 
 * OOP Principles:
 * - Inheritance: Base class for all CSV parsers
 * - Polymorphism: Subclasses provide specific implementations
 * - Encapsulation: Protected methods for extension points
 */
export abstract class CSVParser<T> {
    /**
     * Template Method: Defines the parsing algorithm
     * Final method that cannot be overridden
     */
    async parse(filePath: string): Promise<T[]> {
        const rawData = await this.loadFile(filePath);
        const lines = this.splitIntoLines(rawData);
        const headers = this.extractHeaders(lines[0]);

        const results: T[] = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const parsed = this.parseLine(lines[i], headers);
                if (this.validate(parsed)) {
                    results.push(parsed);
                }
            } catch (error) {
                this.handleParseError(error, i);
            }
        }

        return results;
    }

    /**
     * Load file content
     * Can be overridden for different loading strategies (streaming, chunked, etc.)
     */
    protected async loadFile(filePath: string): Promise<string> {
        if (typeof window === 'undefined') {
            // Node.js environment
            const fs = await import('fs/promises');
            return fs.readFile(filePath, 'utf-8');
        } else {
            // Browser environment
            const response = await fetch(filePath);
            return response.text();
        }
    }

    /**
     * Split raw data into lines
     */
    protected splitIntoLines(rawData: string): string[] {
        return rawData.split(/\r?\n/).filter(line => line.trim() !== '');
    }

    /**
     * Extract headers from the first line
     * Abstract method: Must be implemented by subclasses
     */
    protected abstract extractHeaders(headerLine: string): string[];

    /**
     * Parse a single line into the target type
     * Abstract method: Must be implemented by subclasses
     */
    protected abstract parseLine(line: string, headers: string[]): T;

    /**
     * Validate parsed data
     * Hook method: Can be overridden by subclasses for custom validation
     */
    protected validate(data: T): boolean {
        return data !== null && data !== undefined;
    }

    /**
     * Handle parse errors
     * Hook method: Can be overridden for custom error handling
     */
    protected handleParseError(error: unknown, lineNumber: number): void {
        console.warn(`Parse error at line ${lineNumber}:`, error);
    }
}
