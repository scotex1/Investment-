# AIAS Frontend

React + Vite + TailwindCSS frontend for the AI Investment Advisory System.

## Stack
- **React 18** + React Router v6
- **Vite 5** (dev server + bundler)
- **TailwindCSS 3** (utility-first styling)
- **Zustand** (global auth state)
- **Recharts** (portfolio & projection charts)
- **Framer Motion** (page transitions)
- **Axios** (API client with interceptors)
- **react-hot-toast** (notifications)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env

# 3. Start dev server (ensure backend is running on :8000)
npm run dev
# → http://localhost:3000

# 4. Build for production
npm run build
```

## Pages

| Route            | Page                   | Plan Required |
|------------------|------------------------|---------------|
| /login           | Login                  | Public        |
| /register        | Register               | Public        |
| /dashboard       | Dashboard              | Free          |
| /portfolio       | Portfolio Manager      | Free          |
| /risk            | Risk Profile           | Free          |
| /stocks          | Stock Analysis         | Pro           |
| /news            | News Intelligence      | Pro           |
| /geo-events      | Geopolitical Events    | Pro           |
| /planner         | Goal & Retirement      | Free          |
| /subscription    | Pricing & Upgrade      | Free          |

## Project Structure

```
src/
├── components/
│   ├── charts/         # PortfolioChart, LineChart
│   ├── layout/         # Layout (sidebar + shell)
│   └── ui/             # StatCard, Spinner, PageHeader, PlanGate, LoadingScreen
├── pages/              # All 10 page components
├── services/
│   └── api.js          # Axios instance + all API methods
├── store/
│   └── authStore.js    # Zustand auth store
├── App.jsx             # Router
├── main.jsx            # Entry point
└── index.css           # Tailwind + global styles
```

## Environment Variables

| Variable            | Description              | Default                   |
|---------------------|--------------------------|---------------------------|
| VITE_API_BASE_URL   | Backend API base URL     | http://localhost:8000     |

## Design System

- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono (numbers/code)
- **Theme**: Deep navy dark (`ink-*`), azure blue accents, jade green positive, rose red negative
- **Components**: `card`, `card-glow`, `btn-primary`, `btn-ghost`, `input-field`, `badge-*`
