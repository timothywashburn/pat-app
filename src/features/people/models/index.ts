export interface PersonProperty {
    id: string;
    key: string;
    value: string;
}

export interface PersonNote {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Person {
    id: string;
    name: string;
    properties: PersonProperty[];
    notes: PersonNote[];
}