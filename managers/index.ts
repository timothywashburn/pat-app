import { AgendaItem, Person, Thought, Task, Settings, PanelSetting, PanelType } from '../models';

// Base Manager class with singleton pattern
export abstract class BaseManager<T> {
    protected static instances: { [key: string]: any } = {};
    protected data: T[] = [];

    // Abstract methods to be implemented by subclasses
    abstract load(): Promise<void>;
    abstract create(item: Partial<T>): Promise<T>;
    abstract update(id: string, item: Partial<T>): Promise<T>;
    abstract delete(id: string): Promise<void>;
}

// AgendaManager
export class AgendaManager extends BaseManager<AgendaItem> {
    private constructor() {
        super();
    }

    public static getInstance(): AgendaManager {
        if (!BaseManager.instances['agenda']) {
            BaseManager.instances['agenda'] = new AgendaManager();
        }
        return BaseManager.instances['agenda'];
    }

    get agendaItems(): AgendaItem[] {
        return [...this.data];
    }

    async loadAgendaItems(): Promise<void> {
        // This would actually fetch from an API or local storage
        console.log('loading agenda items')
        // Mock data for now
        this.data = [
            {
                id: '1',
                name: 'Meeting with team',
                date: new Date(),
                urgent: true,
                completed: false,
                category: 'Work',
            },
            {
                id: '2',
                name: 'Doctor appointment',
                date: new Date(Date.now() + 86400000), // Tomorrow
                urgent: false,
                completed: false,
                category: 'Personal',
            },
        ];
        return Promise.resolve();
    }

    async load(): Promise<void> {
        return this.loadAgendaItems();
    }

    async createAgendaItem(item: Partial<AgendaItem>): Promise<AgendaItem> {
        const newItem: AgendaItem = {
            id: Date.now().toString(),
            name: item.name || '',
            date: item.date,
            notes: item.notes,
            urgent: item.urgent || false,
            completed: item.completed || false,
            category: item.category,
            type: item.type,
        };

        this.data.push(newItem);
        return Promise.resolve(newItem);
    }

    async create(item: Partial<AgendaItem>): Promise<AgendaItem> {
        return this.createAgendaItem(item);
    }

    async updateAgendaItem(
        id: string,
        updates: Partial<AgendaItem>
    ): Promise<AgendaItem> {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Agenda item with ID ${id} not found`);
        }

        const updatedItem = { ...this.data[index], ...updates };
        this.data[index] = updatedItem;
        return Promise.resolve(updatedItem);
    }

    async update(id: string, updates: Partial<AgendaItem>): Promise<AgendaItem> {
        return this.updateAgendaItem(id, updates);
    }

    async deleteAgendaItem(id: string): Promise<void> {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Agenda item with ID ${id} not found`);
        }

        this.data.splice(index, 1);
        return Promise.resolve();
    }

    async delete(id: string): Promise<void> {
        return this.deleteAgendaItem(id);
    }
}

// PersonManager
export class PersonManager extends BaseManager<Person> {
    private constructor() {
        super();
    }

    public static getInstance(): PersonManager {
        if (!BaseManager.instances['person']) {
            BaseManager.instances['person'] = new PersonManager();
        }
        return BaseManager.instances['person'];
    }

    get people(): Person[] {
        return [...this.data];
    }

