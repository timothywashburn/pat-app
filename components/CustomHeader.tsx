import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomHeaderProps {
    title: string;
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    isFilterActive?: boolean;
    onFilterTapped?: () => void;
    showHamburgerMenu: React.MutableRefObject<boolean>;
    trailing?: () => React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showAddButton = false,
    onAddTapped,
    showFilterButton = false,
    isFilterActive = false,
    onFilterTapped,
    showHamburgerMenu,
    trailing,
}) => {
    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                <TouchableOpacity
                    onPress={() => {
                        showHamburgerMenu.current = !showHamburgerMenu.current;
                    }}
                >
                    <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.rightSection}>
                {showFilterButton && (
                    <TouchableOpacity onPress={onFilterTapped} style={styles.iconButton}>
                        <Ionicons
                            name="filter"
                            size={24}
                            color={isFilterActive ? 'blue' : 'black'}
                        />
                    </TouchableOpacity>
                )}

                {showAddButton && (
                    <TouchableOpacity onPress={onAddTapped} style={styles.iconButton}>
                        <Ionicons name="add" size={24} color="black" />
                    </TouchableOpacity>
                )}

                {trailing && trailing()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 2,
        textAlign: 'center',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 16,
    },
});

export default CustomHeader;