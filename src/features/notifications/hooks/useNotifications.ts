import { useCallback, useState } from 'react';
import { HTTPMethod, useNetworkRequest } from '@/src/hooks/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/useAsyncOperation';
import {
    CreateNotificationTemplateRequest,
    CreateNotificationTemplateResponse,
    DeleteNotificationTemplateResponse,
    GetNotificationTemplatesResponse,
    NotificationEntityType,
    NotificationTemplateData,
    PreviewNotificationTemplateRequest,
    PreviewNotificationTemplateResponse,
    Serializer,
    UpdateNotificationTemplateRequest,
    UpdateNotificationTemplateResponse,
} from '@timothyw/pat-common';

export function useNotifications(entityType: NotificationEntityType, entityId: string) {
    const [ templates, setTemplates ] = useState<NotificationTemplateData[]>([]);

    const { performAuthenticated } = useNetworkRequest();
    const asyncOp = useAsyncOperation();

    const getTemplates = useCallback(async (): Promise<NotificationTemplateData[]> => {
        return asyncOp.execute(async () => {
            const params = new URLSearchParams();
            if (entityType) params.append('entityType', entityType);
            if (entityId) params.append('entityId', entityId);

            const endpoint = `/api/notifications/templates${params.toString() ? '?' + params.toString() : ''}`;

            const response = await performAuthenticated<undefined, GetNotificationTemplatesResponse>({
                endpoint,
                method: HTTPMethod.GET,
            });

            const templates = response.templates.map(template => Serializer.deserialize<NotificationTemplateData>(template));
            setTemplates(templates);
            return templates;
        });
    }, [asyncOp, performAuthenticated, entityType, entityId, setTemplates]);

    const createTemplate = useCallback(async (templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<CreateNotificationTemplateRequest, CreateNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates',
                method: HTTPMethod.POST,
                body: templateData,
            });

            const newTemplate = Serializer.deserialize<NotificationTemplateData>(response.template);

            // Add to current templates if they match the current context
            if (!entityType || !entityId ||
                (templateData.entityType === entityType && templateData.entityId === entityId)) {
                setTemplates(prev => [...prev, newTemplate]);
            }

            return newTemplate;
        });
    }, [asyncOp, performAuthenticated, entityType, entityId]);

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

    const previewTemplate = useCallback(async (request: PreviewNotificationTemplateRequest): Promise<{
        title: string;
        body: string;
        variables: Record<string, any>;
        missingVariables: string[];
    }> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<PreviewNotificationTemplateRequest, PreviewNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates/preview',
                method: HTTPMethod.POST,
                body: request,
            });

            return {
                title: response.preview.title,
                body: response.preview.body,
                variables: response.preview.variables,
                missingVariables: response.missingVariables || []
            };
        });
    }, [asyncOp, performAuthenticated]);

    const getEntitySyncState = useCallback(async (entityType: NotificationEntityType, entityId: string): Promise<{
        synced: boolean;
        hasParentTemplates: boolean;
    }> => {
        try {
            const params = new URLSearchParams();
            params.append('entityType', entityType);
            params.append('entityId', entityId);

            const response = await performAuthenticated<undefined, any>({
                endpoint: `/api/notifications/entity-sync?${params.toString()}`,
                method: HTTPMethod.GET,
            });

            return {
                synced: response.synced,
                hasParentTemplates: response.hasParentTemplates
            };
        } catch (error) {
            console.error('Failed to get entity sync state:', error);
            throw error;
        }
    }, [performAuthenticated]);

    const updateEntitySync = useCallback(async (entityType: NotificationEntityType, entityId: string, synced: boolean): Promise<{
        synced: boolean;
        templates: NotificationTemplateData[];
    }> => {
        return asyncOp.execute(async () => {
            const response = await performAuthenticated<any, any>({
                endpoint: '/api/notifications/entity-sync',
                method: HTTPMethod.PUT,
                body: { entityType, entityId, synced },
            });

            const templates = response.templates?.map((template: any) => Serializer.deserialize<NotificationTemplateData>(template)) || [];

            // Update local state if this matches current context
            if (entityType === templates[0]?.entityType) {
                setTemplates(templates);
            }

            return {
                synced: response.synced,
                templates
            };
        });
    }, [asyncOp, performAuthenticated, templates, setTemplates]);

    return {
        templates,
        getTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        previewTemplate,
        getEntitySyncState,
        updateEntitySync,
    };
}