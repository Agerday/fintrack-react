@AGENTS.md

# fintrack-react

Invoice & client management app. Training / portfolio project to master React 19 + Next.js App Router for senior frontend interviews. The owner is a senior Angular developer learning the React ecosystem.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 + shadcn/ui (base-nova style, built on `@base-ui/react`, icons from `lucide-react`)
- TanStack Query (server state), Zustand (client state)
- React Hook Form + Zod v4 (forms and validation)
- Vitest + React Testing Library + MSW (unit, integration), Playwright (E2E)

## Commands

| Command                        | What               |
| ------------------------------ | ------------------ |
| `npm run dev`                  | Dev server         |
| `npm run ws`                   | WebSocket server   |
| `npm run lint`                 | ESLint             |
| `npx tsc --noEmit`             | Type check         |
| `npm run test -- --run`        | Vitest, single run |
| `npm run test:e2e`             | Playwright E2E     |
| `npx prettier --write <files>` | Format             |

Before saying a task is done: run lint, type check and tests, and fix what fails.

## Project structure

No `src/` folder. Everything is at the root, `@/*` maps to `./*`.

- `app/` — routes only (pages, layouts, error/not-found). Pages stay thin: they compose feature components.
- `app/api/<resource>/route.ts` — Route Handlers (mock backend).
- `app/api/<resource>/store.ts` — in-memory store seeded from `features/<domain>/data.ts`.
- `features/<domain>/` — one folder per business domain (invoices, clients, dashboard):
    - `types.ts` — domain types (derive from Zod schemas with `z.infer` when possible)
    - `schema.ts` — Zod schemas + inferred form value types
    - `api.ts` — fetch functions, always through `apiClient`
    - `hooks.ts` — ALL TanStack Query hooks of the domain in one file (queries + mutations). No per-hook files, no `hooks/` folder.
    - `rules.ts` — business rules: pure functions, no React / fetch / store. Route Handlers, MSW handlers and components call them instead of inlining logic. Unit tested in `rules.test.ts`.
    - `data.ts` — seed data
    - `components/` — domain components
- `components/ui/` — shadcn/ui primitives. Add new ones with `npx shadcn add <name>`, never hand-write them.
- `components/layout/` — app shell, header, sidebar, page header, stat card.
- `components/shared/` — reusable cross-feature components (e.g. `QueryState`).
- `hooks/` — generic hooks only (e.g. `useDebounce`). Domain hooks go in `features/<domain>/hooks.ts`.
- `lib/` — cross-cutting helpers. Zustand stores in `lib/store/`.

## Conventions

### Code language

English only in code: identifiers, strings, comments. Never French.

### Reuse first

Factor repeated logic into helpers from the start. Check `lib/` before writing anything new:

- `apiClient` — every client-side fetch
- `ApiError` / `errors.ts` — client-side error mapping
- `HttpError` — throw it from Route Handlers
- `withErrorHandling` — wrap every Route Handler that can fail
- `parseBody(request, schema)` — validate every request body
- `findOrThrow(items, id, 'Resource')` — 404 lookups
- `formatCurrency`, `formatAmount`, `formatDate` — never format inline

If a pattern appears twice, propose a helper instead of duplicating it.

### Components

- Server Components by default. Add `'use client'` only when needed (state, effects, event handlers, browser APIs, TanStack Query hooks).
- Named exports (`export function InvoiceForm`). Default export only where Next.js requires it (`page.tsx`, `layout.tsx`, `error.tsx`…).
- Props typed with `type XxxProps = {...}` right above the component.
- Tailwind utility classes and shadcn theme tokens (`text-destructive`, `text-muted-foreground`, `bg-destructive/10`…). No CSS modules, no inline styles, no hard-coded colors.
- `cn()` from `@/lib/utils` for conditional classes.

### Data fetching

- Query keys: `['invoices']` for lists, `['invoice', id]` for one item.
- Mutations invalidate the related list query in `onSuccess` (`void queryClient.invalidateQueries(...)`).
- Wrap list/detail rendering with `QueryState` for loading / error / empty states.

### Forms

- React Hook Form + `zodResolver(schema)`. The same Zod schema validates on the client and in the Route Handler.
- Map server field errors back to the form with `setError` when `err instanceof ApiError && err.field`.
- Global (non-field) API errors are shown under the form.

### Route Handlers

- Pattern: `export const POST = withErrorHandling(async (request) => { const data = await parseBody(request, schema); ... })`.
- Dynamic params are a Promise: `{ params }: { params: Promise<{ id: string }> }`, then `await params`.
- Never mutate store arrays: reassign with spread / map / filter.

### Style

- Prettier: 4 spaces, single quotes, semicolons, trailing commas, 100 columns.
- `import type` when only types are used.
- No `any`. No non-null assertion (`!`) unless justified in a comment.
- Short comments explaining WHY, not what. Angular / Spring analogies are welcome (e.g. "like @ControllerAdvice").

## Testing

> Existing tests predate these rules and are being migrated. New and touched tests follow them.

### Philosophy

