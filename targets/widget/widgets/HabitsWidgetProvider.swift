import WidgetKit
import SwiftUI

struct HabitsProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> HabitsWidgetEntry {
        let mockHabits = [
            WidgetHabit(
                id: "1",
                name: "Morning Workout",
                startOffsetMinutes: 360,
                endOffsetMinutes: 720,
                todayEntry: nil,
                stats: WidgetHabitStats(completedDays: 15, totalDays: 30, completionRate: 50.0)
            ),
            WidgetHabit(
                id: "2",
                name: "Read 30 Minutes",
                startOffsetMinutes: 0,
                endOffsetMinutes: 1440,
                todayEntry: WidgetHabitEntry(date: Date.today.toDateOnlyString(), status: "completed"),
                stats: WidgetHabitStats(completedDays: 25, totalDays: 30, completionRate: 83.3)
            )
        ]

        return HabitsWidgetEntry(
            date: Date(),
            configuration: HabitsConfigIntent(),
            habits: mockHabits,
            lastUpdated: ISO8601DateFormatter().string(from: Date())
        )
    }

    func snapshot(for configuration: HabitsConfigIntent, in context: Context) async -> HabitsWidgetEntry {
        let habitData = HabitsWidgetDataManager.shared.loadHabitData()

        if let habitData = habitData {
            let filteredHabits = filterHabits(habitData.habits, config: configuration)
            return HabitsWidgetEntry(
                date: Date(),
                configuration: configuration,
                habits: filteredHabits,
                lastUpdated: habitData.lastUpdated
            )
        } else {
            return placeholder(in: context)
        }
    }

    func timeline(for configuration: HabitsConfigIntent, in context: Context) async -> Timeline<HabitsWidgetEntry> {
        let habitData = HabitsWidgetDataManager.shared.loadHabitData()

        guard let habitData = habitData else {
            let entry = HabitsWidgetEntry(
                date: Date(),
                configuration: configuration,
                habits: [],
                lastUpdated: nil
            )
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
            return Timeline(entries: [entry], policy: .after(refreshDate))
        }

        let filteredHabits = filterHabits(habitData.habits, config: configuration)
        var entries: [HabitsWidgetEntry] = []
        let currentDate = Date()

        entries.append(HabitsWidgetEntry(
            date: currentDate,
            configuration: configuration,
            habits: filteredHabits,
            lastUpdated: habitData.lastUpdated
        ))

        let nextRefreshDate = getNextRelevantDate(for: filteredHabits)

        var nextDate = currentDate
        let endDate = Calendar.current.date(byAdding: .hour, value: 24, to: currentDate)!

        while nextDate < endDate && entries.count < 20 {
            let stateChangeDates = filteredHabits.map { $0.getNextRelevantDate() }
            guard let nextChange = stateChangeDates.filter({ $0 > nextDate && $0 < endDate }).min() else {
                break
            }

            entries.append(HabitsWidgetEntry(
                date: nextChange,
                configuration: configuration,
                habits: filteredHabits,
                lastUpdated: habitData.lastUpdated
            ))

            nextDate = nextChange
        }

        return Timeline(entries: entries, policy: .after(nextRefreshDate))
    }

    private func filterHabits(_ habits: [WidgetHabit], config: HabitsConfigIntent) -> [WidgetHabit] {
        switch config.displayMode {
        case .activeOnly:
            return habits.filter { $0.isActive }
        case .todaysAll:
            return habits
        case .specificHabit:
            if let habitId = config.selectedHabitId {
                return habits.filter { $0.id == habitId }
            }
            return habits
        }
    }
}
