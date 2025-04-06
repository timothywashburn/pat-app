import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '@/src/components/CustomHeader';

export default function TasksPanel() {

    return (
        <View style={styles.container}>
            <StatusBar style="auto"/>

            <CustomHeader
                title="Tasks"
                showAddButton
                onAddTapped={() => {
                    console.log('Add task tapped');
                }}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Tasks Panel</Text>
                <Text>This will be the Tasks panel for managing tasks</Text>
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