# Content Marketing Toolkit - Supabase Migration Sitemap

## Docs

| File | Status | Description |
|------|--------|-------------|
| `docs/Guide.md` | ✅ | Step by step development guide |
| `docs/Sitemap.md` | ✅ | Application sitemap (this file) |
| `docs/Plan.md` | ✅ | Implementation roadmap and next steps |

## Core Application Files

| File | Status | Description |
|------|--------|-------------|
| `src/App.jsx` | ✅ | Main application component (updated with Supabase provider) |
| `src/main.jsx` | ✅ | Application entry point (remains unchanged) |
| `src/index.html` | ✅ | HTML template (remains unchanged) |

## Context Providers

| File | Status | Description |
|------|--------|-------------|
| `src/context/AuthContext.js` | ✅ | Supabase auth context provider |
| `src/context/index.js` | ✅ | Context barrel file |
| `src/context/SupabaseContext.js` | ✅ | Supabase auth context provider |
| `src/context/SupabaseContextDefinition.js` | ✅ | Supabase auth context definition |
| `src/context/ToastContext.jsx` | ✅ | Toast notification context provider |
| `src/context/ThemeContext.jsx` | ✅ | Theme management context provider |
| `src/context/SupabaseProvider.jsx` | ✅ | Supabase provider wrapper |

## Routes

| File | Status | Description |
|------|--------|-------------|
| `src/routes/AppRoutes.jsx` | ✅ | Route definitions with admin routes |

## Authentication

| File | Status | Description |
|------|--------|-------------|
| `src/pages/Auth/Login.jsx` | ✅ | Login page (updated for Supabase auth) |
| `src/pages/Auth/Register.jsx` | ✅ | Registration page (updated for Supabase auth) |
| `src/pages/Auth/ResetPassword.jsx` | ✅ | Password reset page (updated for Supabase auth) |

## Admin Panel

| File | Status | Description |
|------|--------|-------------|
| `src/pages/Admin/AdminUsers.jsx` | ✅ | User management with tier controls (FIXED) |
| `src/pages/Admin/AdminDashboard.jsx` | 🔄 | Admin dashboard with system overview |
| `src/pages/Admin/AdminAnalytics.jsx` | ❌ | System analytics and usage stats |
| `src/pages/Admin/AdminSettings.jsx` | ❌ | System configuration settings |

## User Profiles & Subscriptions

| File | Status | Description |
|------|--------|-------------|
| `src/services/supabase/profiles.js` | ✅ | Profile service for Supabase |
| `src/services/supabase/subscriptions.js` | ✅ | Subscription management service (WORKING) |
| `src/hooks/useProfile.js` | ✅ | Hook for profile management |
| `src/pages/Profile.jsx` | ✅ | User profile page |
| `src/pages/Subscription.jsx` | 🔄 | Subscription management page |
| `supabase/migrations/profiles_table.sql` | ✅ | SQL schema for profiles table |
| `supabase/migrations/subscription_tables.sql` | ✅ | SQL schema for subscription system |

## Supabase Services

| File | Status | Description |
|------|--------|-------------|
| `src/services/supabase/supabaseClient.js` | ✅ | Supabase client initialization (FIXED) |
| `src/services/supabase/auth.js` | ✅ | Authentication methods for Supabase |
| `src/services/supabase/db.js` | ✅ | Database interaction methods for Supabase |
| `src/services/supabase/profiles.js` | ✅ | Profile management methods for Supabase |
| `src/services/supabase/subscriptions.js` | ✅ | Subscription and tier management |
| `src/services/supabase/index.js` | ✅ | Supabase services barrel file |

## AI Services (Unchanged)

| File | Status | Description |
|------|--------|-------------|
| `src/services/ai/claudeAIService.js` | ✅ | Claude AI integration service (remains unchanged) |
| `src/services/ai/index.js` | ✅ | AI services barrel file (remains unchanged) |

## Layout Components

| File | Status | Description |
|------|--------|-------------|
| `src/components/Layout/MainLayout.jsx` | ✅ | Main layout with auth-aware elements |
| `src/components/Layout/Header.jsx` | ✅ | Header with auth-aware navigation |
| `src/components/Layout/Sidebar.jsx` | ✅ | Sidebar with auth-aware navigation |
| `src/components/Layout/Footer.jsx` | ✅ | Footer component (implemented) |
| `src/components/Layout/AuthLayout.jsx` | ✅ | Auth pages layout (remains unchanged) |
| `src/components/Layout/AdminLayout.jsx` | 🔄 | Admin-specific layout component |

