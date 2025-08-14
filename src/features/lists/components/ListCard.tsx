import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListWithItems, sortListItems } from '@/src/features/lists/models';
import { ListId, ListItemData, ListType } from '@timothyw/pat-common';
import { useTheme } from '@/src/context/ThemeContext';
import ListItemCard from './ListItemCard';

interface ListCardProps {
    list: ListWithItems;
    onPress: (list: ListWithItems) => void;
    onListItemPress: (listItem: ListItemData) => void;
    onAddListItem: (listId: ListId) => void;
    showCompleted: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ list, onPress, onListItemPress, onAddListItem, showCompleted }) => {
    const { getColor } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [rotateAnimation] = useState(new Animated.Value(0));
    
    const completedItems = list.items.filter(item => item.completed);
    const totalItems = list.items.length;

    const handleHeaderPress = () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        
        Animated.timing(rotateAnimation, {
            toValue: newExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleListPress = () => {
        onPress(list);
    };

    const handleAddListItem = () => {
        onAddListItem(list._id);
    };

    const rotateStyle = {
        transform: [
            {
                rotate: rotateAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                }),
            },
        ],
    };

    return (
        <View className="bg-surface rounded-lg mb-3">
            {/* Header */}
            <TouchableOpacity
                className={`p-4 flex-row items-center ${isExpanded ? 'border-b border-outline' : ''}`}
                onPress={handleHeaderPress}
            >
                <Animated.View style={rotateStyle} className="mr-3">
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </Animated.View>
                
                <View className="flex-row items-center mr-3">
                    <Ionicons
                        name={list.type === ListType.NOTES ? 'document-text' : 'checkbox'}
                        size={20}
                        color={getColor('on-surface-variant')}
                    />
                </View>
                
                <View className="flex-1">
                    <Text className="text-on-surface text-lg font-semibold mb-1">
                        {list.name}
                    </Text>
                    <Text className="text-on-surface-variant text-sm">
                        {list.type === ListType.NOTES
                            ? `${totalItems} note${totalItems !== 1 ? 's' : ''}`
                            : `${completedItems.length}/${totalItems} completed`
                        }
                    </Text>
                </View>
                
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="p-2 mr-2"
                        onPress={handleListPress}
                    >
                        <Ionicons 
                            name="create-outline"
                            size={20} 
                            color={getColor('on-surface-variant')} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        className="p-2"
                        onPress={handleAddListItem}
                    >
                        <Ionicons 
                            name="add"
                            size={20} 
                            color={getColor('primary')} 
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View className="px-4 pb-4">
                    {list.items.length === 0 ? (
                        <Text className="text-on-surface-variant text-center py-4">
                            No items in this list
                        </Text>
                    ) : (
                        (() => {
                            const itemsToShow = showCompleted
                                ? sortListItems(list.items, list.type)
                                : sortListItems(list.items.filter(items => !items.completed), list.type);
                            
                            return itemsToShow.map((listItem, index) => (
                                <ListItemCard
                                    key={listItem._id}
                                    listItem={listItem}
                                    list={list}
                                    onPress={onListItemPress}
                                    isLast={index === itemsToShow.length - 1}
                                />
                            ));
                        })()
                    )}
                </View>
            )}
        </View>
    );
};

export default ListCard;