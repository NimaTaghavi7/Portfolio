# پورتفولیوی شخصی نیما تقوی

وب‌سایت پورتفولیوی شخصی **Nima Taghavi — Frontend Developer | Web Designer** با معماری کامل فرانت‌اند و بک‌اند، طراحی مونوکروم نقره‌ای، پشتیبانی کامل از فارسی/انگلیسی و RTL/LTR، و پنل مدیریت برای ویرایش تمام محتوای سایت.

- دامنه اصلی: `https://nimataghavi.ir`
- زبان پیش‌فرض: انگلیسی (`en`) در مسیر `/`
- زبان دوم: فارسی (`fa`) در مسیر `/fa`
- عنوان حرفه‌ای: `Frontend Developer | Web Designer`

> این پروژه از یک مخزن اولیه بازسازی شده است، اما تمام هویت، محتوا، تصاویر، متادیتا، لینک‌ها و داده‌های مالک قبلی حذف شده‌اند. تاریخچه Git حفظ شده و بازنویسی نشده است.

---

## ۱. امکانات

- طراحی Silver / Monochrome / Minimal با دو پوسته `silver-dark` (پیش‌فرض) و `silver-light` با بافت براق، فلزی و لایه‌های آلومینیومی
- پشتیبانی کامل فارسی و انگلیسی با `next-intl`، مسیرهای locale-aware و `hreflang`
- تشخیص/جابه‌جایی خودکار RTL و LTR، فونت محلی Vazirmatn + Inter
- صفحه اصلی شامل Hero با نمایشگر ماکاپ، Marquee انگلیسی، آمار متحرک، مهارت‌ها، پروژه‌ها، درباره من، تایم‌لاین اختیاری تجربه/تحصیلات و فرم تماس
- بخش یادداشت‌ها (Notes) دو زبانه با Markdown
- فرم تماس واقعی با اعتبارسنجی سمت کلاینت و سرور، Honeypot، Rate Limit و ذخیره در PostgreSQL
- پنل مدیریت کامل: پروفایل، متن‌های صفحه اصلی، مهارت‌ها، دسته‌بندی‌ها، پروژه‌ها، تجربه، تحصیلات، آمار، پیام‌ها، یادداشت‌ها، رسانه، SEO و حساب کاربری
- آپلود تصویر/PDF با ذخیره در PostgreSQL (سازگار با Vercel/Netlify)
- احراز هویت NextAuth با Credentials + bcrypt + JWT، محافظت در Middleware و بررسی مجدد سمت سرور
- SEO: متادیتای دو زبانه، Open Graph، Twitter Card، JSON-LD، Sitemap، Robots، Canonical و `hreflang`
- امنیت: هدرهای امنیتی، CSP، اعتبارسنجی Zod، محدودیت نرخ، جلوگیری از path traversal و XSS
- تصاویر Placeholder قابل جایگزینی؛ هیچ تجربه/تحصیلات/آمار/پروژه واقعی‌ای از خودمان نساخته‌ایم

---

## ۲. تکنولوژی‌ها

| لایه | تکنولوژی |
| --- | --- |
| فریم‌ورک | Next.js 15.5.29 (App Router) + React 19 |
| زبان | TypeScript (strict) |
| استایل | Tailwind CSS 4 + DaisyUI 5 |
| انیمیشن | GSAP + `@gsap/react` + React Three Fiber (Hero 3D، فقط دسکتاپ) |
| i18n | `next-intl` 4 |
| تم | `next-themes` |
| بک‌اند | Server Actions + Route Handlers |
| ORM | Prisma ORM 7 (`prisma-client` + `@prisma/adapter-pg`) |
| دیتابیس | PostgreSQL (لوکال: `prisma dev`؛ پروداکشن: Neon/Supabase/Netlify DB/هر Postgres مدیریت‌شده) |
| احراز هویت | NextAuth 4 (Credentials) + bcrypt + JWT |
| اعتبارسنجی | Zod + React Hook Form |
| آیکون‌ها | lucide-react (بدون وابستگی به API خارجی) |

