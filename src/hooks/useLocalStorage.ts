import { useState, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * useState backed by localStorage.
 *
 * The setter accepts either a plain value or a functional updater — the same
 * signature React's own setState uses — so callers can safely do:
 *   setExpenses(prev => [...prev, newItem])
 *
 * We run the functional updater inside setValue's own updater so that React's
 * batching is respected and we always write the final resolved value to storage,
 * not a potentially-stale snapshot.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => getStorageItem(key, defaultValue));

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (p: T) => T)(prev)
            : newValue;
        setStorageItem(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
