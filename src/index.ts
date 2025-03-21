export * from "./ManifestGenerator";
export * from "./SCORMAdapter";
export * from "./HTMLGenerator";
export { MessageEmitter } from "./MessageHandler";

export const libFiles = [
  "loadContent.js",
  "MessageHandler.js",
  "SCORMAdapter.js",
  "hashString.js",
] as const;

export const scormVersions = [
  "1.2",
  "2004 3rd Edition",
  "2004 4th Edition",
] as const;

export enum LessonStatus {
  Passed = "passed",
  Failed = "failed",
  Completed = "completed",
  Incomplete = "incomplete",
  NotAttempted = "not attempted",
  Browsed = "browsed",
}
