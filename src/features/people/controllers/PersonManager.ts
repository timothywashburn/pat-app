import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreatePersonRequest,
    CreatePersonResponse, DeletePersonResponse,
    GetPeopleResponse, Person, PersonNoteData, PersonNoteId, PersonProperty, Serializer,
    UpdatePersonRequest, UpdatePersonResponse
} from "@timothyw/pat-common";

export class PersonManager {
    private static instance: PersonManager;
    private _people: Person[] = [];

    private constructor() {
    }

    static getInstance(): PersonManager {
        if (!PersonManager.instance) {
            PersonManager.instance = new PersonManager();
        }
        return PersonManager.instance;
    }

    get people(): Person[] {
        return [...this._people];
    }

    async loadPeople(): Promise<void> {
        try {
            const response = await NetworkManager.shared.performAuthenticated<undefined, GetPeopleResponse>({
                endpoint: '/api/people',
                method: HTTPMethod.GET,
            });

            if (!response.people || !Array.isArray(response.people)) {
                throw new Error('Invalid response format');
            }

            this._people = response.people.map(person => Serializer.deserializePerson(person));
        } catch (error) {
            console.error('Failed to load people:', error);
            throw error;
        }
    }

    async createPerson(params: {
        name: string;
        properties?: PersonProperty[];
        notes?: PersonNoteId[];
    }): Promise<Person> {
        const body = {
            name: params.name,
            properties: (params.properties || []).map(prop => ({
                key: prop.key,
                value: prop.value,
            })),
            notes: params.notes,
        };

        try {
            const response = await NetworkManager.shared.performAuthenticated<CreatePersonRequest, CreatePersonResponse>({
                endpoint: '/api/people',
                method: HTTPMethod.POST,
                body,
            });

            if (!response.person) {
                throw new Error('Invalid response format');
            }

            // Refresh the list to get the updated data
            await this.loadPeople();

            // Find the newly created person
            const newPerson = this._people.find(p => p._id === response.person._id);
            if (!newPerson) {
                throw new Error('Failed to create person');
            }

            return newPerson;
        } catch (error) {
            console.error('Failed to create person:', error);
            throw error;
        }
    }

    async updatePerson(
        id: string,
        updates: {
            name?: string;
            properties?: PersonProperty[];
            notes?: PersonNoteData[];
        },
        autoRefresh: boolean = true
    ): Promise<void> {
        const body: UpdatePersonRequest = {};

        if (updates.name !== undefined) {
            body.name = updates.name;
        }

        if (updates.properties !== undefined) {
            body.properties = updates.properties.map(prop => ({
                key: prop.key,
                value: prop.value,
            }));
        }

        if (updates.notes !== undefined) {
            body.noteIds = updates.notes.map(note => note._id);
        }

        try {
            await NetworkManager.shared.performAuthenticated<UpdatePersonRequest, UpdatePersonResponse>({
                endpoint: `/api/people/${id}`,
                method: HTTPMethod.PUT,
                body,
            });

            // Refresh the list if requested
            if (autoRefresh) {
                await this.loadPeople();
            }
        } catch (error) {
            console.error('Failed to update person:', error);
            throw error;
        }
    }

    async deletePerson(id: string): Promise<void> {
        try {
            await NetworkManager.shared.performAuthenticated<undefined, DeletePersonResponse>({
                endpoint: `/api/people/${id}`,
                method: HTTPMethod.DELETE,
            });

            // Refresh the list
            await this.loadPeople();
        } catch (error) {
            console.error('Failed to delete person:', error);
            throw error;
        }
    }
}