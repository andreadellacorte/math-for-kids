/**
 * DOM utility functions for games
 */

/**
 * Safely get element by ID with type assertion
 */
export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

/**
 * Safely query selector with type assertion
 */
export function querySelector<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  return element as T;
}

/**
 * Set text content safely
 */
export function setText(id: string, text: string): void {
  const element = getElement(id);
  element.textContent = text;
}

/**
 * Set HTML content safely
 */
export function setHTML(id: string, html: string): void {
  const element = getElement(id);
  element.innerHTML = html;
}

/**
 * Add CSS class to element
 */
export function addClass(id: string, className: string): void {
  const element = getElement(id);
  element.classList.add(className);
}

/**
 * Remove CSS class from element
 */
export function removeClass(id: string, className: string): void {
  const element = getElement(id);
  element.classList.remove(className);
}

/**
 * Toggle CSS class on element
 */
export function toggleClass(id: string, className: string): void {
  const element = getElement(id);
  element.classList.toggle(className);
}

/**
 * Show element
 */
export function show(id: string): void {
  const element = getElement<HTMLElement>(id);
  element.style.display = '';
}

/**
 * Hide element
 */
export function hide(id: string): void {
  const element = getElement<HTMLElement>(id);
  element.style.display = 'none';
}

/**
 * Check if element exists
 */
export function exists(id: string): boolean {
  return document.getElementById(id) !== null;
}

/**
 * Create element with attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string>,
  children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  }

  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}
