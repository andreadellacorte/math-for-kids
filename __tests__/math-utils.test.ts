/**
 * Tests for math utility functions
 */

import {
  clamp,
  randomInt,
  isInRange,
  validateEquation,
  padNumber,
  isPrime,
  gcd,
  lcm
} from '../js/math-utils';

describe('Math Utilities', () => {
  describe('clamp', () => {
    test('should clamp value below minimum', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    test('should clamp value above maximum', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    test('should return value within range unchanged', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });

    test('should handle negative numbers', () => {
      expect(clamp(-5, -10, 0)).toBe(-5);
      expect(clamp(-15, -10, 0)).toBe(-10);
    });
  });

  describe('randomInt', () => {
    test('should generate number within range', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
      }
    });

    test('should handle single value range', () => {
      expect(randomInt(5, 5)).toBe(5);
    });

    test('should handle negative ranges', () => {
      const num = randomInt(-10, -5);
      expect(num).toBeGreaterThanOrEqual(-10);
      expect(num).toBeLessThanOrEqual(-5);
    });
  });

  describe('isInRange', () => {
    test('should return true for value in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
    });

    test('should return true for value at boundaries', () => {
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    test('should return false for value outside range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('validateEquation', () => {
    test('should validate addition', () => {
      expect(validateEquation(5, '+', 3, 8)).toBe(true);
      expect(validateEquation(5, '+', 3, 9)).toBe(false);
    });

    test('should validate subtraction', () => {
      expect(validateEquation(10, '-', 4, 6)).toBe(true);
      expect(validateEquation(10, '-', 4, 7)).toBe(false);
    });

    test('should validate multiplication', () => {
      expect(validateEquation(6, '×', 7, 42)).toBe(true);
      expect(validateEquation(6, '*', 7, 42)).toBe(true);
      expect(validateEquation(6, '×', 7, 41)).toBe(false);
    });

    test('should validate division', () => {
      expect(validateEquation(20, '÷', 4, 5)).toBe(true);
      expect(validateEquation(20, '/', 4, 5)).toBe(true);
      expect(validateEquation(20, '÷', 4, 6)).toBe(false);
    });

    test('should reject division by zero', () => {
      expect(validateEquation(20, '÷', 0, 0)).toBe(false);
    });

    test('should reject invalid operators', () => {
      // @ts-expect-error Testing invalid operator
      expect(validateEquation(5, '%', 3, 2)).toBe(false);
    });
  });

  describe('padNumber', () => {
    test('should pad single digit with leading zero', () => {
      expect(padNumber(5)).toBe('05');
    });

    test('should not pad double digit', () => {
      expect(padNumber(15)).toBe('15');
    });

    test('should support custom width', () => {
      expect(padNumber(5, 3)).toBe('005');
      expect(padNumber(5, 4)).toBe('0005');
    });

    test('should handle zero', () => {
      expect(padNumber(0)).toBe('00');
    });
  });

  describe('isPrime', () => {
    test('should identify prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(11)).toBe(true);
      expect(isPrime(13)).toBe(true);
      expect(isPrime(17)).toBe(true);
      expect(isPrime(19)).toBe(true);
    });

    test('should identify non-prime numbers', () => {
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(8)).toBe(false);
      expect(isPrime(9)).toBe(false);
      expect(isPrime(10)).toBe(false);
      expect(isPrime(15)).toBe(false);
      expect(isPrime(20)).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isPrime(0)).toBe(false);
      expect(isPrime(-5)).toBe(false);
    });

    test('should handle large primes', () => {
      expect(isPrime(97)).toBe(true);
      expect(isPrime(100)).toBe(false);
    });
  });

  describe('gcd', () => {
    test('should calculate GCD of two numbers', () => {
      expect(gcd(12, 8)).toBe(4);
      expect(gcd(48, 18)).toBe(6);
      expect(gcd(7, 13)).toBe(1);
    });

    test('should handle zero', () => {
      expect(gcd(0, 5)).toBe(5);
      expect(gcd(5, 0)).toBe(5);
    });

    test('should handle negative numbers', () => {
      expect(gcd(-12, 8)).toBe(4);
      expect(gcd(12, -8)).toBe(4);
      expect(gcd(-12, -8)).toBe(4);
    });

    test('should handle same numbers', () => {
      expect(gcd(10, 10)).toBe(10);
    });
  });

  describe('lcm', () => {
    test('should calculate LCM of two numbers', () => {
      expect(lcm(4, 6)).toBe(12);
      expect(lcm(3, 5)).toBe(15);
      expect(lcm(12, 8)).toBe(24);
    });

    test('should handle zero', () => {
      expect(lcm(0, 5)).toBe(0);
      expect(lcm(5, 0)).toBe(0);
    });

    test('should handle negative numbers', () => {
      expect(lcm(-4, 6)).toBe(12);
      expect(lcm(4, -6)).toBe(12);
      expect(lcm(-4, -6)).toBe(12);
    });

    test('should handle coprime numbers', () => {
      expect(lcm(7, 13)).toBe(91);
    });
  });
});
