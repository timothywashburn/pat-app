import { 
    NotificationVariantType, 
    NotificationSchedulerType 
} from '@timothyw/pat-common';
import { NotificationVariantInformation } from "@/src/features/notifications/variants/index";

export const habitIncompleteVariant: NotificationVariantInformation = {
    type: NotificationVariantType.HABIT_INCOMPLETE,
    displayName: 'Incomplete Habit',
    description: 'Get reminded when a habit hasn\'t been completed',
    icon: 'checkmark-circle',
    defaultSchedulerData: {
        type: NotificationSchedulerType.DAY_TIME,
        days: [0, 1, 2, 3, 4, 5, 6],
        time: '20:00'
    },
    defaultVariantData: {
        type: NotificationVariantType.HABIT_INCOMPLETE,
    }
};