    async loadPeople(): Promise<void> {
        // This would actually fetch from an API or local storage
        console.log('loading people')
        // Mock data for now
        this.data = [
            {
                id: '1',
                name: 'John Doe',
                properties: [
                    { id: '1', key: 'email', value: 'john@example.com' },
                    { id: '2', key: 'phone', value: '123-456-7890' },
                ],
                notes: [
                    {
                        id: '1',
                        content: 'Met at conference',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                ],
            },
            {
                id: '2',
                name: 'Jane Smith',
                properties: [
                    { id: '3', key: 'email', value: 'jane@example.com' },
                ],
                notes: [],
            },
        ];
        return Promise.resolve();
    }

    async load(): Promise<void> {
        return this.loadPeople();
    }

    async createPerson(personData: {
        name: string;
        properties: any[];
        notes: any[];
    }): Promise<Person> {
        const newPerson: Person = {
            id: Date.now().toString(),
            name: personData.name,
            properties: personData.properties.map(p => ({
                id: p.id || Date.now().toString() + Math.random().toString(),
                key: p.key,
                value: p.value,
            })),
            notes: personData.notes.map(n => ({
                id: n.id || Date.now().toString() + Math.random().toString(),
                content: n.content,
                createdAt: n.createdAt || new Date(),
                updatedAt: n.updatedAt || new Date(),
            })),
        };

        this.data.push(newPerson);
        return Promise.resolve(newPerson);
    }

    async create(personData: Partial<Person>): Promise<Person> {
        return this.createPerson({
            name: personData.name || '',
            properties: personData.properties || [],
            notes: personData.notes || [],
        });
    }

    async updatePerson(
        id: string,
        name: string,
        properties: any[],
        notes: any[]
    ): Promise<Person> {
        const index = this.data.findIndex(person => person.id === id);
        if (index === -1) {
            throw new Error(`Person with ID ${id} not found`);
        }

        const updatedPerson = {
            ...this.data[index],
            name,
            properties,
            notes,
        };

        this.data[index] = updatedPerson;
        return Promise.resolve(updatedPerson);
    }

    async update(id: string, updates: Partial<Person>): Promise<Person> {
        const person = this.data.find(p => p.id === id);
        if (!person) {
            throw new Error(`Person with ID ${id} not found`);
        }

        return this.updatePerson(
            id,
            updates.name || person.name,
            updates.properties || person.properties,
            updates.notes || person.notes
        );
    }

    async deletePerson(id: string): Promise<void> {
        const index = this.data.findIndex(person => person.id === id);
        if (index === -1) {
            throw new Error(`Person with ID ${id} not found`);
        }

        this.data.splice(index, 1);
        return Promise.resolve();
    }

    async delete(id: string): Promise<void> {
        return this.deletePerson(id);
    }
}

// ThoughtManager
export class ThoughtManager extends BaseManager<Thought> {
    private constructor() {
        super();
    }

    public static getInstance(): ThoughtManager {
        if (!BaseManager.instances['thought']) {
            BaseManager.instances['thought'] = new ThoughtManager();
        }
        return BaseManager.instances['thought'];
    }

    get thoughts(): Thought[] {
        return [...this.data];
    }

    async loadThoughts(): Promise<void> {
        // This would actually fetch from an API or local storage
        console.log('loading thoughts')
        // Mock data for now
        this.data = [
            {
                id: '1',
                content: 'Need to buy groceries',
                createdAt: new Date(),
            },
            {
                id: '2',
                content: 'Call mom this weekend',
                createdAt: new Date(Date.now() - 86400000), // Yesterday
            },
        ];
        return Promise.resolve();
    }

    async load(): Promise<void> {
        return this.loadThoughts();
    }

    async createThought(content: string): Promise<Thought> {
        const newThought: Thought = {
            id: Date.now().toString(),
            content,
            createdAt: new Date(),
        };

        this.data.push(newThought);
        return Promise.resolve(newThought);
    }

    async create(thoughtData: Partial<Thought>): Promise<Thought> {
        return this.createThought(thoughtData.content || '');
    }

    async updateThought(id: string, content: string): Promise<Thought> {
        const index = this.data.findIndex(thought => thought.id === id);
        if (index === -1) {
            throw new Error(`Thought with ID ${id} not found`);
        }

        const updatedThought = {
            ...this.data[index],
            content,
        };

        this.data[index] = updatedThought;
        return Promise.resolve(updatedThought);
    }

    async update(id: string, updates: Partial<Thought>): Promise<Thought> {
        if (!updates.content) {
            throw new Error('Content is required');
        }
        return this.updateThought(id, updates.content);
    }

    async deleteThought(id: string): Promise<void> {
        const index = this.data.findIndex(thought => thought.id === id);
        if (index === -1) {
            throw new Error(`Thought with ID ${id} not found`);
        }

        this.data.splice(index, 1);
        return Promise.resolve();
    }

    async delete(id: string): Promise<void> {
        return this.deleteThought(id);
    }
}

// SettingsManager
export class SettingsManager {
    private static instance: SettingsManager;
    private _settings: Settings = {
        panels: [],
        categories: [],
        types: [],
        propertyKeys: [],
    };

    private constructor() {
        // Initialize with default values
        this._settings = {
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
    }

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
        // In a real app, this would load from storage
        console.log('loading settings')
        return Promise.resolve();
    }

    async updatePanelSettings(): Promise<void> {
        // In a real app, this would save to storage
        console.log('updating panel settings')
        return Promise.resolve();
    }

    async updateItemTypes(types: string[]): Promise<void> {
        this._settings.types = [...types];
        // In a real app, this would save to storage
        console.log('updating item types')
        return Promise.resolve();
    }

    async updateItemCategories(categories: string[]): Promise<void> {
        this._settings.categories = [...categories];
        // In a real app, this would save to storage
        console.log('updating item categories')
        return Promise.resolve();
    }

    async updatePropertyKeys(keys: string[]): Promise<void> {
        this._settings.propertyKeys = [...keys];
        // In a real app, this would save to storage
        console.log('updating property keys')
        return Promise.resolve();
    }
}