import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { Person } from "@/src/features/people/models";
import { PersonManager } from "@/src/features/people/controllers/PersonManager";
import PersonItemView from "@/src/features/people/components/PersonItemView";
import PersonFormView from "@/src/features/people/components/PersonFormView";
import PersonDetailView from "@/src/features/people/components/PersonDetailView";

export default function PeoplePanel() {
    const { getColor } = useTheme();
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);

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
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.log('haptics not available:', error);
        }

        setErrorMessage(null);

        try {
            await personManager.loadPeople();
            setPeople(personManager.people);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to refresh people');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleAddPerson = () => {
        setShowingCreateForm(true);
    };

    const handlePersonSelect = (person: Person) => {
        setSelectedPerson(person);
        setShowingDetailView(true);
    };

    const handleDetailDismiss = () => {
        setShowingDetailView(false);
        setSelectedPerson(null);
    };

    const handleEditRequest = () => {
        setShowingDetailView(false);
        setShowingEditForm(true);
    };

    const handleFormDismiss = () => {
        setShowingCreateForm(false);
        setShowingEditForm(false);
        setSelectedPerson(null);
        loadPeople();
    };

    return (
        <SafeAreaView className="bg-background flex-1">
            <CustomHeader
                title="People"
                showAddButton
                onAddTapped={handleAddPerson}
            />

            {errorMessage && (
                <Text className="text-unknown p-4 text-center">{errorMessage}</Text>
            )}

            {isLoading && people.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <ActivityIndicator size="large" color={getColor("primary")} />
                </View>
            ) : people.length === 0 ? (
                <View className="flex-1 justify-center items-center p-5">
                    <Ionicons
                        name="people"
                        size={48}
                        color={getColor("primary")}
                    />
                    <Text className="text-base text-on-background-variant mb-5">
                        No people added yet
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-5 py-2.5 rounded-lg"
                        onPress={handleAddPerson}
                    >
                        <Text className="text-on-primary text-base font-semibold">Add Person</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={people}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handlePersonSelect(item)}>
                            <PersonItemView person={item} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={[getColor("primary")]}
                            tintColor={getColor("primary")}
                        />
                    }
                />
            )}

            {/* Create new person modal */}
            <PersonFormView
                visible={showingCreateForm}
                onDismiss={handleFormDismiss}
                onPersonSaved={loadPeople}
            />

            {/* Edit person modal */}
            {selectedPerson && (
                <PersonFormView
                    visible={showingEditForm}
                    onDismiss={handleFormDismiss}
                    onPersonSaved={loadPeople}
                    existingPerson={selectedPerson}
                    isEditMode={true}
                />
            )}

            {/* Person detail view */}
            {selectedPerson && (
                <PersonDetailView
                    person={selectedPerson}
                    isPresented={showingDetailView}
                    onDismiss={handleDetailDismiss}
                    onEditRequest={handleEditRequest}
                />
            )}
        </SafeAreaView>
    );
}