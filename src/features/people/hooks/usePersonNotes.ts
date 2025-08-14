import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreatePersonNoteRequest,
    CreatePersonNoteResponse,
    GetPersonNotesResponse,
    UpdatePersonNoteRequest,
    UpdatePersonNoteResponse,
    DeletePersonNoteResponse,
    PersonNoteId,
    PersonNoteData,
    PersonId,
    Serializer, ListItemData
} from '@timothyw/pat-common';

export interface PersonNotesHookState {
    personNotes: PersonNoteData[];
    isLoading: boolean;
    error: string | null;
}

export function usePersonNotes() {
    const [state, setState] = useState<PersonNotesHookState>({
        personNotes: [],
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

    const setPersonNotes = useCallback((personNotes: PersonNoteData[]) => {
        setState(prev => ({ ...prev, personNotes, error: null }));
    }, []);

    const createPersonNote = useCallback(async (personId: PersonId, content: string): Promise<PersonNoteData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreatePersonNoteRequest, CreatePersonNoteResponse>({
                endpoint: '/api/people/notes',
                method: HTTPMethod.POST,
                body: {
                    personId,
                    content
                }
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create person note');

            const newNote = Serializer.deserialize<PersonNoteData>(response.personNote);

            setState(prev => ({
                ...prev,
                personNotes: [...prev.personNotes, newNote],
                error: null
            }));

            setLoading(false);
            return newNote;
        }, { errorMessage: 'Failed to create person note' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    const getPersonNotes = useCallback(async (): Promise<PersonNoteData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, GetPersonNotesResponse>({
                endpoint: '/api/people/notes',
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to load person notes');

            const personNotes = response.personNotes.map(note => Serializer.deserialize<PersonNoteData>(note));
            setPersonNotes(personNotes);
            setLoading(false);
            return personNotes;
        }, { errorMessage: 'Failed to load person notes' });
    }, [asyncOp, performAuthenticated, setLoading, setError, setPersonNotes]);

    const updatePersonNote = useCallback(async (personNoteId: PersonNoteId, content: string): Promise<PersonNoteData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<UpdatePersonNoteRequest, UpdatePersonNoteResponse>({
                endpoint: `/api/people/notes/${personNoteId}`,
                method: HTTPMethod.PUT,
                body: {
                    content
                }
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to update person note');

            const updatedNote = Serializer.deserialize<PersonNoteData>(response.personNote);

            setState(prev => ({
                ...prev,
                personNotes: prev.personNotes.map(note => 
                    note._id === personNoteId ? updatedNote : note
                ),
                error: null
            }));

            setLoading(false);
            return updatedNote;
        }, { errorMessage: 'Failed to update person note' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    const deletePersonNote = useCallback(async (personNoteId: PersonNoteId): Promise<boolean> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, DeletePersonNoteResponse>({
                endpoint: `/api/people/notes/${personNoteId}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            if (response.success) {
                setState(prev => ({
                    ...prev,
                    personNotes: prev.personNotes.filter(note => note._id !== personNoteId),
                    error: null
                }));
            }

            setLoading(false);
            return response.success;
        }, { errorMessage: 'Failed to delete person note' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    return {
        ...state,
        createPersonNote,
        getPersonNotes,
        updatePersonNote,
        deletePersonNote,
    };
}