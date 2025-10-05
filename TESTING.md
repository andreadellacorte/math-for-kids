# Testing Guide

This project uses Jest with TypeScript (ts-jest) for unit testing with coverage reporting.

## Setup

Install dependencies:

```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### Type checking
```bash
npm run type-check
```

### Build TypeScript
```bash
npm run build
```

## Project Structure

```
math-for-kids/
├── js/                    # TypeScript source files
│   └── math-utils.ts      # Math utility functions
├── __tests__/             # Test files
│   └── math-utils.test.ts # Tests for math utilities
├── dist/                  # Compiled JavaScript (generated)
├── coverage/              # Coverage reports (generated)
├── package.json           # Node dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── .babelrc               # Babel configuration
```

## Coverage Thresholds

The project maintains the following minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Writing Tests

Tests should be placed in the `__tests__/` directory with the `.test.ts` extension.

Example test:

```typescript
import { clamp } from '../js/math-utils';

describe('clamp', () => {
  test('should clamp value below minimum', () => {
    expect(clamp(5, 10, 20)).toBe(10);
  });
});
```

## Next Steps for Refactoring

To improve testability, the following modules should be extracted from the HTML files:

### Math Crossword (`math-crossword.html`)
1. **crossword-generator.js** - Core generation algorithms
2. **crossword-solver.js** - Solving and optimization logic
3. **equation-utils.js** - Equation generation/validation
4. **crossword-renderer.js** - DOM rendering functions
5. **crossword-ui.js** - UI controls and event handlers

### Benefits
- **Testability**: Each module can be tested independently
- **Maintainability**: Bugs are easier to locate and fix
- **Reusability**: Shared code can be used across games
- **Performance**: Browser caching of separate JS files
