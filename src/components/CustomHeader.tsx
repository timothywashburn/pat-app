import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
    title: string;
    showAddButton?: boolean;
    onAddTapped?: () => void;
    showFilterButton?: boolean;
    isFilterActive?: boolean;
    onFilterTapped?: () => void;
    trailing?: () => React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showAddButton = false,
    onAddTapped,
    showFilterButton = false,
    isFilterActive = false,
    onFilterTapped,
    trailing,
}) => {
    // Get safe area insets
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.header,
                {paddingTop: insets.top} // Apply top inset as padding
            ]}
        >
            <View style={styles.headerContent}>
                <View style={styles.leftSection}>
                    <TouchableOpacity
                        onPress={() => {
                            // TODO: implement hamburger menu
                        }}
                    >
                        <Ionicons name="menu" size={24} color="black"/>
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
                            <Ionicons name="add" size={24} color="black"/>
                        </TouchableOpacity>
                    )}

                    {trailing && trailing()}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerContent: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
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
        padding: 4, // Added padding for better touch target
    },
});

export default CustomHeader;