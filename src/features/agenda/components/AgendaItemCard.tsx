import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { AgendaItem } from "@/src/features/agenda/models";

interface AgendaItemCardProps {
    item: AgendaItem;
    onPress: (item: AgendaItem) => void;
}

const AgendaItemCard: React.FC<AgendaItemCardProps> = ({ item, onPress }) => {
    return (
        <TouchableOpacity
            className="bg-surface rounded-lg p-4 mb-3"
            onPress={() => onPress(item)}
        >
            <View className="flex-col">
                <Text className="text-on-surface text-base font-semibold mb-2">{item.name}</Text>

                {item.date && (
                    <Text className="text-on-surface-variant text-sm mb-1">
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </Text>
                )}

                {item.category && <Text className="text-primary text-sm mb-1">{item.category}</Text>}

                {item.urgent && (
                    <View className="bg-error px-2 py-0.5 rounded self-start">
                        <Text className="text-on-error text-xs font-semibold">Urgent</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default AgendaItemCard;