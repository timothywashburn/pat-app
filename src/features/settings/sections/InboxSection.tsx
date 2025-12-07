import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { MainStackParamList } from '@/src/navigation/MainStack';
import NotificationService from '@/src/services/NotificationService';

interface InboxSectionProps {
    editMode: boolean;
}

export const InboxSection: React.FC<InboxSectionProps> = ({
    editMode
}) => {
    const { getColor } = useTheme();
    const navigation = useNavigation<StackNavigationProp<MainStackParamList, 'Settings'>>();

    const handleInboxEntityNotificationPress = async () => {
        const shouldNavigate = await NotificationService.shared.checkAndPromptForNotifications();

        if (shouldNavigate) {
            navigation.navigate('NotificationInfo', {
                targetEntityType: NotificationEntityType.INBOX_PANEL,
                targetId: 'inbox_panel',
                targetLevel: NotificationTemplateLevel.ENTITY,
                entityName: 'Inbox Panel'
            });
        }
    };

    return (
        <View className="mb-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-on-background text-lg font-bold">Inbox</Text>
                {!editMode && (
                    <TouchableOpacity
                        onPress={handleInboxEntityNotificationPress}
                        className="p-1"
                    >
                        <Ionicons name="notifications" size={20} color={getColor("primary")} />
                    </TouchableOpacity>
                )}
            </View>

            <View className="bg-surface w-full p-4 rounded-lg">
                <Text className="text-on-surface-variant text-sm">
                    No inbox settings available yet.
                </Text>
            </View>
        </View>
    );
};