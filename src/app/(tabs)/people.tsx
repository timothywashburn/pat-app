import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CustomHeader from '@/src/components/CustomHeader';
import PersonItemView from '@/src/features/people/components/PersonItemView';
import PersonDetailPanel from '@/src/features/people/components/PersonDetailPanel';
import CreatePersonView from '@/src/features/people/components/CreatePersonView';
import { Person } from '@/src/models';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";

export default function PeoplePanel() {
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [showingDetail, setShowingDetail] = useState(false);
    const [showingCreateSheet, setShowingCreateSheet] = useState(false);
    const showHamburgerMenu = useRef(false);

    // Initialize manager
    const personManager = PersonManager.getInstance();

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        if (isRefreshing) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await personManager.loadPeople();
            setPeople(personManager.people);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to load people');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await personManager.loadPeople();
            setPeople(personManager.people);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh people');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handlePersonSelect = (person: Person) => {
        setSelectedPerson(person);
        setShowingDetail(true);
    };

    const handleDetailDismiss = () => {
        setShowingDetail(false);
        loadPeople(); // Refresh list after possible changes
    };

    const handleCreatePerson = () => {
        setShowingCreateSheet(true);
    };

    const renderItem = ({ item }: { item: Person }) => (
        <TouchableOpacity onPress={() => handlePersonSelect(item)}>
            <PersonItemView person={item} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <CustomHeader
                title="People"
                showAddButton
                onAddTapped={handleCreatePerson}
                showHamburgerMenu={showHamburgerMenu}
            />

            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            {isLoading && people.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : people.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No people added yet</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleCreatePerson}
                    >
                        <Text style={styles.addButtonText}>Add Person</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={people}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                />
            )}

            {selectedPerson && (
                <PersonDetailPanel
                    person={selectedPerson}
                    isPresented={showingDetail}
                    onDismiss={handleDetailDismiss}
                />
            )}

            <CreatePersonView
                visible={showingCreateSheet}
                onDismiss={() => setShowingCreateSheet(false)}
                onPersonCreated={loadPeople}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    errorText: {
        color: 'red',
        padding: 16,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});