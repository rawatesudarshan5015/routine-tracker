# Migration Guide: Supabase to MongoDB

This document explains the key differences and migration steps from the original Vite + Supabase project to the new Next.js + MongoDB project.

## Architecture Changes

### Before (Supabase)
```
Vite (Frontend)
    ↓
Supabase API
    ↓
PostgreSQL
+ Supabase Auth
+ Row-Level Security (RLS)
```

### After (Next.js + MongoDB)
```
Next.js (Frontend + Backend)
    ↓
Next.js API Routes
    ↓
MongoDB
+ JWT Authentication
+ Request-level Authorization
```

## Key Changes

### 1. Authentication

**Old (Supabase):**
```typescript
import { supabase } from './lib/supabase';
await supabase.auth.signInWithPassword({ email, password });
```

**New (JWT):**
```typescript
const response = await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({ email, password, isSignUp: false }),
});
```

### 2. Database

**Old (Supabase/PostgreSQL):**
```typescript
const { data } = await supabase
  .from('daily_logs')
  .select('*')
  .eq('user_id', userId);
```

**New (MongoDB):**
```typescript
const logs = await DailyLog.find({ userId: userId });
```

### 3. API Calls

**Old:** Direct Supabase client calls in components

**New:** HTTP requests to Next.js API routes
```typescript
const response = await fetch('/api/daily-logs?date=2024-12-06');
const logs = await response.json();
```

### 4. Environment Variables

**Old (.env.local):**
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

**New (.env.local):**
```env
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

## Feature Mapping

| Feature | Old | New | Status |
|---------|-----|-----|--------|
| User Registration | Supabase Auth | JWT + MongoDB | ✅ |
| User Login | Supabase Auth | JWT + MongoDB | ✅ |
| Activity Blocks | PostgreSQL | MongoDB | ✅ |
| Daily Logs | PostgreSQL | MongoDB | ✅ |
| Daily Summary | PostgreSQL | MongoDB | ✅ |
| Plans | PostgreSQL | MongoDB | ✅ |
| Custom Activities | PostgreSQL | MongoDB | ✅ |
| Row Level Security | RLS Policies | Auth Middleware | ✅ |

## Data Structure Changes

### User Table

**Old (PostgreSQL):**
```sql
CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  email text,
  password_hash text,
  -- Supabase managed fields
);
```

**New (MongoDB):**
```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string; // bcrypt hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### Daily Logs

**Old (PostgreSQL):**
```sql
CREATE TABLE daily_logs (
  id uuid,
  user_id uuid,
  log_date date,
  activity_block_id uuid,
  completed boolean,
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  notes text,
  energy_level integer,
  created_at timestamptz
);
```

**New (MongoDB):**
```typescript
interface IDailyLog {
  _id: ObjectId;
  userId: ObjectId;
  logDate: Date;
  activityBlockId: ObjectId;
  completed: boolean;
  actualStartTime?: Date;
  actualEndTime?: Date;
  notes?: string;
  energyLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Component Changes

### Before: Direct Supabase Calls
```typescript
// OLD - ActivityModal.tsx
import { supabase } from '@/lib/supabase';

export default function ActivityModal() {
  const handleSubmit = async () => {
    const { error } = await supabase
      .from('daily_logs')
      .insert([{ user_id: userId, activity_block_id: blockId }]);
  };
}
```

### After: API Route Calls
```typescript
// NEW - ActivityModal.tsx
export default function ActivityModal() {
  const handleSubmit = async () => {
    const response = await fetch('/api/daily-logs', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        activityBlockId: blockId,
        logDate: new Date(),
      }),
    });
  };
}
```

## Security Model Changes

### Row Level Security (RLS) → Request-level Auth

**Old (PostgreSQL RLS):**
```sql
CREATE POLICY "Users can view own logs"
  ON daily_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**New (Next.js Middleware):**
```typescript
async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');
  
  const payload = verifyToken(token);
  return payload;
}
```

## Authentication Flow

### Old (Supabase)
```
1. User enters credentials
2. Send to Supabase Auth
3. Supabase returns session + JWT
4. Store in localStorage
5. Use session for subsequent requests
```

### New (Custom JWT)
```
1. User enters credentials
2. Send to /api/auth
3. Backend hashes password + creates JWT
4. Set JWT in httpOnly cookie
5. Automatically sent with requests
```

## Setup Changes

### Old Setup
```bash
# 1. Create Supabase account
# 2. Set up PostgreSQL database
# 3. Add environment variables
npm install
npm run dev
```

### New Setup
```bash
# 1. Set up local MongoDB or Atlas
# 2. Create .env.local with MONGODB_URI
npm install
npm run dev
```

## Performance Considerations

### Before
- Supabase handled connection pooling
- RLS policies evaluated server-side
- Network requests to Supabase servers

### After
- Next.js handles MongoDB connections
- Auth check in API route middleware
- Same-server requests (faster)
- Better for self-hosted solutions

## Migration Checklist

- [x] Create MongoDB collections
- [x] Implement JWT authentication
- [x] Create API routes for all operations
- [x] Update React components
- [x] Remove Supabase dependencies
- [x] Update environment configuration
- [x] Add TypeScript types for MongoDB
- [x] Implement error handling

## Rollback Strategy

If needed to revert:

1. Keep original project directory (`project/`)
2. New project is isolated in `project-next/`
3. Both can run simultaneously
4. Redirect traffic gradually

## Common Issues

### 1. JWT Token Expired
**Solution:** Tokens expire after 7 days, user needs to sign in again

### 2. MongoDB Connection Slow
**Solution:** Check connection string, verify network access if using Atlas

### 3. Cookies Not Working
**Solution:** Check SameSite and Secure flags match your environment

### 4. User Data Loss
**Solution:** MongoDB uses different ID format (ObjectId vs UUID), ensure migration scripts convert IDs properly

## Performance Improvements

- **Reduced Latency**: Requests go to same server
- **No External Dependencies**: No Supabase API calls
- **Better Scalability**: Direct database control
- **Easier Self-Hosting**: No third-party services needed

## Future Enhancements

Possible improvements now possible with Next.js:

1. **Server-Side Rendering**: Pre-render reports
2. **Background Jobs**: Scheduled summaries/reports
3. **WebSockets**: Real-time updates (Socket.io)
4. **File Uploads**: Direct to MongoDB GridFS or cloud storage
5. **Email Notifications**: SendGrid or Nodemailer integration
6. **Analytics**: Built-in usage tracking
7. **Caching**: Redis integration for performance

## Support & Questions

Refer to:
- README.md - Full documentation
- QUICKSTART.md - Setup guide
- API route files - Example implementations
- MongoDB documentation - Schema details

## Conclusion

The migration maintains all original functionality while providing:
- ✅ Full control over infrastructure
- ✅ Better performance for self-hosting
- ✅ More flexibility for customization
- ✅ Reduced external dependencies
- ✅ Easier deployment options
