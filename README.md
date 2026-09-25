# ApexStrategy Enterprise

A modern, production-ready, multi-department **corporate business simulation** platform — featuring reactive live proformas, multi-currency support (INR default, USD, plus live exchange rates), AI competitors, integrated MBA functional departments (Strategy, R&D, Marketing, Operations, HR, Finance), and a sleek financial-terminal UI. **Zero-setup** — runs entirely in the browser, no database or environment variables required.

---

## ✨ Features

- **Weighted Demand Engine** — Pricing (35%) + Age/Positioning (25%) + R&D/MTBF (20%) + Marketing (20%).
- **Live Proforma Calculator** — R&D, Marketing, Operations, and Finance inputs update projected P&L, cash, and stock price **instantly** as you type.
- **Full Financial Statements** — Auto-computed Income Statement, Balance Sheet, and Cash Flow every round.
- **Emergency Loan Engine** — Cash below zero triggers a punitive 22.5% APR Big Al's loan automatically, with critical alert.
- **AI Competitors** — 3 AI-driven companies (easy / medium / hard difficulty) make their own decisions each round.
- **5 Market Segments** — Traditional, Low End, High End, Performance, Size — each with its own ideal price, MTBF, position, and growth rate.
- **Perceptual Map** — Visualize your products vs. the segment ideal; R&D investment shifts products toward target.
- **Auto-Save to LocalStorage** — Reload the browser, your game persists. Save multiple games in parallel.
- **Charts & Leaderboards** — Stock price, revenue, net profit, ROE, market share trends across all rounds.
- **Multi-Currency** — INR (default, with lakhs/crores formatting), USD, EUR, GBP, JPY, AED, SGD with live exchange rates.
- **Modern Financial-Terminal Aesthetic** — Dark-mode-first, refined gradients, glassmorphism cards, animated transitions.

---

## 🛠 Tech Stack

| Layer            | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router, static export)          |
| Language         | TypeScript 5                                    |
| Styling          | Tailwind CSS 4 + shadcn/ui                      |
| Animation        | Framer Motion                                   |
| Icons            | Lucide React                                    |
| Charts           | Recharts                                        |
| State            | React Context + LocalStorage persistence        |
| Simulation Math  | Custom engine (`src/engine/simulationEngine.ts`)|

---

## 📁 File Structure

```
apexstrategy/
├── .github/workflows/deploy.yml        # Auto-deploy to GitHub Pages on push
├── public/                             # logo.svg, robots.txt, .nojekyll
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout, fonts, metadata
│   │   ├── page.tsx                    # AuthProvider + GameProvider + view router
│   │   └── globals.css                 # Financial-terminal theme (Tailwind 4)
│   ├── context/
│   │   ├── GameContext.tsx             # Central state store + localStorage sync
│   │   ├── AuthContext.tsx             # Client-side sign in / sign up / sessions
│   │   └── CurrencyContext.tsx         # Multi-currency display + live FX rates
│   ├── engine/
│   │   └── simulationEngine.ts         # Demand, finance, scoring math
│   ├── components/
│   │   ├── Navigation.tsx              # Top header + tab nav + team/currency switchers
│   │   ├── charts/
│   │   │   ├── FinancialChart.tsx      # Multi-line trend chart
│   │   │   └── MarketShareChart.tsx    # Doughnut + stacked-bar variants
│   │   ├── views/
│   │   │   ├── AuthView.tsx            # Login / sign-up
│   │   │   ├── LandingView.tsx         # New / Load Game setup
│   │   │   ├── DashboardView.tsx       # KPI scorecards, alerts, leaderboard
│   │   │   ├── StrategyView.tsx        # Focus segments, ESG, alliances, brand
│   │   │   ├── RndView.tsx             # Specs, price, tech, live proforma
│   │   │   ├── MarketingView.tsx       # Promo & sales force allocation
│   │   │   ├── OperationsView.tsx      # Capacity, automation, lean, scheduling
│   │   │   ├── HrView.tsx              # Compensation, training, benefits
│   │   │   ├── FinanceView.tsx         # Proforma P&L, BS, CF, debt/equity
│   │   │   └── ResultsView.tsx         # Debrief, market share, charts
│   │   └── ui/                         # shadcn/ui components
│   ├── hooks/                          # use-mobile, use-toast
│   ├── lib/                            # format, utils
│   └── types/game.ts                   # All TypeScript interfaces
├── next.config.ts                      # Static export + GitHub Pages base path
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── components.json
├── eslint.config.mjs
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000
```

The app boots directly into a **zero-hurdle demo mode** — sign up (stored locally in your browser), then launch a game pre-populated with 4 teams ("Bharat Apex Industries" as the player, plus three AI rivals) and 5 products per team across all segments. Make decisions in Strategy, R&D, Marketing, Operations, HR, and Finance → **Process Next Round** to advance.

To test a production build locally:

