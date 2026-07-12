
# Jaaziel Trading Enterprise

A custom online marketplace and point-of-sale system for Jaaziel Trading Enterprise — built as a tenant-ready platform so additional businesses can be onboarded in the future without a schema rebuild.
---

## What This Project Does

- **Public storefront** — customers browse products, add to cart (toggleable), and check out for delivery or in-store pickup
- **Point of Sale (POS)** — cashier-facing screen for ringing up in-person sales
- **Order management** — staff view for tracking and updating online order fulfillment
- **Admin dashboard** — full control over products, categories, orders, staff, and reports
- **Superadmin tools** — cross-tenant oversight (single tenant active today, structured for more later)

---

## Tech Stack

- **Frontend:** Vite + React + TypeScript, Tailwind CSS, shadcn/ui (DaisyUI used sparingly where needed)
- **Backend:** Hono (deployed as Vercel serverless functions)
- **Auth:** Better Auth (email/password only in v1)
- **ORM:** Drizzle
- **Database:** Neon (Postgres)
- **File storage:** ImageKit
- **Payments:** Paystack (schema-ready, gateway wired in a later version)
- **Testing:** Vitest, React Testing Library, Playwright
- **Package manager:** pnpm
- **Hosting:** Vercel (frontend + backend)
- **CI:** GitHub Actions (runs on pull requests)

---

## Project Structure

```
jaaziel-trading-enterprise/
├── apps/
│   ├── web/       # Vite + React frontend
│   └── api/       # Hono backend
├── packages/
│   └── shared/    # shared types/constants
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/workflows/
└── README.md
```

---

## Getting Started

Planned setup steps:
1. Clone the repository
2. Install dependencies with `pnpm install`
3. Copy `.env.example` to `.env` in both `apps/web` and `apps/api`, and fill in required values
4. Run database migrations
5. Start the development servers

---

## Environment Variables

Each app (`apps/web`, `apps/api`) has its own `.env.example` file listing required variables. Never commit real `.env` files.

---

## Testing

- Unit/integration tests: Vitest (+ React Testing Library for components)
- End-to-end tests: Playwright

Tests are written alongside each feature as it is built, not retrofitted afterward.

---

## Contributing / Development Workflow

- Branch naming: `feature/short-description`, `fix/short-description`
- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
- All changes go through a pull request; CI runs typecheck, tests, and build before merge
- Deployment to Vercel happens automatically on push (separate from CI)

---

## Roles

| Role | Description |
|---|---|
| Superadmin | Developer — cross-tenant system oversight |
| Admin | Business owner — full control of their tenant |
| Cashier | In-store POS sales only |
| Staff | Online order fulfillment queue only |

---

## Status

This project is in active planning/early development.