import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeManager';
import { Person } from '@/src/features/people/models';

interface PersonItemViewProps {
    person: Person;
}

const PersonItemView: React.FC<PersonItemViewProps> = ({ person }) => {
    const { colors } = useTheme();

    return (
        <View className="w-full p-4 bg-surface rounded-lg mb-3">
            <Text className="text-lg font-bold text-primary mb-2">{person.name}</Text>

            {person.properties.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}
                >
                    {person.properties.map((property) => (
                        <View key={property.id} className="p-2 bg-accent/10 rounded-lg">
                            <Text className="text-xs text-secondary">{property.key}</Text>
                            <Text className="text-sm text-primary">{property.value}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default PersonItemView;