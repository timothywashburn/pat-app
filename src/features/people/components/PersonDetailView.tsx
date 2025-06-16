import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/controllers/ThemeManager';
import DetailViewHeader from '@/src/components/common/DetailViewHeader';
import { Person } from "@/src/features/people/models";

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
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();

    if (!isPresented) {
        return null;
    }

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <DetailViewHeader
                title="Details"
                onBack={onDismiss}
                onEdit={onEditRequest}
            />

            <ScrollView className="flex-1 p-4">
                <View className="bg-surface rounded-lg p-4 mb-5">
                    <Text className="text-on-surface text-xl font-bold mb-4">{person.name}</Text>

                    {/* Properties Section */}
                    {person.properties.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-on-background text-base font-medium mb-2">Properties</Text>
                            <View className="flex-col gap-2">
                                {person.properties.map(property => (
                                    <View key={property.id} className="bg-surface border border-outline rounded-lg p-3">
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
                                    <View key={note.id} className="bg-surface border border-outline rounded-lg p-3">
                                        <Text className="text-base text-on-surface mb-1">{note.content}</Text>
                                        <Text className="text-xs text-on-surface-variant">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                <View className="mt-5 gap-2.5">
                    <TouchableOpacity
                        className="bg-primary flex-row items-center justify-center rounded-lg p-3"
                        onPress={onEditRequest}
                    >
                        <Text className="text-on-primary text-base font-semibold mr-2">
                            Edit Person
                        </Text>
                        <Ionicons name="create-outline" size={20} color={getColor("on-primary")} />
                    </TouchableOpacity>
                </View>

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default PersonDetailView;