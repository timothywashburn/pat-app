import WidgetKit
import SwiftUI

struct HabitsWidget: Widget {
    let kind: String = "HabitsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: HabitsConfigIntent.self,
            provider: HabitsProvider()
        ) { entry in
            HabitsWidgetView(entry: entry)
        }
        .configurationDisplayName("Habits Tracker")
        .description("Track your daily habits at a glance")
        .supportedFamilies([.systemLarge])
    }
}

// MARK: - Previews

extension HabitsConfigIntent {
    fileprivate static var activeOnly: HabitsConfigIntent {
        let intent = HabitsConfigIntent()
        intent.displayMode = .activeOnly
        return intent
    }

    fileprivate static var todaysAll: HabitsConfigIntent {
        let intent = HabitsConfigIntent()
        intent.displayMode = .todaysAll
        return intent
    }
}

#Preview(as: .systemLarge) {
    HabitsWidget()
} timeline: {
    // Preview with active habits
    HabitsWidgetEntry(
        date: .now,
        configuration: .activeOnly,
        habits: [
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
            ),
            WidgetHabit(
                id: "3",
                name: "Meditation",
                startOffsetMinutes: 0,
                endOffsetMinutes: 1440,
                todayEntry: nil,
                stats: WidgetHabitStats(completedDays: 20, totalDays: 30, completionRate: 66.7)
            )
        ],
        lastUpdated: ISO8601DateFormatter().string(from: Date())
    )

    // Preview with all completed
    HabitsWidgetEntry(
        date: .now,
        configuration: .todaysAll,
        habits: [
            WidgetHabit(
                id: "1",
                name: "Morning Workout",
                startOffsetMinutes: 360,
                endOffsetMinutes: 720,
                todayEntry: WidgetHabitEntry(date: Date.today.toDateOnlyString(), status: "completed"),
                stats: WidgetHabitStats(completedDays: 16, totalDays: 30, completionRate: 53.3)
            ),
            WidgetHabit(
                id: "2",
                name: "Read 30 Minutes",
                startOffsetMinutes: 0,
                endOffsetMinutes: 1440,
                todayEntry: WidgetHabitEntry(date: Date.today.toDateOnlyString(), status: "completed"),
                stats: WidgetHabitStats(completedDays: 26, totalDays: 30, completionRate: 86.7)
            )
        ],
        lastUpdated: ISO8601DateFormatter().string(from: Date())
    )
}
