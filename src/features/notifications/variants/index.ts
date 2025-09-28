import {
    NotificationVariantType,
    NotificationEntityType,
    ENTITY_TYPE_VARIANT_MAP, notificationSchedulerDataSchema
} from '@timothyw/pat-common';
import { agendaItemDueVariant } from './AgendaItemDue';
import { habitDueVariant } from './HabitDue';
import { habitTimedReminderVariant } from './HabitTimedReminder';
import { clearInboxTimedReminderVariant } from './ClearInboxTimedReminder';
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';

export interface SchedulerFormProps {
    schedulerData: z.infer<typeof notificationSchedulerDataSchema>; // TODO: these infers can probably be converted to just one and moved to common
    onSchedulerDataChange: (data: z.infer<typeof notificationSchedulerDataSchema>) => void;
}

export interface DisplayComponentProps {
    schedulerData: z.infer<typeof notificationSchedulerDataSchema>;
    variantData: any;
}

export interface NotificationVariantInformation {
    type: NotificationVariantType;
    displayName: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    defaultSchedulerData: z.infer<typeof notificationSchedulerDataSchema>;
    defaultVariantData: any;
    dataForm?: React.ComponentType<SchedulerFormProps>;
    displayComponent?: React.ComponentType<DisplayComponentProps>;
}

export const VARIANT_REGISTRY = {
    [NotificationVariantType.AGENDA_ITEM_DUE]: agendaItemDueVariant,
    [NotificationVariantType.HABIT_TIMED_REMINDER]: habitTimedReminderVariant,
    [NotificationVariantType.HABIT_DUE]: habitDueVariant,
    [NotificationVariantType.CLEAR_INBOX_TIMED_REMINDER]: clearInboxTimedReminderVariant,
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

export * from './AgendaItemDue';
export * from './HabitDue';
export * from './HabitTimedReminder';
export * from './ClearInboxTimedReminder';