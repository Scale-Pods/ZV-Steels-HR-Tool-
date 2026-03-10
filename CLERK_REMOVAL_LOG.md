# Clerk Removal Complete

## Summary
All Clerk dependencies have been successfully removed from the HR Candidate Tracker application. The app now works without authentication in editors like v0.

## Files Modified

### 1. **app/layout.tsx**
- Removed `ClerkProviderWrapper` component
- Removed Clerk provider wrapping
- Kept only `ThemeProvider` for styling

### 2. **app/dashboard/page.tsx**
- Removed `useUser()` hook from Clerk
- Changed `userEmail` state to default to `"guest@example.com"`
- Removed authentication checks
- Removed `isUserLoggedIn` and `isLoaded` states

### 3. **app/profile/page.tsx**
- Converted from async server component to client component
- Removed `currentUser()` server-side call
- Removed redirect logic for unauthenticated users
- Added mock user data instead

### 4. **components/profile/sign-out-button.tsx**
- Removed `useClerk()` hook
- Simplified to just navigate to `/sign-in` without calling Clerk

### 5. **app/exhibitions/page.tsx**
- Removed `useUser()` hook
- Removed authentication checks
- Removed redirect logic

### 6. **app/manage-campaigns/page.tsx**
- Removed `useUser()` hook
- Removed authentication guard

### 7. **middleware.ts**
- Deleted entire file (removed all auth middleware)

## Environment Variables No Longer Needed
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

## Result
✅ App now loads in editors without authentication errors
✅ No more "useUser can only be used within <ClerkProvider/>" errors
✅ All pages accessible directly without login
✅ Clean, minimal configuration suitable for v0 and editor previews
