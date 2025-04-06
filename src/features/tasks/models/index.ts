export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
}