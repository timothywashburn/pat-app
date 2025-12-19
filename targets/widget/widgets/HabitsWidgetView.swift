import SwiftUI
import WidgetKit

struct HabitsWidgetView: View {
    var entry: HabitsProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            if entry.isEmpty {
                EmptyStateView()
            } else if entry.isStale {
                StaleDataView(habits: entry.habits)
            } else {
                HabitsListView(habits: entry.habits)
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

// MARK: - Habits List View

struct HabitsListView: View {
    let habits: [WidgetHabit]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text("Habits")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
                if habits.allSatisfy({ $0.isCompleted }) && !habits.isEmpty {
                    Text("🎉")
                        .font(.title3)
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)

            // Habits list
            let displayHabits = Array(habits.prefix(3))

            if displayHabits.isEmpty {
                Spacer()
                Text("No active habits")
                    .font(.subheadline)
                    .foregroundColor(.primary)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                ForEach(displayHabits) { habit in
                    HabitRowView(habit: habit)
                }
                .padding(.horizontal, 8)
            }

            Spacer(minLength: 0)
        }
    }
}

// MARK: - Habit Row View

struct HabitRowView: View {
    let habit: WidgetHabit

    var body: some View {
        VStack(spacing: 6) {
            HStack(alignment: .center, spacing: 8) {
                // Status indicator dot
                Circle()
                    .fill(statusColor)
                    .frame(width: 8, height: 8)

                // Habit name
                Text(habit.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)

                Spacer()

                // Mark complete button
                if !habit.isCompleted && habit.isActive {
                    Button(intent: MarkCompleteIntent(
                        habitId: habit.id,
                        date: habit.getActiveDate() ?? Date.today.toDateOnlyString()
                    )) {
                        Image(systemName: "checkmark.circle")
                            .font(.title3)
                            .foregroundColor(.green)
                    }
                    .buttonStyle(.plain)
                } else if habit.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundColor(.green)
                }
            }

            // Progress bar or status text
            if habit.isActive && !habit.isCompleted {
                HStack(spacing: 6) {
                    // Time remaining text
                    Text(habit.formatTimeRemaining())
                        .font(.caption2)
                        .foregroundColor(.secondary)

                    Spacer()

                    // Progress percentage
                    let timeRemaining = habit.getTimeRemaining()
                    Text("\(Int(timeRemaining.percentage))%")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // Background
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 4)

                        // Progress
                        let timeRemaining = habit.getTimeRemaining()
                        RoundedRectangle(cornerRadius: 2)
                            .fill(progressGradient(for: timeRemaining.percentage))
                            .frame(
                                width: geometry.size.width * CGFloat(timeRemaining.percentage / 100.0),
                                height: 4
                            )
                    }
                }
                .frame(height: 4)
            } else if habit.isCompleted {
                HStack {
                    Text("Completed")
                        .font(.caption2)
                        .foregroundColor(.green)
                    Spacer()
                }
            } else if habit.isMissed {
                HStack {
                    Text("Missed")
                        .font(.caption2)
                        .foregroundColor(.red)
                    Spacer()
                }
            } else if habit.isExcused {
                HStack {
                    Text("Excused")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    Spacer()
                }
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }

    private var statusColor: Color {
        if habit.isCompleted {
            return .green
        } else if habit.isMissed {
            return .red
        } else if habit.isExcused {
            return .orange
        } else if habit.isActive {
            return .green
        } else {
            return .gray
        }
    }

    private func progressGradient(for percentage: Double) -> LinearGradient {
        let color: Color
        if percentage < 33 {
            color = .green
        } else if percentage < 66 {
            color = .yellow
        } else if percentage < 90 {
            color = .orange
        } else {
            color = .red
        }

        return LinearGradient(
            gradient: Gradient(colors: [color, color]),
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

// MARK: - Empty State View

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 40))
                .foregroundColor(.gray)

            Text("No Habits")
                .font(.headline)
                .foregroundColor(.primary)

            Text("Add habits in the app to track them here")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Stale Data View

struct StaleDataView: View {
    let habits: [WidgetHabit]

    var body: some View {
        VStack(spacing: 12) {
            HabitsListView(habits: habits)
                .opacity(0.5)

            Text("Open app to refresh")
                .font(.caption)
                .foregroundColor(.orange)
                .padding(.horizontal)
                .padding(.bottom, 8)
        }
    }
}
