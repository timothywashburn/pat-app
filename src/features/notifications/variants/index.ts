import {
    NotificationVariantType,
    NotificationEntityType,
    ENTITY_TYPE_VARIANT_MAP, notificationSchedulerDataSchema
} from '@timothyw/pat-common';
import { agendaItemUpcomingDeadlineVariant } from './AgendaItemUpcomingDeadline';
import { habitIncompleteVariant } from './HabitIncomplete';
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';

export interface SchedulerFormProps {
    schedulerData: z.infer<typeof notificationSchedulerDataSchema>;
    onSchedulerDataChange: (data: z.infer<typeof notificationSchedulerDataSchema>) => void;
}

export interface NotificationVariantInformation {
    type: NotificationVariantType;
    displayName: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    defaultSchedulerData: z.infer<typeof notificationSchedulerDataSchema>;
    defaultVariantData: any;
    dataForm?: React.ComponentType<SchedulerFormProps>;
}

export const VARIANT_REGISTRY = {
    [NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE]: agendaItemUpcomingDeadlineVariant,
    [NotificationVariantType.HABIT_INCOMPLETE]: habitIncompleteVariant,
};

export function getVariantDefinition(variantType: NotificationVariantType): NotificationVariantInformation | undefined {
    return VARIANT_REGISTRY[variantType];
}

export function getAvailableVariantsForEntity(entityType: NotificationEntityType): NotificationVariantInformation[] {
    const availableVariantTypes = ENTITY_TYPE_VARIANT_MAP[entityType] || [];
    return availableVariantTypes
        .map(variantType => VARIANT_REGISTRY[variantType])
        .filter(Boolean);
}

export function getDefaultDataForVariant(variantType: NotificationVariantType) {
    const variant = getVariantDefinition(variantType);
    if (!variant) return { variantData: null, schedulerData: null };
    
    return {
        variantData: variant.defaultVariantData,
        schedulerData: variant.defaultSchedulerData
    };
}

export * from './AgendaItemUpcomingDeadline';
export * from './HabitIncomplete';