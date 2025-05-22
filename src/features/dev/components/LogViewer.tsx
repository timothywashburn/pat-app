import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Logger, LogEntry, LogLevel } from './Logger';

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
    const updateTimeoutRef = useRef<number | null>(null);

    const loadLogs = useCallback(() => {
        if (isPaused) return;

        const filteredLogs = Logger.getLogs().filter(log => {
            if (!levelFilter[log.level]) return false;
            if (category && log.category !== category) return false;
            return true;
        });

        setLogs(filteredLogs);
    }, [levelFilter, isPaused, category]);

    useEffect(() => {
        if (autoScroll && logs.length > 0) {
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [logs, autoScroll]);

    useEffect(() => {
        loadLogs();

        const handleLogChange = () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            updateTimeoutRef.current = setTimeout(() => {
                loadLogs();
            }, 0);
        };

        const removeListener = Logger.addChangeListener(handleLogChange);

        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            removeListener();
        };
    }, [loadLogs]);

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
            case 'debug': return '#9e9e9e';
            case 'info': return '#625fff';
            case 'warn': return '#efb100';
            case 'error': return '#BA1A1A';
            default: return '#1A1D21';
        }
    };

    const formatTimestamp = (date: Date): string => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    };

    const clearLogs = useCallback(() => {
        Logger.clearLogs();
        console.log("logs cleared");
    }, []);

    const toggleLevel = useCallback((level: LogLevel) => {
        setLevelFilter(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => {
            const newPaused = !prev;
            console.log(`log updates ${prev ? 'resumed' : 'paused'}`);
            return newPaused;
        });
    }, []);

    const toggleAutoScroll = useCallback(() => {
        setAutoScroll(prev => {
            const newAutoScroll = !prev;
            console.log(`auto scroll ${newAutoScroll ? 'enabled' : 'disabled'}`);
            return newAutoScroll;
        });
    }, []);

    const handleScrollBeginDrag = useCallback(() => {
        if (autoScroll) {
            setAutoScroll(false);
        }
    }, [autoScroll]);

    const handleContentSizeChange = useCallback(() => {
        if (autoScroll && logs.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
        }
    }, [autoScroll, logs.length]);

    const handleLayout = useCallback(() => {
        if (autoScroll && logs.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
        }
    }, [autoScroll, logs.length]);

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
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={(item, index) => `log-${index}-${item.timestamp.getTime()}`}
                    className="px-2"
                    onScrollBeginDrag={handleScrollBeginDrag}
                    onContentSizeChange={handleContentSizeChange}
                    onLayout={handleLayout}
                />
            )}
        </View>
    );
};

export default LogViewer;