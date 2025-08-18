import { useCallback, useState } from 'react';
import { HTTPMethod, useNetworkRequest } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreateNotificationTemplateRequest,
    CreateNotificationTemplateResponse,
    DeleteNotificationTemplateResponse,
    GetNotificationTemplatesResponse,
    NotificationTemplateData,
    Serializer,
    UpdateNotificationTemplateRequest,
    UpdateNotificationTemplateResponse,
    EntitySyncRequest,
    EntitySyncResponse,
    GetEntitySyncRequest,
    GetEntitySyncResponse,
    NotificationEntityType,
    NotificationTemplateLevel,
} from '@timothyw/pat-common';

export function useNotifications(targetEntityType: NotificationEntityType, targetId: string, targetLevel: NotificationTemplateLevel) {
    const [ templates, setTemplates ] = useState<NotificationTemplateData[]>([]);

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const getTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
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

            const templates = response.templates.map(template => Serializer.deserialize<NotificationTemplateData>(template));
            setTemplates(templates);
            return templates;
        });
    }, [asyncOp, performAuthenticated, targetLevel, targetEntityType, targetId, setTemplates]);

    const createTemplate = useCallback(async (templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<CreateNotificationTemplateRequest, CreateNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates',
                method: HTTPMethod.POST,
                body: templateData,
            });

            const newTemplate = Serializer.deserialize<NotificationTemplateData>(response.template);

            // Add to current templates if they match the current context
            if (templateData.targetEntityType === targetEntityType && 
                templateData.targetId === targetId &&
                templateData.targetLevel === targetLevel) {
                setTemplates(prev => [...prev, newTemplate]);
            }

            return newTemplate;
        });
    }, [asyncOp, performAuthenticated, targetEntityType, targetId, targetLevel]);

    const updateTemplate = useCallback(async (templateId: string, updates: UpdateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<UpdateNotificationTemplateRequest, UpdateNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.PUT,
                body: updates,
            });

            const updatedTemplate = Serializer.deserialize<NotificationTemplateData>(response.template);

            setTemplates(prev => prev.map(t => t._id === templateId ? updatedTemplate : t));

            return updatedTemplate;
        });
    }, [asyncOp, performAuthenticated]);

    const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<undefined, DeleteNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.DELETE,
            });

            setTemplates(prev => prev.filter(t => t._id !== templateId));
        });
    }, [asyncOp, performAuthenticated]);

    const getEntitySyncState = useCallback(async (targetEntityType: NotificationEntityType, targetId: string): Promise<{
        synced: boolean;
    }> => {
        try {
            const params = new URLSearchParams();
            params.append('targetEntityType', targetEntityType);
            params.append('targetId', targetId);

            const response = await performAuthenticated<undefined, GetEntitySyncResponse>({
                endpoint: `/api/notifications/entity-sync?${params.toString()}`,
                method: HTTPMethod.GET,
            });

            return {
                synced: response.synced
            };
        } catch (error) {
            console.error('Failed to get entity sync state:', error);
            throw error;
        }
    }, [performAuthenticated]);

    const updateEntitySync = useCallback(async (targetEntityType: NotificationEntityType, targetId: string, synced: boolean): Promise<{
        synced: boolean;
        templates: NotificationTemplateData[];
    }> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<EntitySyncRequest, EntitySyncResponse>({
                endpoint: '/api/notifications/entity-sync',
                method: HTTPMethod.PUT,
                body: { targetEntityType, targetId, synced },
            });

            const templates = response.templates?.map((template: any) => Serializer.deserialize<NotificationTemplateData>(template)) || [];

            // Update local state if this matches current context
            if (templates.length > 0 && targetEntityType === templates[0]?.targetEntityType) {
                setTemplates(templates);
            }

            return {
                synced: response.synced,
                templates
            };
        });
    }, [asyncOp, performAuthenticated, setTemplates]);

    const refreshTemplates = useCallback(async () => {
        await getTemplates();
    }, [getTemplates]);

    return {
        templates,
        getTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getEntitySyncState,
        updateEntitySync,
        refreshTemplates,
    };
}