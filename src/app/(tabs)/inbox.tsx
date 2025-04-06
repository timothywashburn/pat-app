import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '@/src/components/CustomHeader';

export default function InboxPanel() {
    const showHamburgerMenu = useRef(false);

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="Inbox"
                showAddButton
                onAddTapped={() => {
                    console.log('Add thought tapped');
                }}
                showHamburgerMenu={showHamburgerMenu}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Inbox Panel</Text>
                <Text>This will be the Inbox panel for capturing thoughts</Text>
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