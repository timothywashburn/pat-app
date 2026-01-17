import ExpoModulesCore
import ActivityKit

// Matching the WidgetAttributes defined in the widget target
struct WidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var emoji: String
    }
    var name: String
}

public class AppleLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppleLiveActivity")

    Function("startLiveActivity") { (emoji: String) in
      if #available(iOS 16.2, *) {
        let attributes = WidgetAttributes(name: "Test Activity")
        let contentState = WidgetAttributes.ContentState(emoji: emoji)

        do {
          let activity = try Activity<WidgetAttributes>.request(
            attributes: attributes,
            content: .init(state: contentState, staleDate: nil)
          )
          print("✅ [Swift] Live Activity started with ID: \(activity.id)")
        } catch {
          print("❌ [Swift] Error starting Live Activity: \(error.localizedDescription)")
          throw error
        }
      } else {
        print("❌ [Swift] Live Activities require iOS 16.2+")
      }
    }

    Function("updateLiveActivity") { (emoji: String) in
      if #available(iOS 16.2, *) {
        Task {
          for activity in Activity<WidgetAttributes>.activities {
            let contentState = WidgetAttributes.ContentState(emoji: emoji)
            await activity.update(.init(state: contentState, staleDate: nil))
            print("✅ [Swift] Live Activity updated with emoji: \(emoji)")
          }
        }
      }
    }

    Function("stopAllLiveActivities") {
      if #available(iOS 16.2, *) {
        Task {
          for activity in Activity<WidgetAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
            print("✅ [Swift] Live Activity stopped")
          }
        }
      }
    }
  }
}
