# World Flags

**World Flags** is a geography app in the browser: a fullscreen [Mapbox](https://www.mapbox.com/) world map where you can explore freely or play flag-and-country challenges. Click any country to see its name, ISO codes, population, region, capital, area, and local flag. In challenge mode, either find the country for a given flag or the flag for a given country, with configurable rounds, scoring, and a short history of recent runs. Built with **Next.js** and **React**; country data and flag assets ship with the repo.

## Features

- Fullscreen interactive world map with country click selection.
- Country overlay with name, ISO codes, population, region, capital, area, and local flag.
- Country data and flag assets ship with the repo (`src/data/countries.json`, `public/flags`).
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
