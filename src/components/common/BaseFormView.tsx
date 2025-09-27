import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { useAlert } from '@/src/components/alert';
import FormViewHeader from '../headers/FormViewHeader';
import { useRouter } from "expo-router";

interface NavigationProps {
    navigation?: any;
    route?: any;
}

interface BaseFormViewProps extends NavigationProps {
    // Header props
    title: string;
    isEditMode?: boolean;
    saveText?: string;
    
    // Form state
    onSave: () => Promise<void> | void;
    isSaveDisabled?: boolean;
    isLoading?: boolean;
    // TODO: this should be removed and replaced with errorToast
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
    navigation,
    route,
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
    const { getColor } = useTheme();
    const { confirmAlert } = useAlert();

    const router = useRouter();

    // Handle dismiss
    const handleDismiss = () => {
        navigation.goBack();
    };

    // Handle cancel
    const handleCancel = () => {
        // navigation.goBack();
        router.back();
    };

    const handleDelete = () => {
        if (!existingItem || !onDelete) return;

        confirmAlert(
            deleteConfirmTitle,
            deleteConfirmMessage,
            async () => {
                await onDelete();
            }
        );
    };

    return (
        <View className="bg-background flex-1">
            <FormViewHeader
                title={title}
                onCancel={handleCancel}
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