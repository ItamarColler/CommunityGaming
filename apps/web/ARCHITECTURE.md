# Next.js Web Application Architecture

## Overview
CommunityGaming web app built with Next.js 14 App Router, featuring server-side route protection, RTK Query for API management, and a component-based authentication system.

## Directory Structure

```
apps/web/src/
├── app/
│   ├── (authenticated)/          # Route group for protected routes
│   │   ├── layout.tsx            # Wraps all auth routes with PageContainer + AuthGuard
│   │   ├── dashboard/            # Dashboard page
│   │   ├── communities/          # Communities listing
│   │   └── ...                   # Other authenticated routes
│   ├── login/                    # Public login page
│   ├── register/                 # Public register page
│   ├── layout.tsx                # Root layout (Redux Provider)
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx         # Client-side auth protection
│   ├── PageContainer/            # Header + main layout wrapper
│   │   ├── PageContainer.tsx
│   │   └── PageContainer.module.css
│   └── Header/                   # Navigation header
│
├── features/
│   └── auth/
│       ├── slice/                # Auth Redux slice
│       ├── selectors/            # Auth selectors
│       └── services/             # Legacy auth service (migrating to RTK Query)
│
├── lib/
│   ├── redux/
│   │   ├── api/
│   │   │   ├── baseApi.ts        # RTK Query base config
│   │   │   └── authApi.ts        # Auth endpoints
│   │   ├── store.ts              # Redux store
│   │   └── StoreProvider.tsx     # Client-side provider
│   └── auth/
│       └── session.ts            # Session utilities
│
├── middleware.ts                 # Next.js middleware for route protection
└── styles/
    └── globals.css               # Global styles
```

## Routing Strategy

### Route Groups
We use Next.js route groups to organize protected vs public routes:

**Public Routes** (no group)
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

**Authenticated Routes** `(authenticated)` group
- `/dashboard` - User dashboard
- `/communities` - Communities listing
- `/communities/[id]` - Community details
- `/matchmaking` - Squad finder
- `/profile` - User profile

### Route Protection Layers

#### 1. Server-Side (Middleware)
```typescript
// src/middleware.ts
- Checks for auth_token cookie
- Redirects unauthenticated users to /login
- Redirects authenticated users away from /login, /register
- Preserves return URL for post-login redirect
```

#### 2. Layout-Based (AuthGuard + PageContainer)
```typescript
// src/app/(authenticated)/layout.tsx
<AuthGuard>           // Client-side auth check + loading state
  <PageContainer>      // Header + main wrapper
    {children}        // Page content
  </PageContainer>
</AuthGuard>
```

## Authentication Flow

### Login Flow
1. User submits credentials via `LoginForm`
2. RTK Query mutation: `useLoginMutation()` → `/auth/login`
3. Server returns JWT + user data
4. Redux slice stores user, token
5. Middleware detects auth_token cookie
6. User redirected to dashboard (or returnUrl)

### Session Management
- **Tokens**: JWT stored in httpOnly cookie (secure)
- **Client State**: User data in Redux
- **Refresh**: Auto-refresh via `refreshSession` mutation
- **Persistence**: Redux Persist (localStorage) for user data

## API Management with RTK Query

### Base API Configuration
```typescript
// lib/redux/api/baseApi.ts
- baseUrl: process.env.NEXT_PUBLIC_API_URL (defaults to localhost:4001)
- Auto-injects auth token in headers
- Credentials: 'include' for httpOnly cookies
- Tag-based cache invalidation
```

### Auth API Endpoints
```typescript
// lib/redux/api/authApi.ts
Mutations:
- useLoginMutation()
- useRegisterMutation()
- useLogoutMutation()
- useRefreshSessionMutation()

Queries:
- useGetCurrentUserQuery()
- useLazyGetCurrentUserQuery()
```

### Creating New API Endpoints
```typescript
// Example: Community API
export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query({
      query: () => '/communities',
      providesTags: ['Community'],
    }),

    createCommunity: builder.mutation({
      query: (data) => ({
        url: '/communities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Community'],
    }),
  }),
});
```

## Component Patterns

### Page Component Pattern
```typescript
// app/(authenticated)/dashboard/page.tsx
'use client';  // Required for hooks

export default function DashboardPage() {
  const user = useAppSelector(selectUser);
  const [fetchData] = useLazyGetDataQuery();

  // No need for AuthGuard here - layout handles it
  // No need for PageContainer - layout provides it

  return <div>Page content</div>;
}
```

### API Mutation Pattern
```typescript
'use client';

import { useCreateCommunityMutation } from '@/lib/redux/api/communityApi';

export default function CreateCommunityForm() {
  const [createCommunity, { isLoading, error }] = useCreateCommunityMutation();

  const handleSubmit = async (data) => {
    const result = await createCommunity(data);
    if (result.data?.success) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}
```

## State Management

### Redux Store Structure
```typescript
{
  api: {
    queries: {},    // RTK Query cache
    mutations: {},  // RTK Query mutations
  },
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
  },
  // ... other slices
}
```

### Selectors
```typescript
// features/auth/selectors/auth.selectors.ts
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
```

## Styling Strategy

### CSS Modules
- Component-scoped styles
- TypeScript autocomplete
- No class name conflicts
- Example: `dashboard.module.css`

### Global Styles
- CSS variables for theming
- Base typography
- Reset/normalize
- Located in `styles/globals.css`

## Environment Variables

### Required Variables
```env
# API Gateway URL (for client-side requests)
NEXT_PUBLIC_API_URL=http://localhost:4001

# Node environment
NODE_ENV=development
```

## Best Practices

### ✅ DO
- Use RTK Query for all API calls
- Place authenticated routes in `(authenticated)` group
- Use CSS Modules for component styles
- Leverage middleware for server-side protection
- Use TypeScript strictly
- Validate env variables

### ❌ DON'T
- Don't use `fetch()` directly - use RTK Query
- Don't wrap auth routes with AuthGuard manually (layout does it)
- Don't store sensitive data in localStorage
- Don't put API keys in client-side code
- Don't bypass middleware auth checks

## Performance Optimizations

1. **Route Groups**: Shared layouts reduce re-renders
2. **RTK Query**: Automatic caching, deduplication
3. **Middleware**: Fast server-side redirects
4. **Code Splitting**: Automatic per-route
5. **CSS Modules**: Minimal CSS in bundle

## Security Considerations

1. **httpOnly Cookies**: Tokens not accessible to JavaScript
2. **CSRF Protection**: X-Requested-With header
3. **Middleware Auth**: Server-side validation
4. **Environment Variables**: Secrets never in client bundle
5. **Content Security Policy**: Configured in next.config.js

## Migration Notes

### From Legacy Auth Service to RTK Query
Old way:
```typescript
import { authService } from '@/features/auth/services';
const result = await authService.signIn(credentials);
```

New way:
```typescript
import { useLoginMutation } from '@/lib/redux/api/authApi';
const [login] = useLoginMutation();
const result = await login(credentials);
```

## Future Enhancements

- [ ] Server Components for better SEO
- [ ] Streaming SSR for dashboard
- [ ] Optimistic updates with RTK Query
- [ ] WebSocket integration
- [ ] Real-time notifications
- [ ] PWA support
