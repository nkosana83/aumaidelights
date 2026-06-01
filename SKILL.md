# SKILL.md — Development Skills Reference

> This file is read automatically when referenced in CLAUDE.md.
> It defines how Claude Code should approach common development tasks
> across all web and application projects. No editing required.

---

## Skill Index

| Skill | When to Use |
|-------|-------------|
| [UI Components](#skill-ui-components) | Building any React/HTML component or page section |
| [API Integration](#skill-api-integration) | Connecting to REST or third-party APIs |
| [Forms & Validation](#skill-forms--validation) | Any user input, forms, or data entry |
| [Authentication](#skill-authentication) | Login, signup, sessions, protected routes |
| [Database Operations](#skill-database-operations) | Queries, mutations, migrations, schema design |
| [State Management](#skill-state-management) | Global or shared client-side state |
| [Error Handling](#skill-error-handling) | Try/catch, user-facing errors, logging |
| [Performance](#skill-performance) | Optimization, lazy loading, caching |
| [Testing](#skill-testing) | Unit tests, integration tests, E2E |
| [Accessibility](#skill-accessibility) | a11y compliance on any UI element |
| [Responsive Design](#skill-responsive-design) | Mobile-first layouts and breakpoints |
| [Deployment & Environment](#skill-deployment--environment) | Env vars, CI/CD, build config |
| [Security](#skill-security) | Input sanitization, auth guards, headers |
| [TypeScript Patterns](#skill-typescript-patterns) | Types, interfaces, generics, inference |

---

## Skill: UI Components

### Approach
1. Understand the component's purpose and user context before writing a single line
2. Choose a clear, intentional aesthetic direction — avoid generic defaults
3. Build mobile-first, then layer in larger breakpoints
4. Every component must be self-contained, reusable, and independently testable

### Component Structure (React)
```tsx
// ✅ Standard component anatomy
import { type FC } from 'react'

interface ComponentNameProps {
  // Props defined explicitly — never use `any`
}

export const ComponentName: FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // 1. Hooks at the top
  // 2. Derived values / computed logic
  // 3. Event handlers
  // 4. Early returns (loading, error, empty states)
  // 5. Main render

  return (
    <div>
      {/* Always handle: loading state, error state, empty state, populated state */}
    </div>
  )
}
```

### Design Rules
- **Typography:** Choose distinctive, characterful fonts — never Arial, Inter, or Roboto by default
- **Color:** Use CSS variables defined in the design token file — never hardcode hex values in components
- **Spacing:** Use the design system scale (Tailwind spacing) — never arbitrary pixel values
- **Animation:** Prefer CSS transitions over JS for simple interactions; use Framer Motion for complex sequences
- **Dark mode:** Support via `dark:` Tailwind variants or CSS variable switching — never two separate stylesheets

### What to Always Include
- Loading skeleton or spinner state
- Empty state (with helpful message, not just blank)
- Error state (with actionable message)
- Responsive behavior at all breakpoints
- Keyboard navigation support
- `aria-*` attributes where appropriate

### What to Never Do
- No inline `style={{}}` attributes — use Tailwind or CSS variables
- No hardcoded strings — use props or constants
- No direct DOM manipulation — use React state and refs
- No components longer than 200 lines — split into sub-components
- No business logic inside components — extract to hooks or utils

---

## Skill: API Integration

### Approach
All external API calls are routed through `/lib/api.ts` — never call `fetch()` directly in components or pages.

### Standard API Client Pattern
```typescript
// /lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}
```

### Rules
- Always define TypeScript return types for API responses
- Always handle network errors AND application-level errors separately
- Never expose raw error messages from APIs to end users — map them to user-friendly messages
- Use React Query or SWR for data fetching in components — not `useEffect + fetch`
- Set timeouts on all fetch calls in production
- Log errors to the logger utility, not `console.error`

---

## Skill: Forms & Validation

### Stack
- **Form state:** React Hook Form
- **Validation schema:** Zod
- **Never:** Build custom form state management or custom validators from scratch

### Standard Pattern
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // data is fully typed and validated
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} aria-describedby="email-error" />
      {errors.email && <span id="email-error" role="alert">{errors.email.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### Rules
- Every form field must have a visible label (not just placeholder text)
- Every error message must be associated with its field via `aria-describedby`
- Disable submit button while submitting — prevent double submissions
- Show success AND error feedback after submission
- Sanitize inputs on the server even if validated on the client
- Never store sensitive form values (passwords, card numbers) in React state longer than necessary

---

## Skill: Authentication

### Approach
- Use an established auth library (NextAuth.js, Clerk, Supabase Auth) — never build custom auth from scratch
- Auth state lives in a provider at the root level — accessed via `useSession()` or equivalent hook
- Protected routes use middleware or higher-order components — never ad hoc checks inside pages

### Route Protection Pattern (Next.js Middleware)
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/admin/:path*'],
}
```

### Rules
- Never store JWT tokens in `localStorage` — use `httpOnly` cookies
- Never expose session tokens to client-side JavaScript
- Always redirect unauthenticated users to login, not a 404
- Implement role-based access control (RBAC) at the API layer, not just the UI
- Session expiry must trigger automatic redirect to login, not a broken UI
- Log all auth failures (failed logins, unauthorized access attempts)

---

## Skill: Database Operations

### Approach
All database queries go through `/lib/db.ts` — never write raw database calls in API routes or server actions.

### Standard Pattern (Prisma)
```typescript
// /lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### Rules
- Always use parameterized queries — never string-interpolate user input into queries
- Always wrap multi-step operations in transactions
- Never fetch more columns than needed — always `select` explicitly
- Always paginate large result sets — never return unbounded lists
- Index columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses
- Never run migrations in production without a backup
- Schema changes require explicit discussion before implementation

---

## Skill: State Management

### Decision Tree
```
Is the state local to one component?
  └─ Yes → useState / useReducer (keep it local)
  └─ No → Is it server data (fetched from API)?
              └─ Yes → React Query / SWR (server state)
              └─ No → Is it complex global UI state?
                          └─ Yes → Zustand
                          └─ No → React Context (simple shared state)
```

### Zustand Store Pattern
```typescript
// /store/useAuthStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
```

### Rules
- Never store derived values in state — compute them from existing state
- Never store server data in Zustand — that's React Query's job
- Reset stores on logout to prevent state leakage between sessions
- Keep store files focused: one concern per store file

---

## Skill: Error Handling

### Levels of Error Handling
1. **Component level:** Error boundaries for UI crashes
2. **Data fetching level:** React Query error states
3. **Form level:** Validation errors via Zod
4. **API level:** Structured error responses
5. **Global level:** Unhandled promise rejections logged and reported

### Standard API Error Response Shape
```typescript
// Always return this shape from API routes on error
{
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR',
    message: string,   // User-facing message (safe to display)
    details?: unknown  // Developer details (omit in production)
  }
}
```

### Rules
- Never show raw error messages or stack traces to users
- Always log errors with enough context to reproduce them
- Use error codes (not just messages) so the client can handle errors programmatically
- Network timeouts must show a retry option — not just an error message
- 404 pages must be helpful (search, navigation) — not just "Page Not Found"
- 500 pages must reassure the user and provide a path forward

---

## Skill: Performance

### Checklist Before Every Deployment
- [ ] Images use Next.js `<Image />` or equivalent with lazy loading and correct dimensions
- [ ] No unused npm packages in `dependencies` (move to `devDependencies` if build-only)
- [ ] Dynamic imports (`next/dynamic`) for heavy components not needed on initial load
- [ ] Fonts loaded via `next/font` — no external `@import` in CSS
- [ ] API responses are cached where appropriate (React Query `staleTime`, CDN headers)
- [ ] Database queries have indexes on filtered/sorted columns
- [ ] No N+1 query problems — use `include` / `join` to batch fetches
- [ ] Lighthouse score ≥ 90 on Performance, Accessibility, Best Practices, SEO

### Key Thresholds
| Metric | Target |
|--------|--------|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to First Byte (TTFB) | < 600ms |
| Bundle size (initial JS) | < 200kb gzipped |

---

## Skill: Testing

### Test Types & Tools
| Type | Tool | What It Tests |
|------|------|---------------|
| Unit | Jest + React Testing Library | Individual functions and components |
| Integration | Jest + MSW (mock service worker) | Components + API interactions |
| E2E | Playwright | Full user flows in a real browser |

### Component Test Pattern
```tsx
import { render, screen, userEvent } from '@testing-library/react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('shows validation error for invalid email', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i)
  })
})
```

### Rules
- Test behavior, not implementation — test what users see, not internal state
- Never test implementation details (internal function names, state variable names)
- Mock all external dependencies (APIs, databases) — tests must run offline
- Each test must be independent — no shared state between tests
- Name tests as user stories: `'shows error when email is invalid'` not `'test error state'`
- Minimum 70% coverage on utilities and hooks; 100% on critical business logic

---

## Skill: Accessibility

### Required for Every UI Element
- **Images:** `alt` text on all `<img>` — meaningful description or `alt=""` for decorative
- **Forms:** Every input has an associated `<label>` via `htmlFor` / `id`
- **Buttons:** Descriptive text or `aria-label` — never "Click here" or "Submit"
- **Icons:** Icon-only buttons need `aria-label`; decorative icons need `aria-hidden="true"`
- **Focus:** All interactive elements must be keyboard-focusable and have visible focus ring
- **Color:** Never convey information through color alone — use icons, text, or patterns too
- **Headings:** Use semantic heading hierarchy (h1 → h2 → h3) — never skip levels
- **Landmark regions:** Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>` semantically

### WCAG AA Targets
| Check | Standard |
|-------|----------|
| Text contrast | 4.5:1 minimum |
| Large text contrast | 3:1 minimum |
| Interactive element contrast | 3:1 minimum |
| Focus indicator | Clearly visible |
| Keyboard navigation | All actions achievable |

### Testing Accessibility
```bash
# Run axe-core in tests
npm install --save-dev @axe-core/react

# Lighthouse CLI audit
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

---

## Skill: Responsive Design

### Breakpoint System (Tailwind)
| Prefix | Min-width | Typical device |
|--------|-----------|----------------|
| (none) | 0px | Mobile (base) |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Wide desktop |

### Rules
- **Mobile-first always:** Write base styles for mobile, add `md:` and `lg:` overrides
- Test on real devices or accurate device emulation — not just desktop resizing
- Touch targets must be minimum 44x44px on mobile
- No horizontal scroll on any viewport width
- Typography scales with viewport — use `clamp()` or responsive font sizes
- Navigation must be usable on mobile (hamburger menu, bottom nav, or equivalent)

---

## Skill: Deployment & Environment

### Environment Variable Rules
- All secrets live in `.env.local` (never committed)
- Public values (safe for client) prefixed: `NEXT_PUBLIC_`
- Private values (server only): no prefix
- Always provide `.env.example` with all variable keys (no values)
- Validate required env vars at startup — fail fast if missing

### Startup Validation Pattern
```typescript
// /lib/env.ts
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'] as const

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}
```

### Deployment Checklist
- [ ] All environment variables set in deployment platform
- [ ] Database migrations run before deploying new code
- [ ] `npm run build` passes locally before pushing
- [ ] TypeScript errors: zero (`npm run typecheck`)
- [ ] Lint errors: zero (`npm run lint`)
- [ ] All tests passing (`npm test`)
- [ ] Staging deployment reviewed and approved before production

---

## Skill: Security

### Input Handling
- Validate and sanitize ALL user inputs on the server — the client is untrusted
- Use Zod schemas for server-side request validation (same schemas as client)
- Sanitize HTML output if rendering user-generated content (use DOMPurify or equivalent)
- Parameterized queries only — never concatenate user input into SQL or NoSQL queries

### HTTP Security Headers
```typescript
// next.config.ts — apply to all responses
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### API Security
- Rate limit all public endpoints (especially auth endpoints)
- Authenticate before authorizing — always check session before checking role
- Return generic error messages on auth failures — never reveal whether a user exists
- Log all security events: failed logins, unauthorized access, suspicious activity
- Never log passwords, tokens, or sensitive user data

### Dependency Security
```bash
# Run before every deployment
npm audit
# Fix critical and high severity issues before shipping
```

---

## Skill: TypeScript Patterns

### Type Definitions
```typescript
// ✅ Prefer interfaces for object shapes
interface User {
  id: string
  email: string
  role: 'admin' | 'user' | 'guest'
  createdAt: Date
}

// ✅ Use type aliases for unions, intersections, and utility types
type UserId = string
type AdminUser = User & { permissions: string[] }
type PartialUser = Partial<Pick<User, 'email' | 'role'>>

// ✅ Generic utility types
type ApiResponse<T> = {
  data: T
  error: null
} | {
  data: null
  error: { code: string; message: string }
}
```

### Rules
- `strict: true` in tsconfig — always
- Never use `any` — use `unknown` for truly unknown types, then narrow with type guards
- Never use non-null assertion (`!`) — handle the null case explicitly
- Use `satisfies` operator to validate object literals against types without widening
- Prefer `readonly` arrays and properties for data that shouldn't mutate
- Use discriminated unions for complex state shapes (not boolean flags)

### Type Narrowing Pattern
```typescript
// ✅ Type guard for unknown data (e.g., API responses)
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}
```

---

*This file is project-agnostic and requires no editing. It applies across all web and application projects.*
