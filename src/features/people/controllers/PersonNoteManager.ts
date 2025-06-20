import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreatePersonNoteRequest,
    CreatePersonNoteResponse,
    GetPersonNotesResponse,
    UpdatePersonNoteRequest,
    UpdatePersonNoteResponse,
    DeletePersonNoteResponse,
    PersonNoteId,
    PersonNoteData,
    PersonId
} from "@timothyw/pat-common";

export class PersonNoteManager {
    private static instance: PersonNoteManager;

    private constructor() {
    }

    static getInstance(): PersonNoteManager {
        if (!PersonNoteManager.instance) {
            PersonNoteManager.instance = new PersonNoteManager();
        }
        return PersonNoteManager.instance;
    }

    async createPersonNote(personId: PersonId, content: string): Promise<PersonNoteData> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<CreatePersonNoteRequest, CreatePersonNoteResponse>({
                endpoint: '/api/people/notes',
                method: HTTPMethod.POST,
                body: {
                    personId,
                    content
                }
            });

            if (!response.personNote) {
                throw new Error('Invalid response format');
            }

            return response.personNote;
        } catch (error) {
            console.error('Failed to create person note:', error);
            throw error;
        }
    }

    async getPersonNotes(): Promise<PersonNoteData[]> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetPersonNotesResponse>({
                endpoint: '/api/people/notes',
                method: HTTPMethod.GET,
            });

            if (!response.personNotes || !Array.isArray(response.personNotes)) {
                throw new Error('Invalid response format');
            }

            return response.personNotes;
        } catch (error) {
            console.error('Failed to load person notes:', error);
            throw error;
        }
    }

    async updatePersonNote(personNoteId: PersonNoteId, content: string): Promise<PersonNoteData> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<UpdatePersonNoteRequest, UpdatePersonNoteResponse>({
                endpoint: `/api/people/notes/${personNoteId}`,
                method: HTTPMethod.PUT,
                body: {
                    content
                }
            });

            if (!response.personNote) {
                throw new Error('Invalid response format');
            }

            return response.personNote;
        } catch (error) {
            console.error('Failed to update person note:', error);
            throw error;
        }
    }

    async deletePersonNote(personNoteId: PersonNoteId): Promise<boolean> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, DeletePersonNoteResponse>({
                endpoint: `/api/people/notes/${personNoteId}`,
                method: HTTPMethod.DELETE,
            });

            return response.success;
        } catch (error) {
            console.error('Failed to delete person note:', error);
            throw error;
        }
    }
}