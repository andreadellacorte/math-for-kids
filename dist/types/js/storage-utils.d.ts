/**
 * Storage utility functions (cookies and localStorage)
 */
/**
 * Set a cookie with optional expiration
 */
export declare function setCookie(name: string, value: string, days?: number): void;
/**
 * Get a cookie value by name
 */
export declare function getCookie(name: string): string | null;
/**
 * Delete a cookie by name
 */
export declare function deleteCookie(name: string): void;
/**
 * Set item in localStorage with JSON serialization
 */
export declare function setLocalStorage<T>(key: string, value: T): void;
/**
 * Get item from localStorage with JSON deserialization
 */
export declare function getLocalStorage<T>(key: string): T | null;
/**
 * Remove item from localStorage
 */
export declare function removeLocalStorage(key: string): void;
/**
 * Clear all localStorage items
 */
export declare function clearLocalStorage(): void;
/**
 * Check if localStorage is available
 */
export declare function isLocalStorageAvailable(): boolean;
//# sourceMappingURL=storage-utils.d.ts.map