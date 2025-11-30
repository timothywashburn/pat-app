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
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AppleLiveActivity')` in JavaScript.
    Name("AppleLiveActivity")

    // Defines constant property on the module.
    Constant("PI") {
      Double.pi
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

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
  }
}
