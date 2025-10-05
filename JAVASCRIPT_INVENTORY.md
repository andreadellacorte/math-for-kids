# JavaScript Inventory

## Current Status

### ✅ Migrated to TypeScript (339 lines)
- `js/math-utils.ts` - 136 lines
- `__tests__/math-utils.test.ts` - 203 lines

### ⚠️ Old JavaScript Files (262 lines) - Can be deleted
- `js/math-utils.js` - 108 lines
- `__tests__/math-utils.test.js` - 154 lines

### ❌ Embedded JavaScript in HTML - NOT Migrated

**Large files with significant JavaScript:**

1. **math-crossword.html** - 3,287 lines total, ~48 functions
   - Largest file, most complex logic
   - Priority for migration

2. **brain-training.html** - 1,722 lines total
   - Second largest file

3. **times-table.html** - 1,715 lines total
   - Similar size to brain-training

4. **music-theory.html** - 1,348 lines total
   - Music game logic

5. **rhythm-game.html** - 751 lines total

6. **place-value-showdown.html** - 613 lines total

7. **notation-game.html** - 613 lines total

8. **dice-101.html** - 605 lines total, ~22 functions

9. **instruments-game.html** - 573 lines total

10. **hearing-game.html** - 533 lines total

11. **cashier-challenge.html** - 403 lines total, ~16 functions

**Smaller files:**
- changelog.html - 199 lines (mostly content)
- index.html - 96 lines (mostly HTML)
- music-trivia.html - 39 lines

## Estimation

Based on file analysis:

- **HTML/CSS**: ~30-40% of each game file
- **JavaScript**: ~60-70% of each game file

**Rough estimate of embedded JavaScript:**
- math-crossword.html: ~2,300 lines of JS
- brain-training.html: ~1,200 lines of JS
- times-table.html: ~1,200 lines of JS
- Other games: ~4,000 lines combined

**TOTAL EMBEDDED JAVASCRIPT: ~8,700 lines**

## Migration Progress

| Category | Lines | Status |
|----------|-------|--------|
| TypeScript | 339 | ✅ Complete |
| Old JS files | 262 | ⚠️ Delete after verification |
| Embedded JS | ~8,700 | ❌ Not started |
| **TOTAL** | **~9,300** | **~4% migrated** |

## Recommended Migration Order

### Phase 1: Utility Modules (Complete ✓)
- [x] Math utilities
- [x] Test infrastructure

### Phase 2: Extract Common Game Logic
1. Create TypeScript modules:
   - `js/game-engine.ts` - Common game loop, scoring
   - `js/dom-utils.ts` - DOM helpers
   - `js/audio-utils.ts` - Sound/music helpers
   - `js/storage-utils.ts` - Cookie/localStorage helpers

### Phase 3: Math Crossword (Priority - Largest file)
1. Extract modules:
   - `js/crossword/types.ts` - Type definitions
   - `js/crossword/generator.ts` - Grid generation
   - `js/crossword/solver.ts` - Solving logic
   - `js/crossword/renderer.ts` - DOM rendering
   - `js/crossword/ui.ts` - Event handlers

### Phase 4: Other Math Games
- Brain Training
- Times Table
- Place Value Showdown
- Dice 101
- Cashier Challenge

### Phase 5: Music Games
- Music Theory
- Rhythm Game
- Notation Game
- Hearing Game
- Instruments Game

## Benefits of Full Migration

1. **Type Safety**: Catch bugs before runtime
2. **Code Reuse**: Share logic between games
3. **Testability**: Unit test all game logic
4. **Maintainability**: Easier to find and fix bugs
5. **Performance**: Better minification and tree-shaking
6. **Developer Experience**: Better IDE support

## Cleanup Tasks

Once TypeScript migration is verified working:

```bash
# Remove old JavaScript files
rm js/math-utils.js
rm __tests__/math-utils.test.js
```
