# Contributing to SquadCredit

Thank you for being part of the Squad Stack team. This guide defines our branching strategy, commit standards, and pull request process so that contributions from multiple people stay clean and mergeable — especially across feature areas like the AI scoring engine, the frontend, and the payment integration.

---

## Table of Contents

- [Branch Strategy](#branch-strategy)
- [Branch Naming Rules](#branch-naming-rules)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Who Works on What](#who-works-on-what)

---

## Branch Strategy

We use a **feature-area trunk** model. Every major feature area of the app has its own integration branch. Individual contributors work on their own personal branches within that area and then open a pull request into the area's integration branch. Only the integration branch (when stable) gets merged into `main`.

```
main
 ├── ai/main          ← AI scoring engine integration branch
 │    ├── alice/ai    ← Alice's personal AI work
 │    └── bob/ai      ← Bob's personal AI work
 │
 ├── frontend/main    ← Frontend UI integration branch
 │    ├── alice/frontend
 │    └── bob/frontend
 │
 ├── payments/main    ← Squad API + webhook integration branch
 │    ├── alice/payments
 │    └── bob/payments
 │
 └── db/main          ← Database schema / migrations integration branch
      ├── alice/db
      └── bob/db
```

### Rules
- **Never commit directly to `main`** or to any `*/main` integration branch.
- All work goes into a personal branch first (e.g. `alice/ai`).
- A personal branch is merged into its area's integration branch via a pull request, reviewed by at least one other team member.
- The integration branch (`ai/main`, `frontend/main`, etc.) is merged into `main` only when it is stable and demo-ready.

---

## Branch Naming Rules

Use the format: `{your-name}/{area}`

For personal work branches:

| Area | Your branch name |
|---|---|
| AI / scoring model | `alice/ai` |
| Frontend / UI | `alice/frontend` |
| Squad payments / webhooks | `alice/payments` |
| Database / migrations | `alice/db` |
| Bug fix (any area) | `alice/fix-score-calculation` |
| Hotfix going straight to main | `hotfix/webhook-signature-failure` |

For integration (team-shared) branches:

| Area | Integration branch |
|---|---|
| AI / scoring model | `ai/main` |
| Frontend / UI | `frontend/main` |
| Squad payments / webhooks | `payments/main` |
| Database / migrations | `db/main` |

### Creating your branch

Always branch off from the relevant integration branch, not from `main`:

```bash
# Example: Alice starting work on the AI scorer
git checkout ai/main
git pull origin ai/main
git checkout -b alice/ai
```

---

## Commit Message Format

We follow the **Conventional Commits** standard. Every commit message must follow this format:

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature or behaviour |
| `fix` | A bug fix |
| `refactor` | Code change that is not a fix or feature (cleanup, rename) |
| `style` | Visual/CSS changes only (no logic change) |
| `db` | Database migration or schema change |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes |
| `chore` | Tooling, config, or dependency updates |
| `wip` | Work in progress — use sparingly, should not be merged |

### Scopes (optional but recommended)

`ai`, `scoring`, `webhook`, `payout`, `dashboard`, `auth`, `migrations`, `seed`, `ui`

### Examples

```
feat(scoring): add repeat-sender share feature to trust score
fix(webhook): correctly verify Squad HMAC signature on retry
db(migrations): add holdback_percentage column to loans table
style(dashboard): increase score ring stroke width on mobile
refactor(ai): extract feature computation into separate module
docs: update CONTRIBUTING with payments branch naming
chore: bump @supabase/ssr to 0.10.3
```

### Rules
- Use **sentence case** for the description — no capital letters at the start, no full stop at the end.
- Keep the description under **72 characters**.
- Write in the **imperative mood**: "add feature" not "added feature" or "adds feature".
- Reference GitHub issues in the body if relevant: `Closes #12`

---

## Pull Request Process

### Opening a PR

1. Make sure your personal branch is up to date with its integration branch before opening:
   ```bash
   git checkout alice/ai
   git fetch origin
   git rebase origin/ai/main
   ```
2. Push your branch and open a PR **into the integration branch** (not `main`):
   - `alice/ai` → `ai/main`
   - `alice/frontend` → `frontend/main`
3. Fill in the PR description using this template:

```markdown
## What this does
<!-- One or two sentences describing the change -->

## How to test it
<!-- Steps to verify the change works -->

## Screenshots (if UI change)
<!-- Attach before/after screenshots -->

## Checklist
- [ ] I have tested this locally
- [ ] I have not committed .env.local or any secret keys
- [ ] Commit messages follow the Conventional Commits format
- [ ] No console.log or debug code left in
```

### Review rules

- Every PR needs **at least one approval** before merging.
- The person who opened the PR should **not be the one who merges it**.
- Resolve all review comments before merging.
- Use **Squash and merge** when merging personal branches into integration branches to keep the history clean.
- Use **Merge commit** (no squash) when merging an integration branch into `main` so the full history is preserved.

---

## Code Standards

These mirror the rules in `CLAUDE.md`. All contributors must follow them.

### General
- **Server actions** for all data mutations. **Route handlers** for webhooks only.
- **Zod** for all input validation — no unvalidated user input ever reaches the database.
- All Squad API calls go through `lib/squad.ts` only — never call Squad endpoints directly from a component.
- All database access goes through the typed Supabase clients in `lib/supabase/` — no raw `fetch` calls to Supabase.

### Formatting and naming
- **Sentence case** for all UI copy. No title case, no ALL CAPS, no fintech jargon.
- All ₦ amounts must use the formatter from `lib/format.ts` — never format naira manually.
- All virtual account numbers and transaction references must be rendered in `font-mono`.
- File names use **kebab-case** (e.g. `score-card.tsx`, `transaction-feed.tsx`).
- Component names use **PascalCase** (e.g. `ScoreCard`, `TransactionFeed`).

### TypeScript
- No use of `any`. Use `unknown` and narrow the type instead.
- All Supabase query results must be typed against the generated types in `lib/supabase/types.ts`.
- Do not silence TypeScript errors with `// @ts-ignore` — fix the type properly.

### Security
- **Never** commit `.env.local` or any file containing real API keys or secrets.
- **Never** use the `service_role` key in client-side code (anything in `app/` that runs in the browser). It is server-side only.
- Always verify Squad webhook signatures using `verifySquadSignature` from `lib/squad.ts` before processing any webhook payload.

---

## Who Works on What

| Feature area | Integration branch | Description |
|---|---|---|
| AI & scoring | `ai/main` | Trust score computation, SHAP explanations, LightGBM model, feature engineering |
| Frontend & UI | `frontend/main` | Dashboard, components, animations, mobile PWA layout |
| Payments | `payments/main` | Squad virtual accounts, disbursements, webhook handler |
| Database | `db/main` | Supabase migrations, RLS policies, Realtime config, seed data |

If your change touches more than one area, open it against the area it **primarily** belongs to, and mention the cross-area impact in the PR description.

---

## Questions?

If you are unsure about where something belongs or how to structure a change, open a draft PR and ask for input before finishing the work. It is much easier to course-correct early.
