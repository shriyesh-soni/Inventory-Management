# Submission

## Links

- **GitHub repository:** [https://github.com/shriyesh-soni/Inventory-Management]
- **Live application:** [https://inventory-management-jet-five.vercel.app/login]

## Notes for the reviewer

Backend and frontend are deployed on free tiers (Render and Vercel). First request may take 30-60 seconds to wake from idle. Database seeded with demo data: 2 manager accounts, 1 staff account, 4 locations, 15 items across categories, ~50 stock movements, several items below reorder level for alert testing.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@example.com | password123 |
| Staff | staff@example.com | password123 |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | Next.js 14, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Recharts | Type safety, modern framework, excellent component libraries, efficient data fetching |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL | Fast REST API, type-safe ORM, strong relational database for complex queries |
| Database | PostgreSQL on Supabase | Relational data, ACID transactions, referential integrity, free managed tier |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) | All free tiers, no credit card required, minimal setup |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | MANAGER/STAFF roles enforced server-side; location assignment for staff; password hashing |
| 2 | Items | Done | CRUD with archive/restore; categories; audit log for all changes; timeline view |
| 3 | Stock movements | Done | Receipt, issue, transfer (atomic), adjustment (requires reason); full history per item |
| 4 | Stock ledger | Done | Append-only immutable movements; on-hand computed from ledger; transfers atomic; adjustments validated |
| 5 | Location assignment | Done | Many-to-many staff-location mapping; staff scoped to locations; managers unrestricted |
| 6 | Finding items | Done | Server-side filtering (search, category, location, archived, belowReorder); sorting; pagination; all server-side |
| 7 | Bulk import/export | Done | CSV import for items and receipts with per-row error reporting; stock position export |
| 8 | Dashboard | Done | 4 KPI cards; stock by category chart; stock by location chart; 8-week movement volume chart |
| 9 | History immutable | Done | Combined timeline of audit logs + notes; no edit/delete; complete change history with old→new values |
| 10 | Low-stock alerts | Done | Alert badge in nav; dismiss functionality; re-trigger logic when stock rises then falls below reorder |

## Stretch goals

| Goal | Status | Notes |
|------|--------|-------|
| Barcode-friendly SKU lookup | Done | `GET /items/sku/:sku` endpoint for fast barcode scanner integration |
| Reorder suggestions | Done | `GET /items/reorder-suggestions` computes order quantity based on reorder level |
| Supplier records | Done | Supplier table with items linked; manager CRUD |

## How much time did you actually spend?

Estimated: ~12 hours
Actual: ~15 hours

| Phase                       | Estimate | Actual |
| --------------------------- | -------: | ------: |
| Backend setup & schema      |       2h |    2.5h |
| Backend auth & core modules |       4h |    4.5h |
| Dashboard & import/export   |       2h |    1.5h |
| Frontend setup & auth       |       2h |    1.5h |
| Frontend pages              |       4h |      4h |
| Testing & deployment        |       1h |      1h |
| **Total**                   |  **12h** | **~15h** |

Stock transfers, validation, and alert re-triggering took longer than expected. Simpler tasks (frontend auth, API integration, deployment) balanced out some overruns.

## What would you do next, with another 12 hours?

1. **Unit tests** (3 hrs) — Jest for backend, React Testing Library for frontend critical paths
2. **Advanced accessibility** (2 hrs) — WCAG AA compliance, keyboard navigation audit, screen reader testing
3. **Performance optimization** (2 hrs) — Bundle analysis, code splitting, database query optimization
4. **Email alerts digest** (2 hrs) — Daily low-stock email to managers
5. **Cycle count workflow** (2 hrs) — Reconciliation tool comparing physical count to ledger

## What are you least happy with in this codebase, and why?

Frontend UI iteration took longer than backend logic. Some components (ItemsTable, MovementForms) are verbose and could be abstracted into reusable patterns. Form validation error messaging could be more polished. No automated tests for critical paths means edge cases rely on manual testing. Database queries for dashboard aggregates could benefit from materialized views for better performance at scale.
