# Clerk Authentication Migration

This project has been migrated from Supabase Auth to Clerk for authentication.

## What Changed

### Authentication
- **Before**: Supabase Auth (`@supabase/ssr`, `supabase.auth.signIn()`)
- **After**: Clerk (`@clerk/nextjs`, `<SignIn />`, `<SignUp />`)

### Key Changes

1. **Middleware** (`middleware.ts`)
   - Now uses `clerkMiddleware()` from `@clerk/nextjs/server`
   - Protected routes defined with `createRouteMatcher()`

2. **Root Layout** (`app/layout.tsx`)
   - Wrapped with `<ClerkProvider>`

3. **Auth Pages**
   - Sign-in: Uses Clerk's `<SignIn />` component
   - Sign-up: Uses Clerk's `<SignUp />` component
   - Password reset: Handled by Clerk's built-in flows

4. **Server Components**
   - Use `auth()` from `@clerk/nextjs/server` to get user ID
   - Use `currentUser()` for full user details

5. **Client Components**
   - Use `useUser()` hook from `@clerk/nextjs`
   - Use `useClerk()` for sign-out functionality

6. **API Routes**
   - Use `auth()` from `@clerk/nextjs/server`
   - Access user ID via `const { userId } = await auth()`

## What Stayed the Same

- **Supabase Database**: Still used for storing campaigns, credentials, and other data
- **All business logic**: Campaign management, analytics, etc.
- **UI Components**: All existing UI components remain unchanged

## Environment Variables

Required Clerk environment variables:

\`\`\`bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
\`\`\`

Get these from your [Clerk Dashboard](https://dashboard.clerk.com/).

## Setup Instructions

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy your API keys from the dashboard
4. Add them to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   \`\`\`
5. Run `npm install` to ensure `@clerk/nextjs` is installed
6. Start your development server: `npm run dev`

## User Migration

If you have existing users in Supabase:
- Clerk user IDs are different from Supabase user IDs
- You may need to migrate user data or create a mapping table
- Consider using Clerk's [User Import API](https://clerk.com/docs/users/importing-users)

## Testing

1. Visit `/sign-in` to test authentication
2. Create a new account via `/sign-up`
3. Access protected routes like `/dashboard`
4. Test sign-out functionality

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
\`\`\`
