import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgendaItem } from "@/src/features/agenda/models";
import { useTheme } from '@/src/controllers/ThemeManager';

interface AgendaItemCardProps {
    item: AgendaItem;
    onPress: (item: AgendaItem) => void;
}

const AgendaItemCard: React.FC<AgendaItemCardProps> = ({ item, onPress }) => {
    const { getColor } = useTheme();

    return (
        <TouchableOpacity
            className={`bg-surface rounded-xl p-4 mb-3 ${
                item.urgent ? 'border-l-4 border-l-error' : ''
            }`}
            onPress={() => onPress(item)}
        >
            <View className="flex-row items-start justify-between mb-3">
                <Text className="text-on-surface text-base font-semibold flex-1 mr-3 leading-5">
                    {item.name}
                </Text>
                {item.urgent && (
                    <View className="bg-error/15 px-2 py-1 rounded-md">
                        <Text className="text-error text-xs font-medium">URGENT</Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-center justify-between">
                {item.date ? (
                    <View className="flex-row items-center flex-1">
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={getColor("on-surface-variant")}
                        />
                        <Text className="text-on-surface-variant text-sm ml-1">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(item.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        </Text>
                    </View>
                ) : <View className="flex-1" />}

                <View className="flex-row gap-2">
                    {item.category && (
                        <View className="bg-primary/12 px-2 py-1 rounded-full">
                            <Text className="text-primary text-xs font-medium">
                                {item.category}
                            </Text>
                        </View>
                    )}
                    {item.type && (
                        <View className="bg-secondary/12 px-2 py-1 rounded-full">
                            <Text className="text-secondary text-xs font-medium">
                                {item.type}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default AgendaItemCard;