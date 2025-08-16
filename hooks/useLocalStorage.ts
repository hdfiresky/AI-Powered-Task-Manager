/**
 * @file useLocalStorage.ts
 * @description A custom React hook for persisting state to the browser's localStorage.
 * This hook behaves like `useState` but automatically saves the state to localStorage
 * whenever it changes and retrieves it on initial load.
 */

import { useState, useEffect } from 'react';

/**
 * Retrieves a value from localStorage, handling potential errors and default values.
 * @template T The type of the value to retrieve.
 * @param {string} key The key to look for in localStorage.
 * @param {T} defaultValue The value to return if the key is not found or if there's a parsing error.
 * @returns {T} The parsed value from localStorage or the default value.
 */
function getStorageValue<T,>(key: string, defaultValue: T): T {
  // Check if running in a browser environment. If not (e.g., server-side rendering), return default.
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  const saved = localStorage.getItem(key);
  if (saved !== null) {
    try {
      // Attempt to parse the stored JSON string back into its original type.
      return JSON.parse(saved) as T;
    } catch (e) {
      // If parsing fails (e.g., corrupted data), log the error and remove the faulty item.
      console.error(`Error parsing localStorage key "${key}":`, e);
      localStorage.removeItem(key);
      return defaultValue;
    }
  }
  // If no item is found, return the provided default value.
  return defaultValue;
}

/**
 * A custom hook that syncs a state value with localStorage.
 * @template T The type of the state value.
 * @param {string} key The unique key for storing this value in localStorage.
 * @param {T} initialValue The initial value to use if nothing is stored in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A stateful value and a function to update it, same as `useState`.
 */
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize the state by trying to get the value from localStorage first,
  // falling back to the initialValue if not found.
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, initialValue);
  });

  // Use useEffect to listen for changes to the `value` state.
  // Whenever `value` changes, this effect will run and save the new value to localStorage.
  useEffect(() => {
    try {
      // Convert the value to a JSON string before storing it.
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Handle potential errors, e.g., if localStorage is full.
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }, [key, value]); // The effect depends on the key and the value.

  return [value, setValue];
}

export default useLocalStorage;