## Pages

| File | Status | Description |
|------|--------|-------------|
| `src/pages/Dashboard.jsx` | ✅ | Main dashboard with tools overview |
| `src/pages/SalesPageEmailGenerator.jsx` | ✅ | Container for email generator component |
| `src/pages/Profile.jsx` | ✅ | User profile page |
| `src/pages/Subscription.jsx` | 🔄 | Subscription management and billing |
| `src/pages/BlogPostCreator.jsx` | ❌ | Blog Post Creator page (future) |
| `src/pages/NewsletterCreator.jsx` | ❌ | Newsletter Creator page (future) |
| `src/pages/SocialMediaPlanner.jsx` | ❌ | Social media content planner (future) |
| `src/pages/ContentCalendar.jsx` | ❌ | Content calendar overview (future) |

## Email Generator Tool

| File | Status | Description |
|------|--------|-------------|
| `src/components/EmailGenerator/EnhancedSalesEmailGenerator.jsx` | ✅ | Main email generator component (refactored for Supabase) |
| `src/components/EmailGenerator/ScanPageForm.jsx` | ✅ | Form component for scanning sales pages |
| `src/components/EmailGenerator/ScanResultsPanel.jsx` | ✅ | Panel for displaying and selecting scan results |
| `src/components/EmailGenerator/SalesPageEmailPreview.jsx` | ✅ | Email preview component |
| `src/components/EmailGenerator/EmailSeriesPanel.jsx` | ✅ | Panel for managing email series (updated for Supabase) |
| `src/components/EmailGenerator/EmailAnalyticsPanel.jsx` | ✅ | Panel for email analytics (updated for Supabase) |
| `src/components/EmailGenerator/SupabaseEmailDisplay.jsx` | ✅ | Component for displaying emails from Supabase |

## Custom Hooks

| File | Status | Description |
|------|--------|-------------|
| `src/hooks/useAuth.js` | ✅ | Hook for Supabase authentication |
| `src/hooks/useEmailGenerator.js` | ✅ | Hook for email generation functionality |
| `src/hooks/useEmailSeries.js` | ✅ | Hook for email series management |
| `src/hooks/useProfile.js` | ✅ | Hook for Profile management |
| `src/hooks/useSavedEmails.js` | ✅ | Hook for saved emails operations with Supabase |
| `src/hooks/useSupabase.js` | ✅ | Hook for Supabase client access |
| `src/hooks/useSupabaseAuth.js` | ✅ | Hook for Supabase authentication |
| `src/hooks/useToast.js` | ✅ | Hook for toast notifications |
| `src/hooks/useSubscription.js` | 🔄 | Hook for subscription management |
| `src/hooks/useUsageTracking.js` | 🔄 | Hook for usage limits and tracking |

## Email Generator Services

| File | Status | Description |
|------|--------|-------------|
| `src/services/emailGenerator/index.js` | ✅ | Barrel file for email generator services |
| `src/services/emailGenerator/scannerService.js` | ✅ | Service for scanning sales pages |
| `src/services/emailGenerator/cacheService.js` | ✅ | Service for caching scrape results |
| `src/services/emailGenerator/emailGenerator.js` | ✅ | Service for generating emails |
| `src/services/emailGenerator/emailSeriesService.js` | ✅ | Service for email series management |
| `src/services/emailGenerator/htmlExtractor.js` | ✅ | Service for extracting data from HTML |
| `src/services/emailGenerator/dataEnhancer.js` | ✅ | Service for enhancing extracted data |
| `src/services/emailGenerator/proxyService.js` | ✅ | Service for CORS proxy |
| `src/services/emailGenerator/simulatedDataGenerator.js` | ✅ | Fallback service |
| `src/services/emailGenerator/utils.js` | ✅ | Utility functions |

## Common Components

