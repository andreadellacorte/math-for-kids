/**
 * DOM utility functions for games
 */
/**
 * Safely get element by ID with type assertion
 */
export declare function getElement<T extends HTMLElement>(id: string): T;
/**
 * Safely query selector with type assertion
 */
export declare function querySelector<T extends HTMLElement>(selector: string): T;
/**
 * Set text content safely
 */
export declare function setText(id: string, text: string): void;
/**
 * Set HTML content safely
 */
export declare function setHTML(id: string, html: string): void;
/**
 * Add CSS class to element
 */
export declare function addClass(id: string, className: string): void;
/**
 * Remove CSS class from element
 */
export declare function removeClass(id: string, className: string): void;
/**
 * Toggle CSS class on element
 */
export declare function toggleClass(id: string, className: string): void;
/**
 * Show element
 */
export declare function show(id: string): void;
/**
 * Hide element
 */
export declare function hide(id: string): void;
/**
 * Check if element exists
 */
export declare function exists(id: string): boolean;
/**
 * Create element with attributes
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attributes?: Record<string, string>, children?: (HTMLElement | string)[]): HTMLElementTagNameMap[K];
//# sourceMappingURL=dom-utils.d.ts.map