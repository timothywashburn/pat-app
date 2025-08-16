import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { useAgendaStore } from "@/src/stores/useAgendaStore";
import { AgendaItemData } from "@timothyw/pat-common";
import { NotificationsSection } from '@/src/features/notifications/components/NotificationsSection';
import { NotificationConfigView } from '@/src/features/notifications/components/NotificationConfigView';

interface AgendaItemDetailViewProps {
    item: AgendaItemData;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
    onItemUpdated?: () => void;
}

const AgendaItemDetailView: React.FC<AgendaItemDetailViewProps> = ({
    item,
    isPresented,
    onDismiss,
    onEditRequest,
    onItemUpdated,
}) => {
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showNotificationConfig, setShowNotificationConfig] = React.useState(false);

    const { setCompleted } = useAgendaStore();

    if (!isPresented) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await setCompleted(item._id, !item.completed);
            onItemUpdated?.();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
        } finally {
            setIsLoading(false);
        }
    };

    const actions = [
        {
            label: "Edit Item",
            onPress: onEditRequest,
            variant: 'outline' as const,
            icon: 'create-outline'
        },
        {
            label: item.completed ? "Mark as Incomplete" : "Mark as Complete",
            onPress: handleToggleCompleted,
            variant: 'primary' as const,
            icon: item.completed ? 'refresh-circle' : 'checkmark-circle',
            loading: isLoading
        }
    ];

    return (
        <>
            <BaseDetailView
                isPresented={isPresented}
                onDismiss={onDismiss}
                title="Details"
                onEditRequest={onEditRequest}
                errorMessage={errorMessage}
                actions={actions}
            >
                <Text className="text-on-surface text-xl font-bold mb-4">{item.name}</Text>

                        <View className="mb-4">
                            {item.dueDate && (
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                                    <Text className="text-on-surface-variant text-base ml-2">
                                        {item.dueDate.toLocaleDateString()} at {item.dueDate.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </Text>
                                </View>
                            )}

                            {(item.category || item.type) && (
                                <View className="flex-row flex-wrap mb-2">
                                    {item.category && (
                                        <View className="bg-surface border border-primary rounded-2xl px-3 py-1 mr-2 mb-2">
                                            <Text className="text-primary text-sm">{item.category}</Text>
                                        </View>
                                    )}

                                    {item.type && (
                                        <View className="bg-surface border border-on-surface-variant rounded-2xl px-3 py-1 mr-2 mb-2">
                                            <Text className="text-on-surface-variant text-sm">{item.type}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {item.urgent && (
                                <View className="bg-error px-2 py-1 rounded self-start mb-2">
                                    <Text className="text-on-error text-sm font-semibold">Urgent</Text>
                                </View>
                            )}
                        </View>

                        {item.notes && (
                            <View className="mb-4">
                                <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                                <View className="bg-surface border border-outline rounded-lg p-3">
                                    <Text className="text-on-surface text-base">{item.notes}</Text>
                                </View>
                            </View>
                        )}

                <NotificationsSection
                    entityType="agenda_item"
                    entityId={item._id}
                    entityName={item.name}
                    onPress={() => setShowNotificationConfig(true)}
                />

                <View className="flex-row items-center">
                    <Ionicons
                        name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={item.completed ? getColor("primary") : getColor("on-surface-variant")}
                    />
                    <Text className="text-on-surface text-base ml-2">
                        {item.completed ? "Completed" : "Not completed"}
                    </Text>
                </View>
            </BaseDetailView>

            {showNotificationConfig && (
                <NotificationConfigView
                    entityType="agenda_item"
                    entityId={item._id}
                    entityName={item.name}
                    onClose={() => setShowNotificationConfig(false)}
                />
            )}
        </>
    );
};

export default AgendaItemDetailView;