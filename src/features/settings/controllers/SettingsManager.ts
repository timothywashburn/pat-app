import NetworkManager, { HTTPMethod } from '@/src/services/NetworkManager';
import { AuthState } from '@/src/features/auth/controllers/AuthState';
import { PanelType, Settings, PanelSetting } from "@/src/features/settings/models";
import { GetUserConfigResponse, UpdateUserConfigRequest, UpdateUserConfigResponse } from "@timothyw/pat-common";

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
        categories: ['School', 'Work', 'Personal'],
        types: ['Assignment', 'Project'],
        propertyKeys: ['Email', 'Phone', 'Company', 'Title'],
    };
    private _config: Record<string, any> = {};
    private _isLoaded: boolean = false;

    private constructor() {
    }

    public static get shared(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    get isLoaded(): boolean {
        return this._isLoaded;
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

    get config(): Record<string, any> {
        return { ...this._config };
    }

    async loadSettings(): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('No auth token');
        }

        try {
            const response = await NetworkManager.shared.perform<undefined, GetUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.GET,
                token: authToken,
            });

            if (response.user) {
                this._config = response.user;
                this.updateFromConfig();
                this._isLoaded = true;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            throw error;
        }
    }

    private updateFromConfig(): void {
        if (this._config.iosApp) {
            const iosApp = this._config.iosApp;

            if (iosApp.itemCategories) {
                this._settings.categories = iosApp.itemCategories;
            }

            if (iosApp.itemTypes) {
                this._settings.types = iosApp.itemTypes;
            }

            if (iosApp.propertyKeys) {
                this._settings.propertyKeys = iosApp.propertyKeys;
            }

            if (iosApp.panels) {
                this.updatePanelsFromSettings(iosApp.panels);
            }
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

    private async updateConfig(newConfig: Record<string, any>): Promise<void> {
        const authToken = AuthState.getState().authToken;
        if (!authToken) {
            throw new Error('No auth token');
        }

        try {
            const response = await NetworkManager.shared.perform<UpdateUserConfigRequest, UpdateUserConfigResponse>({
                endpoint: '/api/account/config',
                method: HTTPMethod.PUT,
                body: newConfig,
                token: authToken,
            });

            if (response.user) {
                // If the config has an iosApp property, update just that part
                if (newConfig.iosApp && this._config.iosApp) {
                    const existingIosApp = { ...this._config.iosApp };
                    for (const [key, value] of Object.entries(newConfig.iosApp)) {
                        existingIosApp[key] = value;
                    }
                    this._config = {
                        ...this._config,
                        iosApp: existingIosApp
                    };
                } else {
                    this._config = response.user;
                }

                this.updateFromConfig();
                // TODO: decide if I should emit an event here?
                console.log('settings changed');
            }
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    async updatePanelSettings(): Promise<void> {
        const panelSettings = this._settings.panels.map(setting => ({
            panel: setting.panel.type.toLowerCase(),
            visible: setting.visible,
        }));

        const newConfig = {
            iosApp: {
                panels: panelSettings,
            }
        };

        await this.updateConfig(newConfig);
    }

    async updateItemCategories(categories: string[]): Promise<void> {
        this._settings.categories = [...categories];
        await this.updateConfig({
            iosApp: {
                itemCategories: categories
            }
        });
    }

    async updateItemTypes(types: string[]): Promise<void> {
        this._settings.types = [...types];
        await this.updateConfig({
            iosApp: {
                itemTypes: types
            }
        });
    }

    async updatePropertyKeys(keys: string[]): Promise<void> {
        this._settings.propertyKeys = [...keys];
        await this.updateConfig({
            iosApp: {
                propertyKeys: keys
            }
        });
    }
}