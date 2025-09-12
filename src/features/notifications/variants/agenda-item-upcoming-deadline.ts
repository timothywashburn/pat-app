import { 
    NotificationVariantType, 
    NotificationSchedulerType 
} from '@timothyw/pat-common';
import { NotificationVariantInformation } from "@/src/features/notifications/variants/index";

export const agendaItemUpcomingDeadlineVariant: NotificationVariantInformation = {
    type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
    displayName: 'Upcoming Deadline',
    description: 'Get notified before an agenda item\'s deadline',
    icon: 'alarm',
    defaultSchedulerData: {
        type: NotificationSchedulerType.RELATIVE_DATE,
        offsetMinutes: -60
    },
    defaultVariantData: {
        type: NotificationVariantType.AGENDA_ITEM_UPCOMING_DEADLINE,
    }
};