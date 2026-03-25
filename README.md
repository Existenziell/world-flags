# World Flags

Fullscreen Next.js + TypeScript app that renders a world map with Mapbox, shows country overlays on click, and serves local flag files.

## Features

- Fullscreen interactive world map with country click selection.
- Country overlay with name, ISO codes, population, region, capital, area, and local flag.
- Top-right settings panel:
  - Projection: `globe` / `mercator`
  - Map style: `dark` / `streets` / `satellite`
  - Theme: `dark` / `light`
- Settings persist in `localStorage`.
- Country data + local flags generated via script.
- Linting and Vitest tests included.

## Requirements

- Node.js 20+
- npm

## Environment

Create `.env` in the project root:

```bash
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

The app reads `MAPBOX_ACCESS_TOKEN` from server-side env and passes it into the client map component.

## Install

```bash
npm install
```

## Fetch Country Data + Flags

This script pulls metadata from REST Countries and downloads flags from FlagCDN into `public/flags`.

```bash
npm run data:fetch
```

Generated files:

- `src/data/countries.json`
- `public/flags/*.svg`

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Lint and Test

```bash
npm run lint
npm run test
```

Watch mode:

```bash
npm run test:watch
```