| File | Status | Description |
|------|--------|-------------|
| `src/components/Common/Alert.jsx` | ✅ | Alert/notification component |
| `src/components/Common/Badge.jsx` | ✅ | Badge component for status labels |
| `src/components/Common/Button.jsx` | ✅ | Custom button component |
| `src/components/Common/Card.jsx` | ✅ | Card container component |
| `src/components/Common/Input.jsx` | ✅ | Form input component |
| `src/components/Common/Loader.jsx` | ✅ | Loading indicator |
| `src/components/Common/Modal.jsx` | ✅ | Modal dialog component |
| `src/components/Common/Select.jsx` | ✅ | Dropdown select component |
| `src/components/Common/Tabs.jsx` | ✅ | Tabbed interface components |
| `src/components/Common/Table.jsx` | ✅ | Table interface components |
| `src/components/Common/Toast.jsx` | ✅ | Toast notification component |
| `src/components/Common/SubscriptionBadge.jsx` | 🔄 | Component for displaying user tier |
| `src/components/Common/UsageMeter.jsx` | 🔄 | Component for showing usage limits |
| `src/components/Common/UpgradePrompt.jsx` | 🔄 | Component for upgrade prompts |
| `src/components/Common/index.js` | ✅ | Common components barrel file |

## Styling

| File | Status | Description |
|------|--------|-------------|
| `src/styles/salesEmailGenerator.css` | ✅ | Email generator styles |
| `src/styles/toast.css` | ✅ | Toast notification styles |
| `src/styles/admin.css` | 🔄 | Admin panel specific styles |
| `tailwind.config.js` | ✅ | Tailwind CSS configuration |

## Configuration Files

| File | Status | Description |
|------|--------|-------------|
| `package.json` | ✅ | Dependencies and scripts (added Supabase packages) |
| `.env` | ✅ | Environment variables (added Supabase keys) |
| `vite.config.js` | ✅ | Build configuration |
| `.gitignore` | ✅ | Git ignore configuration |
| `postcss.config.js` | ✅ | PostCSS configuration |

## Database Schema

| File | Status | Description |
|------|--------|-------------|
| `supabase/migrations/001_initial_schema.sql` | ✅ | Initial database schema |
| `supabase/migrations/002_profiles_table.sql` | ✅ | User profiles schema |
| `supabase/migrations/003_subscription_system.sql` | ✅ | Subscription tiers and tracking |
| `supabase/migrations/004_usage_tracking.sql` | ✅ | Usage limits and analytics |
| `supabase/migrations/005_email_tables.sql` | ✅ | Email and series tables |
| `supabase/functions/check_tier_access.sql` | ✅ | Database function for tier access |
| `supabase/functions/check_usage_limit.sql` | ✅ | Database function for usage limits |
| `supabase/functions/update_usage_tracking.sql` | ✅ | Database function for usage updates |

## Documentation

| File | Status | Description |
|------|--------|-------------|
| `README.md` | ✅ | Main project documentation (updated for Supabase) |
| `docs/API.md` | 🔄 | API documentation for services |
| `docs/DEPLOYMENT.md` | 🔄 | Deployment guide for Vercel |
| `docs/DEVELOPMENT.md` | 🔄 | Development setup guide |

---

## Legend:
- ✅ **Completed** - Fully implemented and working
- 🔄 **In Progress** - Partially implemented or needs updates
- ❌ **Not Implemented** - Future feature or not yet started

## Recent Fixes (Completed):
- ✅ Fixed AdminUsers.jsx Supabase query syntax
- ✅ Fixed supabaseClient.js environment variable validation
- ✅ Resolved ESLint warnings in supabaseClient.js
- ✅ Verified Vercel deployment environment variables

## Current System Status:
- **Authentication System**: ✅ Fully working
- **User Management**: ✅ Admin panel functional
- **Subscription System**: ✅ Backend complete, frontend in progress
- **Email Generator**: ✅ Core functionality working
- **Database**: ✅ All tables and functions implemented
- **Deployment**: ✅ Working on Vercel

## Required Environment Variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Environment
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_API_LOGGING=true
VITE_ENABLE_OFFLINE_MODE=true

# CORS Proxy for Web Scraping
VITE_CORS_PROXY_URL=https://your-proxy-url/corsProxy?url=
VITE_SCRAPE_ENDPOINT=https://your-proxy-url/scrape
VITE_SIMPLE_PROXY_URL=https://your-proxy-url/simple-proxy

# Claude AI Service
VITE_CLAUDE_PROXY_URL=https://your-proxy-url/claudeProxy
VITE_CLAUDE_API_KEY=your-api-key
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
```

## Architecture Strengths:
1. **Robust Authentication** - Supabase auth with profile management
2. **Scalable Subscription System** - Multi-tier with usage tracking
3. **Admin Controls** - Full user and tier management
4. **Modular Design** - Reusable hooks and components
5. **Type Safety** - Consistent error handling
6. **Performance** - Optimized queries and caching
7. **Security** - Row-level security policies
8. **Monitoring** - Usage tracking and analytics ready