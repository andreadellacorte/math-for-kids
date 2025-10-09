#!/usr/bin/env node

// Test script for math crossword puzzle generation
// Tests that all difficulty levels work within 20 attempts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the math-crossword.js file
const jsPath = path.join(__dirname, 'public/games/math-crossword.js');
const jsCode = fs.readFileSync(jsPath, 'utf8');

// Evaluate the code (extract just the functions we need)
// This is a simplified version - we'll extract the key functions

console.log('🧪 Math Crossword Puzzle Generation Test\n');
console.log('Testing that all difficulty levels generate within 20 attempts...\n');

// We need to use the actual browser code, so let's use Node to run the tests
// by importing the functions via eval (safe in test context)

// Mock window object for console logging
global.window = {
  console: console
};

// Execute the JS code to get access to functions
eval(jsCode);

// Test configuration
const TEST_CONFIGS = [
  { difficulty: 'easy', numEq: 20, range: [0, 20], expectedAttempts: 20 },
  { difficulty: 'medium', numEq: 20, range: [0, 20], expectedAttempts: 20 },
  { difficulty: 'hard', numEq: 20, range: [0, 20], expectedAttempts: 20 }
];

const ops = {
  add: true,
  sub: true,
  mul: true,
  div: true
};

async function runTest(config) {
  const { difficulty, numEq, range, expectedAttempts } = config;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Testing ${difficulty.toUpperCase()} difficulty`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Config: ${numEq} equations, range ${range[0]}-${range[1]}`);
  console.log(`Max attempts allowed: ${expectedAttempts}\n`);

  let success = false;
  let attempts = 0;
  let result = null;
  let lastError = null;

  for (attempts = 1; attempts <= expectedAttempts; attempts++) {
    try {
      // Generate puzzle
      const puzzle = generateCrosswordPuzzle(numEq, range[0], range[1], ops, difficulty);

      if (puzzle && puzzle.equations && puzzle.equations.length > 0) {
        result = puzzle;
        success = true;
        break;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  if (success && result) {
    const stats = result.techniqueScore || {};
    const details = stats.details || {};
    const counts = details.counts || {};

    const totalTechniques = (counts.T1_ARITH || 0) +
                           (counts.T2_SINGLE || 0) +
                           (counts.T3_SUBST || 0) +
                           (counts.T4_ELIM_2X2 || 0) +
                           (counts.T5_CHAIN_3PLUS || 0) +
                           (counts.T6_GUESS_DEPTH1 || 0);

    const numGivens = result.givens ? result.givens.size : 0;
    const totalNumbers = result.allNumbers ? result.allNumbers.length : 0;
    const givensPercent = totalNumbers > 0 ? Math.round((numGivens / totalNumbers) * 100) : 0;

    console.log(`✅ SUCCESS on attempt ${attempts}/${expectedAttempts}`);
    console.log(`\nPuzzle Statistics:`);
    console.log(`  - Equations: ${result.equations.length}`);
    console.log(`  - Givens: ${numGivens}/${totalNumbers} (${givensPercent}%)`);
    console.log(`  - Difficulty Band: ${stats.band || 'unknown'}`);
    console.log(`  - Raw Score: ${stats.raw || 0}`);
    console.log(`  - Total Techniques: ${totalTechniques}`);
    console.log(`\nTechnique Breakdown:`);
    console.log(`  - T1 (Arithmetic): ${counts.T1_ARITH || 0}`);
    console.log(`  - T2 (Single): ${counts.T2_SINGLE || 0}`);
    console.log(`  - T3 (Cross-Eq): ${counts.T3_SUBST || 0}`);
    console.log(`  - T4 (Linear): ${counts.T4_ELIM_2X2 || 0}`);
    console.log(`  - T5 (Chain): ${counts.T5_CHAIN_3PLUS || 0}`);
    console.log(`  - T6 (Guess): ${counts.T6_GUESS_DEPTH1 || 0}`);
    console.log(`  - Max Chain: ${details.maxChainLen || 0}`);

    // Verify minimum requirements
    const hasMinTechniques = (counts.T1_ARITH || 0) >= 1 &&
                             (counts.T2_SINGLE || 0) >= 1 &&
                             (counts.T3_SUBST || 0) >= 1;

    if (!hasMinTechniques) {
      console.log(`\n⚠️  WARNING: Puzzle missing minimum techniques!`);
      console.log(`   Required: T1≥1, T2≥1, T3≥1`);
      return false;
    }

    // Verify band matches difficulty
    const expectedBand = difficulty;
    const actualBand = stats.band;

    if (difficulty === 'medium' && (actualBand === 'easy' || actualBand === 'medium')) {
      // OK - medium accepts easy/medium
    } else if (difficulty === 'hard' && (actualBand === 'medium' || actualBand === 'hard')) {
      // OK - hard accepts medium/hard
    } else if (difficulty === 'easy' && actualBand === 'easy') {
      // OK - easy only accepts easy
    } else {
      console.log(`\n⚠️  WARNING: Band mismatch! Expected ${expectedBand}, got ${actualBand}`);
      return false;
    }

    return true;
  } else {
    console.log(`❌ FAILED after ${expectedAttempts} attempts`);
    if (lastError) {
      console.log(`   Last error: ${lastError}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('Starting comprehensive puzzle generation tests...');
  console.log('Each difficulty level must generate within 20 attempts.\n');

  const results = [];

  for (const config of TEST_CONFIGS) {
    const passed = await runTest(config);
    results.push({ difficulty: config.difficulty, passed });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📈 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  let allPassed = true;
  for (const { difficulty, passed } of results) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} - ${difficulty.toUpperCase()}`);
    if (!passed) allPassed = false;
  }

  console.log(`\n${'='.repeat(60)}`);
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('💥 SOME TESTS FAILED - See details above');
    process.exit(1);
  }
  console.log(`${'='.repeat(60)}\n`);
}

// Run the tests
runAllTests().catch(err => {
  console.error('❌ Test runner error:', err);
  process.exit(1);
});
