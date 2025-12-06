# Schedule Tracker - Next.js + MongoDB

A complete migration of the Schedule Tracker application from Vite + React + Supabase to **Next.js** with **MongoDB**.

## Features

- ✅ User authentication with JWT
- ✅ Schedule tracking with activity blocks
- ✅ Daily logs and summaries
- ✅ Custom plan creation
- ✅ Weekly and daily reports
- ✅ MongoDB integration
- ✅ Type-safe with TypeScript

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT + Cookies
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn package manager

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/schedule-tracker

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production

# Next.js Environment
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schedule-tracker?retryWrites=true&w=majority
```

### 3. Start MongoDB (if using local)

```bash
# On Windows with MongoDB installed
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── activity-blocks/   # Activity management
│   │   ├── daily-logs/        # Daily log endpoints
│   │   ├── daily-summary/     # Summary endpoints
│   │   └── plans/             # Plan management
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main app page
│   └── globals.css            # Global styles
├── components/                # React components
│   ├── Auth.tsx
│   ├── Schedule.tsx
│   ├── ActivityModal.tsx
│   ├── DailySummaryForm.tsx
│   ├── DailyReport.tsx
│   ├── WeeklyReport.tsx
│   ├── PlansManager.tsx
│   ├── History.tsx
│   └── CreatePlanModal.tsx
└── lib/
    ├── db/
    │   ├── connect.ts         # MongoDB connection
    │   └── models/            # Mongoose schemas
    │       ├── User.ts
    │       ├── ActivityBlock.ts
    │       ├── DailyLog.ts
    │       ├── DailySummary.ts
    │       ├── UserPlan.ts
    │       └── CustomActivityBlock.ts
    └── auth/
        ├── jwt.ts             # JWT utilities
        ├── password.ts        # Password hashing
        └── middleware.ts      # Auth middleware
```

## API Endpoints

### Authentication
- `POST /api/auth` - Sign up / Sign in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/session` - Get current session

### Activity Blocks
- `GET /api/activity-blocks?dayType=weekday` - Get blocks for a day type
- `POST /api/activity-blocks` - Create new activity block

### Daily Logs
- `GET /api/daily-logs?date=YYYY-MM-DD` - Get logs for a date
- `POST /api/daily-logs` - Create new log
- `PATCH /api/daily-logs` - Update log
- `DELETE /api/daily-logs?id=logId` - Delete log

### Daily Summary
- `GET /api/daily-summary?date=YYYY-MM-DD` - Get summary for a date
- `POST /api/daily-summary` - Create/update summary

### Plans
- `GET /api/plans?dayType=weekday` - Get user plans
- `POST /api/plans` - Create new plan
- `PATCH /api/plans` - Update plan
- `DELETE /api/plans?id=planId` - Delete plan
- `GET /api/plans/[planId]/activities` - Get plan activities
- `POST /api/plans/[planId]/activities` - Add activity to plan

## Database Models

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  createdAt: Date
  updatedAt: Date
}
```

### ActivityBlock
```typescript
{
  name: string
  startTime: string (HH:MM)
  endTime: string (HH:MM)
  durationMinutes: number
  category: string
  dayType: 'weekday' | 'weekend'
  description?: string
  createdAt: Date
}
```

### DailyLog
```typescript
{
  userId: ObjectId
  logDate: Date
  activityBlockId: ObjectId
  completed: boolean
  actualStartTime?: Date
  actualEndTime?: Date
  notes?: string
  energyLevel?: number (1-5)
  createdAt: Date
  updatedAt: Date
}
```

### DailySummary
```typescript
{
  userId: ObjectId
  logDate: Date
  dsaProblems: number
  projectHours: number
  commitsPushed: number
  systemDesignTopic?: string
  applicationsSent: number
  mockInterviews: number
  energyRating?: number (1-5)
  blocker?: string
  top3Priorities?: string[]
  createdAt: Date
  updatedAt: Date
}
```

### UserPlan
```typescript
{
  userId: ObjectId
  name: string
  description?: string
  isActive: boolean
  dayType: 'weekday' | 'weekend'
  createdAt: Date
  updatedAt: Date
}
```

### CustomActivityBlock
```typescript
{
  planId: ObjectId
  name: string
  startTime: string (HH:MM)
  endTime: string (HH:MM)
  durationMinutes: number
  category: string
  description?: string
  order: number
  createdAt: Date
}
```

## Build & Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Migration from Supabase

Key changes from the original Supabase version:

1. **Authentication**: Replaced Supabase Auth with JWT + bcrypt
2. **Database**: Replaced PostgreSQL with MongoDB + Mongoose
3. **API**: Replaced Supabase RLS with Next.js API Routes
4. **File Structure**: Migrated from Vite to Next.js app router
5. **Cookies**: Using Next.js cookies() API for session management

## Development

### Format Code
```bash
npm run lint
```

### Type Check
```bash
npm run typecheck
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `net start MongoDB` (Windows) or check Docker container
- Check `MONGODB_URI` in `.env.local`
- Verify firewall/network settings

### Authentication Issues
- Clear browser cookies
- Check JWT_SECRET is set
- Verify auth token in cookies via DevTools

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

## Security Notes

⚠️ **Production Checklist:**
- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Use MongoDB connection with strong credentials
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging
- [ ] Implement request validation

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for anything!
