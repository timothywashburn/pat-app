import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/src/components/CustomHeader';
import { ModuleType } from "@timothyw/pat-common";

export const TasksPanel: React.FC = () => {

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                moduleType={ModuleType.TASKS}
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('add task tapped');
                }}
            />

            <View className="flex-1 items-center justify-center p-5">
                <Text className="text-on-background text-2xl font-bold mb-5">Tasks Module</Text>
                <Text className="text-on-background-variant">This will be the Tasks module for managing tasks</Text>
            </View>
        </SafeAreaView>
    );
}

export default TasksPanel;