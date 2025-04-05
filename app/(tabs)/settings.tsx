import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '../../components/CustomHeader';
import { useAuth } from '../../contexts/AuthProvider';

export default function SettingsPanel() {
    const { signOut, userInfo } = useAuth();
    const showHamburgerMenu = useRef(false);
    const [editMode, setEditMode] = useState(false);

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="Settings"
                showAddButton={false}
                showHamburgerMenu={showHamburgerMenu}
                trailing={() => (
                    <Text
                        style={styles.editButton}
                        onPress={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Done' : 'Edit'}
                    </Text>
                )}
            />

            <View style={styles.content}>
                <Text style={styles.title}>Settings Panel</Text>

                {userInfo && (
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userInfoTitle}>User Info</Text>
                        <Text>Name: {userInfo.name}</Text>
                        <Text>Email: {userInfo.email}</Text>
                        <Text>Email Verified: {userInfo.isEmailVerified ? 'Yes' : 'No'}</Text>
                    </View>
                )}

                <Text
                    style={styles.signOutButton}
                    onPress={() => signOut()}
                >
                    Sign Out
                </Text>
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
    editButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    userInfoContainer: {
        width: '100%',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 20,
    },
    userInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    signOutButton: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
    },
});