---

## ۳. ساختار پروژه

```text
app/
  [locale]/
    layout.tsx                 # html lang/dir، فونت‌ها، Providerها، JSON-LD
    (site)/                    # صفحات عمومی + Header/Footer/Preloader
      page.tsx
      notes/
    (admin)/dashboard/         # پنل مدیریت (محافظت‌شده)
    (auth)/auth/signin/        # ورود مدیر
    error.tsx, loading.tsx, not-found.tsx
  api/
    auth/[...nextauth]/route.ts
    contact/route.ts
  og/route.tsx                 # تصویر Open Graph (PNG)
  uploads/[filename]/route.ts  # سرو رسانه‌های ذخیره‌شده در PostgreSQL
  robots.ts, sitemap.ts
components/
  site/                        # Header، Footer، زبان، تم، سکشن‌های صفحه اصلی
  admin/                       # فرم‌ها، ناوبری و اجزای پنل
  providers/                   # Theme/Auth Provider
i18n/                          # routing، request config و navigation
messages/fa.json, en.json      # رشته‌های رابط کاربری
lib/
  content/site.ts              # کوئری‌های محتوا و localized fallback
  admin/actions/               # Server Actions پنل
  auth/                        # NextAuth و session helpers
  db/prisma.ts                 # Prisma singleton
  email/                       # Resend (اختیاری)
  security/rate-limit.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
public/
  images/placeholders/         # تصاویر Placeholder
  fonts/                       # فونت TTF مخصوص OG
  icon.svg
```

---

## ۴. پیش‌نیازها

- Node.js **22.12 یا بالاتر** (توصیه: 22.20)
- npm
- برای توسعه لوکال: هیچ Docker یا سرویس جداگانه‌ای لازم نیست؛ `prisma dev` یک PostgreSQL جاسازی‌شده اجرا می‌کند.
- برای پروداکشن: یک دیتابیس PostgreSQL مدیریت‌شده

---

## ۵. راه‌اندازی سریع (لوکال)

```bash
npm install
```

`postinstall` به‌صورت خودکار Prisma Client را تولید می‌کند.

### ۵.۱. اجرای دیتابیس لوکال

```bash
npm run db:dev
```

این دستور `prisma dev --detach --name portfolio` را اجرا می‌کند و دو رشته اتصال چاپ می‌کند:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable..."
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:51215/template1?sslmode=disable"
```

برای دیدن دوباره آدرس‌ها:

```bash
npm run db:dev:status
```

### ۵.۲. ساخت `.env.local`

```bash
cp .env.example .env.local
```

سپس مقادیر را پر کنید. حداقل موارد لازم:

```env
DATABASE_URL="<URL چاپ‌شده توسط prisma dev>"
SHADOW_DATABASE_URL="<URL shadow چاپ‌شده>"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<یک رشته تصادفی>"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="<یک رمز قوی حداقل ۱۲ کاراکتر>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

تولید `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> `ADMIN_PASSWORD` فقط توسط اسکریپت Seed استفاده می‌شود. در محیط توسعه اگر خالی باشد، اسکریپت یک رمز تصادفی می‌سازد و فقط یک‌بار چاپ می‌کند. در محیط production، برای اولین Seed، `ADMIN_EMAIL` و `ADMIN_PASSWORD` الزامی‌اند تا هیچ رمزی در لاگ‌های deployment چاپ نشود. هیچ رمز پیش‌فرضی در پروژه وجود ندارد.

### ۵.۳. مایگریشن و داده اولیه

```bash
npm run db:migrate
npm run db:seed
```

### ۵.۴. اجرا

```bash
npm run dev
```

- سایت: `http://localhost:3000`
- فارسی: `http://localhost:3000/fa`
- ورود مدیر: `http://localhost:3000/auth/signin`

> اگر `prisma dev` را متوقف کنید، سایت نمی‌تواند به دیتابیس وصل شود. با `npm run db:dev` دوباره اجرا کنید. داده‌ها با نام `portfolio` حفظ می‌شوند.

