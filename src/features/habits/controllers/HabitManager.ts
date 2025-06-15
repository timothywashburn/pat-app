import { 
    Habit, 
    HabitEntry, 
    HabitWithEntries, 
    HabitFrequency, 
    HabitEntryStatus,
    calculateHabitStats,
    formatDate,
    getDateRange,
    getTodayDate,
    getYesterdayDate
} from '@/src/features/habits/models';

export class HabitManager {
    private static instance: HabitManager;
    private _habits: Habit[] = [];
    private _habitEntries: HabitEntry[] = [];
    private _habitsWithEntries: HabitWithEntries[] = [];

    private constructor() {
        this.initializeMockData();
    }

    static getInstance(): HabitManager {
        if (!HabitManager.instance) {
            HabitManager.instance = new HabitManager();
        }
        return HabitManager.instance;
    }

    get habits(): Habit[] {
        return [...this._habits];
    }

    get habitEntries(): HabitEntry[] {
        return [...this._habitEntries];
    }

    get habitsWithEntries(): HabitWithEntries[] {
        return [...this._habitsWithEntries];
    }

    // ===========================================
    // MOCK DATA GENERATION (REMOVE WHEN API IS READY)
    // ===========================================
    
    private initializeMockData(): void {
        console.log('HabitManager: Initializing with mock data');
        
        // Create mock habits
        this._habits = this.generateMockHabits();
        
        // Create mock entries for each habit
        this._habitEntries = this.generateMockEntries(this._habits);
        
        // Combine habits with their entries and stats
        this.updateHabitsWithEntries();
    }

    private generateMockHabits(): Habit[] {
        const mockHabits: Habit[] = [
            {
                id: 'habit-1',
                name: 'Morning Exercise',
                description: 'Go for a 30-minute run or workout',
                frequency: HabitFrequency.DAILY,
                rolloverTime: '06:00',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01')
            },
            {
                id: 'habit-2',
                name: 'Read for 20 minutes',
                description: 'Read a book or article for personal development',
                frequency: HabitFrequency.DAILY,
                rolloverTime: '00:00',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15')
            },
            {
                id: 'habit-3',
                name: 'Meditate',
                description: 'Practice mindfulness for 10 minutes',
                frequency: HabitFrequency.DAILY,
                rolloverTime: '22:00',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-01')
            }
        ];

        return mockHabits;
    }

    // Simple deterministic pseudo-random number generator (seeded)
    private seededRandom(seed: number): () => number {
        seed += 4;
        let x = Math.sin(seed) * 10000;
        return () => {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    }

    private generateMockEntries(habits: Habit[]): HabitEntry[] {
        const entries: HabitEntry[] = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 365); // Last 365 days

        habits.forEach((habit, habitIndex) => {
            const habitStartDate = habit.createdAt > startDate ? habit.createdAt : startDate;
            const dateRange = getDateRange(habitStartDate, today);

            // Create a deterministic seed based on habit ID
            const habitSeed = habit.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const random = this.seededRandom(habitSeed);

            dateRange.forEach((date, index) => {
                // Use deterministic random for consistent results
                let status: HabitEntryStatus;
                const randomValue = random();
                
                // Different habits have different success patterns
                let completionRate = 0.7; // Default 70%
                let excuseRate = 0.1; // Default 10%
                
                if (habitIndex === 0) { // Morning Exercise - slightly lower completion
                    completionRate = 0.65;
                    excuseRate = 0.15;
                } else if (habitIndex === 1) { // Reading - higher completion
                    completionRate = 0.75;
                    excuseRate = 0.08;
                } else if (habitIndex === 2) { // Meditation - moderate completion
                    completionRate = 0.68;
                    excuseRate = 0.12;
                }
                
                if (randomValue < completionRate) {
                    status = HabitEntryStatus.COMPLETED;
                } else if (randomValue < completionRate + excuseRate) {
                    status = HabitEntryStatus.EXCUSED;
                } else {
                    status = HabitEntryStatus.MISSED;
                }

                const entryDate = new Date(date + 'T10:00:00');
                
                entries.push({
                    id: `${habit.id}-${date}`,
                    habitId: habit.id,
                    date: date,
                    status: status,
                    completedAt: status === HabitEntryStatus.COMPLETED ? entryDate : undefined,
                    excusedAt: status === HabitEntryStatus.EXCUSED ? entryDate : undefined,
                    createdAt: entryDate,
                    updatedAt: entryDate
                });
            });
        });

        return entries;
    }

