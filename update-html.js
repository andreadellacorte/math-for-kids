const fs = require('fs');

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

function updateHTML(htmlFile, gameName) {
  let content = fs.readFileSync(htmlFile, 'utf8');

  // Remove all <script> tags (with or without type="module")
  content = content.replace(/<script(?:\s+type="module")?>([\s\S]*?)<\/script>/g, '');

  // Add new script tag before closing </body> or --- if it's a Jekyll file
  const scriptTag = `<script src="/dist/${gameName}.js"></script>`;

  if (content.includes('</body>')) {
    // Regular HTML
    content = content.replace('</body>', `${scriptTag}\n</body>`);
  } else if (content.includes('---\n\n')) {
    // Jekyll front matter - add after content
    content = content.trim() + `\n\n${scriptTag}\n`;
  } else {
    // Add at end
    content = content.trim() + `\n${scriptTag}\n`;
  }

  fs.writeFileSync(htmlFile, content, 'utf8');
}

games.forEach(game => {
  const htmlFile = `./${game}.html`;

  if (!fs.existsSync(htmlFile)) {
    console.warn(`⚠️  ${htmlFile} not found, skipping`);
    return;
  }

  console.log(`📝 Updating ${game}.html...`);
  updateHTML(htmlFile, game);
  console.log(`✓ Updated ${game}.html to use /dist/${game}.js`);
});

console.log('\n✅ All HTML files updated!');
console.log('\nNext steps:');
console.log('  1. Test games in browser');
console.log('  2. Run: npm run build:bundles (to rebuild after changes)');
console.log('  3. Commit changes');
