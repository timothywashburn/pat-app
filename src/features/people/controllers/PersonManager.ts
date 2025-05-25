import { Person, PersonNote, PersonProperty } from '@/src/features/people/models';
import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import {
    CreatePersonRequest,
    CreatePersonResponse, DeletePersonResponse,
    GetPeopleResponse,
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

            const people: Person[] = response.people.map((person: any) => ({
                id: person.id || person._id,
                name: person.name,
                properties: (person.properties || []).map((prop: any) => ({
                    id: prop.id || String(Math.random()),
                    key: prop.key,
                    value: prop.value,
                })),
                notes: (person.notes || []).map((note: any) => ({
                    id: note.id || String(Math.random()),
                    content: note.content,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt),
                })),
            }));

            this._people = people;
        } catch (error) {
            console.error('Failed to load people:', error);
            throw error;
        }
    }

    async createPerson(
        name: string,
        properties: PersonProperty[] = [],
        notes: PersonNote[] = []
    ): Promise<Person> {
        const body = {
            name,
            properties: properties.map(prop => ({
                key: prop.key,
                value: prop.value,
            })),
            notes: notes.map(note => ({
                content: note.content,
            })),
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
            const newPerson = this._people.find(p => p.id === response.person.id);
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
        name: string,
        properties: PersonProperty[],
        notes: PersonNote[]
    ): Promise<void> {
        const body = {
            name,
            properties: properties.map(prop => ({
                key: prop.key,
                value: prop.value,
            })),
            notes: notes.map(note => ({
                content: note.content,
            })),
        };

        try {
            await NetworkManager.shared.performAuthenticated<UpdatePersonRequest, UpdatePersonResponse>({
                endpoint: `/api/people/${id}`,
                method: HTTPMethod.PUT,
                body,
            });

            // Refresh the list
            await this.loadPeople();
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