---

## ۶. متغیرهای محیطی

| متغیر | الزامی | توضیح |
| --- | --- | --- |
| `DATABASE_URL` | بله | رشته اتصال PostgreSQL |
| `SHADOW_DATABASE_URL` | فقط لوکال | برای `prisma migrate dev` |
| `NEXTAUTH_URL` | بله | آدرس سایت؛ در پروداکشن باید `https://` باشد |
| `NEXTAUTH_SECRET` | بله | کلید امضای JWT (تصادفی و محرمانه) |
| `ADMIN_EMAIL` | برای Seed | ایمیل ورود مدیر |
| `ADMIN_PASSWORD` | خیر | رمز اولیه مدیر؛ اگر خالی باشد تولید می‌شود |
| `ADMIN_NAME` | خیر | نام نمایشی مدیر |
| `NEXT_PUBLIC_SITE_URL` | بله در پروداکشن | `https://nimataghavi.ir` برای Canonical/Sitemap/OG |
| `RESEND_API_KEY` | خیر | فعال‌سازی ایمیل اعلان تماس |
| `CONTACT_NOTIFY_EMAIL` | خیر | ایمیل دریافت اعلان |
| `CONTACT_FROM_EMAIL` | خیر | فرستنده Resend |

`.env.local` در `.gitignore` است و نباید Commit شود. فقط `.env.example` بدون مقدار واقعی نگهداری می‌شود.

---

## ۷. مدل داده

مدل‌ها در `prisma/schema.prisma`:

- `User` — مدیر (Role: `ROOT` / `ADMIN`)، رمز Hash شده با bcrypt
- `SiteSettings` — تک‌رکورد تنظیمات: نام، عنوان حرفه‌ای، Bio/About دو زبانه، تماس، شبکه‌های اجتماعی، SEO، تصاویر، نمایش آمار
- `SiteText` — متن‌های قابل ویرایش صفحه اصلی با کلید ثابت (`hero.heading`, `marquee.items`, ...)
- `SkillGroup` / `Skill` — گروه‌های مهارت و آیتم‌ها
- `ProjectCategory` / `Project` — دسته‌بندی و پروژه دو زبانه، تصویر، ابزارها، لینک‌ها، وضعیت انتشار و پرچم Placeholder
- `Experience` / `Education` — تایم‌لاین دو زبانه (به‌صورت پیش‌فرض خالی)
- `Stat` — چهار آمار واقعی: ۳+ سال تجربه، ۲۰+ پروژه، ۱۰+ مشتری راضی و ۵+ تکنولوژی (قابل ویرایش در پنل)
- `ContactMessage` — پیام‌های فرم تماس با وضعیت `NEW/READ/ARCHIVED`
- `Note` — یادداشت دو زبانه Markdown
- `Media` — فایل‌های آپلودشده (تصویر/PDF) به‌صورت `Bytes` در PostgreSQL

### اجرای مایگریشن

توسعه:

```bash
npm run db:migrate
```

پروداکشن:

```bash
npm run db:deploy
```

مایگریشن‌ها در `prisma/migrations/` نگهداری می‌شوند و بین لوکال و پروداکشن مشترک‌اند.

---

## ۸. پنل مدیریت

آدرس: `/auth/signin` (انگلیسی) یا `/fa/auth/signin`

- ساخت اولیه حساب فقط با `npm run db:seed` انجام می‌شود؛ ثبت‌نام عمومی وجود ندارد.
- بعد از اولین ورود، از بخش **Account** رمز را تغییر دهید.
- تمام عملیات مدیریتی با Server Actions و بررسی `requireAdmin()` انجام می‌شود. Middleware فقط لایه اول است.

بخش‌ها:

