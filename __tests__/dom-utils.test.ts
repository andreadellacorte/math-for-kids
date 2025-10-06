/**
 * Tests for dom-utils module
 */

import { getElement, createElement, setText, setHTML, addClass, removeClass, toggleClass, show, hide, exists } from '../js/dom-utils';

describe('DOM Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('getElement', () => {
        it('should get an existing element by id', () => {
            document.body.innerHTML = '<div id="test">Hello</div>';
            const element = getElement<HTMLDivElement>('test');
            expect(element).toBeTruthy();
            expect(element.textContent).toBe('Hello');
        });

        it('should throw error for non-existent element', () => {
            expect(() => getElement('nonexistent')).toThrow('Element with id "nonexistent" not found');
        });

        it('should return correct element type', () => {
            document.body.innerHTML = '<button id="btn">Click</button>';
            const button = getElement<HTMLButtonElement>('btn');
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('createElement', () => {
        it('should create a basic element', () => {
            const div = createElement('div');
            expect(div.tagName).toBe('DIV');
        });

        it('should create element with className', () => {
            const div = createElement('div', { className: 'test-class' });
            expect(div.className).toBe('test-class');
        });

        it('should create element with id', () => {
            const div = createElement('div', { id: 'test-id' });
            expect(div.id).toBe('test-id');
        });

        it('should create element with text content via children', () => {
            const div = createElement('div', {}, ['Hello World']);
            expect(div.textContent).toBe('Hello World');
        });

        it('should create element with multiple attributes', () => {
            const input = createElement('input', {
                id: 'test-input',
                className: 'form-control',
                type: 'text',
                placeholder: 'Enter text'
            });
            expect(input.id).toBe('test-input');
            expect(input.className).toBe('form-control');
            expect(input.getAttribute('type')).toBe('text');
            expect(input.getAttribute('placeholder')).toBe('Enter text');
        });

        it('should create button element with children', () => {
            const button = createElement('button', {}, ['Click me']);
            expect(button.tagName).toBe('BUTTON');
            expect(button.textContent).toBe('Click me');
        });

        it('should create element with mixed children', () => {
            const span = createElement('span', {}, ['Text']);
            const div = createElement('div', {}, ['Hello ', span, ' World']);
            expect(div.textContent).toBe('Hello Text World');
        });
    });

    describe('setText', () => {
        it('should set text content', () => {
            document.body.innerHTML = '<div id="test"></div>';
            setText('test', 'Hello World');
            expect(getElement('test').textContent).toBe('Hello World');
        });
    });

    describe('setHTML', () => {
        it('should set HTML content', () => {
            document.body.innerHTML = '<div id="test"></div>';
            setHTML('test', '<span>Hello</span>');
            expect(getElement('test').innerHTML).toBe('<span>Hello</span>');
        });
    });

    describe('addClass', () => {
        it('should add class to element', () => {
            document.body.innerHTML = '<div id="test"></div>';
            addClass('test', 'active');
            expect(getElement('test').classList.contains('active')).toBe(true);
        });
    });

    describe('removeClass', () => {
        it('should remove class from element', () => {
            document.body.innerHTML = '<div id="test" class="active"></div>';
            removeClass('test', 'active');
            expect(getElement('test').classList.contains('active')).toBe(false);
        });
    });

    describe('toggleClass', () => {
        it('should toggle class on element', () => {
            document.body.innerHTML = '<div id="test"></div>';
            toggleClass('test', 'active');
            expect(getElement('test').classList.contains('active')).toBe(true);
            toggleClass('test', 'active');
            expect(getElement('test').classList.contains('active')).toBe(false);
        });
    });

    describe('show', () => {
        it('should show hidden element', () => {
            document.body.innerHTML = '<div id="test" style="display: none;"></div>';
            show('test');
            expect(getElement('test').style.display).toBe('');
        });
    });

    describe('hide', () => {
        it('should hide visible element', () => {
            document.body.innerHTML = '<div id="test"></div>';
            hide('test');
            expect(getElement('test').style.display).toBe('none');
        });
    });

    describe('exists', () => {
        it('should return true for existing element', () => {
            document.body.innerHTML = '<div id="test"></div>';
            expect(exists('test')).toBe(true);
        });

        it('should return false for non-existent element', () => {
            expect(exists('nonexistent')).toBe(false);
        });
    });
});
