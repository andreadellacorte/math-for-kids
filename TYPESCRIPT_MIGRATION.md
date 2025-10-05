# TypeScript Migration Guide

This document outlines the TypeScript migration for the Math for Kids project.

## What Changed

### Dependencies Added
- `typescript` - TypeScript compiler
- `@types/jest` - Type definitions for Jest
- `@types/node` - Type definitions for Node.js
- `ts-jest` - Jest transformer for TypeScript
- `ts-node` - TypeScript execution environment

### Configuration Files

#### `tsconfig.json`
- **target**: ES2020
- **module**: CommonJS
- **strict mode**: Enabled for type safety
- **sourceMap**: Enabled for debugging
- **declaration**: Generates `.d.ts` files

#### `package.json` (updated)
- Jest preset changed to `ts-jest`
- Test patterns updated to match `.ts` and `.tsx` files
- New scripts:
  - `npm run build` - Compile TypeScript
  - `npm run build:watch` - Watch mode compilation
  - `npm run type-check` - Type checking without emitting files

### File Migrations

| Old File | New File | Changes |
|----------|----------|---------|
| `js/math-utils.js` | `js/math-utils.ts` | Added type annotations, exported `MathOperator` type |
| `__tests__/math-utils.test.js` | `__tests__/math-utils.test.ts` | Changed to ES6 imports, added type safety |

### New Features in TypeScript Version

#### Type Safety
```typescript
export type MathOperator = '+' | '-' | '×' | '*' | '÷' | '/';

export function validateEquation(
  a: number,
  op: MathOperator,
  b: number,
  result: number
): boolean {
  // TypeScript ensures op is only valid operators
}
```

#### Additional Utility Functions
- `gcd(a, b)` - Greatest Common Divisor
- `lcm(a, b)` - Least Common Multiple

## Test Results

### Coverage (TypeScript)
```
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |   97.82 |    95.45 |     100 |     100 |
 math-utils.ts |   97.82 |    95.45 |     100 |     100 | 102
---------------|---------|----------|---------|---------|-------------------

✓ 32 tests passed
✓ All thresholds exceeded (minimum 70%)
```

## Benefits of TypeScript

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete, refactoring, and inline documentation
3. **Self-Documenting Code**: Type annotations serve as documentation
4. **Refactoring Confidence**: Compiler catches breaking changes
5. **Modern JavaScript**: Use latest features with confidence

## Next Steps

### Recommended Migration Path

1. **Phase 1** (Complete) ✓
   - Set up TypeScript tooling
   - Migrate utility functions
   - Update tests

2. **Phase 2** (Suggested)
   - Extract crossword generator logic to TypeScript modules
   - Create interfaces for game data structures
   - Add type-safe event handlers

3. **Phase 3** (Future)
   - Migrate all games to use TypeScript modules
   - Add React/Vue with TypeScript for complex UIs
   - Implement shared game engine with types

### Example: Crossword Module Migration

```typescript
// js/crossword/types.ts
export interface Equation {
  A: number;
  B: number;
  C: number;
  op: MathOperator;
  str: string;
}

export interface GridCell {
  value: number | null;
  given: boolean;
  position: Position;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// js/crossword/generator.ts
export function generateCrossword(
  numEquations: number,
  difficulty: Difficulty
): CrosswordModel {
  // Type-safe implementation
}
```

## Running TypeScript

### Development
```bash
# Run tests with coverage
npm run test:coverage

# Type check without compiling
npm run type-check

# Compile TypeScript
npm run build

# Watch mode for compilation
npm run build:watch
```

### Production
The compiled JavaScript in `dist/` can be used directly in HTML:
```html
<script src="dist/js/math-utils.js"></script>
```

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure paths in `tsconfig.json` include statement match your structure
2. **Type errors**: Run `npm run type-check` to see all type errors
3. **Jest not finding tests**: Check `testMatch` pattern in `package.json`

### IDE Setup

**VS Code**: Install "TypeScript" extension (built-in)
- Automatic type checking
- IntelliSense
- Quick fixes

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest with TypeScript](https://jestjs.io/docs/getting-started#using-typescript)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
