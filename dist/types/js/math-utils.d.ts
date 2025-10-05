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
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export declare function randomInt(min: number, max: number): number;
/**
 * Checks if a number is within a valid range
 * @param num - Number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if in range
 */
export declare function isInRange(num: number, min: number, max: number): boolean;
/**
 * Validates an equation result
 * @param a - First operand
 * @param op - Operator (+, -, ×, ÷)
 * @param b - Second operand
 * @param result - Expected result
 * @returns True if equation is valid
 */
export declare function validateEquation(a: number, op: MathOperator, b: number, result: number): boolean;
/**
 * Formats a number with leading zeros
 * @param num - Number to format
 * @param width - Desired width (default: 2)
 * @returns Formatted number string
 */
export declare function padNumber(num: number, width?: number): string;
/**
 * Checks if a number is prime
 * @param num - Number to check
 * @returns True if prime
 */
export declare function isPrime(num: number): boolean;
/**
 * Calculates the greatest common divisor of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns GCD of a and b
 */
export declare function gcd(a: number, b: number): number;
/**
 * Calculates the least common multiple of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns LCM of a and b
 */
export declare function lcm(a: number, b: number): number;
//# sourceMappingURL=math-utils.d.ts.map