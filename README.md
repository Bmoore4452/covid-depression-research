# The Prevalence of Depression During the COVID-19 Outbreak

A research site analyzing depression prevalence across 12 community-based studies spanning six countries during the COVID-19 pandemic.

**Live site:** https://bmoore4452.github.io/covid-depression-research/

## About

This site is the final research deliverable for **INFM 316 — Data Analytics** at Mercer University (Spring 2026, Session 2), instructed by Dr. Maxine Harlemon. It presents a data-driven exploration of how the COVID-19 pandemic affected depression prevalence worldwide, drawing on the meta-analysis dataset from Bueno-Notivol et al. (2021) and supplementary case study data from Vietnam.

### Purpose

The site addresses three questions:

1. **How prevalent was depression during the COVID-19 outbreak**, and how did estimates vary across assessment tools, countries, and demographic groups?
2. **How methodologically sound was the evidence base** — what does a JBI Critical Appraisal of the 12 studies reveal about quality, bias, and heterogeneity?
3. **What policy, insurance, and research-funding actions** are warranted given what the data does (and does not) support?

It is intended as a public-facing, navigable companion to the written research paper — visitors can scroll the literature review, explore interactive figures, click any chart for a full-size view, and read recommendations grounded in the analysis.

## Tech Stack

| Layer            | Tool                                      |
| ---------------- | ----------------------------------------- |
| Framework        | React 19 + TypeScript                     |
| Build            | Vite 7                                    |
| Styling          | Tailwind CSS 4                            |
| UI primitives    | Radix UI + shadcn/ui                      |
| Animation        | Framer Motion                             |
| Routing          | Wouter                                    |
| Package manager  | pnpm 10                                   |
| Hosting          | GitHub Pages (static)                     |
| CI/CD            | GitHub Actions (`.github/workflows/deploy.yml`) |

The figures (`client/public/Rplot*.png`) are R-generated outputs from the parent INFM 316 coursework: ggplot2 visualizations and a `gt::gtsave()` table render. The Vietnam breakdown table is generated from the three `.xlsx` files in `Week_4/Assignment_1/` of the parent course directory.

## Usage

### Prerequisites

- Node.js 20+
- pnpm 10 (`npm install -g pnpm`)

### Local development

```bash
pnpm install
pnpm dev:local       # serves at http://localhost:5173
```

`dev:local` uses `vite.config.local.ts` — a clean config without the sandbox-only plugins. Hot reload is enabled.

### Type-checking and formatting

```bash
pnpm check           # tsc --noEmit
pnpm format          # prettier --write .
```

### Production build

```bash
pnpm build:local     # outputs to dist/public
```

To preview the build with the GitHub Pages base path:

```bash
GITHUB_PAGES=true pnpm build:local
pnpm preview
```

### Deployment

Pushes to `main` automatically rebuild and deploy via GitHub Actions. The workflow:

1. Checks out the repo and installs dependencies with pnpm
2. Runs `pnpm build:local` with `GITHUB_PAGES=true` so Vite emits `/covid-depression-research/`-prefixed asset paths
3. Adds `.nojekyll` to the build output
4. Uploads `dist/public` as a Pages artifact and deploys it

## Project structure

```
covid-depression-research/
├── client/                    # Vite SPA root
│   ├── public/                # Static assets (R-generated figures)
│   └── src/
│       ├── pages/Home.tsx     # The single-page research write-up
│       ├── components/        # Shared UI primitives
│       └── App.tsx            # Wouter router with base-path support
├── server/                    # Express server (not deployed to Pages)
├── shared/                    # Shared constants
├── vite.config.ts             # Sandbox config (with Manus dev plugins)
├── vite.config.local.ts       # Clean static config used for Pages builds
└── .github/workflows/deploy.yml
```

## License

MIT — see `package.json`.

## Author

**Brian L. Moore** · INFM 316 · Mercer University · 2026
