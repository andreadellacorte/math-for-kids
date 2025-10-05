/**
 * Math utility functions for educational games
 */

/**
 * Math operator types
 */
export type MathOperator = '+' | '-' | '×' | '*' | '÷' | '/';

/**
 * Clamps a value between min and max
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Checks if a number is within a valid range
 * @param num - Number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if in range
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Validates an equation result
 * @param a - First operand
 * @param op - Operator (+, -, ×, ÷)
 * @param b - Second operand
 * @param result - Expected result
 * @returns True if equation is valid
 */
export function validateEquation(
  a: number,
  op: MathOperator,
  b: number,
  result: number
): boolean {
  let calculated: number;

  switch(op) {
    case '+':
      calculated = a + b;
      break;
    case '-':
      calculated = a - b;
      break;
    case '×':
    case '*':
      calculated = a * b;
      break;
    case '÷':
    case '/':
      if (b === 0) return false;
      calculated = a / b;
      break;
    default:
      return false;
  }

  return calculated === result;
}

/**
 * Formats a number with leading zeros
 * @param num - Number to format
 * @param width - Desired width (default: 2)
 * @returns Formatted number string
 */
export function padNumber(num: number, width: number = 2): string {
  return String(num).padStart(width, '0');
}

/**
 * Checks if a number is prime
 * @param num - Number to check
 * @returns True if prime
 */
export function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }

  return true;
}

/**
 * Calculates the greatest common divisor of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns GCD of a and b
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

/**
 * Calculates the least common multiple of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns LCM of a and b
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}
