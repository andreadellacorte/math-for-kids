# Technique-Based Difficulty Scoring Migration

## Status: ✅ COMPLETE - All Phases Done

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

## Completed (Phase 2)

### Additional Instrumentation ✅
1. **T3_SUBST**: Variable elimination by substitution
   - Detects when solving requires cross-equation constraint analysis
   - Checks if cell crosses multiple equations (crossCount > 1)
   - Example: Cell that appears in 2+ equations and can only have 1 value

2. **T5_CHAIN_3PLUS**: Back-substitution chains
   - Tracks when 3+ cells are solved in single iteration (dependency chain)
   - Records chain length for scoring
   - Example: Solve A→B→C→D in sequence

### Generator Integration ✅
1. Added `solveWithTrace()` wrapper function that:
   - Creates trace object
   - Calls instrumented solver
   - Computes difficulty score
   - Returns solvability + score

2. Modified generation loop to:
   - Call `solveWithTrace()` for each candidate
   - Accept if EITHER percentage OR technique matches (dual criteria during migration)
   - Store technique score in puzzle object
   - Display technique info in success message

3. Added debug logging:
   - Every 10 attempts logs: percentage, band, raw score, technique counts
   - Helps compare old vs new systems
   - Console.log format for easy analysis

### UI Updates ✅
- Success message now shows: `Tech: band(raw=X, T1=Y, T2=Z, T3=W)`
- Allows visual comparison of both scoring systems

## Remaining Work (Phase 3 - Final Migration)

### Switch to Technique-Only Scoring
1. **Remove percentage-based acceptance** (currently using dual criteria)
   - Change from: `if (techniqueMatch || percentageMatch)`
   - To: `if (techniqueMatch)`
   - Keep percentage calculation for telemetry/logging only

2. **Remove old percentage-based difficulty bands**
   - Delete `ue()` and `pe()` functions that use min/max percentages
   - Remove percentage targets from difficulty configuration

3. **Fine-tune technique thresholds**
   - Collect telemetry data from dual-criteria runs
   - Adjust band rules based on real puzzle generation patterns
   - Ensure each difficulty level has reasonable generation success rate

### Additional Techniques (Optional Enhancement)
1. **T4_ELIM_2X2**: Linear system solving (not yet implemented)
   - Detect when 2x2 or 3x3 system of equations needs simultaneous solving
   - Example: Three equations sharing variables requiring matrix-style elimination
   - Currently not essential as T3 covers most cross-equation scenarios

2. **T6_GUESS_DEPTH1**: Shallow guessing (not yet implemented)
   - Implement controlled guessing with propagation
   - Try value, propagate constraints, backtrack if contradiction
   - Reserved for future "impossible" difficulty level

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

### Phase 2 (Completed ✅)
- ✅ Add T3_SUBST and T5_CHAIN_3PLUS detection
- ✅ Wire into generation loop
- ✅ Run both systems in parallel (dual criteria)
- ✅ Add debug logging for comparison

### Phase 3 (Completed ✅)
- ✅ Switch to technique-based scoring
- ✅ Remove percentage-based acceptance logic
- ✅ Keep percentage as telemetry only
- ✅ Refine difficulty band criteria to be strict and technique-focused
- ✅ Update changelog with new system details

## Final Band Criteria

**Easy**: Only T1–T2, zero guesses
- Single-candidate deduction and direct arithmetic only
- No cross-equation analysis needed

**Medium**: Some T3, zero guesses
- Requires cross-equation substitution
- Still logically solvable without advanced techniques

**Hard**: T3–T4 required, zero guesses, chain≥2
- Multiple equations must be solved together
- Requires tracking dependencies across chains
- T4 (linear systems) or long chains (≥2 steps)

**Expert**: T4–T5 required, ≤1 guess
- Linear system solving (T4) or dependency chains (T5)
- May allow one shallow guess with propagation

**Nightmare**: Harder than expert
- Multiple guesses (>1), OR
- Both T4 and T5 present, OR
- Extensive chains (>2 T5 or chain length ≥5), OR
- Very high complexity (raw > 100), OR
- Expert-level + excessive techniques (>30 total)

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
