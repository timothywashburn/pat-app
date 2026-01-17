import Foundation
import WidgetKit

// MARK: - Data Models

struct WidgetHabitData: Codable {
    let habits: [WidgetHabit]
    let lastUpdated: String
}

struct WidgetHabit: Codable, Identifiable {
    let id: String
    let name: String
    let startOffsetMinutes: Int
    let endOffsetMinutes: Int
    let todayEntry: WidgetHabitEntry?
    let stats: WidgetHabitStats
}

struct WidgetHabitEntry: Codable {
    let date: String
    let status: String // "completed", "excused", "missed"
}

struct WidgetHabitStats: Codable {
    let completedDays: Int
    let totalDays: Int
    let completionRate: Double
}

// MARK: - Action Queue

struct HabitAction: Codable {
    let habitId: String
    let date: String
    let action: String // "complete"
}

// MARK: - Data Access

class HabitsWidgetDataManager {
    static let shared = HabitsWidgetDataManager()
    private let defaults = UserDefaults(suiteName: "group.dev.timothyw.patapp")

    private init() {}

    func loadHabitData() -> WidgetHabitData? {
        guard let defaults = defaults,
              let jsonString = defaults.string(forKey: "habits_widget_data"),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(WidgetHabitData.self, from: jsonData)
        } catch {
            print("Failed to decode habit data: \(error)")
            return nil
        }
    }

    func queueAction(habitId: String, date: String, action: String) {
        guard let defaults = defaults else { return }

        let habitAction = HabitAction(habitId: habitId, date: date, action: action)

        do {
            let encoder = JSONEncoder()
            let jsonData = try encoder.encode(habitAction)
            defaults.set(jsonData, forKey: "habit_action_queue")
            defaults.synchronize()
        } catch {
            print("Failed to encode action: \(error)")
        }
    }
}

// MARK: - Date Utilities

extension Date {
    func toDateOnlyString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        return formatter.string(from: self)
    }

    static func fromDateOnlyString(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        return formatter.date(from: dateString)
    }

    static var today: Date {
        let now = Date()
        return Calendar.current.startOfDay(for: now)
    }

    static var yesterday: Date {
        return Calendar.current.date(byAdding: .day, value: -1, to: today)!
    }
}

// MARK: - Habit Utilities

struct TimeRemaining {
    let hours: Int
    let minutes: Int
    let totalMinutes: Int
    let percentage: Double
    let isOverdue: Bool
}

extension WidgetHabit {
    func getActiveDate() -> String? {
        let now = Date()
        var date = Date.yesterday

        for _ in 0..<2 {
            let habitStart = date.addingTimeInterval(TimeInterval(startOffsetMinutes * 60))
            let habitEnd = date.addingTimeInterval(TimeInterval(endOffsetMinutes * 60))

            if now >= habitStart && now <= habitEnd {
                return date.toDateOnlyString()
            }

            date = Calendar.current.date(byAdding: .day, value: 1, to: date)!
        }

        return nil
    }

    var isActive: Bool {
        return getActiveDate() != nil
    }

    func getTimeRemaining() -> TimeRemaining {
        let now = Date()
        var date = Date.yesterday

        for _ in 0..<2 {
            let habitStart = date.addingTimeInterval(TimeInterval(startOffsetMinutes * 60))
            let habitEnd = date.addingTimeInterval(TimeInterval(endOffsetMinutes * 60))

            if now >= habitStart && now <= habitEnd {
                let diffSeconds = habitEnd.timeIntervalSince(now)
                let totalMinutes = Int(diffSeconds / 60)
                let hours = totalMinutes / 60
                let minutes = totalMinutes % 60

                let periodDuration = habitEnd.timeIntervalSince(habitStart)
                let elapsed = now.timeIntervalSince(habitStart)
                let percentage = min(100.0, max(0.0, (elapsed / periodDuration) * 100.0))

                return TimeRemaining(
                    hours: max(0, hours),
                    minutes: max(0, minutes),
                    totalMinutes: max(0, totalMinutes),
                    percentage: percentage,
                    isOverdue: totalMinutes < 0
                )
            }

            date = Calendar.current.date(byAdding: .day, value: 1, to: date)!
        }

        return TimeRemaining(hours: 0, minutes: 0, totalMinutes: 0, percentage: 100, isOverdue: true)
    }

    func formatTimeRemaining() -> String {
        let timeRemaining = getTimeRemaining()

        if timeRemaining.isOverdue {
            return "Overdue"
        }

        if timeRemaining.hours > 0 {
            return "\(timeRemaining.hours)h \(timeRemaining.minutes)m left"
        } else if timeRemaining.minutes > 0 {
            return "\(timeRemaining.minutes)m left"
        } else {
            return "Less than 1m left"
        }
    }

    var isCompleted: Bool {
        guard let entry = todayEntry,
              let activeDate = getActiveDate(),
              entry.date == activeDate else {
            return false
        }
        return entry.status == "completed"
    }

    var isMissed: Bool {
        guard let entry = todayEntry,
              let activeDate = getActiveDate(),
              entry.date == activeDate else {
            return false
        }
        return entry.status == "missed"
    }

    var isExcused: Bool {
        guard let entry = todayEntry,
              let activeDate = getActiveDate(),
              entry.date == activeDate else {
            return false
        }
        return entry.status == "excused"
    }
}

// MARK: - Display Mode Filtering

enum DisplayMode {
    case activeOnly
    case todaysAll
    case specificHabit(id: String)

    func filter(habits: [WidgetHabit]) -> [WidgetHabit] {
        switch self {
        case .activeOnly:
            return habits.filter { $0.isActive }
        case .todaysAll:
            return habits
        case .specificHabit(let id):
            return habits.filter { $0.id == id }
        }
    }
}

// MARK: - Timeline Utilities

extension WidgetHabit {
    /// Get the next relevant date when this habit's state might change
    func getNextRelevantDate() -> Date {
        let now = Date()
        var date = Date.yesterday

        for _ in 0..<2 {
            let habitStart = date.addingTimeInterval(TimeInterval(startOffsetMinutes * 60))
            let habitEnd = date.addingTimeInterval(TimeInterval(endOffsetMinutes * 60))

            if now >= habitStart && now <= habitEnd {
                // Currently active - next change is when it ends
                return habitEnd
            }

            if now < habitStart {
                // Not yet started - next change is when it starts
                return habitStart
            }

            date = Calendar.current.date(byAdding: .day, value: 1, to: date)!
        }

        // Otherwise find next start time
        date = Date.today
        for _ in 0..<3 {
            let habitStart = date.addingTimeInterval(TimeInterval(startOffsetMinutes * 60))
            if now < habitStart {
                return habitStart
            }
            date = Calendar.current.date(byAdding: .day, value: 1, to: date)!
        }

        // Fallback - check again tomorrow
        return Calendar.current.date(byAdding: .day, value: 1, to: Date.today)!
    }
}

func getNextRelevantDate(for habits: [WidgetHabit]) -> Date {
    guard !habits.isEmpty else {
        // No habits - refresh at midnight
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date.today)!
        return tomorrow
    }

    // Find the earliest next relevant date among all habits
    let nextDates = habits.map { $0.getNextRelevantDate() }
    let earliest = nextDates.min() ?? Calendar.current.date(byAdding: .hour, value: 1, to: Date())!

    // Also check midnight
    let midnight = Calendar.current.date(byAdding: .day, value: 1, to: Date.today)!

    return min(earliest, midnight)
}
