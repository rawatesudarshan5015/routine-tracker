# CI/CD Configuration Guide

This guide explains the continuous integration and continuous deployment (CI/CD) setup for the Schedule Tracker project.

## Overview

The project uses GitHub Actions for automated testing, building, and deployment. All workflows are defined in `.github/workflows/`.

## Workflows

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

Main workflow that runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint & Type Check**: Runs ESLint and TypeScript type checking
- **Build**: Builds the Next.js application
- **Security Scan**: Runs npm audit and optional Snyk scanning
- **Test**: Runs test suite (if available)
- **Deploy**: Deploys to Vercel (only on main branch pushes)
- **Notify**: Final status notification

**Triggers:**
- `push` to `main` or `develop`
- `pull_request` to `main` or `develop`

### 2. **Docker Build & Push** (`.github/workflows/docker-build.yml`)

Builds and pushes Docker images to GitHub Container Registry.

**Jobs:**
- **Build and Push**: Creates Docker image and pushes to registry

**Triggers:**
- `push` to `main` or `develop`
- Tags starting with `v*`
- Manual trigger via `workflow_dispatch`

**Built Images:**
- Pushed to `ghcr.io/username/project-next`
- Automatically tagged with branch name, semver, and commit SHA

### 3. **Security Checks** (`.github/workflows/security.yml`)

Comprehensive security scanning including dependency checks and secret scanning.

**Jobs:**
- **Dependency Check**: npm audit and vulnerability scanning
- **Code Scanning**: GitHub CodeQL for static analysis
- **Secret Scanning**: TruffleHog for hardcoded secrets
- **Environment Check**: Verifies no sensitive data in source code

**Triggers:**
- `push` to `main` or `develop`
- `pull_request` to `main` or `develop`
- Daily schedule at 2 AM UTC

### 4. **Production Deployment** (`.github/workflows/deploy-production.yml`)

Production deployment workflow with pre-checks and post-deployment validation.

**Jobs:**
- **Pre-Deployment Checks**: Lint, type check, build verification
- **Deploy to Vercel**: Production deployment
- **Post-Deployment Tests**: Health checks on deployed app
- **Notify**: Status notifications (Slack optional)

**Triggers:**
- `push` to `main` branch
- Tags starting with `release-*`
- Manual trigger via `workflow_dispatch`

**Environments:**
- Staging (preview)
- Production (main)

## Setup Instructions

### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

```
# Vercel Deployment
VERCEL_TOKEN: <your-vercel-token>
VERCEL_ORG_ID: <your-vercel-org-id>
VERCEL_PROJECT_ID: <your-vercel-project-id>

# Database
MONGODB_URI: mongodb+srv://user:password@cluster.mongodb.net/db

# Authentication
JWT_SECRET: <generate-secure-random-string>

# Application
NEXTAUTH_URL: https://your-domain.com
NEXTAUTH_SECRET: <generate-secure-random-string>

# Optional: Security & Notifications
SNYK_TOKEN: <your-snyk-token>
SLACK_WEBHOOK: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 2: Get Vercel Credentials

1. Go to https://vercel.com/account/tokens
2. Create a new access token and copy it → `VERCEL_TOKEN`
3. Go to your project settings → get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

### Step 3: Configure Branch Protection Rules

1. Go to **Settings → Branches → Branch protection rules**
2. Create a rule for `main` branch:
   - Require status checks to pass before merging:
     - Lint & Type Check
     - Build
     - Security Scan
   - Require code reviews before merging
   - Require up-to-date branches

### Step 4: Enable GitHub CodeQL

1. Go to **Security → Code scanning → CodeQL analysis**
2. Click "Set up" and follow the prompts
3. Workflows will automatically include CodeQL scanning

## Local Testing

### Run Workflows Locally

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
# On macOS: brew install act
# On Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Run specific workflow
act -j build

# Run with environment file
act -e .env.local

# View available jobs
act -l
```

### Manual Testing Commands

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# Test (if available)
npm test

# Security audit
npm audit
```

## Environment Variables

### Required for CI/CD

All these must be set as GitHub secrets:

| Variable | Purpose | Required |
|----------|---------|----------|
| `MONGODB_URI` | Database connection | Yes |
| `JWT_SECRET` | Authentication token secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `VERCEL_TOKEN` | Vercel API token | Yes (for Vercel deploy) |
| `VERCEL_ORG_ID` | Vercel organization ID | Yes (for Vercel deploy) |
| `VERCEL_PROJECT_ID` | Vercel project ID | Yes (for Vercel deploy) |

### Optional

| Variable | Purpose |
|----------|---------|
| `SNYK_TOKEN` | Snyk security scanning |
| `SLACK_WEBHOOK` | Slack notifications |

## Monitoring & Logs

### GitHub Actions Dashboard

1. Go to **Actions** tab in your repository
2. View all workflows and their runs
3. Click on a run to see detailed logs
4. Click on a job for step-by-step logs

### Status Badges

Add to README.md:

```markdown
[![CI/CD Pipeline](https://github.com/username/repo/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/repo/actions/workflows/ci-cd.yml)
[![Docker Build](https://github.com/username/repo/actions/workflows/docker-build.yml/badge.svg)](https://github.com/username/repo/actions/workflows/docker-build.yml)
[![Security Checks](https://github.com/username/repo/actions/workflows/security.yml/badge.svg)](https://github.com/username/repo/actions/workflows/security.yml)
```

## Troubleshooting

### Workflow Fails on Lint/Type Check

1. Run locally: `npm run lint && npm run typecheck`
2. Fix errors and commit
3. Push to trigger workflow again

### Build Fails in CI but Works Locally

1. Check Node.js version: `node --version` (should be 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and lock file, reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Check for environment variables: `npm run build` with all required env vars

### Deployment Fails

1. Check Vercel secrets are correct
2. Verify MongoDB connection string
3. Check Vercel project is properly connected
4. Review Vercel deployment logs

### Security Checks Fail

1. Run locally: `npm audit`
2. Fix high severity vulnerabilities: `npm audit fix`
3. For secrets, check they're not hardcoded in source
4. Use environment variables for sensitive data

## Performance Optimization

### Reduce Build Time

- Use caching (already configured)
- Optimize dependencies
- Split code and lazy load

### Docker Build Optimization

```dockerfile
# Already optimized with:
# - Multi-stage builds
# - Alpine base images
# - Layer caching
# - Minimal final image size
```

## Security Best Practices

1. ✅ All secrets in GitHub Secrets (not in code)
2. ✅ Branch protection rules enabled
3. ✅ Require status checks before merge
4. ✅ Require code reviews
5. ✅ Regular dependency updates
6. ✅ Security scanning enabled
7. ✅ No hardcoded credentials
8. ✅ HTTPS only for database connections

## Scaling & Advanced Configuration

### Add Custom Notifications

Edit `deploy-production.yml` to add:
- Email notifications
- PagerDuty alerts
- Datadog events

### Matrix Builds

For testing multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

### Scheduled Security Scans

Already configured to run daily at 2 AM UTC.

## Support & Resources

- GitHub Actions Docs: https://docs.github.com/en/actions
- Workflow Syntax: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- Act (Local Testing): https://github.com/nektos/act
- Vercel Deployment: https://vercel.com/docs

