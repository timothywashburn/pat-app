import React from 'react';
import { Text, View } from 'react-native';
import { formatTimeRemaining } from '@/src/features/habits/models';
import { useTheme } from '@/src/context/ThemeContext';
import { useCountdown } from '@/src/features/habits/hooks/useCountdown';

interface TimeRemainingIndicatorProps {
    rolloverTime: string;
}

const TimeRemainingIndicator: React.FC<TimeRemainingIndicatorProps> = ({ 
    rolloverTime,
}) => {
    const { getColor } = useTheme();
    const timeRemaining = useCountdown(rolloverTime);

    const interpolateColor = (color1: string, color2: string, factor: number): string => {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const getBarStyle = () => {
        const percentage = timeRemaining.percentage;

        if (percentage <= 70) {
            return { backgroundColor: getColor('success') };
        } else if (percentage <= 80) {
            const gradientFactor = (percentage - 70) / 10;
            const gradientColor = interpolateColor(getColor('success'), getColor('warning'), gradientFactor);
            return { backgroundColor: gradientColor };
        } else if (percentage <= 90) {
            const gradientFactor = (percentage - 80) / 10;
            const gradientColor = interpolateColor(getColor('warning'), getColor('error'), gradientFactor);
            return { backgroundColor: gradientColor };
        } else {
            return { backgroundColor: getColor('error') };
        }
    };

    const getTextClassName = () => {
        if (timeRemaining.isOverdue) {
            return 'text-error';
        } else if (timeRemaining.totalMinutes < 60) {
            return 'text-secondary';
        } else {
            return 'text-on-surface-variant';
        }
    };

    return (
        <View className="flex-row items-center">
            <View className="flex-1 bg-outline-variant rounded-full h-2 mr-3">
                <View 
                    className="rounded-full h-2"
                    style={{ 
                        width: `${timeRemaining.percentage}%`,
                        ...getBarStyle()
                    }}
                />
            </View>
            <Text className={`text-xs ${getTextClassName()}`}>
                {formatTimeRemaining(timeRemaining)}
            </Text>
        </View>
    );
};

export default TimeRemainingIndicator;