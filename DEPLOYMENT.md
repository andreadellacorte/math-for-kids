# Deployment Guide

## Overview

The project is now fully TypeScript-based with an optimized build pipeline.

## Build Commands

```bash
# Development build (with source maps, debugging)
npm run build:bundles

# Production build (minified, optimized)
npm run build:prod

# Watch mode (auto-rebuild on changes)
npm run build:watch

# Full build (bundles + type definitions)
npm run build
```

## File Structure

```
math-for-kids/
├── js/                    # TypeScript source (DO commit)
├── dist/                  # Compiled bundles (DO commit for Jekyll)
├── *.html                 # Game files (DO commit)
└── node_modules/          # Dependencies (DON'T commit)
```

## Deployment Steps

### 1. Make Code Changes

Edit TypeScript files in `js/` directory:
```bash
vim js/games/math-crossword.ts
```

### 2. Build for Production

```bash
npm run build:prod
```

This creates optimized bundles in `dist/` with:
- Minification (smaller files)
- No source maps (faster loading)
- Console logs removed
- Debugger statements removed

### 3. Test Locally

```bash
# If using Jekyll
bundle exec jekyll serve

# Or open HTML files directly in browser
open math-crossword.html
```

### 4. Commit Changes

```bash
git add js/ dist/ *.html
git commit -m "Update game logic"
git push
```

## GitHub Pages Deployment

The site automatically deploys when you push to the main branch.

### Important Notes

1. **Commit `dist/` folder** - GitHub Pages needs the compiled bundles
2. **Build before committing** - Always run `npm run build:prod` first
3. **Test locally** - Verify games work before pushing

## Bundle Sizes

Production bundles (minified):

- math-crossword.js: 62KB → ~35KB (43% smaller)
- brain-training.js: 25KB → ~15KB (40% smaller)
- times-table.js: 25KB → ~15KB (40% smaller)
- Other games: 9-21KB → 5-12KB (40-45% smaller)

**Total**: ~211KB → ~120KB (43% reduction)

## Development Workflow

### Day-to-Day Development

```bash
# 1. Start watch mode
npm run build:watch

# 2. Edit TypeScript files
# (watch mode automatically rebuilds)

# 3. Test in browser
# (refresh to see changes)
```

### Before Committing

```bash
# 1. Stop watch mode (Ctrl+C)

# 2. Production build
npm run build:prod

# 3. Test
open math-crossword.html

# 4. Commit
git add .
git commit -m "Your message"
git push
```

## Continuous Integration

If you add CI/CD, use this workflow:

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Build production bundles
      run: npm run build:prod

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: .
```

## Troubleshooting

### Games not loading

1. Check browser console for errors
2. Verify `dist/` folder has `.js` files
3. Rebuild: `npm run build:prod`
4. Check HTML files reference correct paths: `/dist/game-name.js`

### Changes not appearing

1. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
2. Clear browser cache
3. Verify you rebuilt after changes: `npm run build:prod`

### Build errors

1. Check TypeScript errors: `npm run type-check`
2. Verify Node.js version: `node --version` (needs 14+)
3. Clean install: `rm -rf node_modules && npm install`

## Performance Optimization

Current optimizations:
- ✅ Minification
- ✅ Tree shaking
- ✅ Console removal
- ✅ ES2020 target

Future optimizations:
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Brotli compression
- [ ] CDN delivery

## Monitoring

After deployment, monitor:

1. **Bundle sizes**: Keep under 100KB per game
2. **Load times**: Target <2s on 3G
3. **Error rates**: Check browser console logs
4. **Coverage**: Aim for 80%+ test coverage

## Rollback

If deployment breaks:

```bash
# Revert to previous commit
git revert HEAD
git push

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force
```

## Support

For issues:
1. Check `TYPESCRIPT_COMPLETE_SUMMARY.md`
2. Review `TESTING.md`
3. Open GitHub issue
