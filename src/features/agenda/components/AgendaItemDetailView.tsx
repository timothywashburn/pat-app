import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import { AgendaItem } from "@/src/features/agenda/models";
import { AgendaManager } from "@/src/features/agenda/controllers/AgendaManager";

interface AgendaItemDetailViewProps {
    item: AgendaItem;
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
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const agendaManager = AgendaManager.getInstance();

    if (!isPresented) {
        return null;
    }

    const handleToggleCompleted = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            await agendaManager.setCompleted(item.id, !item.completed);
            onItemUpdated?.();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="chevron-back" size={24} color={getColor("primary")} />
                </TouchableOpacity>

                <Text className="text-on-surface text-lg font-bold">Details</Text>

                <TouchableOpacity onPress={onEditRequest}>
                    <Ionicons name="create-outline" size={24} color={getColor("primary")} />
                </TouchableOpacity>
            </View>

            {errorMessage && (
                <Text className="text-error p-4 text-center">{errorMessage}</Text>
            )}

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
                    <Text className="text-on-surface text-xl font-bold mb-4">{item.name}</Text>

                    <View className="mb-4">
                        {item.date && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="calendar-outline" size={20} color={getColor("on-surface-variant")} />
                                <Text className="text-on-surface-variant text-base ml-2">
                                    {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {
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
                </View>

                <View className="mt-5 gap-2.5">
                    <TouchableOpacity
                        className="bg-surface border border-outline flex-row items-center justify-center rounded-lg p-3 mt-2"
                        onPress={onEditRequest}
                    >
                        <Text className="text-primary text-base font-semibold mr-2">
                            Edit Item
                        </Text>
                        <Ionicons name="create-outline" size={20} color={getColor("primary")} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-primary flex-row items-center justify-center rounded-lg p-3"
                        onPress={handleToggleCompleted}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={getColor("on-primary")} />
                        ) : (
                            <>
                                <Text className="text-on-primary text-base font-semibold mr-2">
                                    {item.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                </Text>
                                <Ionicons
                                    name={item.completed ? "refresh-circle" : "checkmark-circle"}
                                    size={20}
                                    color={getColor("on-primary")}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default AgendaItemDetailView;