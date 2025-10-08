# Technique-Based Difficulty Scoring Migration

## Status: IN PROGRESS - Phase 1 Complete

## Overview
Migrating from percentage-based difficulty (% empty cells) to technique-based difficulty scoring that measures actual solving complexity.

## Completed (Phase 1)

### Data Structures ✅
- `Technique` enum with 6 levels: T1_SINGLE through T6_GUESS_DEPTH1
- `TechniqueWeights` mapping each technique to difficulty points
- `createSolveTrace()` - creates trace object to track technique usage
- `recordTechnique(trace, technique, chainLen)` - records technique usage
- `scoreDifficulty(trace)` - computes raw score and difficulty band from trace

### Solver Instrumentation ✅
- Modified `he()` function to accept optional `trace` parameter
- Instrumented T2_ARITH technique (direct arithmetic solving)
- Instrumented T1_SINGLE technique (constraint propagation to single value)

### Scoring Algorithm ✅
```javascript
raw_score = Σ(counts[t] * weight[t]) + 3*max_chain_len + 5*min(guesses,1)

Bands:
- EASY: No T3/T4/T5, no guesses (only T1/T2)
- MEDIUM: Some T3, no T4/T5, no guesses
- HARD: T4 present OR multiple T3, chain_len≥2, ≤1 guess
- EXPERT: T5 present OR sophisticated techniques
- NIGHTMARE: Guesses OR extensive T5/T4 usage OR raw>80
```

## Remaining Work (Phase 2)

### Additional Instrumentation Needed
1. **T3_SUBST**: Variable elimination by substitution
   - Detect when solving requires tracking relationships between 2+ equations
   - Example: If A+B=10 and B+C=15, substituting to find C

2. **T4_ELIM_2X2**: Linear system solving
   - Detect when 2x2 or 3x3 system of equations needs simultaneous solving
   - Example: Three equations sharing variables requiring matrix-style elimination

3. **T5_CHAIN_3PLUS**: Back-substitution chains
   - Track chain length when solving requires 3+ steps of back-substitution
   - Example: Solve A→B→C→D in sequence

4. **T6_GUESS_DEPTH1**: Shallow guessing
   - Implement controlled guessing with propagation
   - Try value, propagate constraints, backtrack if contradiction

### Generator Integration
1. Find main generation loop (currently uses `ge()` function)
2. Add `solveWithTrace()` wrapper function:
   ```javascript
   function solveWithTrace(grid, equations, givens) {
     const trace = createSolveTrace();
     const solvable = !he(grid, equations, givens, trace);
     return { solvable, trace, score: scoreDifficulty(trace) };
   }
   ```

3. Replace acceptance criteria:
   ```javascript
   // OLD (remove):
   let y = Math.round((p.actualGivens / p.numTotal) * 100);
   if (y >= t.min && y <= t.max) { accept(); }

   // NEW (add):
   const { trace, score } = solveWithTrace(grid, equations, givens);
   if (score.band === requestedDifficulty) { accept(); }
   ```

4. Keep percentage calculation for telemetry only (with debug flag)

### Testing
1. **Unit tests for scorer**:
   - Easy puzzle: only T1/T2 → band='easy'
   - Medium puzzle: T3 present → band='medium'
   - Hard puzzle: T4 + chains → band='hard'
   - Expert puzzle: T5 or T6 → band='expert'

2. **Property tests**:
   - More techniques → never decreases difficulty
   - Same puzzle always produces same score

3. **Golden tests**:
   - Known seed puzzles map to expected bands

### Documentation
1. Update README with:
   - Technique definitions
   - Band rules and scoring formula
   - Migration notes
   - Examples of each technique

2. Add telemetry logging:
   - Histogram of technique usage per difficulty
   - Average raw scores per band
   - Generation time comparison

## Migration Strategy

### Phase 1 (Completed)
- ✅ Add data structures
- ✅ Basic instrumentation
- ✅ Scoring function
- ✅ Keep old system running

### Phase 2 (Next)
- Add remaining technique detection
- Wire into generation loop
- Run both systems in parallel
- Compare results

### Phase 3 (Final)
- Switch to technique-based scoring
- Remove percentage-based logic
- Keep percentage as telemetry only
- Update UI to show techniques used

## Technical Notes

### Current Solver Algorithm
The `he()` function uses iterative constraint propagation:
1. **Direct solving** (T2_ARITH): 2 knowns → solve for 3rd
2. **Constraint propagation** (T1_SINGLE): Check all valid values, accept if only 1 works

### Missing Techniques (Need Implementation)
- **T3**: Currently not detected - needs equation dependency tracking
- **T4**: Currently not detected - needs linear system solver
- **T5**: Currently not detected - needs chain length tracking
- **T6**: Not implemented - would require backtracking search

### Performance Considerations
- Target: <15% regression in generation time
- Current bottleneck: `he()` called in loop during optimization
- Strategy: Only compute full trace on final candidate, use fast check during iteration

## Files Modified
- `/public/games/math-crossword.js`: Added enums, scoring, instrumentation

## Files To Modify
- `/public/games/math-crossword.js`: Generator loop integration
- Create test file: `/tests/technique-scoring.test.js`
- Update `/README.md` with technique documentation

## References
- Similar to Sudoku difficulty ratings
- Expert puzzle solvers use technique complexity, not cell counts
- Ensures difficulty reflects actual solving experience
