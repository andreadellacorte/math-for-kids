/**
 * Tests for storage-utils module
 */

import { setCookie, getCookie, deleteCookie } from '../js/storage-utils';

describe('Storage Utilities', () => {
    beforeEach(() => {
        // Clear all cookies before each test
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    });

    describe('setCookie', () => {
        it('should set a cookie with default expiration', () => {
            setCookie('test', 'value');
            expect(document.cookie).toContain('test=value');
        });

        it('should set a cookie with custom expiration days', () => {
            setCookie('test', 'value', 7);
            expect(document.cookie).toContain('test=value');
        });

        it('should encode special characters in cookie value', () => {
            setCookie('test', 'hello world!@#$%');
            const value = getCookie('test');
            expect(value).toBe('hello world!@#$%');
        });

        it('should handle empty string values', () => {
            setCookie('test', '');
            expect(getCookie('test')).toBe('');
        });
    });

    describe('getCookie', () => {
        it('should retrieve an existing cookie', () => {
            setCookie('test', 'myvalue');
            expect(getCookie('test')).toBe('myvalue');
        });

        it('should return null for non-existent cookie', () => {
            expect(getCookie('nonexistent')).toBeNull();
        });

        it('should decode encoded cookie values', () => {
            setCookie('test', 'hello world');
            expect(getCookie('test')).toBe('hello world');
        });

        it('should handle multiple cookies', () => {
            setCookie('first', 'value1');
            setCookie('second', 'value2');
            setCookie('third', 'value3');

            expect(getCookie('first')).toBe('value1');
            expect(getCookie('second')).toBe('value2');
            expect(getCookie('third')).toBe('value3');
        });
    });

    describe('deleteCookie', () => {
        it('should delete an existing cookie', () => {
            setCookie('test', 'value');
            expect(getCookie('test')).toBe('value');

            deleteCookie('test');
            expect(getCookie('test')).toBeNull();
        });

        it('should not throw error when deleting non-existent cookie', () => {
            expect(() => deleteCookie('nonexistent')).not.toThrow();
        });

        it('should only delete specified cookie', () => {
            setCookie('keep', 'keepvalue');
            setCookie('delete', 'deletevalue');

            deleteCookie('delete');

            expect(getCookie('keep')).toBe('keepvalue');
            expect(getCookie('delete')).toBeNull();
        });
    });
});
