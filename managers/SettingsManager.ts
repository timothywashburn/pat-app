import { Settings, PanelSetting, PanelType } from '../models';
import NetworkManager, { HTTPMethod } from '../services/NetworkManager';
import { AuthState } from '../services/AuthState';

export class SettingsManager {
    private static instance: SettingsManager;
    private _settings: Settings = {
        panels: [
            {
                id: '1',
                panel: {
                    type: PanelType.Agenda,
                    title: 'Agenda',
                    icon: 'calendar',
                },
                visible: true,
            },
            {
                id: '2',
                panel: {
                    type: PanelType.Inbox,
                    title: 'Inbox',
                    icon: 'mail',
                },
                visible: true,
            },
            {
                id: '3',
                panel: {
                    type: PanelType.Tasks,
                    title: 'Tasks',
                    icon: 'list',
                },
                visible: true,
            },
            {
                id: '4',
                panel: {
                    type: PanelType.People,
                    title: 'People',
                    icon: 'people',
                },
                visible: true,
            },
            {
                id: '5',
                panel: {
                    type: PanelType.Settings,
                    title: 'Settings',
                    icon: 'settings',
                },
                visible: true,
            },
        ],
        categories: ['Work', 'Personal', 'Family', 'Health', 'Finance'],
        types: ['Meeting', 'Call', 'Task', 'Reminder', 'Appointment'],
        propertyKeys: ['Email', 'Phone', 'Address', 'Website', 'Birthday'],
    };

    private constructor() {}

    public static get shared(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    get panels(): PanelSetting[] {
        return [...this._settings.panels];
    }

    set panels(newPanels: PanelSetting[]) {
        this._settings.panels = [...newPanels];
    }

    get categories(): string[] {
        return [...this._settings.categories];
    }

    get types(): string[] {
        return [...this._settings.types];
    }

    get propertyKeys(): string[] {
        return [...this._settings.propertyKeys];
    }

    async loadSettings(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            return;
        }

        try {
            const response = await NetworkManager.shared.perform({
                endpoint: '/api/account/config',
                method: HTTPMethod.GET,
                token: authToken,
            });

            if (response.user) {
                const userData = response.user;

                if (userData.iosApp) {
                    // When we get to implementing this for real, we'll use the equivalent
                    // of the iOS app's settings, adapting them for React Native

                    if (userData.iosApp.itemCategories) {
                        this._settings.categories = userData.iosApp.itemCategories;
                    }

                    if (userData.iosApp.itemTypes) {
                        this._settings.types = userData.iosApp.itemTypes;
                    }

                    if (userData.iosApp.propertyKeys) {
                        this._settings.propertyKeys = userData.iosApp.propertyKeys;
                    }

                    if (userData.iosApp.panels) {
                        this.updatePanelsFromSettings(userData.iosApp.panels);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    private updatePanelsFromSettings(panelSettings: any[]): void {
        const panelMap: Record<string, PanelType> = {
            'agenda': PanelType.Agenda,
            'inbox': PanelType.Inbox,
            'tasks': PanelType.Tasks,
            'people': PanelType.People,
            'settings': PanelType.Settings,
        };

        const iconMap: Record<PanelType, string> = {
            [PanelType.Agenda]: 'calendar',
            [PanelType.Inbox]: 'mail',
            [PanelType.Tasks]: 'list',
            [PanelType.People]: 'people',
            [PanelType.Settings]: 'settings',
        };

        let newPanels: PanelSetting[] = [];

        for (const setting of panelSettings) {
            if (setting.panel && typeof setting.panel === 'string' && setting.visible !== undefined) {
                const panelName = setting.panel.toLowerCase();
                const panelType = panelMap[panelName];

                if (panelType) {
                    newPanels.push({
                        id: String(newPanels.length + 1),
                        panel: {
                            type: panelType,
                            title: panelType,
                            icon: iconMap[panelType],
                        },
                        visible: Boolean(setting.visible),
                    });
                }
            }
        }

        // Add any missing panels (all visible by default)
        const configuredPanelTypes = new Set(newPanels.map(p => p.panel.type));
        for (const panelType of Object.values(PanelType)) {
            if (!configuredPanelTypes.has(panelType)) {
                newPanels.push({
                    id: String(newPanels.length + 1),
                    panel: {
                        type: panelType,
                        title: panelType,
                        icon: iconMap[panelType],
                    },
                    visible: true,
                });
            }
        }

        this._settings.panels = newPanels;
    }

    async updatePanelSettings(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            return;
        }

        try {
            const panelSettings = this._settings.panels.map(setting => ({
                panel: setting.panel.type.toLowerCase(),
                visible: setting.visible,
            }));

            const body = {
                iosApp: {
                    panels: panelSettings,
                }
            };

            await NetworkManager.shared.perform({
                endpoint: '/api/account/config',
                method: HTTPMethod.PUT,
                body,
                token: authToken,
            });
        } catch (error) {
            console.error('Failed to update panel settings:', error);
            throw error;
        }
    }

    async updateItemCategories(categories: string[]): Promise<void> {
        this._settings.categories = [...categories];
        await this.updateConfig({ itemCategories: categories });
    }

    async updateItemTypes(types: string[]): Promise<void> {
        this._settings.types = [...types];
        await this.updateConfig({ itemTypes: types });
    }

    async updatePropertyKeys(keys: string[]): Promise<void> {
        this._settings.propertyKeys = [...keys];
        await this.updateConfig({ propertyKeys: keys });
    }

    private async updateConfig(update: Record<string, any>): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            return;
        }

        try {
            const body = {
                iosApp: update,
            };

            await NetworkManager.shared.perform({
                endpoint: '/api/account/config',
                method: HTTPMethod.PUT,
                body,
                token: authToken,
            });
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }
}