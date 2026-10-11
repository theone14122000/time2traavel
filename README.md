# Time to Travel

Neo-brutalist travel agency website for **Time to Travel** (Kasumpti, Shimla, Himachal Pradesh).
Next.js App Router + TypeScript + Tailwind CSS v4 + Prisma/MySQL + Auth.js v5, deployable to Vercel.

Public site: destinations, packages, trip planner, reviews, FAQs, contact/enquiry forms.
Admin panel at `/admin` for all content. **No mock data anywhere** — every listing, review,
count and contact detail comes from the database, and empty/unpublished content renders
brutalist empty states instead of placeholders.

---

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, `src/proxy.ts` instead of `middleware.ts`) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`src/app/globals.css` tokens: cream/ink, lemon `#ffe500`, hard offset shadows, Archivo Black + Inter) |
| Motion | Framer Motion (`Reveal`/`StaggerGroup`, reduced-motion aware) + CSS ticker marquee |
| Database | Prisma 6 + MySQL |
| Auth | Auth.js v5 (NextAuth) credentials + bcrypt, JWT sessions, admin gated by `src/proxy.ts` + `requireAdmin()` |
| Forms | React Hook Form + Zod 4 (+ `@hookform/resolvers`), honeypot fields |
| UI | shadcn-style primitives rebuilt in the brutalist language (`src/components/ui/*`) |
| Toasts | Sonner |
| Lint | ESLint 10 flat config (`eslint.config.mjs`) with `eslint-config-next` |

---

## Getting started

```bash
npm install
cp .env.example .env      # then edit values
npm run db:migrate        # applies prisma/migrations (needs a running MySQL)
npm run db:seed           # creates admin user + SiteSettings singleton
npm run dev               # http://localhost:3000
```

Local production check:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run build       # prisma generate && next build
npm start
```

### Environment (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `mysql://USER:PASSWORD@HOST:PORT/DB` |
| `NEXT_PUBLIC_SITE_URL` | yes in prod | absolute URLs (sitemap, OG, canonical) |
| `AUTH_SECRET` | yes | session signing (`openssl rand -base64 32`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | for seed | admin login created by `npm run db:seed` |
| `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL` | optional | e-mail notifications on new enquiries; unset → stored in DB only |
| `CLOUDINARY_*` | optional | image uploads; unset → local `/public/uploads` (dev only — on Vercel use Cloudinary or another external store) |
| `RATE_LIMIT_EXCLUDE` | optional | comma-separated IPs bypassing rate limits |

---

## Content model (all admin-managed)

- **Destinations** — slug, state/region, summary, description, best time to visit, gallery, SEO, publish/feature/order.
- **Packages** — pricing, duration, destination relation, highlights/inclusions/exclusions, day-by-day itinerary, gallery, SEO.
- **Reviews** — submitted publicly, stored `PENDING`, shown only after admin `APPROVED`.
- **FAQs** — question/answer/category/published/order.
- **Inquiries** — every form writes an `Inquiry` row (general / trip plan / package / destination),
  admin can filter, open details, change status (`NEW → CONTACTED → CLOSED`) and export CSV.
- **SiteSettings** singleton — contact channels, socials, hero/meta/OG, footer note.
  Phone/WhatsApp/social links are **hidden on the site until configured**.
- **PageContent** keys — `home.hero` (`data: {"instruction": "..."}`),
  `home.whyChooseUs` (`data: [{"title","description"}]`), `about.story|founder|mission`,
  `legal.privacy|terms`.
- **Newsletter subscribers**, **Media assets**.

Seeding never invents content: it only creates the admin user, the settings singleton
(factual name/address), and no destinations/packages/reviews/faqs.

---

## Admin

1. Visit `/admin` → redirected to `/admin/login` by `src/proxy.ts` (cookie presence check);
   the panel layout re-verifies the JWT with `requireAdmin()` on every request, and every
   mutating server action re-checks auth.
2. Sign in with the seeded credentials.
3. Modules: dashboard (real counts only), destinations, packages, reviews moderation,
   inquiries (+ CSV export), FAQs, newsletter, media, site settings, page content.

Route layout:

```
src/app/admin/login/page.tsx        # public
src/app/admin/(panel)/layout.tsx    # requireAdmin() + sidebar/topbar
src/app/admin/(panel)/...           # dashboard, CRUD, moderation, settings
src/actions/admin/*.ts              # all guarded server actions
```

---

## Migrations without a local database

This project was built on a machine with no MySQL server. The initial migration was generated
offline:

```powershell
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script `
  | Out-File -FilePath prisma\migrations\0_init\migration.sql -Encoding utf8
```

(`prisma/migrations/migration_lock.toml` pins `provider = "mysql"`.)
Apply it against a real database with `npm run db:migrate` (or `npm run db:deploy` in CI/Vercel).

Every read goes through `safeQuery()` in `src/lib/data/*`, so the site **builds and renders
without a database** (empty states), which is also why `npm run build` succeeds offline.

---

## Deploying to Vercel

1. Import the repo; framework preset **Next.js** (no custom build config needed).
2. Add env vars: `DATABASE_URL` (e.g. PlanetScale/Neon-for-MySQL/RDS), `NEXT_PUBLIC_SITE_URL`,
   `AUTH_SECRET`, seed vars, optional Resend/Cloudinary.
3. First deploy: run `npm run db:migrate && npm run db:seed` once (Vercel build step, CI job, or locally against the production DB).
4. Storage notes: on serverless, local `/public/uploads` is ephemeral — configure Cloudinary
   for media, and e-mail notifications require `RESEND_API_KEY`.

---

## Structure

```
prisma/            schema.prisma, migrations/0_init, seed.ts
src/app/(public)/  home, destinations, packages, about, contact, privacy, terms
src/app/admin/     login + (panel) group
src/app/api/       auth callback, admin CSV exports
src/components/    ui (kit) · shared · layout · forms · home · destinations · packages · about · admin
src/actions/       public form actions, auth, admin CRUD (all auth-checked)
src/lib/           auth, guards, seo, email, rate-limit, utils, data/ (safe accessors)
src/schemas/       public + admin zod schemas
```

## Verification status

- `npm run typecheck` — clean
- `npm run lint` — 0 errors (4 benign `react-hooks/incompatible-library` warnings on `form.watch`)
- `npm run build` — 26 routes, green (DB-less environment; DB errors are swallowed by `safeQuery`)
- Production smoke test: all public routes 200, unknown route 404, `/admin` redirects to login

## Notes

- Blog module was intentionally skipped (not part of the brief).
- No fabricated business content: known facts are limited to the company name, the Kasumpti
  (Shimla) office address and the founder's name — everything else is admin-entered.
