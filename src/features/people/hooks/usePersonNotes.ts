import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/useNetworkRequest';
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
import { useToast } from "@/src/components/toast/ToastContext";

export function usePersonNotes() {
    const [ personNotes, setPersonNotes ] = useState<PersonNoteData[]>([]);
    const [ isInitialized, setIsInitialized ] = useState<boolean>(false);

    const { performAuthenticated } = useNetworkRequest();
    const { errorToast } = useToast();

    const createPersonNote = useCallback(async (personId: PersonId, content: string): Promise<PersonNoteData> => {
        const response = await performAuthenticated<CreatePersonNoteRequest, CreatePersonNoteResponse>({
            endpoint: '/api/people/notes',
            method: HTTPMethod.POST,
            body: {
                personId,
                content
            }
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const newNote = Serializer.deserialize<PersonNoteData>(response.personNote);

        setPersonNotes(prev => [...prev, newNote]);
        setIsInitialized(true);

        return newNote;
    }, [performAuthenticated, errorToast]);

    const getPersonNotes = useCallback(async (): Promise<PersonNoteData[]> => {
        const response = await performAuthenticated<undefined, GetPersonNotesResponse>({
            endpoint: '/api/people/notes',
            method: HTTPMethod.GET,
        });

        if (!response.success) {
            errorToast(response.error);
            return [];
        }

        const personNotes = response.personNotes.map(note => Serializer.deserialize<PersonNoteData>(note));
        setPersonNotes(personNotes);
        return personNotes;
    }, [performAuthenticated, errorToast, setPersonNotes]);

    const updatePersonNote = useCallback(async (personNoteId: PersonNoteId, content: string): Promise<PersonNoteData> => {
        const response = await performAuthenticated<UpdatePersonNoteRequest, UpdatePersonNoteResponse>({
            endpoint: `/api/people/notes/${personNoteId}`,
            method: HTTPMethod.PUT,
            body: {
                content
            }
        });

        if (!response.success) {
            errorToast(response.error);
            throw new Error(response.error);
        }

        const updatedNote = Serializer.deserialize<PersonNoteData>(response.personNote);

        setPersonNotes(prev => prev.map(note => note._id === personNoteId ? updatedNote : note));

        return updatedNote;
    }, [performAuthenticated, errorToast]);

    const deletePersonNote = useCallback(async (personNoteId: PersonNoteId): Promise<boolean> => {
        const response = await performAuthenticated<undefined, DeletePersonNoteResponse>({
            endpoint: `/api/people/notes/${personNoteId}`,
            method: HTTPMethod.DELETE,
        });

        if (!response.success) {
            errorToast(response.error);
            return false;
        }

        setPersonNotes(prev => prev.filter(note => note._id !== personNoteId));

        return true;
    }, [performAuthenticated, errorToast]);

    return {
        personNotes,
        isInitialized,
        createPersonNote,
        getPersonNotes,
        updatePersonNote,
        deletePersonNote,
    };
}