export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 'startup' | 'auth' | 'linking' | 'unclassified';

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: any;
}

type LogChangeListener = () => void;

export class Logger {
    private static logs: LogEntry[] = [];
    private static MAX_LOGS = 1000;
    private static listeners: LogChangeListener[] = [];

    static debug(category: LogCategory, message: string, data?: any): void {
        Logger.log('debug', category, message, data);
    }

    static info(category: LogCategory, message: string, data?: any): void {
        Logger.log('info', category, message, data);
    }

    static warn(category: LogCategory, message: string, data?: any): void {
        Logger.log('warn', category, message, data);
    }

    static error(category: LogCategory, message: string, data?: any): void {
        Logger.log('error', category, message, data);
    }

    static startTimer(category: LogCategory, label: string): () => number {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            Logger.info(category, `Timer ${label} completed in ${duration}ms`);
            return duration;
        };
    }

    static getLogs(): LogEntry[] {
        return [...Logger.logs];
    }

    static clearLogs(): void {
        Logger.logs = [];
        Logger.notifyListeners();
    }

    static filterLogs(options: { level?: LogLevel, category?: LogCategory }): LogEntry[] {
        return Logger.logs.filter(log => {
            if (options.level && log.level !== options.level) return false;
            if (options.category && log.category !== options.category) return false;
            return true;
        });
    }

    static addChangeListener(listener: LogChangeListener): () => void {
        Logger.listeners.push(listener);

        return () => {
            Logger.listeners = Logger.listeners.filter(l => l !== listener);
        };
    }

    private static notifyListeners(): void {
        Logger.listeners.forEach(listener => listener());
    }

    private static log(level: LogLevel, category: LogCategory, message: string, data?: any): void {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            category,
            message,
            data
        };

        Logger.logs.push(entry);
        if (Logger.logs.length > Logger.MAX_LOGS) {
            Logger.logs.shift();
        }

        Logger.notifyListeners();

        const timestamp = Logger.formatTimestamp(entry.timestamp);
        const prefix = `[${timestamp}] [${category}]`;

        switch (level) {
            case 'debug':
                console.log(prefix, message, data !== undefined ? data : '');
                break;
            case 'info':
                console.info(prefix, message, data !== undefined ? data : '');
                break;
            case 'warn':
                console.warn(prefix, message, data !== undefined ? data : '');
                break;
            case 'error':
                console.error(prefix, message, data !== undefined ? data : '');
                break;
        }
    }

    private static formatTimestamp(date: Date): string {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    }
}