- **A test must catch a real bug.** Before writing one, name the bug it would catch. None → don't write it.
- **Test behavior, not implementation.** What the user sees, what the API returns. Never internal state, props or CSS classes. A refactor that keeps the behavior must not break a test.
- **Few meaningful tests > many shallow ones.** Coverage % is not a goal.
- **One behavior, one level.** Test it at the lowest level that can catch the bug. Don't repeat it higher up.

### Do NOT test

- "renders without crashing", snapshots, "the function was called" with no visible outcome
- `components/ui/` (shadcn) and third-party libraries (Zod, TanStack Query, React Hook Form, Next.js routing)
- Presentational components with no logic, types, constants, seed data, styling
- Schemas field by field — only OUR business rules (amount > 0, max 2 decimals…)

### The three levels

| Level           | File name                            | Tests what                                                                                                     | Fakes                       |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **Unit**        | `*.test.ts(x)`, next to the code     | Pure logic: schema rules, `lib/` helpers, hooks with real logic (e.g. WebSocket reconnect)                     | Everything outside the unit |
| **Integration** | `*.int.test.ts(x)`, next to the code | A feature component with its real hooks, apiClient and validation — or a Route Handler called with a `Request` | Network only (MSW)          |
| **E2E**         | `e2e/<journey>.spec.ts`              | Critical user journeys: create / pay / delete invoice, detail page, real-time, mobile nav                      | Nothing                     |

- **Integration is the main level.** Most feature tests live there.
- Route Handler tests start with `// @vitest-environment node`.
- E2E never re-tests validation messages or edge cases already covered by integration.

### Folder structure

```
e2e/
  fixtures.ts                 # all E2E helpers exposed as fixtures (client, invoicesPage…)
  invoices.spec.ts
  realtime.spec.ts
test/
  setup.ts                    # jest-dom, MSW lifecycle, global resets
  render.tsx                  # renderWithClient, renderHookWithClient
  factories.ts                # buildInvoice(overrides), buildClient(overrides)
  msw/
    server.ts                 # setupServer with all handlers
    handlers/<domain>.ts      # handlers + in-memory db + reset() for one domain
```

No other test folder at the root.

### Mocking

- **Mock the network (MSW), never our own modules.**
- `vi.mock` only for real boundaries: time (`vi.useFakeTimers`), browser globals (`WebSocket`), side effects leaving the process (`publishEvent` in Route Handler tests).
- **MSW handlers copy the real route contract exactly**: same status codes, same body shape, same types as `app/api` and `api.ts`. Route contract changes → handler, `api.ts` and tests change in the same commit.
- `onUnhandledRequest: 'error'` stays on: an unexpected request is a bug.
- All shared state (MSW overrides and listeners, in-memory db, mocks, timers) is reset in `test/setup.ts` or `afterEach`, never at the end of a test.

### Writing a test

- `describe` = the thing under test. `it` = a behavior sentence: `'marks the invoice as paid when the user confirms'`, never `'works'`.
- Arrange / Act / Assert, separated by a blank line. One behavior per test.
- Import `describe`, `it`, `expect`, `vi` explicitly from `'vitest'` (globals off).
- Never hand-write a `QueryClientProvider` wrapper: use `renderWithClient` / `renderHookWithClient`.
- Test data comes from factories, not from seed data content.
- Queries, in this order: `getByRole` (with `name`) → `getByLabelText` → `getByText`. `getByTestId` only if nothing accessible exists. Never `container.querySelector`.
- `userEvent` for interactions. `fireEvent` only for one raw event a hook listens to.
- Async: `findBy*` / `waitFor` in Vitest, web-first assertions in Playwright. Never `setTimeout`, sleep or `page.waitForTimeout`.
- Cover the unhappy paths that matter: API error, empty state, server field error shown in the form, 404.
- E2E: arrange through the API, act and assert through the UI. Each test creates its own uniquely named data and a fixture cleans it up. No test depends on another.

### Comments in tests

- The test name is the documentation. No tutorial comments explaining the testing library.
- Comment only a non-obvious WHY: a jsdom limitation, a known race, a hydration wait.

### Bug fixes

First a failing test that reproduces the bug at the lowest possible level, then the fix.

### Target scripts

Added by the test migration. Until then, use the commands at the top.

| Command             | What                          |
| ------------------- | ----------------------------- |
| `npm run test:unit` | Unit tests, single run        |
| `npm run test:int`  | Integration tests, single run |
| `npm test`          | All Vitest tests, watch mode  |
| `npm run test:e2e`  | Playwright                    |

CI runs lint, type check, unit, integration and E2E on every push.

### Definition of done

A feature or fix comes with tests at the right level. Lint, type check, unit, integration and E2E all pass.

## Rules for Claude

- Do not add a dependency without asking first.
- Do not change the folder structure or existing conventions without asking first.
- Before writing new code, look at the closest existing example and follow its pattern (e.g. a new feature mirrors `features/invoices/`).
- For anything bigger than a small fix, propose a plan first and wait for approval.
- Keep changes scoped to the task. No unrelated refactors, no drive-by renames.
- Next.js may differ from your training data: check `node_modules/next/dist/docs/` (see `AGENTS.md`) before using a Next.js API you are not sure about.
