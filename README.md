# Schedule Tracker - Next.js + MongoDB

Build and track daily routines with activity management, progress logging, and detailed performance reports. Create custom schedules, copy pre-built routines, and visualize your productivity with daily, weekly, and comprehensive reports.

## Features

- ✅ User authentication with JWT
- ✅ Daily routine creation and management
- ✅ Pre-built default plans (DSA & System Design, Balanced Learning)
- ✅ Custom plan creation and deletion
- ✅ Activity logging and completion tracking
- ✅ Daily and weekly performance reports
- ✅ MongoDB Atlas integration
- ✅ Vercel deployment ready

## Tech Stack

- **Frontend**: Next.js 15.5.7, React 19.0.0, TypeScript
- **Backend**: Next.js API Routes with MongoDB
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.447.0
- **Deployment**: Vercel

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- GitHub account (for deployment)

### Setup (2 minutes)

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure MongoDB**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string: Cluster → Connect → Driver
   - Create `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schedule-tracker
   JWT_SECRET=your-32-char-random-string
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │   React UI       │      │  Next.js API Routes      │    │
│  │  (Components)    │      │  (/api/*)                │    │
│  │                  │◄────►│  - Authentication        │    │
│  │  - Schedule      │      │  - Plans Management      │    │
│  │  - PlansManager  │      │  - Activity Operations   │    │
│  │  - Reports       │      │  - Daily Logs            │    │
│  │  - Forms         │      │  - Summaries             │    │
│  └──────────────────┘      └──────────────────────────┘    │
│                                    ▲                         │
│                                    │ Database                │
│                                    ▼                         │
│                        ┌────────────────────┐               │
│                        │  MongoDB Atlas     │               │
│                        │  (Cloud Database)  │               │
│                        │                    │               │
│                        │ - Users            │               │
│                        │ - Plans            │               │
│                        │ - Activities       │               │
│                        │ - Daily Logs       │               │
│                        │ - Summaries        │               │
│                        └────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
           │
           │ Deploy to Vercel
           ▼
    ┌─────────────────┐
    │  Vercel Hosting │
    │  (Production)   │
    └─────────────────┘
```

### Data Flow Architecture

```
User Login
    ▼
[Auth API] ──► Hash password, Generate JWT token ──► Store in cookie
    ▼
Get User Dashboard
    ▼
[Page.tsx] ──► Fetch active plan (PlansManager) ──► Show Schedule
    ▼
User Selects/Creates Plan
    ▼
[Plans API] ──► Create UserPlan document ──► Link with ActivityBlocks
    ▼
User Adds Activity
    ▼
[Activity API] ──► Create ActivityBlock ──► Reference UserPlan
    ▼
User Logs Activity
    ▼
[Daily Logs API] ──► Create/Update DailyLog ──► Track completion
    ▼
View Reports
    ▼
[Reports Components] ──► Aggregate DailyLogs ──► Display analytics
```

### Component Hierarchy

```
App (page.tsx)
├── Auth.tsx
│   └── Login/Signup form
├── PlansManager.tsx
│   ├── Default plans display
│   └── User plans management
├── Schedule.tsx
│   ├── Activity list
│   └── Add activity form
├── DailySummaryForm.tsx
│   └── Daily summary input
├── DailyReport.tsx
│   └── Daily progress report
├── WeeklyReport.tsx
│   └── Weekly analytics
└── History.tsx
    └── Past logs view
```

### Database Schema Relationships

```
User
├── Has Many UserPlans (one-to-many)
│   ├── UserPlan
│   │   ├── Has Many ActivityBlocks (one-to-many)
│   │   │   └── ActivityBlock
│   │   │       └── Referenced by DailyLogs
│   │   └── Associated DailySummaries
│   └── DailyLog (references ActivityBlock & User)
│       └── Tracks completion of specific activity instances
└── DailySummary (references User)
    └── Contains daily metrics and insights
```

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication (signup, login, logout, session)
│   │   ├── activity-blocks/   # Get/create activities
│   │   ├── daily-logs/        # Log activity completion
│   │   ├── daily-summary/     # Daily summary CRUD
│   │   ├── plans/             # Plan CRUD operations
│   │   └── default-plans/     # Default plans & copy endpoint
│   ├── layout.tsx             # Root layout wrapper
│   ├── page.tsx               # Main app dashboard
│   └── globals.css            # Tailwind styles
├── components/
│   ├── Schedule.tsx           # Display & log activities
│   ├── PlansManager.tsx       # Select, copy, delete plans
│   ├── Auth.tsx               # Login/signup forms
│   ├── DailyReport.tsx        # Daily summary display
│   ├── WeeklyReport.tsx       # Weekly analytics
│   ├── DailySummaryForm.tsx   # Summary form
│   ├── History.tsx            # Past activity view
│   ├── ActivityModal.tsx      # Activity detail modal
│   └── CreatePlanModal.tsx    # Custom plan creation
└── lib/
    ├── db/
    │   ├── connect.ts         # MongoDB connection setup
    │   ├── models/
    │   │   ├── User.ts        # User schema
    │   │   ├── UserPlan.ts    # Plan schema
    │   │   ├── ActivityBlock.ts      # Activity schema
    │   │   ├── DailyLog.ts    # Log completion schema
    │   │   ├── DailySummary.ts       # Summary schema
    │   │   └── CustomActivityBlock.ts
    │   └── seeds/
    │       └── defaultPlans.ts       # 3 pre-built plans
    └── auth/
        ├── jwt.ts             # JWT token utilities
        ├── password.ts        # Password hashing (bcrypt)
        └── middleware.ts      # Auth verification
```

## Key Workflows

### 1. User Registration & Login
```
User enters email/password
    ▼
POST /api/auth {email, password}
    ▼
Password hashed with bcrypt
    ▼
User created in MongoDB
    ▼
JWT token generated & sent as HTTP-only cookie
    ▼
Authenticated request includes token in cookie
```

### 2. Create Plan & Add Activities
```
User clicks "Create Plan" 
    ▼
CreatePlanModal collects plan name
    ▼
POST /api/plans {name, description}
    ▼
UserPlan document created
    ▼
Schedule.tsx shows activity form
    ▼
POST /api/activity-blocks {planId, name, startTime, endTime, ...}
    ▼
ActivityBlock created with planId reference
    ▼
GET /api/activity-blocks?planId=xyz fetches activities
    ▼
Schedule renders sorted activity list
```

### 3. Log Daily Activity
```
User marks activity as complete
    ▼
Schedule.tsx calls POST /api/daily-logs
    ▼
DailyLog created {userId, planId, activityBlockId, date, completed}
    ▼
Logs aggregated for daily report
    ▼
DailyReport.tsx displays completion status
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Production
npm run build            # Build optimized bundle
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

## Deployment

Deploy to Vercel in 3 steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables (MONGODB_URI, JWT_SECRET)
   - Click Deploy

3. **Done!** 🚀
   - Vercel automatically deploys on every push to main
   - GitHub Actions runs tests automatically
   - See detailed deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schedule-tracker
JWT_SECRET=your-strong-32-char-random-string
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```
