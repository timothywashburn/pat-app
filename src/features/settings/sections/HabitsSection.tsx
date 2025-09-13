import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { MainStackParamList } from '@/src/navigation/MainStack';

interface HabitsSectionProps {
    editMode: boolean;
}

export const HabitsSection: React.FC<HabitsSectionProps> = ({
    editMode
}) => {
    const { getColor } = useTheme();
    const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Settings'>>();

    const handleHabitsEntityNotificationPress = () => {
        navigation.navigate('NotificationInfo', {
            targetEntityType: NotificationEntityType.HABIT_PANEL,
            targetId: 'habit_panel',
            targetLevel: NotificationTemplateLevel.ENTITY,
            entityName: 'Habit Panel'
        });
    };

    const handleHabitsParentNotificationPress = () => {
        navigation.navigate('NotificationInfo', {
            targetEntityType: NotificationEntityType.HABIT,
            targetId: 'habit',
            targetLevel: NotificationTemplateLevel.PARENT,
            entityName: 'Habits'
        });
    };

    return (
        <View className="mb-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-on-background text-lg font-bold">Habits</Text>
                {!editMode && (
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={handleHabitsEntityNotificationPress}
                            className="p-1 mr-2"
                        >
                            <Ionicons name="notifications" size={20} color={getColor("primary")} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleHabitsParentNotificationPress}
                            className="p-1"
                        >
                            <Ionicons name="notifications" size={20} color={getColor("secondary")} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View className="bg-surface w-full p-4 rounded-lg">
                <Text className="text-on-surface-variant text-sm">
                    No habit settings available yet.
                </Text>
            </View>
        </View>
    );
};