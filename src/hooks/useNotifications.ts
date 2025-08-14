import { useState, useCallback } from 'react';
import { useNetworkRequest, HTTPMethod } from '@/src/hooks/base/useNetworkRequest';
import { useAsyncOperation } from '@/src/hooks/base/useAsyncOperation';
import {
    NotificationTemplateData,
    NotificationEntityType,
    CreateNotificationTemplateRequest,
    CreateNotificationTemplateResponse,
    GetNotificationTemplatesResponse,
    UpdateNotificationTemplateRequest,
    UpdateNotificationTemplateResponse,
    DeleteNotificationTemplateResponse,
    PreviewNotificationTemplateRequest,
    PreviewNotificationTemplateResponse,
    Serializer,
} from '@timothyw/pat-common';

export interface NotificationHookState {
    templates: NotificationTemplateData[];
    isLoading: boolean;
    error: string | null;
}

export function useNotifications(entityType?: NotificationEntityType, entityId?: string) {
    const [state, setState] = useState<NotificationHookState>({
        templates: [],
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

    const setTemplates = useCallback((templates: NotificationTemplateData[]) => {
        setState(prev => ({ ...prev, templates, error: null }));
    }, []);

    /**
     * Get notification templates for a user
     */
    const getTemplates = useCallback(async (
        overrideEntityType?: NotificationEntityType, 
        overrideEntityId?: string
    ): Promise<NotificationTemplateData[]> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            const effectiveEntityType = overrideEntityType || entityType;
            const effectiveEntityId = overrideEntityId || entityId;
            
            if (effectiveEntityType) params.append('entityType', effectiveEntityType);
            if (effectiveEntityId) params.append('entityId', effectiveEntityId);

            const endpoint = `/api/notifications/templates${params.toString() ? '?' + params.toString() : ''}`;

            const response = await performAuthenticated<undefined, GetNotificationTemplatesResponse>({
                endpoint,
                method: HTTPMethod.GET,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to get notification templates');

            const templates = response.templates?.map(template => Serializer.deserializeNotificationTemplateData(template)) || [];
            setTemplates(templates);
            setLoading(false);
            return templates;
        }, { errorMessage: 'Failed to get notification templates' });
    }, [asyncOp, performAuthenticated, entityType, entityId, setLoading, setError, setTemplates]);

    /**
     * Create a new notification template
     */
    const createTemplate = useCallback(async (templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<CreateNotificationTemplateRequest, CreateNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates',
                method: HTTPMethod.POST,
                body: templateData,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to create notification template');
            if (!response.template) throw new Error('No template returned');

            const newTemplate = Serializer.deserializeNotificationTemplateData(response.template);
            
            // Add to current templates if they match the current context
            if (!entityType || !entityId || 
                (templateData.entityType === entityType && templateData.entityId === entityId)) {
                setState(prev => ({
                    ...prev,
                    templates: [...prev.templates, newTemplate],
                    error: null
                }));
            }

            setLoading(false);
            return newTemplate;
        }, { errorMessage: 'Failed to create notification template' });
    }, [asyncOp, performAuthenticated, entityType, entityId, setLoading, setError]);

    /**
     * Update a notification template
     */
    const updateTemplate = useCallback(async (templateId: string, updates: UpdateNotificationTemplateRequest): Promise<NotificationTemplateData> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<UpdateNotificationTemplateRequest, UpdateNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.PUT,
                body: updates,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to update notification template');
            if (!response.template) throw new Error('No template returned');

            const updatedTemplate = Serializer.deserializeNotificationTemplateData(response.template);
            
            // Update in current templates
            setState(prev => ({
                ...prev,
                templates: prev.templates.map(t => t._id === templateId ? updatedTemplate : t),
                error: null
            }));

            setLoading(false);
            return updatedTemplate;
        }, { errorMessage: 'Failed to update notification template' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    /**
     * Delete a notification template
     */
    const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<undefined, DeleteNotificationTemplateResponse>({
                endpoint: `/api/notifications/templates/${templateId}`,
                method: HTTPMethod.DELETE,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to delete notification template');

            // Remove from current templates
            setState(prev => ({
                ...prev,
                templates: prev.templates.filter(t => t._id !== templateId),
                error: null
            }));
            setLoading(false);
        }, { errorMessage: 'Failed to delete notification template' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    /**
     * Preview a notification template
     */
    const previewTemplate = useCallback(async (request: PreviewNotificationTemplateRequest): Promise<{
        title: string;
        body: string;
        variables: Record<string, any>;
        missingVariables: string[];
    }> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<PreviewNotificationTemplateRequest, PreviewNotificationTemplateResponse>({
                endpoint: '/api/notifications/templates/preview',
                method: HTTPMethod.POST,
                body: request,
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to preview notification template');
            if (!response.preview) throw new Error('No preview returned');

            setLoading(false);
            return {
                title: response.preview.title,
                body: response.preview.body,
                variables: response.preview.variables,
                missingVariables: response.missingVariables || []
            };
        }, { errorMessage: 'Failed to preview notification template' });
    }, [asyncOp, performAuthenticated, setLoading, setError]);

    /**
     * Get entity sync state
     */
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
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to get entity sync state');

            return {
                synced: response.synced,
                hasParentTemplates: response.hasParentTemplates
            };
        } catch (error) {
            console.error('Failed to get entity sync state:', error);
            throw error;
        }
    }, [performAuthenticated]);

    /**
     * Update entity sync state
     */
    const updateEntitySync = useCallback(async (entityType: NotificationEntityType, entityId: string, synced: boolean): Promise<{
        synced: boolean;
        templates: NotificationTemplateData[];
    }> => {
        return asyncOp.execute(async () => {
            setLoading(true);
            setError(null);

            const response = await performAuthenticated<any, any>({
                endpoint: '/api/notifications/entity-sync',
                method: HTTPMethod.PUT,
                body: { entityType, entityId, synced },
            }, { skipLoadingState: true });

            if (!response.success) throw new Error('Failed to update entity sync');

            const templates = response.templates?.map((template: any) => Serializer.deserializeNotificationTemplateData(template)) || [];
            
            // Update local state if this matches current context
            if (entityType === state.templates[0]?.entityType) {
                setTemplates(templates);
            }

            setLoading(false);
            return {
                synced: response.synced,
                templates
            };
        }, { errorMessage: 'Failed to update entity sync' });
    }, [asyncOp, performAuthenticated, state.templates, setLoading, setError, setTemplates]);

    return {
        ...state,
        getTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        previewTemplate,
        getEntitySyncState,
        updateEntitySync,
    };
}