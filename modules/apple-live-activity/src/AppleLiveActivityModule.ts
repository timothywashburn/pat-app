import { NativeModule, requireNativeModule } from 'expo';

declare class AppleLiveActivityModule extends NativeModule {
  startLiveActivity(emoji: string): void;
  updateLiveActivity(emoji: string): void;
  stopAllLiveActivities(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AppleLiveActivityModule>('AppleLiveActivity');
