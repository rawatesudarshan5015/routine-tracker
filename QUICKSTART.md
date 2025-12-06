# Quick Start Guide

## 1. First Time Setup

```bash
# Navigate to project
cd project-next

# Install dependencies
npm install

# Create .env.local file and set your MongoDB connection
# Edit .env.local with your MongoDB URI and JWT secret
```

## 2. Start MongoDB

**Option A: Local MongoDB (Windows)**
```bash
# Start MongoDB service
net start MongoDB
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: MongoDB Atlas (Cloud)**
- Get your connection string from MongoDB Atlas
- Update MONGODB_URI in .env.local

## 3. Run the Application

```bash
# Development mode (with hot reload)
npm run dev

# Open browser to http://localhost:3000
```

## 4. Create First User

1. Navigate to http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Enter email and password
4. Click "Sign Up"
5. Sign in with your credentials

## 5. Initialize Schedule Data

The app is ready to use! You can:
- View the schedule for weekdays/weekends
- Log daily activities
- Create daily summaries
- Manage custom plans

## Useful Commands

```bash
# Build for production
npm run build

# Run production build locally
npm start

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Environment Variables Template

```env
# Required: MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/schedule-tracker

# Required: Secret for JWT tokens (change in production!)
JWT_SECRET=your-very-secret-key-here

# Optional: Environment and URLs
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

## MongoDB Connection Examples

**Local MongoDB:**
```
mongodb://localhost:27017/schedule-tracker
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster0.mongodb.net/schedule-tracker?retryWrites=true&w=majority
```

**MongoDB Docker Container:**
```
mongodb://mongo:27017/schedule-tracker
```

## Troubleshooting

### "Cannot find module 'mongoose'"
```bash
npm install mongoose
```

### Port 3000 already in use
```bash
# Kill process on port 3000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or change port:
npm run dev -- -p 3001
```

### MongoDB connection refused
- Check if MongoDB service is running
- Verify MONGODB_URI in .env.local
- For Docker: `docker ps` to see if container is running

### Authentication not working
- Clear browser cookies (DevTools → Application → Cookies → Delete all)
- Check JWT_SECRET is set in .env.local
- Restart dev server after changing .env.local

## Project Structure

```
project-next/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/              # Auth endpoints
│   │   │   ├── activity-blocks/   # Activity endpoints
│   │   │   ├── daily-logs/        # Log endpoints
│   │   │   ├── daily-summary/     # Summary endpoints
│   │   │   └── plans/             # Plan endpoints
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main app
│   │   └── globals.css
│   ├── components/                # React components
│   │   ├── Auth.tsx
│   │   ├── Schedule.tsx
│   │   ├── ActivityModal.tsx
│   │   ├── DailySummaryForm.tsx
│   │   ├── DailyReport.tsx
│   │   ├── WeeklyReport.tsx
│   │   ├── PlansManager.tsx
│   │   ├── History.tsx
│   │   └── CreatePlanModal.tsx
│   └── lib/
│       ├── db/
│       │   ├── connect.ts
│       │   └── models/
│       │       ├── User.ts
│       │       ├── ActivityBlock.ts
│       │       ├── DailyLog.ts
│       │       ├── DailySummary.ts
│       │       ├── UserPlan.ts
│       │       └── CustomActivityBlock.ts
│       └── auth/
│           ├── jwt.ts
│           ├── password.ts
│           └── middleware.ts
├── .env.local                 # Environment variables (create this)
├── .gitignore
├── .eslintrc.json
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

## Next Steps

1. **Add Activity Blocks**: Create default activity blocks in the database
2. **Customize Categories**: Modify the activity categories as needed
3. **Deploy**: Follow production checklist in README.md
4. **Add Features**: Extend with notifications, exports, etc.

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review API documentation in README.md
3. Check browser console for error messages
4. Check MongoDB logs for connection issues

Happy tracking! 🚀
