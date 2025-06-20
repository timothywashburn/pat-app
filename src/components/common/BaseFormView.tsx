import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/controllers/ThemeManager';
import FormViewHeader from './FormViewHeader';

interface BaseFormViewProps {
    // Presentation props
    isPresented: boolean;
    onDismiss: () => void;
    
    // Header props
    title: string;
    isEditMode?: boolean;
    saveText?: string;
    
    // Form state
    onSave: () => Promise<void> | void;
    isSaveDisabled?: boolean;
    isLoading?: boolean;
    errorMessage?: string | null;
    
    // Delete functionality (for edit mode)
    existingItem?: any;
    onDelete?: () => Promise<void> | void;
    deleteButtonText?: string;
    deleteConfirmTitle?: string;
    deleteConfirmMessage?: string;
    
    // Content
    children: React.ReactNode;
}

const BaseFormView: React.FC<BaseFormViewProps> = ({
    isPresented,
    onDismiss,
    title,
    isEditMode = false,
    saveText,
    onSave,
    isSaveDisabled = false,
    isLoading = false,
    errorMessage,
    existingItem,
    onDelete,
    deleteButtonText = "Delete Item",
    deleteConfirmTitle = "Delete Item",
    deleteConfirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
    children
}) => {
    const insets = useSafeAreaInsets();
    const { getColor } = useTheme();

    if (!isPresented) {
        return null;
    }

    const handleDelete = () => {
        if (!existingItem || !onDelete) return;

        Alert.alert(
            deleteConfirmTitle,
            deleteConfirmMessage,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await onDelete();
                    }
                }
            ]
        );
    };

    return (
        <View
            className="bg-background absolute inset-0 z-50"
            style={{ paddingTop: insets.top }}
        >
            <FormViewHeader
                title={title}
                onCancel={onDismiss}
                onSave={onSave}
                isEditMode={isEditMode}
                isSaveDisabled={isSaveDisabled}
                isLoading={isLoading}
                saveText={saveText}
            />

            {errorMessage && (
                <View className="p-4">
                    <Text className="text-error text-center">{errorMessage}</Text>
                </View>
            )}

            <ScrollView className="flex-1 p-4">
                {children}

                {isEditMode && existingItem && onDelete && (
                    <View className="mt-5">
                        <TouchableOpacity
                            className="bg-error flex-row items-center justify-center rounded-lg p-3"
                            onPress={handleDelete}
                            disabled={isLoading}
                        >
                            <Text className="text-on-error text-base font-semibold mr-2">
                                {deleteButtonText}
                            </Text>
                            <Ionicons name="trash-outline" size={20} color={getColor("on-error")} />
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default BaseFormView;