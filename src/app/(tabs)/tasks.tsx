import React from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { useToast } from '@/src/components/toast';

export default function TasksPanel() {
    const { colorScheme } = useTheme();
    const { showToast } = useToast();

    const shortMessage = "Short toast message";
    const mediumMessage = "This is a medium length toast message that spans about two lines when displayed properly";
    const longMessage = "This is a much longer toast message that will definitely need to wrap to multiple lines. It contains a lot of text to show how the toast component handles varying content sizes and ensures proper spacing between multiple stacked toasts with different heights.";

    return (
        <SafeAreaView className="bg-background flex-1">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped');
                    showToast({
                        message: mediumMessage,
                        type: 'info',
                        duration: 3000,
                        position: 'bottom'
                    });
                }}
            />

            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-on-background text-2xl font-bold mb-5">Tasks Panel</Text>
                <Text className="text-on-background-variant mb-5">This will be the Tasks panel for managing tasks</Text>

                <View className="flex-row flex-wrap justify-center">
                    <TouchableOpacity
                        className="bg-primary m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: shortMessage,
                            type: 'info',
                            position: 'top',
                            duration: 5000
                        })}
                    >
                        <Text className="text-white">Short Toast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-primary m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: mediumMessage,
                            type: 'info',
                            position: 'top',
                            duration: 5000
                        })}
                    >
                        <Text className="text-white">Medium Toast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-primary m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: longMessage,
                            type: 'info',
                            position: 'top',
                            duration: 5000
                        })}
                    >
                        <Text className="text-white">Long Toast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-error m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: "Error toast message",
                            type: 'error',
                            position: 'bottom',
                            duration: 5000
                        })}
                    >
                        <Text className="text-white">Error Toast</Text>
                    </TouchableOpacity>

                    {/* New action toast buttons */}
                    <TouchableOpacity
                        className="bg-yellow-500 m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: "Warning: Some tasks were not synced. ajwioefjioa wejfioj aweiofj ioawejfoiawej foiawej ofij awoefj oiawjef oi",
                            type: 'warning',
                            position: 'bottom',
                            duration: 5000,
                            actionLabel: 'Sync',
                            onActionPress: () => Alert.alert('Sync', 'Syncing tasks...')
                        })}
                    >
                        <Text className="text-white">Warning Toast + Action</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-green-500 m-2 p-3 rounded-lg"
                        onPress={() => showToast({
                            message: "Task completed successfully",
                            type: 'success',
                            position: 'bottom',
                            duration: 5000,
                            actionLabel: 'Undo',
                            onActionPress: () => Alert.alert('Undo', 'Undoing task completion...')
                        })}
                    >
                        <Text className="text-white">Success Toast + Action</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}