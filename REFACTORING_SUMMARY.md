## Refactored Next.js App Router - Flat Structure

### Final Folder Structure

```
app/
├── page.tsx                              # Landing page (/)
├── layout.tsx                            # Root layout (NO Clerk provider)
├── globals.css                           # Global styles
│
├── sign-in/
│   ├── page.tsx                         # (/sign-in) - No Clerk
│   └── loading.tsx
├── sign-up/
│   ├── page.tsx                         # (/sign-up)
│   └── loading.tsx
├── forgot-password/
│   └── page.tsx                         # (/forgot-password)
├── reset-password/
│   └── page.tsx                         # (/reset-password)
│
├── dashboard/
│   ├── page.tsx                         # (/dashboard)
│   └── loading.tsx
├── profile/
│   ├── page.tsx                         # (/profile)
│   └── loading.tsx
├── exhibitions/
│   ├── page.tsx                         # (/exhibitions)
│   ├── loading.tsx
│   ├── [id]/
│   │   ├── page.tsx                     # (/exhibitions/[id])
│   │   └── exhibition-detail-client.tsx
│   └── campaign/
│       └── [campaignName]/
│           ├── page.tsx                 # (/exhibitions/campaign/[campaignName])
│           └── campaign-detail-client.tsx
├── manage-campaigns/
│   ├── page.tsx                         # (/manage-campaigns)
│   └── loading.tsx
├── node-credentials/
│   ├── page.tsx                         # (/node-credentials)
│   └── loading.tsx
├── setup-credentials/
│   ├── page.tsx                         # (/setup-credentials)
│   └── loading.tsx
├── whatsapp-chat/
│   ├── page.tsx                         # (/whatsapp-chat)
│   └── [phoneNumber]/
│       └── page.tsx                     # (/whatsapp-chat/[phoneNumber])
│
└── api/                                  # API routes (unchanged)
    ├── credentials/
    ├── campaigns/
    ├── analytics/
    └── ...
```

### Changes Made

1. **Deleted Files:**
   - `middleware.ts` - Removed all auth guards and Clerk protection
   - All route group layouts (`app/(auth)/layout.tsx`, `app/(dashboard)/layout.tsx`)

2. **Moved Pages:**
   - `app/(auth)/sign-in/[[...sign-in]]/page.tsx` → `app/sign-in/page.tsx`
   - `app/(auth)/sign-up/[[...sign-up]]/page.tsx` → `app/sign-up/page.tsx`
   - `app/(auth)/forgot-password/page.tsx` → `app/forgot-password/page.tsx`
   - `app/(auth)/reset-password/page.tsx` → `app/reset-password/page.tsx`
   - `app/(dashboard)/*` → `app/*` (all dashboard pages flattened)

3. **Updated Files:**
   - `app/layout.tsx` - Removed `ClerkProviderWrapper`, kept only `ThemeProvider`
   - `app/sign-in/page.tsx` - Removed Clerk `<SignIn />` component, added simple placeholder

4. **Removed Route Groups:**
   - `(auth)` - No longer exists
   - `(dashboard)` - No longer exists

### Key Configuration

- **No middleware:** Auth guards completely disabled
- **No Clerk:** All Clerk authentication removed from root layout
- **Direct routes:** All pages accessible via flat URL paths
- **No redirects:** No auth-based redirects or guards
- **Editor compatible:** Works in iframe-based editors and v0

### How to Use

All pages now accessible via direct URLs:
- `/` - Landing page
- `/sign-in` - Sign in page
- `/dashboard` - Dashboard
- `/exhibitions` - Exhibitions
- `/exhibitions/[id]` - Exhibition details
- `/exhibitions/campaign/[campaignName]` - Campaign details
- `/manage-campaigns` - Manage campaigns
- `/whatsapp-chat` - WhatsApp chat
- `/setup-credentials` - Credentials setup
- `/profile` - User profile

### To Add Authentication Later

If you need to add authentication back:
1. Restore Clerk provider in `app/layout.tsx`
2. Create a new `middleware.ts` for protected routes
3. Move pages into route groups if needed for layout separation
