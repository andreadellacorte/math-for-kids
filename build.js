const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watch = process.argv.includes('--watch');
const production = process.argv.includes('--production');

// Game entry points
const games = [
  'math-crossword',
  'brain-training',
  'times-table',
  'dice-101',
  'cashier-challenge',
  'place-value-showdown',
  'notation-game',
  'rhythm-game',
  'music-theory',
  'hearing-game',
  'instruments-game'
];

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Build configuration
const buildConfig = {
  bundle: true,
  format: 'iife', // Immediately Invoked Function Expression for browsers
  target: 'es2020',
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
  drop: production ? ['console', 'debugger'] : []
};

async function buildAll() {
  console.log(`Building all games... ${production ? '(PRODUCTION)' : '(DEVELOPMENT)'}\n`);

  for (const game of games) {
    const entryPoint = `./js/games/${game}.ts`;

    // Check if entry point exists
    if (!fs.existsSync(entryPoint)) {
      console.warn(`⚠️  Skipping ${game}: entry point not found`);
      continue;
    }

    try {
      await esbuild.build({
        ...buildConfig,
        entryPoints: [entryPoint],
        outfile: `./dist/${game}.js`,
      });
      console.log(`✓ Built ${game}.js`);
    } catch (error) {
      console.error(`✗ Failed to build ${game}:`, error.message);
    }
  }

  console.log('\n✅ Build complete!');
}

async function buildWatch() {
  console.log('👀 Watching for changes...\n');

  const contexts = [];

  for (const game of games) {
    const entryPoint = `./js/games/${game}.ts`;

    if (!fs.existsSync(entryPoint)) {
      continue;
    }

    const ctx = await esbuild.context({
      ...buildConfig,
      entryPoints: [entryPoint],
      outfile: `./dist/${game}.js`,
    });

    await ctx.watch();
    contexts.push(ctx);
    console.log(`👀 Watching ${game}...`);
  }

  console.log('\n✅ Watch mode active. Press Ctrl+C to stop.');
}

if (watch) {
  buildWatch().catch(() => process.exit(1));
} else {
  buildAll().catch(() => process.exit(1));
}
