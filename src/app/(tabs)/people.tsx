import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import CustomHeader from '@/src/components/CustomHeader';
import { usePeopleStore } from '@/src/stores/usePeopleStore';
import PersonItemView from "@/src/features/people/components/PersonItemView";
import PersonFormView from "@/src/features/people/components/PersonFormView";
import PersonDetailView from "@/src/features/people/components/PersonDetailView";
import { useToast } from "@/src/components/toast/ToastContext";
import { ModuleType, Person } from "@timothyw/pat-common";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';

export const PeoplePanel: React.FC = () => {
    const { getColor } = useTheme();
    const { people, isInitialized, loadPeople } = usePeopleStore();
    const { refreshControl } = useRefreshControl(loadPeople, 'Failed to refresh people');

    useEffect(() => {
        if (!isInitialized) {
            loadPeople();
        }
    }, [isInitialized, loadPeople]);

    // State for the create/edit form
    const [showingCreateForm, setShowingCreateForm] = useState(false);
    const [showingEditForm, setShowingEditForm] = useState(false);

    // State for detail view
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [showingDetailView, setShowingDetailView] = useState(false);

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
    };

    const handleEditCancel = () => {
        setShowingEditForm(false);
        setShowingDetailView(true);
    };

    return (
        <>
            <CustomHeader
                moduleType={ModuleType.PEOPLE}
                title="People"
                showAddButton
                onAddTapped={handleAddPerson}
            />

            {isInitialized && people.length === 0 ? (
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
                    refreshControl={refreshControl}
                />
            )}

            {/* Create new person view */}
            <PersonFormView
                isPresented={showingCreateForm}
                onDismiss={handleFormDismiss}
                onPersonSaved={() => {}}
            />

            {/* Edit person view */}
            {selectedPerson && (
                <PersonFormView
                    isPresented={showingEditForm}
                    onDismiss={handleFormDismiss}
                    onCancel={handleEditCancel}
                    onPersonSaved={() => {}}
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