import { useState, useCallback, useEffect } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import {
    CreatePersonRequest,
    CreatePersonResponse,
    DeletePersonResponse,
    GetPeopleResponse,
    Person,
    PersonNoteData,
    PersonNoteId,
    PersonProperty,
    Serializer,
    UpdatePersonRequest,
    UpdatePersonResponse
} from '@timothyw/pat-common';
import { useToast } from "@/src/components/toast/ToastContext";

export function usePeople() {
    const [ people, setPeople ] = useState<Person[]>([]);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = useCallback(async (): Promise<Person[]> => {
        const response = await performAuthenticated<undefined, GetPeopleResponse>({
            endpoint: '/api/people',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        if (!response.people || !Array.isArray(response.people)) {
            errorToast('Invalid response format');
            return [];
        }

        const people = response.people.map(person => Serializer.deserialize<Person>(person));
        setPeople(people);
        return people;
    }, [performAuthenticated, errorToast, setPeople]);

    const createPerson = useCallback(async (params: {
        name: string;
        properties?: PersonProperty[];
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

        const response = await performAuthenticated<CreatePersonRequest, CreatePersonResponse>({
            endpoint: '/api/people',
            method: HTTPMethod.POST,
            body,
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedPeople = await loadPeople();

        const newPerson = updatedPeople.find(p => p._id === response.person._id);
        if (!newPerson) {
            errorToast('Failed to create person');
            throw new Error('Failed to create person');
        }

        return newPerson;
    }, [performAuthenticated, errorToast, loadPeople]);

    const updatePerson = useCallback(async (
        id: string,
        updates: UpdatePersonRequest,
        autoRefresh: boolean = true
    ): Promise<void> => {
        const response = await performAuthenticated<UpdatePersonRequest, UpdatePersonResponse>({
            endpoint: `/api/people/${id}`,
            method: HTTPMethod.PUT,
            body: updates,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        if (autoRefresh) await loadPeople();
    }, [performAuthenticated, errorToast, loadPeople]);

    const deletePerson = useCallback(async (id: string): Promise<void> => {
        const response = await performAuthenticated<undefined, DeletePersonResponse>({
            endpoint: `/api/people/${id}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return;
        }

        await loadPeople();
    }, [performAuthenticated, errorToast, loadPeople]);

    return {
        people,
        isInitialized,
        loadPeople,
        createPerson,
        updatePerson,
        deletePerson,
    };
}