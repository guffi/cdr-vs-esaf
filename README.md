# CDR vs e-SAF

Interactive calculator comparing:

- Electrofuels / e-SAF for aviation
- Fossil jet fuel plus permanent DAC/CDR with storage

The app is a client-side Next.js calculator with transparent assumptions, live scenario controls, stacked cost charts, scenario presets, a sensitivity heatmap, and unit tests for the core formulas.

Deployed with GitHub Pages at `https://guffi.github.io/cdr-vs-esaf/`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm test
npm run build
```

## Model

Core assumptions live in `src/lib/assumptions.ts`.
Formulas live in `src/lib/calculations.ts`.
Scenario presets live in `src/lib/scenarios.ts`.
