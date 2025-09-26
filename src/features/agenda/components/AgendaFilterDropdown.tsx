import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

export type FilterType = 'incomplete' | 'complete' | string;

interface AgendaFilterDropdownProps {
    selectedFilter: FilterType;
    categories: string[];
    onFilterChange: (filter: FilterType) => void;
}

const AgendaFilterDropdown: React.FC<AgendaFilterDropdownProps> = ({
    selectedFilter,
    categories,
    onFilterChange
}) => {
    const { getColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const getFilterLabel = (filter: FilterType) => {
        switch (filter) {
            case 'incomplete':
                return 'Incomplete';
            case 'complete':
                return 'Complete';
            default:
                return filter;
        }
    };

    const getFilterIcon = (filter: FilterType) => {
        switch (filter) {
            case 'incomplete':
                return 'ellipse-outline';
            case 'complete':
                return 'checkmark-circle';
            default:
                return 'pricetag';
        }
    };

    const handleFilterSelect = (filter: FilterType) => {
        onFilterChange(filter);
        setIsOpen(false);
    };

    const allFilters: FilterType[] = ['incomplete', 'complete', ...categories];

    return (
        <>
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                className="p-1"
            >
                <Ionicons
                    name="filter"
                    size={24}
                    color={selectedFilter !== 'incomplete' ? getColor("primary") : getColor("on-surface")}
                />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50"
                    onPress={() => setIsOpen(false)}
                    activeOpacity={1}
                >
                    <View className="flex-1 justify-center items-center p-4">
                        <TouchableOpacity
                            className="bg-surface rounded-xl p-2 min-w-[200px] max-w-[280px]"
                            activeOpacity={1}
                        >
                            <View className="p-2">
                                <Text className="text-on-surface text-lg font-semibold text-center mb-3">
                                    Filter Items
                                </Text>

                                {allFilters.map((filter, index) => (
                                    <TouchableOpacity
                                        key={filter}
                                        className={`flex-row items-center justify-between py-3 px-4 rounded-lg ${
                                            index < allFilters.length - 1 ? 'mb-1' : ''
                                        }`}
                                        onPress={() => handleFilterSelect(filter)}
                                        style={{
                                            backgroundColor: selectedFilter === filter
                                                ? getColor("primary") + '20'
                                                : 'transparent'
                                        }}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <Ionicons
                                                name={getFilterIcon(filter)}
                                                size={20}
                                                color={selectedFilter === filter ? getColor("primary") : getColor("on-surface-variant")}
                                                style={{ marginRight: 12 }}
                                            />
                                            <Text className={`text-base ${
                                                selectedFilter === filter
                                                    ? 'text-primary font-medium'
                                                    : 'text-on-surface'
                                            }`}>
                                                {getFilterLabel(filter)}
                                            </Text>
                                        </View>
                                        {selectedFilter === filter && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color={getColor("primary")}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default AgendaFilterDropdown;