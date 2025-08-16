
import { useState, useEffect } from 'react';

function getStorageValue<T,>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  if (saved !== null) {
    try {
      return JSON.parse(saved) as T;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      localStorage.removeItem(key); // Clear corrupted data
      return defaultValue;
    }
  }
  return defaultValue;
}

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, initialValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
