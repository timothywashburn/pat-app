export interface AgendaItem {
    id: string;
    name: string;
    date?: Date;
    notes?: string;
    urgent: boolean;
    completed: boolean;
    category?: string;
    type?: string;
}