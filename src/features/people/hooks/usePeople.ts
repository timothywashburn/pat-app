import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
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

export interface PeopleHookState {
    people: Person[];
    isLoading: boolean;
    error: string | null;
}

/**
 * React hook for managing people
 * Replaces the PersonManager singleton
 */
export function usePeople() {
    const [state, setState] = useState<PeopleHookState>({
        people: [],
        isLoading: false,
        error: null,
    });

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }));
    }, []);

    const setPeople = useCallback((people: Person[]) => {
        setState(prev => ({ ...prev, people, error: null }));
    }, []);

    /**
     * Load all people
     */
    const loadPeople = useCallback(async (): Promise<Person[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetPeopleResponse>({
                endpoint: '/api/people',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load people');

            if (!response.people || !Array.isArray(response.people)) {
                throw new Error('Invalid response format');
            }

            const people = response.people.map(person => Serializer.deserializePerson(person));
            setPeople(people);
            setLoading(false);
            return people;
        }, { errorMessage: 'Failed to load people' });
    }, [asyncOp, performAuthenticated, setLoading, setError, setPeople]);

    /**
     * Create a new person
     */
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

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreatePersonRequest, CreatePersonResponse>({
                endpoint: '/api/people',
                method: HTTPMethod.POST,
                body,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create person');

            // Refresh people list
            const updatedPeople = await loadPeople();

            const newPerson = updatedPeople.find(p => p._id === response.person._id);
            if (!newPerson) throw new Error('Failed to create person');

            setLoading(false);
            return newPerson;
        }, { errorMessage: 'Failed to create person' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadPeople]);

    /**
     * Update a person
     */
    const updatePerson = useCallback(async (
        id: string,
        updates: {
            name?: string;
            properties?: PersonProperty[];
            notes?: PersonNoteData[];
        },
        autoRefresh: boolean = true
    ): Promise<void> => {
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

        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<UpdatePersonRequest, UpdatePersonResponse>({
                endpoint: `/api/people/${id}`,
                method: HTTPMethod.PUT,
                body,
            }, { skipLoadingState: true });

            // Refresh the list if requested
            if (autoRefresh) {
                await loadPeople();
            }
            setLoading(false);
        }, { errorMessage: 'Failed to update person' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadPeople]);

    /**
     * Delete a person
     */
    const deletePerson = useCallback(async (id: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            await performAuthenticated<undefined, DeletePersonResponse>({
                endpoint: `/api/people/${id}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            // Refresh the list
            await loadPeople();
            setLoading(false);
        }, { errorMessage: 'Failed to delete person' });
    }, [asyncOp, performAuthenticated, setLoading, setError, loadPeople]);

    return {
        ...state,
        loadPeople,
        createPerson,
        updatePerson,
        deletePerson,
    };
}