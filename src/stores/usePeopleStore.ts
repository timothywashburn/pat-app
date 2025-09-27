import { create } from 'zustand';
import {
    CreatePersonRequest,
    CreatePersonResponse,
    DeletePersonResponse,
    GetPeopleResponse,
    Person,
    PersonNoteData,
    PersonNoteId,
    PersonPropertyData,
    Serializer,
    UpdatePersonRequest,
    UpdatePersonResponse,
    CreatePersonNoteRequest,
    CreatePersonNoteResponse,
    GetPersonNotesResponse,
    UpdatePersonNoteRequest,
    UpdatePersonNoteResponse,
    DeletePersonNoteResponse,
    PersonId
} from '@timothyw/pat-common';
import { performAuthenticatedRequest } from '@/src/utils/networkUtils';
import { toastManager } from '@/src/utils/toastUtils';
import { HTTPMethod } from "@/src/hooks/useNetworkRequestTypes";

interface PeopleState {
    people: Person[];
    personNotes: PersonNoteData[];
    isInitialized: boolean;
    isNotesInitialized: boolean;
    isLoading: boolean;
}

interface PeopleActions {
    loadPeople: () => Promise<Person[]>;
    createPerson: (params: { name: string; properties?: PersonPropertyData[]; notes?: PersonNoteId[]; }) => Promise<Person>;
    updatePerson: (id: string, updates: UpdatePersonRequest, autoRefresh?: boolean) => Promise<void>;
    deletePerson: (id: string) => Promise<void>;
    createPersonNote: (personId: PersonId, content: string) => Promise<PersonNoteData>;
    getPersonNotes: () => Promise<PersonNoteData[]>;
    updatePersonNote: (personNoteId: PersonNoteId, content: string) => Promise<PersonNoteData>;
    deletePersonNote: (personNoteId: PersonNoteId) => Promise<boolean>;
}

export const usePeopleStore = create<PeopleState & PeopleActions>((set, get) => ({
    people: [],
    personNotes: [],
    isInitialized: false,
    isNotesInitialized: false,
    isLoading: false,

    loadPeople: async (): Promise<Person[]> => {
        set({ isLoading: true });

        try {
            const response = await performAuthenticatedRequest<undefined, GetPeopleResponse>({
                endpoint: '/api/people',
                method: HTTPMethod.GET,
            });

            if (!response.success) {
                toastManager.errorToast(response.error);
                set({ isLoading: false });
                return [];
            }

            if (!response.people || !Array.isArray(response.people)) {
                toastManager.errorToast('Invalid response format');
                set({ isLoading: false });
                return [];
            }

            const people = response.people.map(person => Serializer.deserialize<Person>(person));
            set({ people, isInitialized: true, isLoading: false });
            return people;
        } catch (error) {
            set({ isLoading: false });
            return [];
        }
    },

    createPerson: async (params: {
        name: string;
        properties?: PersonPropertyData[];
        notes?: PersonNoteId[];
    }): Promise<Person> => {
        const body = {
            name: params.name,
            properties: (params.properties || []).map(prop => ({
                key: prop.key,
                value: prop.value,
            })),
            notes: params.notes,
        };

        const response = await performAuthenticatedRequest<CreatePersonRequest, CreatePersonResponse>({
            endpoint: '/api/people',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedPeople = await get().loadPeople();
        const newPerson = updatedPeople.find(p => p._id === response.person._id);
        if (!newPerson) {
            toastManager.errorToast('Failed to create person');
            throw new Error('Failed to create person');
        }

        return newPerson;
    },

    updatePerson: async (
        id: string,
        updates: UpdatePersonRequest,
        autoRefresh: boolean = true
    ): Promise<void> => {
        const response = await performAuthenticatedRequest<UpdatePersonRequest, UpdatePersonResponse>({
            endpoint: `/api/people/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        if (autoRefresh) await get().loadPeople();
    },

    deletePerson: async (id: string): Promise<void> => {
        const response = await performAuthenticatedRequest<undefined, DeletePersonResponse>({
            endpoint: `/api/people/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        await get().loadPeople();
    },

    createPersonNote: async (personId: PersonId, content: string): Promise<PersonNoteData> => {
        const response = await performAuthenticatedRequest<CreatePersonNoteRequest, CreatePersonNoteResponse>({
            endpoint: '/api/people/notes',
            method: HTTPMethod.POST,
            body: {
                personId,
                content
            }
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const newNote = Serializer.deserialize<PersonNoteData>(response.personNote);
        set(state => ({ 
            personNotes: [...state.personNotes, newNote],
            isNotesInitialized: true
        }));

        return newNote;
    },

    getPersonNotes: async (): Promise<PersonNoteData[]> => {
        const response = await performAuthenticatedRequest<undefined, GetPersonNotesResponse>({
            endpoint: '/api/people/notes',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            return [];
        }

        const personNotes = response.personNotes.map(note => Serializer.deserialize<PersonNoteData>(note));
        set({ personNotes, isNotesInitialized: true });
        return personNotes;
    },

    updatePersonNote: async (personNoteId: PersonNoteId, content: string): Promise<PersonNoteData> => {
        const response = await performAuthenticatedRequest<UpdatePersonNoteRequest, UpdatePersonNoteResponse>({
            endpoint: `/api/people/notes/${personNoteId}`,
            method: HTTPMethod.PUT,
            body: {
                content
            }
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedNote = Serializer.deserialize<PersonNoteData>(response.personNote);
        set(state => ({
            personNotes: state.personNotes.map(note => note._id === personNoteId ? updatedNote : note)
        }));

        return updatedNote;
    },

    deletePersonNote: async (personNoteId: PersonNoteId): Promise<boolean> => {
        const response = await performAuthenticatedRequest<undefined, DeletePersonNoteResponse>({
            endpoint: `/api/people/notes/${personNoteId}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            toastManager.errorToast(response.error);
            return false;
        }

        set(state => ({
            personNotes: state.personNotes.filter(note => note._id !== personNoteId)
        }));

        return true;
    },
}));