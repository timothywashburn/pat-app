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
        VStack(alignment: .leading, spacing: 4) {
            // Habits list
            let displayHabits = Array(habits.prefix(5))

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
                .padding(.horizontal, 12)
            }

            Spacer(minLength: 0)
        }
        .padding(.top, 12)
    }
}

// MARK: - Habit Row View

struct HabitRowView: View {
    let habit: WidgetHabit

    var body: some View {
        VStack(spacing: 4) {
            // Main row: name, date, and action button
            HStack(alignment: .center, spacing: 6) {
                // Status indicator dot
                Circle()
                    .fill(statusColor)
                    .frame(width: 6, height: 6)

                // Habit name and date on same line
                VStack(alignment: .leading, spacing: 1) {
                    Text(habit.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .lineLimit(1)

                    // Date and status info
                    HStack(spacing: 3) {
                        if habit.isActive && !habit.isCompleted {
                            Text(habit.formatTimeRemaining())
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        } else if habit.isCompleted {
                            Text("Completed")
                                .font(.caption2)
                                .foregroundColor(.green)
                        } else if habit.isMissed {
                            Text("Missed")
                                .font(.caption2)
                                .foregroundColor(.red)
                        } else if habit.isExcused {
                            Text("Excused")
                                .font(.caption2)
                                .foregroundColor(.orange)
                        }
                    }
                }

                Spacer()

                // Mark complete button
                if !habit.isCompleted && habit.isActive {
                    Button(intent: MarkCompleteIntent(
                        habitId: habit.id,
                        date: habit.getActiveDate() ?? Date.today.toDateOnlyString()
                    )) {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 16))
                            .foregroundColor(.green)
                            .frame(width: 32, height: 32)
                            .background(Color.clear)
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(Color.green, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                } else if habit.isCompleted {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(Color.green)
                        .cornerRadius(6)
                }
            }

            // Progress bar - only show if habit is active and not completed
            if habit.isActive && !habit.isCompleted {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        // Background
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 3)

                        // Progress
                        let timeRemaining = habit.getTimeRemaining()
                        RoundedRectangle(cornerRadius: 2)
                            .fill(progressGradient(for: timeRemaining.percentage))
                            .frame(
                                width: geometry.size.width * CGFloat(timeRemaining.percentage / 100.0),
                                height: 3
                            )
                    }
                }
                .frame(height: 3)
                .padding(.leading, 12) // Align with text, accounting for dot
            }
        }
        .padding(.vertical, 4)
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
