import React from 'react';
import {
    Text,
    View,
} from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';
import BaseDetailView from '@/src/components/common/BaseDetailView';
import { Person } from "@timothyw/pat-common";

interface PersonDetailViewProps {
    person: Person;
    isPresented: boolean;
    onDismiss: () => void;
    onEditRequest: () => void;
}

const PersonDetailView: React.FC<PersonDetailViewProps> = ({
    person,
    isPresented,
    onDismiss,
    onEditRequest,
}) => {
    const { getColor } = useTheme();

    if (!isPresented) {
        return null;
    }

    const actions = [
        {
            label: "Edit Person",
            onPress: onEditRequest,
            variant: 'primary' as const,
            icon: 'create-outline'
        }
    ];

    return (
        <BaseDetailView
            isPresented={isPresented}
            onDismiss={onDismiss}
            title="Details"
            onEditRequest={onEditRequest}
            actions={actions}
        >
            <Text className="text-on-surface text-xl font-bold mb-4">{person.name}</Text>

                    {/* Properties Section */}
                    {person.properties.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Properties</Text>
                            <View className="flex-col gap-2">
                                {person.properties.map(property => (
                                    <View key={property.key} className="bg-surface border border-outline rounded-lg p-3">
                                        <Text className="text-xs text-on-surface-variant">{property.key}</Text>
                                        <Text className="text-base text-on-surface">{property.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Notes Section */}
                    {person.notes.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Notes</Text>
                            <View className="flex-col gap-2">
                                {person.notes.map(note => (
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

export default PersonDetailView;