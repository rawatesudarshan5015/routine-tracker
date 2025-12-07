# Deployment Guide - Vercel Only

This document provides instructions for deploying the Schedule Tracker application to Vercel.

## Table of Contents
1. [Vercel Deployment](#vercel-deployment)
2. [GitHub Actions CI/CD](#github-actions-cicd)
3. [Environment Variables](#environment-variables)

---

## Vercel Deployment

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository

### Step-by-Step Deployment

#### 1. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub account (easiest option)

#### 2. Import Repository
- Go to https://vercel.com/new
- Click "Import Project"
- Select "GitHub" and find your repository
- Click "Import"

#### 3. Configure Environment Variables
In the Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schedule-tracker
JWT_SECRET=your-secure-random-secret-min-32-chars
NEXTAUTH_URL=https://your-project.vercel.app
NODE_ENV=production
```

**How to get each variable:**
- **MONGODB_URI**: From MongoDB Atlas → Connect → Copy connection string
- **JWT_SECRET**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **NEXTAUTH_URL**: Your Vercel project URL (shown after first deployment)
- **NODE_ENV**: Use `production`

#### 4. Deploy
- Click "Deploy" button
- Wait for deployment to complete (usually 2-3 minutes)
- Your app is now live! 🎉

### Automatic Deployments

Once connected, Vercel automatically deploys:
- ✅ **Production**: Every push to `main` branch
- ✅ **Preview**: Every push to other branches
- ✅ **Pull Requests**: Preview deployment for each PR

No manual deployment needed - just push code!

### Monitor Deployments

1. Go to your Vercel dashboard
2. Click your project
3. View all deployments in the **Deployments** tab
4. Click any deployment to see logs and status

### Custom Domain

To add a custom domain:
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration steps
4. Update `NEXTAUTH_URL` to your custom domain

---

## GitHub Actions CI/CD

### What CI/CD Does

Automatically on every push:
- ✅ Runs linting (code quality checks)
- ✅ Runs TypeScript type checking
- ✅ Builds the application
- ✅ Runs security scans
- ✅ Deploys to Vercel (main branch only)

### Setup CI/CD

#### 1. Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

```
VERCEL_TOKEN = <your-vercel-token>
VERCEL_ORG_ID = <your-vercel-org-id>
VERCEL_PROJECT_ID = <your-vercel-project-id>
```

#### 2. Get Vercel Credentials

1. Go to https://vercel.com/account/tokens
2. Create a new token → Copy it → Add as `VERCEL_TOKEN`
3. In project settings, copy:
   - `VERCEL_ORG_ID` (Team ID)
   - `VERCEL_PROJECT_ID` (Project ID)

#### 3. Verify Setup

- Push code to GitHub
- Go to **Actions** tab
- Should see workflows running automatically
- Check logs if anything fails

### Workflow Features

**CI/CD Pipeline** (`.github/workflows/ci-cd.yml`):
- Runs on: Push to `main`/`develop`, Pull requests
- Jobs: Lint, Build, Security Scan, Test, Deploy

**Security Checks** (`.github/workflows/security.yml`):
- Runs on: Push, PR, Daily schedule (2 AM UTC)
- Checks: npm audit, CodeQL, secret scanning

**Production Deployment** (`.github/workflows/deploy-production.yml`):
- Runs on: Push to `main`, manual trigger
- Environment: Production with health checks

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `abcd1234...` (32+ chars) |
| `NEXTAUTH_URL` | Your application URL | `https://schedule-tracker.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Generating Secure Secrets

```bash
# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use openssl
openssl rand -base64 32
```

### Setting Variables

#### In Vercel Dashboard
1. Project Settings → Environment Variables
2. Add Name and Value
3. Select which environments it applies to (Production/Preview/Development)
4. Click "Save"

#### In GitHub Secrets
1. Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add Name and Value
4. Workflows can access via `${{ secrets.NAME }}`

---

## Troubleshooting

### Deployment Fails

**Check these in order:**

1. **Environment Variables Missing**
   - Verify all required variables are in Vercel dashboard
   - Check variable names are exact

2. **Build Errors**
   - Check deployment logs in Vercel
   - Run `npm run build` locally to replicate
   - Fix errors and commit

3. **MongoDB Connection**
   - Verify connection string is correct
   - Check IP whitelist in MongoDB Atlas
   - Confirm credentials are accurate

4. **GitHub Actions Failing**
   - Go to Actions tab → View failing workflow
   - Check logs for specific error
   - Common issues: Node version, missing deps

### Application Not Loading

1. Check Vercel deployment status
2. Verify environment variables are set
3. Check MongoDB Atlas cluster is active
4. Review application logs in Vercel dashboard

### Preview Deployments Not Working

- Ensure GitHub is connected to Vercel
- Check branch is pushed to GitHub
- Verify Vercel project is linked to repository

---

## Performance Tips

1. **Caching**: Vercel automatically caches dependencies
2. **Build Optimization**: Next.js optimizes automatically
3. **Database**: Use connection pooling for MongoDB
4. **Images**: Use Next.js Image component for optimization

---

## Security Checklist

- [ ] All secrets in Vercel environment variables (not in code)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] JWT secret is strong (32+ characters)
- [ ] GitHub branch protection enabled
- [ ] Regular dependency updates

---

## Support & Resources

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- GitHub Actions: https://docs.github.com/en/actions

---

## Summary

**Deployment Process:**
1. Push code to GitHub
2. GitHub Actions automatically runs tests
3. If tests pass, Vercel automatically deploys
4. Your app is live in seconds!

That's it! 🚀

