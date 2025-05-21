// LogViewer.tsx - with proper console ordering (newest at bottom)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Logger, LogEntry, LogLevel } from './Logger'; // Adjust import path as needed

interface LogViewerProps {
    maxHeight?: number;
    showControls?: boolean;
    category?: string;
}

interface LogLevelFilter {
    debug: boolean;
    info: boolean;
    warn: boolean;
    error: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({
    maxHeight,
    showControls = true,
    category
}) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [levelFilter, setLevelFilter] = useState<LogLevelFilter>({
        debug: true,
        info: true,
        warn: true,
        error: true
    });
    const [isPaused, setIsPaused] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const loadLogs = () => {
        if (isPaused) return; // Don't update if paused

        const filteredLogs = Logger.getLogs().filter(log => {
            // Filter by selected log levels
            if (!levelFilter[log.level]) return false;
            // Filter by tag if specified
            if (category && log.category !== category) return false;
            return true;
        });

        setLogs(filteredLogs);

        // Scroll to bottom if auto-scroll is enabled
        if (autoScroll && filteredLogs.length > 0) {
            // Use setTimeout to ensure this runs after render
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    useEffect(() => {
        // Load logs immediately on mount or filter change
        loadLogs();

        // Set up listener for log changes
        const removeListener = Logger.addChangeListener(() => {
            loadLogs();
        });

        // Clean up listener on unmount
        return () => {
            removeListener();
        };
    }, [levelFilter, isPaused, category, autoScroll]);

    const renderLogItem = ({ item }: { item: LogEntry }) => {
        const logColor = getLogLevelColor(item.level);

        return (
            <View className="p-2 my-1 bg-surface rounded">
                <View style={{ borderLeftColor: logColor, borderLeftWidth: 4 }} className="pl-2">
                    <Text className="text-xs font-mono text-on-surface-variant">
                        {formatTimestamp(item.timestamp)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Text className="text-xs font-bold mr-2" style={{ color: logColor }}>
                            {item.level.toUpperCase()}
                        </Text>
                        {item.category && (
                            <Text className="text-xs font-bold" style={{ color: logColor }}>
                                {item.category}
                            </Text>
                        )}
                    </View>
                    <Text className="text-sm mt-1 text-on-surface">{item.message}</Text>
                    {item.data && (
                        <Text className="text-xs font-mono mt-1 p-1 bg-background rounded text-on-background">
                            {typeof item.data === 'object'
                                ? JSON.stringify(item.data, null, 2)
                                : String(item.data)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    const getLogLevelColor = (level: LogLevel): string => {
        switch (level) {
            case 'debug': return '#9e9e9e'; // unknown for now
            case 'info': return '#625fff';  // primary
            case 'warn': return '#efb100';  // warning
            case 'error': return '#BA1A1A'; // error
            default: return '#1A1D21';      // on-background
        }
    };

    const formatTimestamp = (date: Date): string => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    };

    const clearLogs = () => {
        Logger.clearLogs();
        console.log("logs cleared");
    };

    const toggleLevel = (level: LogLevel) => {
        setLevelFilter(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
        console.log(`log updates ${isPaused ? 'resumed' : 'paused'}`);
    };

    const toggleAutoScroll = () => {
        setAutoScroll(!autoScroll);
        console.log(`auto scroll ${!autoScroll ? 'enabled' : 'disabled'}`);

        // If enabling auto-scroll, immediately scroll to bottom
        if (!autoScroll && logs.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    // Apply container style with optional maxHeight
    const containerStyle = maxHeight ? { maxHeight } : { flex: 1 };

    return (
        <View
            className="border border-outline-variant rounded-lg overflow-hidden bg-background"
            style={containerStyle}
        >
            {showControls && (
                <View className="p-2 bg-surface border-b border-outline-variant">
                    <View className="flex-row mb-2">
                        <TouchableOpacity
                            className={`px-2 py-1 mr-1 rounded border ${levelFilter.debug ? 'bg-unknown' : 'border-outline'}`}
                            onPress={() => toggleLevel('debug')}
                        >
                            <Text className={`text-xs font-bold ${levelFilter.debug ? 'text-on-primary' : 'text-on-surface'}`}>DEBUG</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-2 py-1 mr-1 rounded border ${levelFilter.info ? 'bg-primary' : 'border-outline'}`}
                            onPress={() => toggleLevel('info')}
                        >
                            <Text className={`text-xs font-bold ${levelFilter.info ? 'text-on-primary' : 'text-on-surface'}`}>INFO</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-2 py-1 mr-1 rounded border ${levelFilter.warn ? 'bg-warning' : 'border-outline'}`}
                            onPress={() => toggleLevel('warn')}
                        >
                            <Text className={`text-xs font-bold ${levelFilter.warn ? 'text-on-warning' : 'text-on-surface'}`}>WARN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-2 py-1 mr-1 rounded border ${levelFilter.error ? 'bg-error' : 'border-outline'}`}
                            onPress={() => toggleLevel('error')}
                        >
                            <Text className={`text-xs font-bold ${levelFilter.error ? 'text-on-error' : 'text-on-surface'}`}>ERROR</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-end">
                        <TouchableOpacity
                            className={`px-3 py-2 mx-1 rounded border ${autoScroll ? 'bg-primary' : 'border-outline'}`}
                            onPress={toggleAutoScroll}
                        >
                            <Text className={`text-xs font-bold ${autoScroll ? 'text-on-primary' : 'text-on-surface'}`}>
                                Auto-scroll {autoScroll ? 'ON' : 'OFF'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`px-3 py-2 mx-1 rounded ${isPaused ? 'bg-success' : 'bg-error'}`}
                            onPress={togglePause}
                        >
                            <Text className={`text-xs font-bold ${isPaused ? 'text-on-success' : 'text-on-error'}`}>
                                {isPaused ? 'Resume' : 'Pause'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="px-3 py-2 mx-1 rounded bg-error"
                            onPress={clearLogs}
                        >
                            <Text className="text-xs font-bold text-on-error">Clear</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {logs.length === 0 ? (
                <View className="p-5 items-center justify-center">
                    <Text className="text-on-surface-variant italic">No logs to display</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={logs} // Chronological order (oldest to newest)
                    renderItem={renderLogItem}
                    keyExtractor={(item, index) => `log-${index}-${item.timestamp.getTime()}`}
                    className="px-2"
                    onScrollBeginDrag={() => {
                        // Optional: Automatically disable auto-scroll when user manually scrolls
                        if (autoScroll) {
                            setAutoScroll(false);
                        }
                    }}
                    // Initial scroll to end for first render
                    onContentSizeChange={() => {
                        if (autoScroll) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                    onLayout={() => {
                        if (autoScroll) {
                            flatListRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                />
            )}
        </View>
    );
};

export default LogViewer;