import { ListItemData, ListData, ListType } from "@timothyw/pat-common";

export interface ListWithItems extends ListData {
    items: ListItemData[];
}

export const sortListItems = (listItems: ListItemData[], listType: ListType = ListType.TASKS): ListItemData[] => {
    return listItems.sort((a, b) => {
        // For note lists, only sort by creation date (newest first)
        if (listType === ListType.NOTES) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        // For lists, sort incomplete items first, then completed
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Within each group, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};