| مسیر | کاربرد |
| --- | --- |
| `/dashboard` | نمای کلی و آخرین پیام‌ها |
| `/dashboard/profile` | نام، عنوان، Bio/About، تصاویر، رزومه، تماس، شبکه‌های اجتماعی |
| `/dashboard/content` | متن‌های صفحه اصلی (دو زبانه) |
| `/dashboard/skills` | گروه‌های مهارت |
| `/dashboard/projects` | افزودن/ویرایش/حذف پروژه‌ها و آپلود تصویر |
| `/dashboard/categories` | دسته‌بندی پروژه‌ها |
| `/dashboard/experience` | تجربه کاری |
| `/dashboard/education` | تحصیلات |
| `/dashboard/stats` | آمار اختیاری |
| `/dashboard/messages` | پیام‌های فرم تماس |
| `/dashboard/notes` | یادداشت‌های دو زبانه |
| `/dashboard/media` | مدیریت فایل‌های آپلودشده |
| `/dashboard/settings` | SEO، تصویر OG و نمایش آمار |
| `/dashboard/account` | مشخصات حساب و تغییر رمز |

---

## ۹. API

### `POST /api/contact`

ورودی JSON:

```json
{
  "name": "Full name",
  "email": "user@example.com",
  "subject": "Subject",
  "message": "Message text (min 10 chars)",
  "locale": "fa",
  "website": ""
}
```

- `website` فیلد Honeypot است و باید خالی بماند.
- محدودیت: ۵ درخواست در ۱۰ دقیقه به ازای IP و ۳ درخواست به ازای ایمیل.
- پاسخ موفق: `{ "ok": true, "emailSent": false }`
- خطای اعتبارسنجی: `400` با `{ "ok": false, "code": "validation", "fields": {...} }`
- محدودیت نرخ: `429`

### `GET /uploads/[id]`

سرو فایل‌های ذخیره‌شده در جدول `Media` با `Content-Type` صحیح و کش immutable.

### تصویر Open Graph

تصویر پیش‌فرض در `/images/placeholders/og.png` قرار دارد و از پنل **Settings** قابل جایگزینی است. برای هر زبان، همان تصویر یا تصویر آپلودشده استفاده می‌شود.

### احراز هویت

`/api/auth/[...nextauth]` توسط NextAuth مدیریت می‌شود. عملیات مدیریتی از Server Actions استفاده می‌کنند و به‌صورت مستقیم قابل فراخوانی از کلاینت بدون نشست معتبر نیستند.

---

## ۱۰. دوزبانه بودن و RTL

- تمام مسیرهای عمومی با `[locale]` ساخته شده‌اند.
- انگلیسی: `/` و فارسی: `/fa`
- انتخاب زبان در هدر، در کوکی `NEXT_LOCALE` ذخیره می‌شود.
- `<html lang dir>` بر اساس locale تنظیم می‌شود.
- از ویژگی‌های منطقی CSS (`ms/me`, `ps/pe`, `start/end`) استفاده شده است.
- رشته‌های رابط کاربری در `messages/fa.json` و `messages/en.json` هستند.
- محتوای قابل ویرایش در دیتابیس به‌صورت جفت فیلدهای `Fa/En` ذخیره می‌شود. اگر یکی خالی باشد، از زبان دیگر استفاده می‌شود.
- برای افزودن زبان جدید: `i18n/routing.ts`، فایل messages و ساختار `[locale]` را گسترش دهید (نیاز به تغییرات کد دارد).

---

## ۱۱. تصاویر و Placeholderها

- تصویر پروفایل پیش‌فرض: `/images/placeholders/avatar.svg`
- تصویر Hero: `/images/placeholders/hero.svg`
- تصاویر پروژه‌های نمونه: `/images/placeholders/project-1..3.svg`
- تصویر OG پیش‌فرض: `/images/placeholders/og.png` (از پنل Settings قابل جایگزینی)
- آیکون: `/icon.svg`

جایگزینی:

