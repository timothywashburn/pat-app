import { useCallback, useState } from 'react';
import { HTTPMethod, useNetworkRequest } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreateNotificationTemplateRequest,
    CreateNotificationTemplateResponse,
    DeleteNotificationTemplateResponse,
    GetEntitySyncResponse,
    GetNotificationTemplatesResponse,
    NotificationEntityType,
    NotificationTemplateData,
    NotificationTemplateLevel,
    NotificationTemplateSyncState,
    Serializer,
    SetEntitySyncRequest,
    SetEntitySyncResponse,
    UpdateNotificationTemplateRequest,
    UpdateNotificationTemplateResponse,
} from '@timothyw/pat-common';

export function useNotifications(targetEntityType: NotificationEntityType, targetId: string, targetLevel: NotificationTemplateLevel) {
    const [ syncState, setSyncState ] = useState<NotificationTemplateSyncState | null>(null);
    const [ templates, setTemplates ] = useState<NotificationTemplateData[]>([]);

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const loadTemplates = useCallback(async (): Promise<void> => {
        return asyncOp.execute(async () => {
            const params = new URLSearchParams();
            if (targetLevel) params.append('targetLevel', targetLevel);
            if (targetEntityType) params.append('targetEntityType', targetEntityType);
            if (targetId) params.append('targetId', targetId);

            const endpoint = `/api/notifications/templates${params.toString() ? '?' + params.toString() : ''}`;

            const response = await performAuthenticated<undefined, GetNotificationTemplatesResponse>({
                endpoint,
                method: HTTPMethod.GET,
            });

            setTemplates(response.templates.map(template => Serializer.deserialize<NotificationTemplateData>(template)));
        });
    }, [asyncOp, performAuthenticated, targetLevel, targetEntityType, targetId, setTemplates]);

    const createTemplate = useCallback(async (templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<CreateNotificationTemplateRequest, CreateNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates',
                method: HTTPMethod.POST,
                body: templateData,
            });

            // setTemplates(prev => [...prev, newTemplate]);
            await loadTemplates();

            return Serializer.deserialize<NotificationTemplateData>(response.template);
        });
    }, [asyncOp, performAuthenticated, targetEntityType, targetId, targetLevel]);

    const updateTemplate = useCallback(async (templateId: string, updates: UpdateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<UpdateNotificationTemplateRequest, UpdateNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.PUT,
                body: updates,
            });

            // setTemplates(prev => prev.map(t => t._id === templateId ? updatedTemplate : t));
            await loadTemplates();

            return Serializer.deserialize<NotificationTemplateData>(response.template);
        });
    }, [asyncOp, performAuthenticated]);

    const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<undefined, DeleteNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.DELETE,
            });

            await loadTemplates();
        });
    }, [asyncOp, performAuthenticated]);

    const loadEntitySyncState = useCallback(async (targetEntityType: NotificationEntityType, targetId: string): Promise<void> => {
        try {
            const params = new URLSearchParams();
            params.append('targetEntityType', targetEntityType);
            params.append('targetId', targetId);

            const response = await performAuthenticated<undefined, GetEntitySyncResponse>({
                endpoint: `/api/notifications/entity-sync?${params.toString()}`,
                method: HTTPMethod.GET,
            });

            setSyncState(response.syncState);
        } catch (error) {
            console.error('Failed to get entity sync state:', error);
            throw error;
        }
    }, [performAuthenticated]);

    const updateEntitySync = useCallback(async (targetEntityType: NotificationEntityType, targetId: string, synced: boolean): Promise<void> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<SetEntitySyncRequest, SetEntitySyncResponse>({
                endpoint: '/api/notifications/entity-sync',
                method: HTTPMethod.PUT,
                body: {
                    targetEntityType,
                    targetId,
                    synced
                },
            });
            setSyncState(response.synced ? NotificationTemplateSyncState.SYNCED : NotificationTemplateSyncState.DESYNCED);
            await loadTemplates();
            await loadEntitySyncState(targetEntityType, targetId);
        });
    }, [asyncOp, performAuthenticated, setTemplates]);

    return {
        templates,
        syncState,
        loadTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        loadEntitySyncState,
        updateEntitySync,
    };
}