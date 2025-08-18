import React from 'react';
import { Alert, AlertItem } from './Alert';

interface AlertContainerProps {
    alerts: AlertItem[];
    onDismiss: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onDismiss }) => {
    // Only show the topmost alert to prevent multiple modals
    const currentAlert = alerts[alerts.length - 1];

    if (!currentAlert) {
        return null;
    }

    return <Alert alert={currentAlert} onDismiss={onDismiss} />;
};