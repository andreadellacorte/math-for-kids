# Jekyll to Astro Migration Plan

**Started:** 2025-10-06
**Status:** In Progress

## Overview

Migrating from Jekyll/Ruby + plain CSS to Astro + Tailwind CSS. This will deprecate Ruby/Jekyll while maintaining all existing functionality.

## Migration Strategy

### Phase 1: Freeze & Setup

- [x] Tag current main as `pre-astro-freeze`
- [ ] Enable GitHub Pages via Actions in Settings
- [ ] Create `astro-migrate` branch
- [ ] Initialize Astro project
- [ ] Add Tailwind CSS

### Phase 2: Configure Pages

- [ ] Set `base: '/math-for-kids'` in `astro.config.mjs` (if using user.github.io/repo)
- [ ] Add `site: 'https://<user>.github.io'`
- [ ] Copy `CNAME` to `public/` if using custom domain

### Phase 3: Static Assets

- [ ] Move Jekyll `assets/` to `public/assets/`
- [ ] Move `images/` to `public/images/`
- [ ] Move game folders to `public/games/`
- [ ] Verify all relative URLs remain functional

### Phase 4: Port Homepage

- [ ] Create `src/pages/index.astro`
- [ ] Hardcode simple grid with game links
- [ ] Verify initial build

### Phase 5: Data Layer

- [ ] Create `src/data/games.json` with structure:
  ```json
  {
    "slug": "...",
    "title": "...",
    "thumb": "...",
    "tags": [],
    "url": "..."
  }
  ```
- [ ] Replace hardcoded grid with loop over `games.json`
- [ ] Keep game HTML under `public/games/<slug>/index.html`

### Phase 6: Styling Migration

- [ ] Create `src/styles/legacy.css` with existing CSS
- [ ] Import legacy CSS in `src/layouts/Base.astro`
- [ ] Introduce Tailwind classes page by page
- [ ] Use `@apply` to map old rules to Tailwind utilities
- [ ] Incrementally delete legacy rules

### Phase 7: Layout & Components

- [ ] Create `src/layouts/Base.astro` with header, footer, `<slot />`
- [ ] Convert Jekyll includes to `src/components/`
- [ ] Apply base layout to all pages

### Phase 8: GitHub Actions Setup

- [ ] Create `.github/workflows/pages.yml`:
  ```yaml
  name: Deploy Astro to Pages
  on:
    push:
      branches: [astro-migrate]
  permissions:
    contents: write
    pages: write
    id-token: write
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
            cache: 'npm'
        - run: npm ci
        - run: npm run build
        - run: touch dist/.nojekyll
        - uses: actions/upload-pages-artifact@v3
          with:
            path: dist
    deploy:
      needs: build
      runs-on: ubuntu-latest
      steps:
        - uses: actions/deploy-pages@v4
  ```
- [ ] Update repo Settings → Pages → Source to "GitHub Actions"

### Phase 9: Cutover

- [ ] Verify preview deploy from `astro-migrate` branch
- [ ] Update links, favicons, robots.txt, sitemap
- [ ] Merge `astro-migrate` to `main`
- [ ] Delete Jekyll-specific files:
  - `_config.yml`
  - `_layouts/`
  - `_includes/`
  - Unused `.md` front matter files

### Phase 10: Optional Upgrades

- [ ] Add search functionality
- [ ] Add "recently played" feature with client script
- [ ] Create `games/[slug].astro` for game detail pages
- [ ] Add PWA manifest
- [ ] Implement cache for game assets

## Build Safety

- **Local builds:** Safety check at commit time
- **Production builds:** GitHub Actions only
- **Rollback plan:** Keep Jekyll branch; switch Pages deployment if needed

## Rollback Plan

1. Keep the Jekyll branch intact
2. If issues arise, switch Pages to deploy from Jekyll branch
3. Debug Astro issues in `astro-migrate` branch
4. Re-attempt cutover when fixed

## Notes

- All game functionality must remain intact
- Same relative URLs to avoid broken links
- Gradual CSS migration to avoid visual regressions
- Test thoroughly in preview before merging to main
