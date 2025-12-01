import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DetailViewHeader from '@/src/components/headers/DetailViewHeader';
import LogViewer from './LogViewer';
import DevPanelSection from './DevPanelSection';

interface LogViewerSectionProps {
    setPanelVisible: (visible: boolean) => void;
}

const LogViewerSection: React.FC<LogViewerSectionProps> = ({
    setPanelVisible,
}) => {
    const openLogViewer = () => {
        setPanelVisible(true);
        console.log("log viewer opened");
    };

    return (
        <DevPanelSection title="Application Logs">
            <TouchableOpacity
                className={`bg-primary h-[50px] rounded-lg justify-center items-center mt-2.5`}
                onPress={openLogViewer}
            >
                <Text className="text-on-primary text-base font-semibold">View Application Logs</Text>
            </TouchableOpacity>
        </DevPanelSection>
    );
};

export default LogViewerSection;