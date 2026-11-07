# Deployment checklist (Vercel + Neon)

## What is already prepared

- Prisma schema and all four migrations exist in `prisma/migrations`.
- The Neon `production` branch has the schema, migration history, admin user, site settings, copy, skills, categories, sample projects and statistics.
- `npm run build`, `tsc --noEmit` and the local backend smoke tests pass.
- `vercel-build` runs `prisma generate`, `prisma migrate deploy`, `prisma db seed` and `next build`.

## 1. Push the code

The Vercel project builds from GitHub. Commit and push the current working tree before deploying.

Do not commit `.env.local`, `.neon`, or any secret.

## 2. Vercel environment variables

Add these to Production, Preview and Development as appropriate:

```env
DATABASE_URL="<Neon pooled connection string>"
DATABASE_URL_UNPOOLED="<Neon direct connection string>"
NEXTAUTH_URL="https://nimataghavi.ir"
NEXTAUTH_SECRET="<random value, at least 32 characters>"
NEXT_PUBLIC_SITE_URL="https://nimataghavi.ir"
ADMIN_EMAIL="admin@nimataghavi.ir"
ADMIN_PASSWORD="<the admin password>"
ADMIN_NAME="Nima Taghavi"
```

Optional email notifications:

```env
RESEND_API_KEY=""
CONTACT_NOTIFY_EMAIL=""
CONTACT_FROM_EMAIL="Portfolio Contact <onboarding@resend.dev>"
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are only needed for the first seed. They can be removed after the first successful production deployment, but keeping them is safe because the seed never changes an existing admin password.

## 3. Neon

The production branch is already migrated and seeded. If the database is reset, run:

```bash
npm run db:deploy
npm run db:seed
```

Use the direct (`DATABASE_URL_UNPOOLED`) connection for migrations.

## 4. Vercel build

Vercel should use the `vercel-build` script automatically. The build must have `DATABASE_URL` and `DATABASE_URL_UNPOOLED` available.

Expected successful output includes:

```text
✓ Compiled successfully
✓ Generating static pages
```

## 5. Domain

1. Add `nimataghavi.ir` and `www.nimataghavi.ir` in Vercel → Domains.
2. Apply the DNS records Vercel shows.
3. Keep `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` on `https://nimataghavi.ir`.
4. Redeploy after changing environment variables.

## 6. Post-deploy checks

- `GET /api/health` returns `{"status":"ok"}`
- `/` and `/fa` return 200
- `/notes` and `/fa/notes` return 200
- Theme toggle works in both languages
- Footer links open the right locale and section
- Footer `04 Resume` downloads a PDF
- `/dashboard` redirects to sign-in when signed out
- Sign in with the admin account and open every dashboard page
- Create/update/delete a test project and note, then remove the test data
- Submit the contact form and confirm the message appears in `/dashboard/messages`
- Upload an image and a PDF from the dashboard
- Check `/sitemap.xml` and `/robots.txt`
- Confirm no horizontal overflow on mobile, tablet and desktop
- Run Lighthouse on `/` and `/fa`

## Known remaining risks

- `npm audit` reports six moderate findings in the TypeScript ESLint toolchain (development only). The PostCSS high-severity finding is resolved with the `postcss` override.
- Resend needs a verified sending domain for reliable production email delivery.
- The bundled `public/resume.pdf` is still a placeholder; replace it with the real résumé or upload one from the dashboard.
- If the Neon/Vercel network is unavailable, retry the deployment; the previous failure was transient.
