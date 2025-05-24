# SUPABASE-MIGRATION.md

# Supabase Migration Guide

This document provides guidance for migrating the Content Marketing Toolkit from Firebase to Supabase. The migration involves changes to the authentication system, database interactions, and related components.

## Migration Overview

1. **Authentication**: Replace Firebase Auth with Supabase Auth
2. **Database**: Replace Firestore with Supabase PostgreSQL
3. **Storage**: Replace Firebase Storage with Supabase Storage (if needed)
4. **Components**: Update components to work with Supabase
5. **Services**: Create new services for Supabase interactions
6. **Profiles**: Add user profile management functionality

## Database Schema

The Supabase database schema consists of three main tables:

### email_series Table

Stores information about email series collections:

| Column             | Type      | Description                           |
|--------------------|-----------|---------------------------------------|
| id                 | UUID      | Primary key                           |
| user_id            | UUID      | Foreign key to auth.users             |
| name               | TEXT      | Series name                           |
| domain             | TEXT      | Domain associated with the series     |
| url                | TEXT      | Source URL for the series             |
| tone               | TEXT      | Tone of the emails (persuasive, etc.) |
| industry           | TEXT      | Industry category                     |
| generated_with_ai  | BOOLEAN   | Whether AI was used for generation    |
| keywords           | TEXT      | Keywords used for generation          |
| email_count        | INTEGER   | Number of emails in the series        |
| created_at         | TIMESTAMP | Creation timestamp                    |
| updated_at         | TIMESTAMP | Last update timestamp                 |

### emails Table

Stores individual email data:

| Column             | Type      | Description                           |
|--------------------|-----------|---------------------------------------|
| id                 | UUID      | Primary key                           |
| user_id            | UUID      | Foreign key to auth.users             |
| series_id          | UUID      | Foreign key to email_series           |
| subject            | TEXT      | Email subject line                    |
| body               | TEXT      | Email body content                    |
| benefit            | TEXT      | Primary benefit focus                 |
| email_number       | INTEGER   | Position in the series                |
| domain             | TEXT      | Domain associated with the email      |
| layout             | TEXT      | Email layout style                    |
| generated_with_ai  | BOOLEAN   | Whether AI was used for generation    |
| created_at         | TIMESTAMP | Creation timestamp                    |
| updated_at         | TIMESTAMP | Last update timestamp                 |

### profiles Table

Stores user profile information:

| Column               | Type      | Description                           |
|----------------------|-----------|---------------------------------------|
| id                   | UUID      | Primary key (matches auth.users id)   |
| first_name           | TEXT      | User's first name                     |
| last_name            | TEXT      | User's last name                      |
| avatar_url           | TEXT      | Profile picture URL                   |
| company              | TEXT      | User's company                        |
| role                 | TEXT      | User's job role                       |
| website              | TEXT      | User's website                        |
| industry             | TEXT      | User's industry                       |
| timezone             | TEXT      | User's timezone                       |
| subscription_tier    | TEXT      | Subscription level (free, premium)    |
| subscription_status  | TEXT      | Status (active, cancelled, etc.)      |
| subscription_ends_at | TIMESTAMP | When subscription expires             |
| email_quota          | INTEGER   | Maximum number of emails allowed      |
| emails_generated     | INTEGER   | Count of generated emails             |
| emails_saved         | INTEGER   | Count of saved emails                 |
| ai_tokens_used       | INTEGER   | Count of AI tokens used               |
| preferences          | JSONB     | User preferences as JSON              |
| created_at           | TIMESTAMP | Creation timestamp                    |
| updated_at           | TIMESTAMP | Last update timestamp                 |

## Authentication Changes

Authentication is managed through Supabase Auth:

1. Replace `useAuth` hook with `useSupabaseAuth`
2. Update login, registration, and password reset components
3. Replace Firebase auth context with Supabase auth

## Database Interactions

Database interactions are managed through the Supabase client:

1. Replace Firestore queries with Supabase queries
2. Update email saving and loading functions
3. Implement proper error handling for Supabase queries

## User Profiles

User profiles provide additional functionality:

1. Store user information beyond basic auth data
2. Track usage statistics (emails saved, AI tokens used)
3. Manage subscription status and quotas
4. Enable avatar uploads using Supabase Storage

## Security

Supabase uses Row Level Security (RLS) policies to secure data:

1. Each table has RLS policies to restrict access to the user's own data
2. Authentication is required for all data operations
3. Foreign key constraints enforce data relationships

## Migration Steps

1. **Install Supabase packages**:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase project**:
   - Create a new project on Supabase.com
   - Set up the project database
   - Add the SQL schema from `supabase/migrations/schema.sql`
   - Add the profiles table schema from `supabase/migrations/profiles_table.sql`

3. **Update environment variables**:
   - Add Supabase URL and anon key to .env file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Create Supabase services**:
   - Set up the Supabase client
   - Create auth and database services
   - Implement the profiles service

5. **Create custom hooks**:
   - `useSupabaseAuth` for authentication
   - `useProfile` for profile management
   - `useEmailGenerator` for email scanning
   - `useEmailSeries` for series management
   - `useSavedEmails` for saved emails

6. **Update components**:
   - Replace Firebase auth with Supabase auth
   - Update database interaction code
   - Add profile management UI
   - Test each component

7. **Migrate data** (optional):
   - Export data from Firebase
   - Transform to match Supabase schema
   - Import to Supabase

## Component Architecture

The new architecture breaks down functionality into modular components:

1. **Main Components**: 
   - `EnhancedSalesEmailGenerator.jsx` - Main container
   - `Profile.jsx` - User profile management

2. **Custom Hooks**:
   - `useSupabaseAuth.js` - Authentication
   - `useProfile.js` - Profile management
   - `useEmailGenerator.js` - Email generation
   - `useEmailSeries.js` - Series management
   - `useSavedEmails.js` - Saved emails
   - `useToast.js` - Notifications

3. **Services**:
   - `supabaseClient.js` - Supabase initialization
   - `auth.js` - Authentication methods
   - `db.js` - Database operations
   - `profiles.js` - Profile management

## Advantages of Supabase

1. **Enhanced Reliability**: No more Firestore internal assertion errors
2. **Simplified Database Schema**: Clear, relational structure for emails and series
3. **Improved Query Performance**: SQL-based querying for better performance
4. **Better Authentication Flow**: More reliable auth through Supabase
5. **Real-time Updates**: Optional real-time subscriptions for email changes
6. **Simplified Backend**: No need for complex serverless functions
7. **Easier Development**: SQL-based approach easier to understand and debug
8. **Enhanced Security**: Row-level security policies for data protection
9. **Improved Error Handling**: Standard HTTP status codes for errors
10. **Better Documentation**: Well-documented Supabase API
11. **User Profiles**: More comprehensive user data management
12. **Usage Tracking**: Built-in usage tracking and quotas
13. **Subscription Management**: Better handling of subscription tiers
14. **Avatar Storage**: Built-in file storage for profile pictures

## Testing

After migration, thoroughly test the following:

1. **Authentication**: Login, signup, and password reset
2. **Email Generation**: Scanning pages and generating emails
3. **Saving Emails**: Saving individual emails and series
4. **Loading Emails**: Loading saved emails and series
5. **Deleting Emails**: Deleting emails and series
6. **Profile Management**: Creating and updating profiles
7. **Avatar Uploads**: Uploading and displaying avatars
8. **Error Handling**: Properly handling errors from Supabase

## Rollback Plan

In case of issues:

1. Keep both Firebase and Supabase implementations available
2. Implement feature flags to toggle between them
3. Have a clear path to roll back changes if needed
