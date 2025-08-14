import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListData, ListItemData, ListType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';

interface ListItemCardProps {
    listItem: ListItemData;
    list: ListData;
    onPress: (listItem: ListItemData) => void;
    isLast?: boolean;
}

const ListItemCard: React.FC<ListItemCardProps> = ({ listItem, list, onPress, isLast }) => {
    const { getColor } = useTheme();
    const isNoteList = list.type === ListType.NOTES;

    return (
        <TouchableOpacity
            className={`flex-row items-center py-3 ${!isLast ? 'border-b border-surface-variant' : ''}`}
            onPress={() => onPress(listItem)}
        >
            {!isNoteList && (
                <View className="mr-3">
                    <Ionicons
                        name={listItem.completed ? 'checkmark-circle' : 'radio-button-off'}
                        size={20}
                        color={listItem.completed ? getColor('primary') : getColor('on-surface-variant')}
                    />
                </View>
            )}
            
            {isNoteList && (
                <View className="mr-3">
                    <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </View>
            )}
            
            <View className="flex-1">
                <Text 
                    className={`text-base ${
                        !isNoteList && listItem.completed 
                            ? 'text-on-surface-variant line-through' 
                            : 'text-on-surface'
                    }`}
                >
                    {listItem.name}
                </Text>
                
                {listItem.notes && (
                    <Text className="text-on-surface-variant text-sm mt-1">
                        {listItem.notes}
                    </Text>
                )}
            </View>
            
            <Ionicons
                name="chevron-forward"
                size={16}
                color={getColor('on-surface-variant')}
            />
        </TouchableOpacity>
    );
};

export default ListItemCard;