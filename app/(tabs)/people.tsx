import React, { useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '../../components/CustomHeader';

export default function PeoplePanel() {
    const showHamburgerMenu = useRef(false);

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="People"
                showAddButton
                onAddTapped={() => {
                    console.log('Add person tapped');
                }}
                showHamburgerMenu={showHamburgerMenu}
            />

            <View style={styles.content}>
                <Text style={styles.title}>People Panel</Text>
                <Text>This will be the People panel for managing contacts</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});