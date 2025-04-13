import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import PersonItemView from '@/src/features/people/components/PersonItemView';
import PersonDetailPanel from '@/src/features/people/components/PersonDetailPanel';
import CreatePersonView from '@/src/features/people/components/CreatePersonView';
import { Person } from '@/src/features/people/models';
import { PersonManager } from "@/src/features/people/controllers/PersonManager";

export default function PeoplePanel() {
    const { colors, colorScheme } = useTheme();
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [showingDetail, setShowingDetail] = useState(false);
    const [showingCreateSheet, setShowingCreateSheet] = useState(false);

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
        loadPeople();
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
        <SafeAreaView className="flex-1 bg-surface">
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <CustomHeader
                title="People"
                showAddButton
                onAddTapped={handleCreatePerson}
            />

            {errorMessage && (
                <Text className="text-red-500 p-4 text-center">{errorMessage}</Text>
            )}

            {isLoading && people.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : people.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-base text-secondary mb-4">No people added yet</Text>
                    <TouchableOpacity
                        className="bg-accent px-5 py-2.5 rounded-lg"
                        onPress={handleCreatePerson}
                    >
                        <Text className="text-white text-base font-semibold">Add Person</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={people}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.accent]}
                            tintColor={colors.accent}
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
        </SafeAreaView>
    );
}