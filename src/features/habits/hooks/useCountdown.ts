import { useState, useEffect, useRef } from 'react';
import { getTimeRemainingUntilRollover, TimeRemaining } from '@/src/features/habits/models';
import { useAppFocus } from '../../../hooks/useAppFocus';

export const useCountdown = (rolloverTime: string): TimeRemaining => {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => 
        getTimeRemainingUntilRollover(rolloverTime)
    );
    const intervalRef = useRef<number | null>(null);

    const updateTimeRemaining = () => {
        setTimeRemaining(getTimeRemainingUntilRollover(rolloverTime));
    };

    const startTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
            updateTimeRemaining();
        }, 1_000);
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        startTimer();
        
        return () => {
            stopTimer();
        };
    }, [rolloverTime]);

    useAppFocus(() => {
        updateTimeRemaining();
        startTimer();
    });

    return timeRemaining;
};