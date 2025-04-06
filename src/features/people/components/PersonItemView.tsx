import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Person } from '@/src/models';

interface PersonItemViewProps {
    person: Person;
}

const PersonItemView: React.FC<PersonItemViewProps> = ({person}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.name}>{person.name}</Text>

            {person.properties.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.propertiesContainer}
                >
                    {person.properties.map((property) => (
                        <View key={property.id} style={styles.propertyContainer}>
                            <Text style={styles.propertyKey}>{property.key}</Text>
                            <Text style={styles.propertyValue}>{property.value}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    propertiesContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    propertyContainer: {
        padding: 8,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 8,
    },
    propertyKey: {
        fontSize: 12,
        color: '#666',
    },
    propertyValue: {
        fontSize: 14,
        color: '#000',
    },
});

export default PersonItemView;