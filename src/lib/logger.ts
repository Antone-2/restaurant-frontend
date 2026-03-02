// Frontend logging utility with levels and persistence
// Provides structured logging with optional localStorage persistence

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    stack?: string;
}

class Logger {
    private level: LogLevel;
    private logs: LogEntry[] = [];
    private maxLogs = 100;
    private storageKey = 'app_logs';

    constructor() {
        // Default to DEBUG in development, INFO in production
        this.level = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch {
            // Ignore storage errors
        }
    }

    private saveToStorage(): void {
        try {
            // Keep only recent logs
            const toSave = this.logs.slice(-this.maxLogs);
            localStorage.setItem(this.storageKey, JSON.stringify(toSave));
        } catch {
            // Ignore storage errors
        }
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (level < this.level) return;

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
        };

        // Add stack trace for errors
        if (level === LogLevel.ERROR) {
            entry.stack = new Error().stack;
        }

        this.logs.push(entry);
        this.saveToStorage();

        // Console output with styling
        const styles = {
            [LogLevel.DEBUG]: 'color: #6c757d; font-size: 12px;',
            [LogLevel.INFO]: 'color: #0dcaf0; font-weight: bold;',
            [LogLevel.WARN]: 'color: #ffc107; font-weight: bold;',
            [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold;',
        };

        const levelName = LogLevel[level];

        console.group(`%c[${levelName}] ${message}`, styles[level]);
        if (context) {
            console.log('Context:', context);
        }
        if (entry.stack) {
            console.log('Stack:', entry.stack);
        }
        console.groupEnd();
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context);
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    clearLogs(): void {
        this.logs = [];
        localStorage.removeItem(this.storageKey);
    }

    // Export logs for debugging
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    // Report to error tracking service (placeholder for Sentry, etc.)
    reportError(error: Error, context?: Record<string, unknown>): void {
        this.error(error.message, {
            ...context,
            name: error.name,
            stack: error.stack,
        });

        // Here you could add integration with error tracking services
        if (!import.meta.env.DEV) {
            // Example: Sentry.captureException(error, { extra: context });
        }
    }
}

// Singleton instance
export const logger = new Logger();

// React hook for logging
export function useLogger() {
    return logger;
}

export default logger;
