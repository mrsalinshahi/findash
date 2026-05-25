/**
 * Thin wrappers around localStorage that swallow JSON parse errors.
 * A corrupt entry (e.g. from a failed mid-write) returns the default value
 * instead of crashing the app on startup.
 */

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
