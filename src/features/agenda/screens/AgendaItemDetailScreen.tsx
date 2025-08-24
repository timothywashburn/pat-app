import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import { NotificationEntityType, NotificationTemplateLevel } from "@timothyw/pat-common";
import { NotificationsSection } from '@/src/features/notifications/components/NotificationsSection';
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface AgendaItemDetailViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'AgendaItemDetail'>;
    route: RouteProp<MainStackParamList, 'AgendaItemDetail'>;
}

const AgendaItemDetailScreen: React.FC<AgendaItemDetailViewProps> = ({
    navigation,
    route,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showNotificationConfig, setShowNotificationConfig] = React.useState(false);

    const { setCompleted, items } = useAgendaStore();
    const currentItem = items.find(item => item._id === route.params.itemId)!;
    
    const handleEditRequest = () => {
        if (currentItem) {
            navigation.navigate('AgendaItemForm', { itemId: currentItem._id, isEditing: true });
        }
    };

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await setCompleted(currentItem._id, !currentItem.completed);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update currentItem');
        } finally {
            setIsLoading(false);
        }
    };

    const actions = [
        {
            label: "Edit Item",
            onPress: handleEditRequest,
            variant: 'outline' as const,
            icon: 'create-outline'
        },
        {
            label: currentItem.completed ? "Mark as Incomplete" : "Mark as Complete",
            onPress: handleToggleCompleted,
            variant: 'primary' as const,
            icon: currentItem.completed ? 'refresh-circle' : 'checkmark-circle',
            loading: isLoading
        }
    ];

    return (
        <>
            <BaseDetailView
                navigation={navigation}
                route={route}
                title="Details"
                onEditRequest={handleEditRequest}
                errorMessage={errorMessage}
                actions={actions}
            >
                <Text className="text-on-surface text-xl font-bold mb-4">{currentItem.name}</Text>

                        <View className="mb-4">
                            {currentItem.dueDate && (
                                <View className="flex-row currentItems-center mb-2">
                                    <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                                    <Text className="text-on-surface-variant text-base ml-2">
                                        {currentItem.dueDate.toLocaleDateString()} at {currentItem.dueDate.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </Text>
                                </View>
                            )}

                            {(currentItem.category || currentItem.type) && (
                                <View className="flex-row flex-wrap mb-2">
                                    {currentItem.category && (
                                        <View className="bg-surface border border-primary rounded-2xl px-3 py-1 mr-2 mb-2">
                                            <Text className="text-primary text-sm">{currentItem.category}</Text>
                                        </View>
                                    )}

                                    {currentItem.type && (
                                        <View className="bg-surface border border-on-surface-variant rounded-2xl px-3 py-1 mr-2 mb-2">
                                            <Text className="text-on-surface-variant text-sm">{currentItem.type}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {currentItem.urgent && (
                                <View className="bg-error px-2 py-1 rounded self-start mb-2">
                                    <Text className="text-on-error text-sm font-semibold">Urgent</Text>
                                </View>
                            )}
                        </View>

                        {currentItem.notes && (
                            <View className="mb-4">
                                <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                                <View className="bg-surface border border-outline rounded-lg p-3">
                                    <Text className="text-on-surface text-base">{currentItem.notes}</Text>
                                </View>
                            </View>
                        )}

                <NotificationsSection
                    targetEntityType={NotificationEntityType.AGENDA_ITEM}
                    targetId={currentItem._id}
                    targetLevel={NotificationTemplateLevel.ENTITY}
                    entityName={currentItem.name}
                    onPress={() => setShowNotificationConfig(true)}
                />

                <View className="flex-row currentItems-center">
                    <Ionicons
                        name={currentItem.completed ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={currentItem.completed ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className="text-on-surface text-base ml-2">
                        {currentItem.completed ? "Completed" : "Not completed"}
                    </Text>
                </View>
            </BaseDetailView>

            {showNotificationConfig && (
                <NotificationConfigView
                    targetEntityType={NotificationEntityType.AGENDA_ITEM}
                    targetId={currentItem._id}
                    targetLevel={NotificationTemplateLevel.ENTITY}
                    entityName={currentItem.name}
                    onClose={() => setShowNotificationConfig(false)}
                />
            )}
        </>
    );
};

export default AgendaItemDetailScreen;