import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import DetailViewHeader from '../headers/DetailViewHeader';

interface ActionButton {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    isDestructive?: boolean;
}

interface ContentSection {
    content: React.ReactNode;
    showCard?: boolean; // whether to wrap in bg-surface card styling
}

interface NavigationProps {
    navigation?: any;
    route?: any;
}

interface BaseDetailViewProps extends NavigationProps {
    // Header props
    title?: string;
    onEditRequest?: () => void;
    showEdit?: boolean;
    
    // Error handling
    errorMessage?: string | null;
    
    // Content - either simple children or multiple sections
    children?: React.ReactNode;
    sections?: ContentSection[];
    
    // Action buttons
    actions?: ActionButton[];
}

const BaseDetailView: React.FC<BaseDetailViewProps> = ({
    navigation,
    route,
    title = "Details",
    onEditRequest,
    showEdit = true,
    errorMessage,
    children,
    sections,
    actions = []
}) => {
    const { getColor } = useTheme();

    // Handle dismiss
    const handleDismiss = () => {
        navigation.goBack();
    };

    const getButtonStyle = (variant: ActionButton['variant'] = 'primary', isDestructive?: boolean) => {
        if (isDestructive) {
            return 'bg-error';
        }
        switch (variant) {
            case 'primary':
                return 'bg-primary';
            case 'secondary':
                return 'bg-surface border border-outline';
            case 'outline':
                return 'bg-surface border border-outline';
            default:
                return 'bg-primary';
        }
    };

    const getTextStyle = (variant: ActionButton['variant'] = 'primary', isDestructive?: boolean) => {
        if (isDestructive) {
            return 'text-on-error';
        }
        switch (variant) {
            case 'primary':
                return 'text-on-primary';
            case 'secondary':
                return 'text-primary';
            case 'outline':
                return 'text-primary';
            default:
                return 'text-on-primary';
        }
    };

    const getIconColor = (variant: ActionButton['variant'] = 'primary', isDestructive?: boolean) => {
        if (isDestructive) {
            return 'on-error';
        }
        return variant === 'primary' ? 'on-primary' : 'primary';
    };

    return (
        <View className="bg-background flex-1">
            <DetailViewHeader
                title={title}
                onBack={handleDismiss}
                onEdit={onEditRequest || (() => {})}
                showEdit={showEdit && !!onEditRequest}
            />

            {errorMessage && (
                <View className="p-4">
                    <Text className="text-error text-center">{errorMessage}</Text>
                </View>
            )}

            <ScrollView className="flex-1 p-4">
                {/* Handle either sections or single children */}
                {sections ? (
                    sections.map((section, index) => (
                        section.showCard !== false ? (
                            <View key={index} className="bg-surface rounded-lg p-4 mb-5">
                                {section.content}
                            </View>
                        ) : (
                            <View key={index} className="mb-5">
                                {section.content}
                            </View>
                        )
                    ))
                ) : children ? (
                    <View className="bg-surface rounded-lg p-4 mb-5">
                        {children}
                    </View>
                ) : null}

                {actions.length > 0 && (
                    <View className="mt-5 gap-2.5">
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`${getButtonStyle(action.variant, action.isDestructive)} flex-row items-center justify-center rounded-lg p-3`}
                                onPress={action.onPress}
                                disabled={action.disabled || action.loading}
                            >
                                {action.loading ? (
                                    <ActivityIndicator 
                                        size="small" 
                                        color={getColor(getIconColor(action.variant, action.isDestructive))} 
                                    />
                                ) : (
                                    <>
                                        <Text className={`${getTextStyle(action.variant, action.isDestructive)} text-base font-semibold mr-2`}>
                                            {action.label}
                                        </Text>
                                        {action.icon && (
                                            <Ionicons
                                                name={action.icon as any}
                                                size={20}
                                                color={getColor(getIconColor(action.variant, action.isDestructive))}
                                            />
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default BaseDetailView;