import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { usePeopleStore } from '@/src/stores/usePeopleStore';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { MainStackParamList } from "@/src/navigation/MainStack";

interface PersonDetailViewProps {
    navigation: StackNavigationProp<MainStackParamList, 'PersonDetail'>;
    route: RouteProp<MainStackParamList, 'PersonDetail'>;
}

const PersonDetailScreen: React.FC<PersonDetailViewProps> = ({
    navigation,
    route,
}) => {
    const { people } = usePeopleStore();
    const currentPerson = people.find(person => person._id === route.params.personId);
    
    if (!currentPerson) {
        return null;
    }
    
    const handleEditRequest = () => {
        navigation.navigate('PersonForm', { personId: currentPerson._id, isEditing: true });
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