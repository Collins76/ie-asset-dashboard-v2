# IE Grid Intelligence Dashboard v2

Full-stack Next.js dashboard for monitoring and analyzing 20,000+ distribution transformers across the Ikeja Electric network.

## Features

- **7 Dashboard Views**: Executive Summary, Network Infrastructure, Metering Analytics, Operational Status, Upriser & Feeder Pillar, Geospatial DT Map, Network Overview
- **Interactive Maps**: React-Leaflet with dark tiles, animated popups
- **Real-time Filtering**: 13 multi-select filters across all dimensions
- **Charts & Analytics**: Recharts-powered visualizations with dark theme
- **Data Management**: Admin panel for uploading Excel/CSV/JSON data to Vercel Blob
- **Authentication**: NextAuth.js with Google sign-in and role-based access
- **Responsive Design**: Fully responsive with glassmorphism dark theme
- **Animations**: Framer Motion page transitions, KPI count-up, staggered entrances
- **Export**: CSV export functionality for filtered data

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: React-Leaflet
- **Animations**: Framer Motion
- **Storage**: Vercel Blob
- **Auth**: NextAuth.js v5
- **Data Parsing**: xlsx

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone <your-repo-url>
cd ie-asset-dashboard-v2
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note**: Without auth env vars configured, you can temporarily comment out the middleware export in `src/middleware.ts` for local development.

### Build

```bash
npm run build
```

## Data Sources

The dashboard loads transformer data from Vercel Blob storage. If no Blob data exists, it falls back to fetching from the original Supabase storage URLs.

### Uploading Data

1. Navigate to `/admin` (requires admin role)
2. Select the data type (Dashboard, Upriser, or Network)
3. Drag & drop or browse for your file (.xlsx, .csv, or .json)
4. Click "Upload & Update Dashboard"

## Deployment to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and click "Add New Project"
3. Import the GitHub repository
4. Add environment variables in Project Settings:
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAILS`
   - `BLOB_READ_WRITE_TOKEN`
5. Deploy — Vercel auto-deploys on every push to `main`

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/           # Dashboard pages (shared layout with sidebar)
│   │   ├── executive-summary/
│   │   ├── network-infrastructure/
│   │   ├── metering-analytics/
│   │   ├── operational-status/
│   │   ├── upriser-feeder-pillar/
│   │   ├── geospatial-dt-map/
│   │   └── network-overview/
│   ├── admin/                 # Admin upload panel
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth API routes
│   │   ├── data/              # Data fetch API
│   │   └── upload-data/       # Data upload API
│   └── login/                 # Login page
├── components/
│   ├── charts/                # Recharts chart components
│   ├── filters/               # Filter bar components
│   ├── maps/                  # React-Leaflet map components
│   └── ui/                    # Shared UI components
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── constants.ts           # Colors, labels, navigation
│   ├── data.ts                # Data processing utilities
│   └── store.tsx              # React context for dashboard state
└── types/
    └── dashboard.ts           # TypeScript interfaces
```
