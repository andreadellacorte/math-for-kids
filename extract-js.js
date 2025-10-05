const fs = require('fs');
const path = require('path');

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

function extractJavaScript(htmlFile) {
  const content = fs.readFileSync(htmlFile, 'utf8');

  // Find <script> tags (with or without type="module") and extract content
  const scriptRegex = /<script(?:\s+type="module")?>([\s\S]*?)<\/script>/g;
  let match;
  let jsCode = '';

  while ((match = scriptRegex.exec(content)) !== null) {
    jsCode += match[1] + '\n';
  }

  return jsCode.trim();
}

function addTypeScriptWrapper(jsCode, gameName) {
  return `/**
 * ${gameName} game logic
 * Migrated from ${gameName}.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

${jsCode}

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
`;
}

// Create games directory
if (!fs.existsSync('./js/games')) {
  fs.mkdirSync('./js/games', { recursive: true });
}

// Extract JavaScript from each game
games.forEach(game => {
  const htmlFile = `./${game}.html`;

  if (!fs.existsSync(htmlFile)) {
    console.warn(`⚠️  ${htmlFile} not found, skipping`);
    return;
  }

  console.log(`📄 Extracting JavaScript from ${game}.html...`);

  const jsCode = extractJavaScript(htmlFile);

  if (!jsCode) {
    console.warn(`⚠️  No JavaScript found in ${game}.html`);
    return;
  }

  const tsCode = addTypeScriptWrapper(jsCode, game);
  const outputFile = `./js/games/${game}.ts`;

  fs.writeFileSync(outputFile, tsCode, 'utf8');
  console.log(`✓ Created ${outputFile} (${tsCode.split('\n').length} lines)`);
});

console.log('\n✅ Extraction complete!');
console.log('\nNext steps:');
console.log('  1. Run: npm run type-check');
console.log('  2. Fix any TypeScript errors');
console.log('  3. Run: npm run build');