1. از پنل **Profile** تصویر آواتار/Hero را آپلود کنید یا URL بدهید.
2. برای پروژه‌ها از فرم پروژه تصویر آپلود کنید (JPG/PNG/WebP/AVIF/GIF، حداکثر ۴ مگابایت).
3. رزومه PDF را از **Profile** آپلود کنید یا URL بدهید. تا زمان آماده شدن فایل اصلی، `/public/resume.pdf` یک Placeholder مشخص است و دکمه دانلود همیشه کار می‌کند. زبان دکمه در نسخه فارسی «دانلود رزومه» و در نسخه انگلیسی «Download Resume» است.
4. آپلودها در PostgreSQL ذخیره می‌شوند و روی Vercel/Netlify نیز باقی می‌مانند. برای حجم‌های بزرگ‌تر، `lib/admin/uploads.ts` را به S3/R2/Cloudinary منتقل کنید؛ قرارداد URL `/uploads/<id>` حفظ می‌شود.

> پروژه‌های اولیه با برچسب واضح **Sample / نمونه** هستند و هیچ ادعای کار واقعی ندارند. تجربه و تحصیلات اولیه خالی‌اند؛ آمار اولیه (۳+، ۲۰+، ۱۰+، ۵+) توسط مالک پروژه ارائه شده و از پنل قابل ویرایش است.

---

## ۱۲. مدیریت پروژه‌ها و محتوا

- **Projects** → افزودن پروژه: Slug یکتا، عنوان/توضیح فارسی و انگلیسی، دسته‌بندی، ابزارها، تصویر، لینک‌ها، ترتیب و وضعیت انتشار.
- برای پروژه واقعی، تیک **Sample / placeholder** را بردارید.
- ترتیب نمایش: `featured` ابتدا، سپس `order`، سپس تاریخ.
- پروژه‌های منتشرنشده در سایت نمایش داده نمی‌شوند.
- تجربه/تحصیلات/آمار فقط وقتی رکورد منتشرشده داشته باشند نمایش داده می‌شوند.
- متن‌های صفحه اصلی از **Homepage copy** قابل ویرایش‌اند.

---

## ۱۳. شبکه‌های اجتماعی

فیلدهای GitHub، LinkedIn، Instagram، Telegram، X، Dribbble و Behance در **Profile** خالی هستند. تا زمانی که مقدار معتبر `https://` وارد نشود، هیچ لینک/دکمه‌ای در سایت رندر نمی‌شود. ایمیل و تلفن هم فقط در صورت پر بودن نمایش داده می‌شوند.

---

## ۱۴. ایمیل تماس (اختیاری)

پیام‌ها همیشه در PostgreSQL ذخیره می‌شوند. برای فعال‌سازی ایمیل اعلان:

```env
RESEND_API_KEY="re_..."
CONTACT_NOTIFY_EMAIL="you@example.com"
CONTACT_FROM_EMAIL="Portfolio <noreply@yourdomain.com>"
```

سپس سرور را ری‌استارت کنید. بدون این مقادیر، `emailSent` در پاسخ `false` است و هیچ ایمیل جعلی‌ای ارسال نمی‌شود. دامنه فرستنده باید در Resend تأیید شده باشد.

---

## ۱۵. استقرار (Neon / Vercel)

### ۱۵.۱. Neon

پروژه با Neon CLI به پروژه و شاخه `production` متصل شده است:

```bash
neon login
neon init -y --org-id <org> --project-id <project> --branch production --services postgres
neon deploy
neon env pull
```

`neon deploy` متغیرهای زیر را در `.env.local` قرار می‌دهد:

- `DATABASE_URL` — اتصال **pooled** برای Runtime
- `DATABASE_URL_UNPOOLED` — اتصال **direct** برای مایگریشن، dump و replication
- `NEON_BRANCH`

برنامه برای کوئری‌ها از `DATABASE_URL` (pooled) و برای مایگریشن‌ها از `DATABASE_URL_UNPOOLED` استفاده می‌کند.

### ۱۵.۲. متغیرهای محیطی پروداکشن (Vercel)

در Vercel این مقادیر را تنظیم کنید:

