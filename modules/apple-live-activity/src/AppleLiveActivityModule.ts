import { NativeModule, requireNativeModule } from 'expo';

import { AppleLiveActivityModuleEvents } from './AppleLiveActivity.types';

declare class AppleLiveActivityModule extends NativeModule<AppleLiveActivityModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  startLiveActivity(emoji: string): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AppleLiveActivityModule>('AppleLiveActivity');
