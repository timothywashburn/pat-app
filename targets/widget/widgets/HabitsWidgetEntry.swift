import WidgetKit

struct HabitsWidgetEntry: TimelineEntry {
    let date: Date
    let configuration: HabitsConfigIntent
    let habits: [WidgetHabit]
    let lastUpdated: String?

    var isEmpty: Bool {
        return habits.isEmpty
    }

    var isStale: Bool {
        guard let lastUpdated = lastUpdated,
              let updatedDate = ISO8601DateFormatter().date(from: lastUpdated) else {
            return true
        }

        let hoursSinceUpdate = Date().timeIntervalSince(updatedDate) / 3600
        return hoursSinceUpdate > 24
    }
}