```env
DATABASE_URL="<Neon pooled URL>"
DATABASE_URL_UNPOOLED="<Neon direct URL>"
NEXTAUTH_URL="https://nimataghavi.ir"
NEXTAUTH_SECRET="<random>"
NEXT_PUBLIC_SITE_URL="https://nimataghavi.ir"
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."   # فقط برای اولین Seed
RESEND_API_KEY=""      # اختیاری
CONTACT_NOTIFY_EMAIL=""
CONTACT_FROM_EMAIL=""
```

> `NEXTAUTH_URL` باید با `https://` شروع شود تا کوکی‌های امن فعال شوند. `DATABASE_URL` را از اتصال Pooled و `DATABASE_URL_UNPOOLED` را از اتصال مستقیم Neon بردارید. اگر Neon Vercel Integration را فعال کنید، معمولاً این متغیرها به‌صورت خودکار اضافه می‌شوند.

### ۱۵.۳. مایگریشن و Seed

`vercel-build` به‌صورت خودکار این کارها را انجام می‌دهد:

```json
"vercel-build": "prisma generate && prisma migrate deploy && prisma db seed && next build"
```

Seed ایدمپوتنت است: مدیر موجود را تغییر نمی‌دهد، تنظیمات کاربر را بازنویسی نمی‌کند و آمار را فقط در صورت خالی بودن ایجاد می‌کند.

برای اجرای دستی روی Neon:

```bash
npm run db:deploy
npm run db:seed
```

> `db:deploy` از `DATABASE_URL_UNPOOLED` استفاده می‌کند. اجرای مایگریشن روی اتصال Pooled توصیه نمی‌شود. برای اولین Seed روی production، `ADMIN_EMAIL` و `ADMIN_PASSWORD` باید تنظیم شده باشند؛ در غیر این صورت Seed با خطای واضح متوقف می‌شود.

### ۱۵.۴. نکات

- Node.js 22.12+ (در `package.json` تعریف شده است).
- `postinstall` و `build` هر دو `prisma generate` را اجرا می‌کنند.
- Prisma Client به‌صورت Lazy ساخته می‌شود؛ بنابراین `next build` بدون `DATABASE_URL` هم می‌تواند صفحات را جمع‌آوری کند، اما Runtime برای دیتابیس به آن نیاز دارد.
- آپلودها در PostgreSQL هستند، بنابراین روی فایل‌سیستم Serverless مشکلی ایجاد نمی‌کنند.
- `prisma dev` فقط ابزار توسعه است و در پروداکشن استفاده نمی‌شود.

---

## ۱۶. امنیت

- رمزها با bcrypt (cost 12) Hash می‌شوند.
- نشست JWT با `httpOnly`, `sameSite=lax`, `secure` در HTTPS.
- Rate Limit برای ورود (per-email و per-IP) و فرم تماس.
- Server Actions همیشه `requireAdmin()` را قبل از نوشتن صدا می‌زنند.
- اعتبارسنجی Zod/دستی برای ورودی‌ها؛ URLهای خارجی با whitelist پروتکل.
- آپلود فقط JPG/PNG/WebP/GIF/AVIF/PDF با بررسی Magic Bytes و محدودیت ۴ مگابایت؛ SVG آپلود نمی‌شود.
- مسیر فایل‌ها با `path` کنترل می‌شود؛ path traversal مسدود است.
- Markdown با `react-markdown` بدون `rehype-raw` رندر می‌شود (HTML خام اجرا نمی‌شود).
- JSON-LD با escape `<` تولید می‌شود.
- هدرهای امنیتی و CSP در `next.config.ts`.
- هیچ Secret یا رمز پیش‌فرضی در مخزن نیست.

---

## ۱۷. دستورات

```bash
npm run dev            # توسعه با Turbopack
npm run build          # Prisma generate + Next build
npm start              # اجرای Build تولیدی
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run db:dev         # PostgreSQL جاسازی‌شده لوکال
npm run db:dev:status  # نمایش URLهای دیتابیس لوکال
npm run db:dev:stop    # توقف دیتابیس لوکال
npm run db:generate    # تولید Prisma Client
npm run db:migrate     # مایگریشن توسعه
npm run db:deploy      # مایگریشن پروداکشن
npm run db:seed        # داده اولیه / ساخت مدیر
npm run db:studio      # Prisma Studio
```

