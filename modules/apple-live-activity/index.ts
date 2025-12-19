// Reexport the native module. On web, it will be resolved to AppleLiveActivityModule.web.ts
// and on native platforms to AppleLiveActivityModule.ts
export { default } from './src/AppleLiveActivityModule';
export * from './src/AppleLiveActivity.types';
