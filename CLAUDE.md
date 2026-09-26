@AGENTS.md

fintrack-react

Invoice & client management app. Training / portfolio project to master React 19 + Next.js App Router for senior frontend interviews. The owner is a senior Angular developer learning the React ecosystem.

Stack
Next.js 16 (App Router), React 19, TypeScript strict
Tailwind CSS v4 + shadcn/ui (base-nova style, built on @base-ui/react, icons from lucide-react)
TanStack Query (server state), Zustand (client state)
React Hook Form + Zod v4 (forms and validation)
Vitest + React Testing Library (unit), Playwright (E2E)
Commands
npm run dev — dev server
npm run lint — ESLint
npx tsc --noEmit — type check
npm run test -- --run — unit tests (single run)
npx playwright test — E2E
npx prettier --write <files> — format

Before saying a task is done: run lint, type check and tests, and fix what fails.

Project structure

No src/ folder — everything is at the root, @/* maps to ./*.

app/ — routes only (pages, layouts, error/not-found). Pages stay thin: compose feature components.
app/api/<resource>/route.ts — Route Handlers (mock backend).
app/api/<resource>/store.ts — in-memory store seeded from features/<domain>/data.ts.
features/<domain>/ — one folder per business domain (invoices, clients, dashboard):
types.ts — domain types (derive from Zod schemas with z.infer when possible)
schema.ts — Zod schemas + inferred form value types
api.ts — fetch functions, always through apiClient
hooks.ts — ALL TanStack Query hooks of the domain in one file (queries + mutations). No per-hook files, no hooks/ folder.
data.ts — seed data
components/ — domain components
components/ui/ — shadcn/ui primitives. Add new ones with npx shadcn add <name>, do not hand-write them.
components/layout/ — app shell, header, sidebar, page header, stat card.
components/shared/ — reusable cross-feature components (e.g. QueryState).
hooks/ — generic hooks only (e.g. useDebounce). Domain hooks go in features/<domain>/hooks.ts.
lib/ — cross-cutting helpers. Zustand stores in lib/store/.
Conventions
Code language
English only in code: identifiers, strings, comments. Never French.
Reuse first
Factor repeated logic into helpers from the start. Check lib/ before writing anything new:
apiClient — every client-side fetch
ApiError / errors.ts — client-side error mapping
HttpError — throw it from Route Handlers
withErrorHandling — wrap every Route Handler that can fail
parseBody(request, schema) — validate every request body
findOrThrow(items, id, 'Resource') — 404 lookups
formatCurrency, formatAmount, formatDate — never format inline
If a pattern appears twice, propose a helper instead of duplicating it.
Components
Server Components by default. Add 'use client' only when needed (state, effects, event handlers, browser APIs, TanStack Query hooks).
Named exports for components (export function InvoiceForm). Default export only where Next.js requires it (page.tsx, layout.tsx, error.tsx…).
Props typed with a type XxxProps = {...} right above the component.
Styling with Tailwind utility classes and shadcn theme tokens (text-destructive, text-muted-foreground, bg-destructive/10…). No CSS modules, no inline styles, no hard-coded colors.
Use cn() from @/lib/utils for conditional classes.
Data fetching
Query keys: ['invoices'] for lists, ['invoice', id] for one item.
Mutations invalidate the related list query in onSuccess (void queryClient.invalidateQueries(...)).
Wrap list/detail rendering with QueryState for loading / error / empty states.
Forms
React Hook Form + zodResolver(schema). The same Zod schema validates on the client and in the Route Handler.
Map server field errors back to the form with setError when err instanceof ApiError && err.field.
Global (non-field) API errors are shown under the form.
Route Handlers
Pattern: export const POST = withErrorHandling(async (request) => { const data = await parseBody(request, schema); ... }).
Dynamic params are a Promise: { params }: { params: Promise<{ id: string }> } then await params.
Never mutate store arrays: reassign with spread / map / filter.
Style
Prettier: 4 spaces, single quotes, semicolons, trailing commas, 100 columns.
Type imports with import type when only types are used.
No any. No non-null assertion (!) unless justified in a comment.
Short comments explaining WHY, not what. Analogies with Angular / Spring are welcome (e.g. "like @ControllerAdvice").
Rules for Claude
Do not add a dependency without asking first.
Do not change the folder structure or existing conventions without asking first.
Before writing new code, look at the closest existing example in the codebase and follow its pattern (e.g. a new feature mirrors features/invoices/).
For anything bigger than a small fix, propose a plan first and wait for approval.
Keep changes scoped to the task. No unrelated refactors, no drive-by renames.
Next.js may differ from your training data: check node_modules/next/dist/docs/ (see AGENTS.md) before using a Next.js API you are not sure about.