---

## ۱۸. تست‌های انجام‌شده

- `npx tsc --noEmit` — بدون خطا
- `npm run lint` — بدون خطای مسدودکننده
- `npm run build` — موفق
- اجرای `prisma dev`، مایگریشن `init` و `media`، و Seed
- ورود/خروج مدیر، محافظت از `/dashboard` (307 به Sign in)
- ایجاد/ویرایش/حذف پروژه، دسته‌بندی، آمار و یادداشت از پنل
- آپلود تصویر و سرو آن از `/uploads/<id>` (ذخیره در PostgreSQL)
- فرم تماس end-to-end: ذخیره پیام، نمایش در پنل، تغییر وضعیت، حذف
- Rate Limit فرم تماس (درخواست چهارم: 429) و Honeypot
- `/` انگلیسی LTR و `/fa` فارسی RTL، سوییچ زبان و ماندگاری کوکی
- سوییچ تم تیره/روشن و ماندگاری `localStorage`
- `sitemap.xml`، `robots.txt`، تصویر OG، Canonical و `hreflang`
- اجرای موفق `next dev --turbopack`

---

## ۱۹. محدودیت‌ها و موارد باقی‌مانده

- **ایمیل تماس** تا زمانی که `RESEND_API_KEY` و `CONTACT_NOTIFY_EMAIL` واقعی تنظیم نشوند غیرفعال است (پیام‌ها ذخیره می‌شوند).
- **محتوای شخصی** (بیوگرافی واقعی، عکس، پروژه‌ها، تجربه، تحصیلات، آمار، شبکه‌های اجتماعی) باید توسط شما از پنل اضافه شود. هیچ داده‌ای از خودمان ساخته نشده است.
- **رابط پنل مدیریت** انگلیسی است؛ تمام محتوای قابل ویرایش دو زبانه است.
- **آپلود** حداکثر ۴ مگابایت و در PostgreSQL است. برای کتابخانه بزرگ‌تر از Object Storage استفاده کنید.
- **پروژه‌های اولیه** Sample هستند و باید جایگزین شوند.
- **تاریخچه Git** و Remote اصلی (`origin`) حفظ شده‌اند؛ در صورت نیاز Remote را به مخزن خودتان تغییر دهید.

---

## ۲۰. گزارش نهایی پیاده‌سازی

- معماری فرانت‌اند از Next.js App Router بدون تغییر فریم‌ورک حفظ و بازسازی شد.
- تمام مسیرهای عمومی به `[locale]` منتقل شدند و `next-intl` با `localePrefix: as-needed` پیاده شد.
- MongoDB/Mongoose و آداپتور Mongo حذف و Prisma 7 + PostgreSQL جایگزین شد.
- ۱۳ مدل داده، دو مایگریشن، Seed ایدمپوتنت و مدیر امن پیاده شد.
- پنل مدیریت کامل با ۱۴ بخش، Server Actions، اعتبارسنجی، تأیید حذف، اعلان و آپلود رسانه ساخته شد.
- سیستم تم دوگانه، فونت‌های محلی و رفع خطای Google Fonts/Turbopack انجام شد.
- SEO دو زبانه، Sitemap، Robots، OG داینامیک، JSON-LD و `hreflang` پیاده شد.
- هویت مالک قبلی از کد، محتوا، تصاویر، PDF، متادیتا، Seed و مستندات حذف شد.
- تست‌های Build، TypeScript، Lint، دیتابیس، احراز هویت، CRUD، آپلود، فرم تماس، RTL/LTR، تم و SEO اجرا شدند.

برای هرگونه توسعه بعدی، ابتدا `README` و ساختار `lib/content` + `lib/admin/actions` را بررسی کنید.
