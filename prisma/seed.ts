/**
 * Idempotent seed for the Nima Taghavi portfolio.
 *
 * - Creates the initial admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
 * - Creates the site settings singleton, editable copy, skills, categories and
 *   three clearly-labelled sample projects.
 * - Does not invent experience, education, statistics, clients or social links.
 *
 * Usage: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { hash } from "bcrypt";
import crypto from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, Role } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local first.");
}

const adapter = new PrismaPg({ connectionString, max: 1 });
const prisma = new PrismaClient({ adapter });

const SITE_URL = "https://nimataghavi.ir";
const TITLE_EN = "Frontend Developer | Web Designer";
const TITLE_FA = "Frontend Developer | Web Designer";

const texts = [
  {
    key: "hero.kicker",
    label: "Hero kicker",
    valueFa: "توسعه‌دهنده فرانت‌اند | طراح وب",
    valueEn: "FRONTEND DEVELOPER | WEB DESIGNER",
  },
  {
    key: "hero.heading",
    label: "Hero heading",
    valueFa: "سلام، من نیما هستم",
    valueEn: "Hi, I'm Nima",
  },
  {
    key: "hero.intro",
    label: "Hero introduction",
    valueFa:
      "توسعه‌دهنده فرانت‌اند و طراح وب با تمرکز بر ساخت تجربه‌های دیجیتال سریع، مینیمال و واکنش‌گرا.",
    valueEn:
      "Frontend developer and web designer focused on building fast, minimal and responsive digital experiences.",
  },
  {
    key: "hero.cta",
    label: "Hero call to action",
    valueFa: "بیایید صحبت کنیم",
    valueEn: "Let's talk",
  },
  {
    key: "hero.resume",
    label: "Résumé button label",
    valueFa: "دانلود رزومه",
    valueEn: "Download Resume",
  },
  {
    key: "marquee.items",
    label: "Marquee items (comma separated)",
    valueFa:
      "توسعه فرانت‌اند, طراحی وب, React, Next.js, TypeScript, Tailwind CSS, UI/UX, دسترس‌پذیری",
    valueEn:
      "Frontend Development, Web Design, React, Next.js, TypeScript, Tailwind CSS, UI/UX, Accessibility",
  },
  {
    key: "skills.kicker",
    label: "Skills kicker",
    valueFa: "مهارت‌های من",
    valueEn: "MY SKILLS",
  },
  {
    key: "skills.subtitle",
    label: "Skills heading",
    valueFa: "ابزارهایی که با آن‌ها کار می‌کنم",
    valueEn: "Tools I Work With",
  },
  {
    key: "skills.description",
    label: "Skills description",
    valueFa: "مجموعه‌ای از ابزارها و تکنولوژی‌هایی که در طراحی و توسعه استفاده می‌کنم.",
    valueEn:
      "A selection of tools and technologies I use for design and development.",
  },
  {
    key: "projects.kicker",
    label: "Projects kicker",
    valueFa: "پروژه‌های من",
    valueEn: "MY PROJECTS",
  },
  {
    key: "projects.subtitle",
    label: "Projects heading",
    valueFa: "نمونه‌کارها",
    valueEn: "Selected Work",
  },
  {
    key: "projects.description",
    label: "Projects description",
    valueFa:
      "پروژه‌های نمونه؛ این موارد جایگزین هستند و از پنل مدیریت با کارهای واقعی شما عوض می‌شوند.",
    valueEn:
      "Sample projects. These are placeholders and should be replaced with your real work from the admin dashboard.",
  },
  {
    key: "about.kicker",
    label: "About kicker",
    valueFa: "درباره من",
    valueEn: "ABOUT ME",
  },
  {
    key: "about.subtitle",
    label: "About heading",
    valueFa: "بیشتر با من آشنا شوید",
    valueEn: "Get To Know Me",
  },
  {
    key: "about.description",
    label: "About short description",
    valueFa: "رویکرد من به طراحی و توسعه",
    valueEn: "How I approach design and development",
  },
  {
    key: "contact.kicker",
    label: "Contact kicker",
    valueFa: "ارتباط با من",
    valueEn: "CONTACT ME",
  },
  {
    key: "contact.subtitle",
    label: "Contact heading",
    valueFa: "بیایید با هم کار کنیم",
    valueEn: "Let's Work Together",
  },
  {
    key: "contact.description",
    label: "Contact description",
    valueFa: "برای همکاری، پیشنهاد پروژه یا هر سؤالی پیام بگذارید.",
    valueEn: "Reach out for collaborations, project ideas or any questions.",
  },
  {
    key: "notes.kicker",
    label: "Notes kicker",
    valueFa: "یادداشت‌ها",
    valueEn: "NOTES",
  },
  {
    key: "notes.description",
    label: "Notes description",
    valueFa: "یادداشت‌های کوتاه درباره توسعه وب، طراحی و ابزارهایی که امتحان می‌کنم.",
    valueEn:
      "Short notes about web development, design and the tools I try.",
  },
  {
    key: "footer.tagline",
    label: "Footer tagline",
    valueFa: "ساخته‌شده با دقت و علاقه.",
    valueEn: "Designed and built with care.",
  },
];

const skillGroups = [
  {
    id: "seed-group-frontend",
    nameFa: "توسعه فرانت‌اند",
    nameEn: "Frontend Development",
    icon: "code",
    order: 1,
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Tailwind CSS",
    ],
  },
  {
    id: "seed-group-design",
    nameFa: "طراحی رابط کاربری",
    nameEn: "UI & Web Design",
    icon: "pen-tool",
    order: 2,
    skills: [
      "Figma",
      "Responsive Design",
      "Design Systems",
      "Accessibility (a11y)",
    ],
  },
  {
    id: "seed-group-tools",
    nameFa: "ابزارها",
    nameEn: "Tools",
    icon: "wrench",
    order: 3,
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
  },
];

const categories = [
  { id: "seed-cat-web-app", slug: "web-app", nameFa: "وب اپلیکیشن", nameEn: "Web App", order: 1 },
  { id: "seed-cat-landing", slug: "landing-page", nameFa: "لندینگ پیج", nameEn: "Landing Page", order: 2 },
  { id: "seed-cat-ui", slug: "ui-concept", nameFa: "کانسپت رابط کاربری", nameEn: "UI Concept", order: 3 },
];

const stats = [
  {
    id: "seed-stat-experience",
    value: 3,
    suffix: "+",
    labelFa: "سال تجربه",
    labelEn: "Years of Experience",
    order: 1,
  },
  {
    id: "seed-stat-projects",
    value: 20,
    suffix: "+",
    labelFa: "پروژه تکمیل‌شده",
    labelEn: "Projects Completed",
    order: 2,
  },
  {
    id: "seed-stat-clients",
    value: 10,
    suffix: "+",
    labelFa: "مشتری راضی",
    labelEn: "Happy Clients",
    order: 3,
  },
  {
    id: "seed-stat-technologies",
    value: 5,
    suffix: "+",
    labelFa: "تکنولوژی مسلط",
    labelEn: "Technologies Mastered",
    order: 4,
  },
];

const projects = [
  {
    id: "seed-project-1",
    slug: "sample-project-portfolio-concept",
    titleFa: "پروژه نمونه — کانسپت پورتفولیو",
    titleEn: "Sample Project — Portfolio Concept",
    descriptionFa:
      "این یک پروژه نمونه است. توضیحات، تصویر و لینک‌های آن را از پنل مدیریت جایگزین کنید.",
    descriptionEn:
      "This is a sample project. Replace its description, image and links with your real work from the admin dashboard.",
    imageUrl: "/images/placeholders/project-1.svg",
    tools: ["Next.js", "TypeScript", "Tailwind CSS"],
    categoryId: "seed-cat-web-app",
    order: 1,
  },
  {
    id: "seed-project-2",
    slug: "sample-project-landing-page",
    titleFa: "پروژه نمونه — لندینگ پیج",
    titleEn: "Sample Project — Landing Page",
    descriptionFa:
      "این یک پروژه نمونه است. یک لندینگ پیج واکنش‌گرا با تمرکز بر تایپوگرافی و سرعت.",
    descriptionEn:
      "This is a sample project. A responsive landing page focused on typography and performance.",
    imageUrl: "/images/placeholders/project-2.svg",
    tools: ["React", "Figma", "CSS"],
    categoryId: "seed-cat-landing",
    order: 2,
  },
  {
    id: "seed-project-3",
    slug: "sample-project-dashboard-ui",
    titleFa: "پروژه نمونه — رابط داشبورد",
    titleEn: "Sample Project — Dashboard UI",
    descriptionFa:
      "این یک پروژه نمونه است. یک کانسپت رابط کاربری برای داشبورد با چیدمان مینیمال.",
    descriptionEn:
      "This is a sample project. A dashboard interface concept with a minimal layout.",
    imageUrl: "/images/placeholders/project-3.svg",
    tools: ["TypeScript", "Design System", "Figma"],
    categoryId: "seed-cat-ui",
    order: 3,
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    const adminCount = await prisma.user.count();
    if (process.env.NODE_ENV === "production" && adminCount === 0) {
      throw new Error(
        "ADMIN_EMAIL is required for the first production seed. Set it in the deployment environment."
      );
    }
    console.warn(
      "ADMIN_EMAIL is not set; skipping admin creation. Set it and run `npm run db:seed` again."
    );
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error("ADMIN_EMAIL is not a valid email address.");
  }
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { name: process.env.ADMIN_NAME || existing.name, role: Role.ROOT },
    });
    console.log(`Admin already exists: ${email} (no password change).`);
    return;
  }

  const providedPassword = process.env.ADMIN_PASSWORD;
  if (!providedPassword && process.env.NODE_ENV === "production") {
    // Never print a generated password into deployment build logs.
    throw new Error(
      "ADMIN_PASSWORD is required for the first production seed. Set it in the deployment environment."
    );
  }
  const password = providedPassword || crypto.randomBytes(15).toString("base64url");

  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME || "Nima Taghavi",
      email,
      passwordHash: await hash(password, 12),
      role: Role.ROOT,
    },
  });

  console.log("Admin account created.");
  console.log(`  Email: ${email}`);
  if (!providedPassword) {
    console.log(`  Password: ${password}`);
    console.log("  This password is shown only once. Store it safely.");
  } else {
    console.log("  Password: taken from ADMIN_PASSWORD.");
  }
}

async function main() {
  await seedAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      fullName: "Nima Taghavi",
      displayName: "Nima Taghavi",
      professionalTitleFa: TITLE_FA,
      professionalTitleEn: TITLE_EN,
      bioFa:
        "من نیما تقوی هستم؛ توسعه‌دهنده فرانت‌اند و طراح وب. روی ساخت رابط‌های کاربری سریع، مینیمال و واکنش‌گرا تمرکز می‌کنم و به جزئیات بصری، دسترس‌پذیری و کیفیت کد اهمیت می‌دهم.",
      bioEn:
        "I'm Nima Taghavi, a frontend developer and web designer. I focus on building fast, minimal and responsive interfaces, with care for visual detail, accessibility and code quality.",
      aboutFa:
        "من وب‌سایت‌های مدرن و کاربرپسند می‌سازم. تمرکز من روی فرانت‌اند، طراحی رابط کاربری و پیاده‌سازی دقیق طرح‌ها با React، Next.js، TypeScript و Tailwind CSS است. برای آشنایی بیشتر و دیدن نمونه‌کارهای واقعی، از بخش پروژه‌ها و پنل مدیریت استفاده کنید.",
      aboutEn:
        "I build modern, user-friendly websites. My focus is frontend development, interface design and turning designs into precise, maintainable code with React, Next.js, TypeScript and Tailwind CSS. Explore the projects section and admin dashboard to add real work.",
      email: "taghavinima807@gmail.com",
      phone: "09149539832",
      availability: false,
      availabilityFa: "وضعیت همکاری را از پنل مدیریت تنظیم کنید.",
      availabilityEn: "Set your availability from the admin dashboard.",
      seoTitleFa: "نیما تقوی — توسعه‌دهنده فرانت‌اند | طراح وب",
      seoTitleEn: "Nima Taghavi — Frontend Developer | Web Designer",
      seoDescriptionFa:
        "پورتفولیوی شخصی نیما تقوی، توسعه‌دهنده فرانت‌اند و طراح وب. پروژه‌ها، مهارت‌ها و یادداشت‌ها.",
      seoDescriptionEn:
        "Personal portfolio of Nima Taghavi, frontend developer and web designer. Projects, skills and notes.",
      keywordsFa: [
        "نیما تقوی",
        "توسعه‌دهنده فرانت‌اند",
        "طراح وب",
        "React",
        "Next.js",
        "TypeScript",
      ],
      keywordsEn: [
        "Nima Taghavi",
        "frontend developer",
        "web designer",
        "React",
        "Next.js",
        "TypeScript",
      ],
      ogImageUrl: "/images/placeholders/og.png",
      showStats: false,
    },
  });

  for (const text of texts) {
    await prisma.siteText.upsert({
      where: { key: text.key },
      update: { label: text.label },
      create: text,
    });
  }

  for (const group of skillGroups) {
    const { skills, ...groupData } = group;
    const existing = await prisma.skillGroup.findUnique({
      where: { id: groupData.id },
      select: { id: true },
    });
    // Never overwrite skills the owner has edited through the dashboard.
    if (existing) continue;

    await prisma.skillGroup.create({
      data: {
        ...groupData,
        skills: {
          create: skills.map((name, index) => ({
            name,
            order: index + 1,
          })),
        },
      },
    });
  }

  for (const category of categories) {
    const existing = await prisma.projectCategory.findUnique({
      where: { id: category.id },
      select: { id: true },
    });
    // Never overwrite category edits made through the dashboard.
    if (existing) continue;
    await prisma.projectCategory.create({ data: category });
  }

  for (const project of projects) {
    const { id, ...data } = project;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      // Never overwrite content the owner has edited.
      continue;
    }
    await prisma.project.create({
      data: {
        id,
        ...data,
        published: true,
        isPlaceholder: true,
      },
    });
  }

  // Seed the four statistics supplied by the owner, but never overwrite
  // statistics that have already been edited in the dashboard.
  const existingStats = await prisma.stat.count();
  if (existingStats === 0) {
    await prisma.stat.createMany({
      data: stats.map((stat) => ({
        ...stat,
        published: true,
        isPlaceholder: false,
      })),
    });
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { showStats: true },
    });
  }

  console.log("Seed complete.");
  console.log(`Site URL: ${SITE_URL}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
