import { NativeModule, requireNativeModule } from 'expo';

declare class AppleLiveActivityModule extends NativeModule {
  startLiveActivity(emoji: string): void;
  updateLiveActivity(emoji: string): void;
  stopAllLiveActivities(): void;
}

export default requireNativeModule<AppleLiveActivityModule>('AppleLiveActivity');
