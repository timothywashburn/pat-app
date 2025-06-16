import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/controllers/ThemeManager';

interface FormViewHeaderProps {
    title: string;
    onCancel: () => void;
    onSave: () => void;
    isEditMode?: boolean;
    isSaveDisabled?: boolean;
    isLoading?: boolean;
    saveText?: string;
}

const FormViewHeader: React.FC<FormViewHeaderProps> = ({
    title,
    onCancel,
    onSave,
    isEditMode = false,
    isSaveDisabled = false,
    isLoading = false,
    saveText = "Save"
}) => {
    const { getColor } = useTheme();

    return (
        <View className="bg-surface flex-row justify-between items-center px-4 py-4 border-b border-outline">
            <View className="flex-1">
                {/* Empty left side */}
            </View>

            <Text className="text-on-surface text-lg font-bold">
                {title}
            </Text>

            <View className="flex-1 flex-row justify-end items-center">
                <TouchableOpacity 
                    onPress={onSave} 
                    disabled={isLoading || isSaveDisabled}
                    className="mr-4"
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={getColor("primary")} />
                    ) : (
                        <Text 
                            className={`text-base font-semibold ${
                                isSaveDisabled ? 'text-on-surface-variant' : 'text-primary'
                            }`}
                        >
                            {saveText}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onCancel} disabled={isLoading}>
                    <Text className={`text-base font-medium ${isEditMode ? 'text-on-error' : 'text-primary'}`}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FormViewHeader;