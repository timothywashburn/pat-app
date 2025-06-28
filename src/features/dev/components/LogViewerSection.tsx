import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DetailViewHeader from '@/src/components/common/DetailViewHeader';
import LogViewer from './LogViewer';
import DevPanelSection from './DevPanelSection';

interface LogViewerSectionProps {
    panelVisible?: boolean;
    onOpenPanel?: () => void;
    onClosePanel?: () => void;
}

const LogViewerSection: React.FC<LogViewerSectionProps> = ({
    panelVisible = false,
    onOpenPanel,
    onClosePanel
}) => {
    const [internalPanelVisible, setInternalPanelVisible] = useState(false);

    const isVisible = panelVisible || internalPanelVisible;

    const openLogViewer = () => {
        if (onOpenPanel) {
            onOpenPanel();
        } else {
            setInternalPanelVisible(true);
        }
        console.log("log viewer opened");
    };

    const closeLogViewer = () => {
        if (onClosePanel) {
            onClosePanel();
        } else {
            setInternalPanelVisible(false);
        }
        console.log("log viewer closed");
    };

    if (isVisible) {
        return (
            <View
                className="bg-background absolute inset-0 z-50"
            >
                <DetailViewHeader
                    title="Application Logs"
                    onBack={closeLogViewer}
                    onEdit={() => {}}
                    showEdit={false}
                />

                <LogViewer maxHeight={undefined} fullScreen={true} />
            </View>
        );
    }

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