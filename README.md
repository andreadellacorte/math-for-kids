# Math Fun for Kids! 🧮

Interactive educational games for children built with Astro and Tailwind CSS.

## 🎮 Games

- **Math Crossword** - Create crossword puzzles with math equations
- **Brain Training** - Speed math challenge to test your brain age
- **Times Table Training** - Master multiplication with speed drills
- **Music Theory** - Test your music theory knowledge
- **Music Trivia** - Learn about rhythm, notation, hearing, and instruments
- **Dice 101** - Roll dice to reach 101 without going over
- **Cashier Challenge** - Practice addition and subtraction with money
- **Place Value Showdown** - Build the biggest number by placing digits strategically

## 🚀 Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript (game logic)
- **GitHub Actions** - Automated deployment to GitHub Pages

## 📁 Project Structure

```text
/
├── public/
│   ├── games/           # Game HTML files and bundled JavaScript
│   ├── images/          # Static images
│   └── styles.css       # Main stylesheet
├── src/
│   ├── data/
│   │   └── games.json   # Game metadata
│   ├── layouts/
│   │   └── Base.astro   # Base HTML layout
│   └── pages/
│       └── index.astro  # Homepage
└── .github/workflows/   # CI/CD deployment
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                             |
| `npm run dev`             | Start dev server at `localhost:4321/math-for-kids` |
| `npm run build`           | Build production site to `./dist/`               |
| `npm run preview`         | Preview build locally before deploying           |

## 🌐 Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions on push to `main`.

**Live site:** https://andreadellacorte.github.io/math-for-kids

## 📝 Development Notes

- All game JavaScript is pre-bundled and located in `public/games/`
- Games use vanilla JavaScript/TypeScript (no framework dependencies)
- Homepage is dynamically generated from `src/data/games.json`
- Deployment happens automatically via `.github/workflows/pages.yml`

## 🤝 Contributing

Made with ❤️ by Andrea & Defne

## 📜 License

MIT
