import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/core';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/src/context/ThemeContext';
import MainViewHeader from '@/src/components/headers/MainViewHeader';
import { usePeopleStore } from '@/src/stores/usePeopleStore';
import PersonCard from "@/src/features/people/components/PersonCard";
import PersonFormScreen from "@/src/features/people/screens/PersonFormScreen";
import { ModuleType, Person } from "@timothyw/pat-common";
import { useRefreshControl } from '@/src/hooks/useRefreshControl';
import { MainStackParamList } from '@/src/navigation/MainStack';
import { TabNavigatorParamList } from '@/src/navigation/AppNavigator';
import { useNavStateLogger } from "@/src/hooks/useNavStateLogger";
import { useHeaderControls } from '@/src/context/HeaderControlsContext';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

interface PeoplePanelProps {
    navigation: CompositeNavigationProp<
        MaterialTopTabNavigationProp<TabNavigatorParamList, ModuleType.PEOPLE>,
        StackNavigationProp<MainStackParamList>
    >;
    route: RouteProp<TabNavigatorParamList, ModuleType.PEOPLE>;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({
    navigation,
    route
}) => {
    const { getColor } = useTheme();
    const { people, isInitialized, loadPeople } = usePeopleStore();
    const { refreshControl } = useRefreshControl(loadPeople, 'Failed to refresh people');
    const { setHeaderControls } = useHeaderControls();

    useNavStateLogger(navigation, 'people');

    useEffect(() => {
        if (!isInitialized) {
            loadPeople();
        }
    }, [isInitialized, loadPeople]);

    // State for the create form only
    const [showingCreateForm, setShowingCreateForm] = useState(false);

    const handleAddPerson = () => {
        navigation.navigate('PersonForm', { isEditing: false });
    };

    useFocusEffect(
        useCallback(() => {
            setHeaderControls({
                showAddButton: true,
                onAddTapped: handleAddPerson,
            });

            return () => {
                setHeaderControls({});
            };
        }, [])
    );

    const handlePersonSelect = (person: Person) => {
        navigation.navigate('PersonDetail', { personId: person._id });
    };

    const handleFormDismiss = () => {
        setShowingCreateForm(false);
    };

    return (
        <>
            <MainViewHeader
                moduleType={ModuleType.PEOPLE}
                title="People"
            />

            {!isInitialized && people.length === 0 ? (
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
                            <PersonCard person={item} />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={refreshControl}
                />
            )}

        </>
    );
}

export default PeoplePanel;