    // ===========================================
    // END MOCK DATA GENERATION
    // ===========================================

    private updateHabitsWithEntries(): void {
        this._habitsWithEntries = this._habits.map(habit => {
            const entries = this._habitEntries.filter(entry => entry.habitId === habit.id);
            const stats = calculateHabitStats(entries);
            
            return {
                ...habit,
                entries: entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                stats
            };
        });
    }

    // Public API methods (these will call actual API endpoints later)
    async loadHabits(): Promise<void> {
        // TODO: Replace with actual API call
        console.log('HabitManager: Loading habits (using mock data)');
        this.initializeMockData();
    }

    async createHabit(params: {
        name: string;
        description?: string;
        frequency?: HabitFrequency;
        rolloverTime?: string;
    }): Promise<Habit> {
        // TODO: Replace with actual API call
        const newHabit: Habit = {
            id: `habit-${Date.now()}`,
            name: params.name,
            description: params.description,
            frequency: params.frequency || HabitFrequency.DAILY,
            rolloverTime: params.rolloverTime || '00:00',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this._habits.push(newHabit);
        this.updateHabitsWithEntries();
        
        return newHabit;
    }

    async updateHabit(id: string, updates: {
        name?: string;
        description?: string;
        frequency?: HabitFrequency;
        rolloverTime?: string;
    }): Promise<void> {
        // TODO: Replace with actual API call
        const habitIndex = this._habits.findIndex(h => h.id === id);
        if (habitIndex === -1) {
            throw new Error('Habit not found');
        }

        this._habits[habitIndex] = {
            ...this._habits[habitIndex],
            ...updates,
            updatedAt: new Date()
        };

        this.updateHabitsWithEntries();
    }

    async deleteHabit(id: string): Promise<void> {
        // TODO: Replace with actual API call
        this._habits = this._habits.filter(h => h.id !== id);
        this._habitEntries = this._habitEntries.filter(e => e.habitId !== id);
        this.updateHabitsWithEntries();
    }

    async markHabitEntry(habitId: string, date: string, status: HabitEntryStatus): Promise<void> {
        // TODO: Replace with actual API call
        const existingEntryIndex = this._habitEntries.findIndex(
            e => e.habitId === habitId && e.date === date
        );

        const now = new Date();
        
        if (existingEntryIndex !== -1) {
            // Update existing entry
            this._habitEntries[existingEntryIndex] = {
                ...this._habitEntries[existingEntryIndex],
                status,
                completedAt: status === HabitEntryStatus.COMPLETED ? now : undefined,
                excusedAt: status === HabitEntryStatus.EXCUSED ? now : undefined,
                updatedAt: now
            };
        } else {
            // Create new entry
            const newEntry: HabitEntry = {
                id: `${habitId}-${date}`,
                habitId,
                date,
                status,
                completedAt: status === HabitEntryStatus.COMPLETED ? now : undefined,
                excusedAt: status === HabitEntryStatus.EXCUSED ? now : undefined,
                createdAt: now,
                updatedAt: now
            };
            
            this._habitEntries.push(newEntry);
        }

        this.updateHabitsWithEntries();
    }

    getHabitById(id: string): HabitWithEntries | undefined {
        return this._habitsWithEntries.find(h => h.id === id);
    }

    getHabitEntryByDate(habitId: string, date: string): HabitEntry | undefined {
        return this._habitEntries.find(e => e.habitId === habitId && e.date === date);
    }

    getTodayEntry(habitId: string): HabitEntry | undefined {
        return this.getHabitEntryByDate(habitId, getTodayDate());
    }

    getYesterdayEntry(habitId: string): HabitEntry | undefined {
        return this.getHabitEntryByDate(habitId, getYesterdayDate());
    }
}