```bash
npm run build      # static export → ./out
npm run preview    # serve the ./out folder locally
```

---

## 🌐 Deploy to GitHub Pages (recommended)

This repo ships with a ready-made GitHub Actions workflow (`.github/workflows/deploy.yml`). Three steps:

**1. Create a new repository on GitHub** (e.g. `apexstrategy`) — do **not** initialize it with a README.

**2. Push this code:**

```bash
cd apexstrategy
git init
git add .
git commit -m "Initial commit: ApexStrategy Enterprise"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
git push -u origin main
```

**3. That's it — no manual setup needed:**

The workflow automatically enables GitHub Pages and sets its build source to **GitHub Actions** on the first push, then deploys the site. Your app goes live at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/` in a minute or two. Every future `git push` to `main` redeploys automatically.

> **If the deploy step still fails with `404 Not Found`** (can happen if the automatic setup lacks permission): go to **Settings → Pages** on GitHub.com → under *Build and deployment*, set **Source** to **GitHub Actions**, then re-run the workflow from the **Actions** tab.

> **Notes**
> - Works out of the box for project pages (`user.github.io/repo`) and user pages (`user.github.io`) — the base path is auto-detected.
> - No environment variables, database, or server needed — the app is fully client-side.
> - A `.nojekyll` file is included so GitHub Pages serves the `_next/` assets untouched.

### Deploy elsewhere (optional)

- **Vercel:** Import the repo at [vercel.com/new](https://vercel.com/new) → Deploy. (Static export is auto-detected.)
- **Netlify:** Import the repo, build command `npm run build`, publish directory `out`.

---

## 🎮 How to Play

### Per-round flow

1. **Strategy tab** — Pick focus segments (attractiveness boost), invest in ESG, R&D pipeline, alliances, and brand building.
2. **R&D tab** — Set price, MTBF, and target position on the perceptual map. Allocate R&D investment to push your products toward the segment ideal.
3. **Marketing tab** — Split promo budget (drives brand awareness) vs. sales force budget (drives customer accessibility) per product.
4. **Operations tab** — Schedule production per product. Watch capacity utilization, lean manufacturing, and stock-out risk.
5. **HR tab** — Tune compensation, training, benefits, hiring, and bonus pool — all feed unit cost and productivity.
6. **Finance tab** — Issue short-term / long-term debt, raise equity, pay dividends. Monitor projected cash and emergency loan risk in real time.
7. **Process Next Round** (top-right CTA) — Engine computes demand across all teams, builds financial statements, advances product ages, decays awareness, and updates stock prices.
8. **Results tab** — Review the round debrief: market share doughnut, per-segment stacked bar, stock price trend, leaderboard. Iterate.

### Win condition

The team with the **highest stock price** at the end of round 8 (default) wins.
Stock price is a function of EPS × P/E × risk-discount, where:
- EPS = Net Profit / Shares Outstanding (2M shares)
- P/E ratio = 12 + 8 × growth (clamped)
- Risk discount = 1 − bankruptcyRisk / 200

---

## 🧮 Simulation Math (Highlights)

### Demand Model

For each segment, every competing product gets an **attractiveness score (0–1)**:

```
score = priceFactor * 0.35
      + agePositionFactor * 0.25
      + qualityMtbfFactor * 0.20
      + marketingFactor * 0.20
```

Demand is then distributed proportionally to scores. Units sold = min(demand, available).

### Emergency Loan

If a team's ending cash < 0, an emergency loan is auto-issued at **22.5% APR**
to bring cash back to zero. The interest is deducted from net profit and a critical
alert is raised.

### Stock Price

```
PE = 12 + 8 * clamp(growth, -0.5, 2)
stockPrice = max(5, EPS * PE * (1 - bankruptcyRisk/200) + prevStock * 0.3)
```

Full code in `src/engine/simulationEngine.ts`.

---

## 🔧 Configuration

- **Number of rounds**: Choose 4 / 6 / 8 / 12 in the New Game modal.
- **AI difficulty**: Edit `src/engine/simulationEngine.ts → createDefaultTeams()`
  to set `aiDifficulty: "easy" | "medium" | "hard"` per AI team.
- **Tax rate, interest rates, depreciation**: Top of `simulationEngine.ts`.
- **Theme**: Edit CSS variables in `src/app/globals.css`. Dark mode is default.

---

## 🧪 Extending the App

- Add more teams: Edit `createDefaultTeams()` in `simulationEngine.ts`.
- Add a 6th segment: Extend `SegmentId` and `SEGMENT_DEFAULTS`.
- Add a database: Replace the localStorage persistence layer in `GameContext.tsx`
  with your backend of choice (needs a server — drop `output: "export"` from `next.config.ts`).

---

## 📜 License

MIT — use it, fork it, teach with it, sell it. See [LICENSE](LICENSE).

Built by **Magesh Kanna S**.
