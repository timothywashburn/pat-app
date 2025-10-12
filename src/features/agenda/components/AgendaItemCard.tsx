import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { AgendaItemData } from "@timothyw/pat-common";

interface AgendaItemCardProps {
    item: AgendaItemData;
    onPress: (item: AgendaItemData) => void;
    isTableView?: boolean;
}

const AgendaItemCard: React.FC<AgendaItemCardProps> = ({ item, onPress, isTableView = false }) => {
    const { getColor } = useTheme();

    if (isTableView) {
        return (
            <TouchableOpacity
                className={`bg-surface border-l-4 ${
                    item.urgent ? 'border-l-on-error' : 'border-l-transparent'
                }`}
                onPress={() => onPress(item)}
            >
                <View className="flex-row items-center py-4 px-5">
                    <View className="flex-1 max-w-[35%] pr-4">
                        <View className="flex-row items-center flex-wrap">
                            <Text className="text-on-surface text-sm font-semibold mr-4" numberOfLines={2}>
                                {item.name}
                            </Text>
                            {item.urgent && (
                                <Text className="text-on-error text-xs font-medium">URGENT</Text>
                            )}
                        </View>
                    </View>

                    <View className="w-[25%] px-2">
                        {item.dueDate ? (
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="time-outline"
                                    size={12}
                                    color={getColor("on-surface-variant")}
                                />
                                <Text className="text-on-surface-variant text-xs ml-1" numberOfLines={1}>
                                    {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{" "}
                                    {item.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-on-surface-variant text-xs">—</Text>
                        )}
                    </View>

                    <View className="w-[20%] px-2">
                        {item.category ? (
                            <Text className="text-primary text-xs font-medium" numberOfLines={1}>
                                {item.category}
                            </Text>
                        ) : (
                            <Text className="text-on-surface-variant text-xs">—</Text>
                        )}
                    </View>

                    <View className="w-[20%] px-2">
                        {item.type ? (
                            <Text className="text-secondary text-xs font-medium" numberOfLines={1}>
                                {item.type}
                            </Text>
                        ) : (
                            <Text className="text-on-surface-variant text-xs">—</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    } else {
        return (
            <TouchableOpacity
                className={`bg-surface rounded-xl p-4 border-l-4 mb-3 ${
                    item.urgent ? 'border-l-on-error' : 'border-l-transparent'
                }`}
                onPress={() => onPress(item)}
            >
                <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-on-surface text-base font-semibold flex-1 mr-3 leading-5">
                        {item.name}
                    </Text>
                    {item.urgent && (
                        <Text className="text-on-error text-xs font-medium px-2">URGENT</Text>
                    )}
                </View>

                <View className="flex-row items-center justify-between">
                    {item.dueDate ? (
                        <View className="flex-row items-center flex-1">
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color={getColor("on-surface-variant")}
                            />
                            <Text className="text-on-surface-variant text-sm ml-1">
                                {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {item.dueDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </Text>
                        </View>
                    ) : <View className="flex-1" />}

                    <View className="flex-row gap-2">
                        {item.category && (
                            <View className="px-2 py-1 rounded-full">
                                <Text className="text-primary text-xs font-medium">
                                    {item.category}
                                </Text>
                            </View>
                        )}
                        {item.type && (
                            <View className="px-2 py-1 rounded-full">
                                <Text className="text-secondary text-xs font-medium">
                                    {item.type}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
};

export default AgendaItemCard;