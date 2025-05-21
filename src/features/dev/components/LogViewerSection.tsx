import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import LogViewer from './LogViewer'; // Adjust import path as needed
import { useTheme } from '@/src/controllers/ThemeManager';
import DevPanelSection from './DevPanelSection';

const LogViewerSection: React.FC = () => {
    const { getColor } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const openLogViewer = () => {
        setIsLoading(true);
        setModalVisible(true);
        console.log("log viewer opened");
        // Simulate loading logs
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const closeLogViewer = () => {
        setModalVisible(false);
        console.log("log viewer closed");
    };

    return (
        <DevPanelSection title="Application Logs">
            <TouchableOpacity
                className={`h-[50px] rounded-lg justify-center items-center mt-2.5 ${
                    isLoading ? "bg-error" : "bg-primary"
                }`}
                onPress={openLogViewer}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={getColor("on-primary")} />
                ) : (
                    <Text className="text-on-primary text-base font-semibold">View Application Logs</Text>
                )}
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={closeLogViewer}
            >
                <SafeAreaView className="flex-1 bg-background">
                    <StatusBar barStyle="dark-content" />

                    <View className="flex-row justify-between items-center p-4 border-b border-outline-variant/20">
                        <Text className="text-xl font-bold text-on-background">Application Logs</Text>
                        <TouchableOpacity
                            className="px-3 py-1.5 rounded-lg bg-primary"
                            onPress={closeLogViewer}
                        >
                            <Text className="text-on-primary font-medium">Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="px-4 pt-2 flex-1">
                        <LogViewer maxHeight={undefined} />
                    </View>
                </SafeAreaView>
            </Modal>
        </DevPanelSection>
    );
};

export default LogViewerSection;