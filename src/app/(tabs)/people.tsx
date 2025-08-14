import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import CustomHeader from '@/src/components/CustomHeader';
import { usePeople } from "@/src/features/people/hooks/usePeople";
import PersonItemView from "@/src/features/people/components/PersonItemView";
import PersonFormView from "@/src/features/people/components/PersonFormView";
import PersonDetailView from "@/src/features/people/components/PersonDetailView";
import { useToast } from "@/src/components/toast/ToastContext";
import { ModuleType, Person } from "@timothyw/pat-common";

export const PeoplePanel: React.FC = () => {
    const { getColor } = useTheme();
    const { errorToast } = useToast();
    const peopleHook = usePeople();
    const { people, isLoading, error } = peopleHook;
    const [isRefreshing, setIsRefreshing] = useState(false);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);

    const personManager = peopleHook;

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        if (isRefreshing) return;


        try {
            await peopleHook.loadPeople();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to load people';
            errorToast(errorMsg);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.log('haptics not available:', error);
        }

        try {
            await peopleHook.loadPeople();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to refresh people';
            errorToast(errorMsg);
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

    const handleEditCancel = () => {
        setShowingEditForm(false);
        setShowingDetailView(true); // Go back to detail view instead of list
    };

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.PEOPLE}
                title="People"
                showAddButton
                onAddTapped={handleAddPerson}
            />

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
                    keyExtractor={item => item._id}
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

            {/* Create new person view */}
            <PersonFormView
                isPresented={showingCreateForm}
                onDismiss={handleFormDismiss}
                onPersonSaved={loadPeople}
            />

            {/* Edit person view */}
            {selectedPerson && (
                <PersonFormView
                    isPresented={showingEditForm}
                    onDismiss={handleFormDismiss}
                    onCancel={handleEditCancel}
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
        </>
    );
}

export default PeoplePanel;