import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeManager';
import { Person } from '@/src/features/people/models';

interface PersonItemViewProps {
    person: Person;
}

const PersonItemView: React.FC<PersonItemViewProps> = ({ person }) => {
    return (
        <View className="bg-surface rounded-lg p-4 mb-3">
            <Text className="text-on-surface text-base font-semibold mb-2">{person.name}</Text>

            {person.properties.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}
                >
                    {person.properties.map((property) => (
                        <View key={property.id} className="px-3 py-1 bg-surface border border-primary rounded-2xl">
                            <Text className="text-xs text-on-surface-variant">{property.key}</Text>
                            <Text className="text-sm text-primary">{property.value}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default PersonItemView;