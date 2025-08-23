import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { Person } from "@timothyw/pat-common";
import { StackNavigationProp } from "@react-navigation/stack";
import { ListsStackParamList } from "@/src/navigation/ListsStack";
import { RouteProp } from "@react-navigation/core";
import { PeopleStackParamList } from "@/src/navigation/PeopleStack";

interface PersonDetailViewProps {
    navigation: StackNavigationProp<PeopleStackParamList, 'PersonDetail'>;
    route: RouteProp<PeopleStackParamList, 'PersonDetail'>;
}

const PersonDetailScreen: React.FC<PersonDetailViewProps> = ({
    navigation,
    route,
}) => {
    const currentPerson = route.params.person;
    
    const handleEditRequest = () => {
        navigation.navigate('PersonForm', { person: currentPerson, isEditing: true });
    };

    const actions = [
        {
            label: "Edit Person",
            onPress: handleEditRequest,
            variant: 'primary' as const,
            icon: 'create-outline'
        }
    ];

    return (
        <BaseDetailView
            navigation={navigation}
            route={route}
            title="Details"
            onEditRequest={handleEditRequest}
            actions={actions}
        >
            <Text className="text-on-surface text-xl font-bold mb-4">{currentPerson.name}</Text>

                    {/* Properties Section */}
                    {currentPerson.properties.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Properties</Text>
                            <View className="flex-col gap-2">
                                {currentPerson.properties.map((property: any) => (
                                    <View key={property.key} className="bg-surface border border-outline rounded-lg p-3">
                                        <Text className="text-xs text-on-surface-variant">{property.key}</Text>
                                        <Text className="text-base text-on-surface">{property.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Notes Section */}
                    {currentPerson.notes && currentPerson.notes.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                            <View className="flex-col gap-2">
                                {currentPerson.notes.map((note: any) => (
                                    <View key={note._id} className="bg-surface border border-outline rounded-lg p-3">
                                        <Text className="text-base text-on-surface mb-1">{note.content}</Text>
                                        <Text className="text-xs text-on-surface-variant">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
        </BaseDetailView>
    );
};

export default PersonDetailScreen;