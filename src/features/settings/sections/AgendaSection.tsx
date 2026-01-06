import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgendaItemCategories } from '@/src/features/settings/components/AgendaItemCategories';
import { AgendaItemTypes } from '@/src/features/settings/components/AgendaItemTypes';
import { NotificationEntityType, NotificationTemplateLevel } from '@timothyw/pat-common';
import { MainStackParamList } from '@/src/navigation/MainStack';
import NotificationService from '@/src/services/NotificationService';

export const AgendaSection: React.FC = () => {
    const { getColor } = useTheme();
    const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Settings'>>();

    const handleAgendaNotificationPress = async () => {
        const shouldNavigate = await NotificationService.shared.checkAndPromptForNotifications();

        if (shouldNavigate) {
            navigation.navigate('NotificationInfo', {
                targetEntityType: NotificationEntityType.AGENDA_PANEL,
                targetId: 'agenda_panel',
                targetLevel: NotificationTemplateLevel.ENTITY,
                entityName: 'Agenda Panel'
            });
        }
    };

    return (
        <View className="mb-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-on-background text-lg font-bold">Agenda</Text>
                <TouchableOpacity
                    onPress={handleAgendaNotificationPress}
                    className="p-1"
                >
                    <Ionicons name="notifications" size={20} color={getColor('primary')} />
                </TouchableOpacity>
            </View>

            <AgendaItemCategories />

            <View className="h-px bg-surface my-4" />

            <AgendaItemTypes />
        </View>
    );
};