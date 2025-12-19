import WidgetKit
import AppIntents

// MARK: - Display Mode Enum

enum DisplayModeEnum: String, AppEnum {
    case activeOnly
    case todaysAll
    case specificHabit

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Display Mode"
    static var caseDisplayRepresentations: [DisplayModeEnum: DisplayRepresentation] = [
        .activeOnly: "Active Only",
        .todaysAll: "Today's Habits",
        .specificHabit: "Specific Habit"
    ]
}

// MARK: - Widget Configuration Intent

struct HabitsConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Habits Display" }
    static var description: IntentDescription { "Configure which habits to display" }

    @Parameter(title: "Display Mode", default: .activeOnly)
    var displayMode: DisplayModeEnum

    @Parameter(title: "Specific Habit ID")
    var selectedHabitId: String?
}

// MARK: - Mark Complete Intent

struct MarkCompleteIntent: AppIntent {
    static var title: LocalizedStringResource { "Mark Habit Complete" }

    @Parameter(title: "Habit ID")
    var habitId: String

    @Parameter(title: "Date")
    var date: String

    init() {
        self.habitId = ""
        self.date = ""
    }

    init(habitId: String, date: String) {
        self.habitId = habitId
        self.date = date
    }

    func perform() async throws -> some IntentResult {
        // Queue the action for the main app to process
        HabitsWidgetDataManager.shared.queueAction(
            habitId: habitId,
            date: date,
            action: "complete"
        )

        // Request widget timeline refresh to show optimistic update
        WidgetCenter.shared.reloadTimelines(ofKind: "HabitsWidget")

        return .result()
    }
}
