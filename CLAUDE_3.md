# CLAUDE.md — Universal Project Configuration

> This file requires no manual editing. Claude Code reads it at the start of every session
> and infers project-specific details (framework, stack, structure) by reading the codebase.
> Drop it into the root of any project and it works immediately.

---

## How Claude Code Should Start Every Session

1. Read this file fully
2. Read `/SKILL.md` in this project root for skill-level guidance
3. Run `ls`, read `package.json`, `tsconfig.json`, and any existing `README.md` to infer the stack
4. Understand the folder structure before writing any code
5. Ask one clarifying question if the task is ambiguous — then proceed

---

## Stack Detection (Auto-Infer)

Claude Code must detect the tech stack from the project files before writing any code.

```
package.json          → dependencies, scripts, package manager
tsconfig.json         → TypeScript config and path aliases
next.config.*         → Next.js project
vite.config.*         → Vite-based project (React, Vue, Svelte)
astro.config.*        → Astro project
tailwind.config.*     → Tailwind CSS in use
prisma/schema.prisma  → Prisma ORM and database type
.env.example          → Required environment variables
```

If the stack cannot be determined from these files, ask before writing code.

---

## Universal Folder Conventions

Regardless of framework, Claude Code follows these path conventions:

```
/lib/api.*            → All external HTTP/API calls live here only
/lib/db.*             → Database client and query helpers only
/lib/utils.*          → Pure utility functions with no side effects
/lib/logger.*         → Logging utility — use instead of console.log
/hooks/               → Custom React hooks (prefix: use*)
/components/ui/       → Base-level, unstyled or primitives
/components/          → Feature components, co-located with their tests
/store/               → Global state (Zustand stores, Redux slices)
/types/               → Shared TypeScript types and interfaces
/tests/ or __tests__/ → Test files (mirror src structure)
```

If the project uses a different structure, detect it first and follow the existing pattern.

---

## Language & Typing

- **TypeScript always** — never create `.js` or `.jsx` files unless the project has no TypeScript
- `strict: true` must be on — never relax TypeScript strictness
- No `any` — use `unknown` and narrow, or define proper interfaces
- No non-null assertions (`!`) — handle null/undefined explicitly
- Infer types where obvious; annotate function signatures and return types explicitly

---

## Code Style (Universal)

### Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase + `use` prefix | `useWindowSize.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types / Interfaces | PascalCase | `UserProfile`, `ApiResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS classes (custom) | kebab-case | `card-header` |
| Files (non-component) | kebab-case | `auth-helpers.ts` |

### Formatting
- 2-space indentation
- Single quotes for strings (TypeScript/JavaScript)
- Trailing commas in multi-line structures
- Semicolons: follow the project's existing style (detect from existing files)
- Max line length: 100 characters
- No commented-out code left in final output

### Functions
- Prefer named functions over anonymous arrow functions at module level
- Keep functions under 40 lines — split if longer
- Single responsibility: one function does one thing
- Pure functions preferred — minimize side effects
- No nested ternaries — use early returns or switch statements

### React Specifics
- Functional components only — no class components
- Hooks at top of component — never inside conditionals or loops
- Named exports for all components — no default exports (unless framework requires it)
- Event handlers prefixed with `handle`: `handleSubmit`, `handleClick`
- Boolean props prefixed with `is`, `has`, `can`, `should`: `isLoading`, `hasError`
- Co-locate component test file next to the component: `Button.tsx` + `Button.test.tsx`

---

## Architecture Rules (Non-Negotiable)

These apply to every project without exception:

**Data Flow**
- All API calls through `/lib/api.*` — never raw `fetch()` in components or pages
- All database queries through `/lib/db.*` — never raw ORM calls in routes or actions
- All environment variables validated at startup via `/lib/env.*`

**Components**
- Components under 200 lines — split into sub-components beyond that
- No business logic inside components — extract to hooks or server functions
- No inline `style={{}}` attributes — use the project's styling system
- Every component handles: loading state, error state, empty state, populated state

**State**
- Local state: `useState` / `useReducer`
- Server/async state: React Query or SWR
- Global UI state: Zustand
- Never store derived values in state — compute them

**Security**
- Validate all inputs server-side regardless of client-side validation
- Parameterized queries only — no SQL/NoSQL string concatenation
- No secrets in client-accessible code or environment variables prefixed `NEXT_PUBLIC_`

---

## What Claude Code Must Never Do

Without explicit instruction from the user in chat, Claude Code must not:

- Install new npm/pip packages — ask first, state the reason
- Modify database schema files (`schema.prisma`, migration files, SQL)
- Change authentication logic or session handling
- Modify CI/CD configuration files (`.github/workflows/`, `vercel.json`, etc.)
- Delete or rename existing files — refactor in place
- Commit `.env`, `.env.local`, or any file containing secrets
- Add `console.log` statements to production code — use the logger utility
- Break existing TypeScript types to make something work faster
- Use `// @ts-ignore` or `// eslint-disable` — fix the underlying issue
- Write raw SQL string interpolation with user inputs
- Leave TODO comments in delivered code — implement or raise as a question
- Ignore existing code patterns — detect and follow project conventions

---

## Commands (Auto-Detected)

Claude Code reads `package.json` scripts and uses the project's actual commands.
As a fallback, these are the standard conventions:

```bash
# Development
npm run dev              # or: pnpm dev / yarn dev

# Quality
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run format           # Prettier

# Testing
npm test                 # Unit + integration
npm run test:e2e         # End-to-end (Playwright / Cypress)
npm run test:coverage    # Coverage report

# Build & Deploy
npm run build            # Production build
npm run start            # Production server

# Database (if Prisma detected)
npx prisma migrate dev   # Apply migrations in development
npx prisma generate      # Regenerate client after schema change
npx prisma studio        # Open GUI
```

---

## Testing Standards

- Test behavior, not implementation
- Tests must pass with no network access — mock all external calls
- Test files mirror source structure and co-locate with components
- Every utility function in `/lib` needs at least one test
- Critical paths (auth, payment, data mutation) need 100% coverage
- Test naming format: `'does X when Y'` — readable as user stories

**Minimum coverage targets:**
- Utilities and hooks: 70%
- API route handlers: 80%
- Critical business logic: 100%

---

## Accessibility (Required on All UI)

- All images: meaningful `alt` text or `alt=""` for decorative
- All form inputs: associated `<label>` via `htmlFor`/`id`
- All buttons: descriptive text or `aria-label`
- Keyboard navigation: all interactive elements reachable and operable
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`
- Heading hierarchy: never skip levels (h1 → h2 → h3)
- Error messages: associated to their field via `aria-describedby` and `role="alert"`

---

## Performance (Required on All Projects)

- Images: lazy loading, correct dimensions, modern formats (WebP/AVIF)
- Fonts: loaded via framework font optimization — no `@import` in CSS
- JavaScript: dynamic imports for non-critical components
- API responses: appropriate cache headers and client-side cache configuration
- Database: no N+1 queries — batch fetches with `include`/`join`
- Target Lighthouse scores: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90

---

## Security (Required on All Projects)

- Rate limiting on all public API endpoints
- HTTP security headers on all responses
- Input sanitization server-side before any database operation
- Session tokens in `httpOnly` cookies — never `localStorage`
- `npm audit` clean (no critical or high vulnerabilities) before every deployment
- Generic error messages to clients — detailed errors only in server logs

---

## Git Conventions

- Branch naming: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/` prefixes
- Commit format: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never commit directly to `main` — use feature branches
- Never commit: `.env*` files, build artifacts, `node_modules/`, secrets, credentials

---

## Environment Variables

- Template: always maintain `.env.example` with all keys but no values
- Never hardcode secrets, API keys, or connection strings in source code
- Server-only vars: no prefix
- Client-safe vars: `NEXT_PUBLIC_` prefix (Next.js) or framework equivalent
- Validate required vars at startup — crash early with a clear error message

---

## Skill Reference

For detailed patterns on specific tasks, read `/SKILL.md` in this project root:

| Need | SKILL.md Section |
|------|-----------------|
| Building a component | `## Skill: UI Components` |
| Calling an API | `## Skill: API Integration` |
| Building a form | `## Skill: Forms & Validation` |
| Auth flows | `## Skill: Authentication` |
| Database queries | `## Skill: Database Operations` |
| Global state | `## Skill: State Management` |
| Error handling | `## Skill: Error Handling` |
| Performance work | `## Skill: Performance` |
| Writing tests | `## Skill: Testing` |
| Accessibility | `## Skill: Accessibility` |
| Responsive layouts | `## Skill: Responsive Design` |
| Deployment config | `## Skill: Deployment & Environment` |
| Security hardening | `## Skill: Security` |
| TypeScript patterns | `## Skill: TypeScript Patterns` |

---

## Communication Style

When working on this project, Claude Code should:

- State what it is about to do before doing it — no silent large changes
- Ask one focused question when something is ambiguous — then proceed
- Flag breaking changes, schema changes, or deletions before executing
- Summarize what was changed at the end of each task
- Suggest improvements but implement only what was asked
- Prefer smaller, reviewable changes over one massive commit

---

*This file is framework-agnostic and project-agnostic. No editing required.*
*Place in the project root alongside SKILL.md before starting any Claude Code session.*
