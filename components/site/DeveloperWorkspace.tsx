"use client";

import {
  ChevronRight,
  Circle,
  Code2,
  FileCode2,
  FileText,
  Folder,
  GitBranch,
  Play,
  TerminalSquare,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/constants";

type WorkspaceFile = {
  id: string;
  name: string;
  path: string;
  group: string;
  language: string;
  lines: string[];
};

const FILES: WorkspaceFile[] = [
  {
    id: "hero",
    name: "hero.tsx",
    path: "app/(site)/hero.tsx",
    group: "app",
    language: "tsx",
    lines: [
      'import { Canvas } from "@react-three/fiber";',
      'import { project } from "@/lib/portfolio";',
      "",
      "export function Hero() {",
      "  const identity = {",
      '    role: "frontend engineer",',
      '    focus: ["interfaces", "performance", "systems"],',
      "  };",
      "",
      "  return (",
      '    <section className="hero">',
      "      <Canvas>",
      '        <Bubbles count={2} material="chrome" />',
      "      </Canvas>",
      "      <h1>{identity.role}</h1>",
      "    </section>",
      "  );",
      "}",
    ],
  },
  {
    id: "content",
    name: "content.ts",
    path: "lib/content.ts",
    group: "lib",
    language: "ts",
    lines: [
      'export const stack = ["Next.js", "TypeScript", "React", "GSAP"];',
      "",
      "export const principles = {",
      '  motion: "purposeful",',
      '  layout: "responsive",',
      '  a11y: "default",',
      "};",
      "",
      "export function getFeatured(projects: Project[]) {",
      "  return projects.filter((project) => project.featured);",
      "}",
    ],
  },
  {
    id: "health",
    name: "route.ts",
    path: "app/api/health/route.ts",
    group: "api",
    language: "ts",
    lines: [
      'import { prisma } from "@/lib/db/prisma";',
      "",
      "export async function GET() {",
      "  try {",
      "    await prisma.$queryRaw`SELECT 1`;",
      '    return Response.json({ status: "ok" });',
      "  } catch {",
      '    return Response.json({ status: "unavailable" }, { status: 503 });',
      "  }",
      "}",
    ],
  },
  {
    id: "bubbles",
    name: "Bubbles.tsx",
    path: "components/3d/Bubbles.tsx",
    group: "components",
    language: "tsx",
    lines: [
      '"use client";',
      "",
      "export function Bubbles({ count = 2 }) {",
      "  return (",
      "    <group>",
      "      {Array.from({ length: count }).map((_, index) => (",
      "        <mesh key={index} position={[index * 1.2, 0, 0]}>",
      "          <sphereGeometry args={[1, 64, 64]} />",
      "          <MeshDistortMaterial distort={0.3} speed={1.1} />",
      "        </mesh>",
      "      ))}",
      "    </group>",
      "  );",
      "}",
    ],
  },
];

const KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "function",
  "return",
  "const",
  "let",
  "async",
  "await",
  "new",
  "if",
  "else",
  "try",
  "catch",
  "filter",
  "map",
  "true",
  "false",
  "null",
  "count",
  "type",
  "interface",
]);

const TOKEN_PATTERN =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.*$|\b(?:import|from|export|function|return|const|let|async|await|new|if|else|try|catch|filter|map|true|false|null|count|type|interface)\b|\b\d+(?:\.\d+)?\b)/g;

function Line({ line }: { line: string }) {
  const parts = line.split(TOKEN_PATTERN).filter((part) => part !== undefined);
  return (
    <>
      {parts.map((part, index) => {
        let className = "";
        if (part.startsWith("//")) className = "token-comment";
        else if (/^["'`]/.test(part)) className = "token-string";
        else if (KEYWORDS.has(part)) className = "token-keyword";
        else if (/^\d+(?:\.\d+)?$/.test(part)) className = "token-number";
        else if (/^<\/?[A-Z]/.test(part)) className = "token-tag";
        return (
          <span key={`${index}-${part}`} className={className}>
            {part}
          </span>
        );
      })}
    </>
  );
}

const COMMAND_OUTPUT: Record<string, string[]> = {
  help: [
    "available commands:",
    "  npm run build      compile the production bundle",
    "  npm run dev        start the local development server",
    "  git status         inspect the working tree",
    "  curl /api/health   check the database connection",
    "  ls                 list workspace files",
    "  clear              clear the terminal",
  ],
  "npm run build": [
    "▲ Next.js 16.3.8",
    "✓ Compiled successfully",
    "✓ Type checking",
    "✓ Generating static pages",
    "Route (app)                    Size",
    "○ /                            static",
    "✓ ready in 2.4s",
  ],
  "npm run dev": [
    "▲ Next.js 16.3.8",
    "- Local:   http://localhost:3000",
    "✓ Ready in 1.2s",
    "✓ Compiled / in 340ms",
  ],
  "git status": [
    "On branch main",
    "Your branch is up to date with 'origin/main'.",
    "nothing to commit, working tree clean",
  ],
  "curl /api/health": ['{"status":"ok"}', "HTTP/1.1 200 OK"],
  ls: FILES.map((file) => `  ${file.path}`),
};

export default function DeveloperWorkspace({ locale }: { locale: Locale }) {
  const isFa = locale === "fa";
  const [activeId, setActiveId] = useState("hero");
  const [openTabs, setOpenTabs] = useState(["hero", "content", "health"]);
  const [command, setCommand] = useState("");
  const [terminal, setTerminal] = useState<string[]>([
    "workspace initialized",
    "$ npm run dev",
    "▲ Next.js 16.3.8",
    "✓ Ready in 1.2s",
    "",
    "type `help` to inspect available commands",
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const activeFile = FILES.find((file) => file.id === activeId) ?? FILES[0];

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminal]);

  const groups = useMemo(() => {
    return FILES.reduce<Record<string, WorkspaceFile[]>>((result, file) => {
      result[file.group] = [...(result[file.group] || []), file];
      return result;
    }, {});
  }, []);

  const openFile = (id: string) => {
    setActiveId(id);
    setOpenTabs((tabs) => (tabs.includes(id) ? tabs : [...tabs, id]));
  };

  const closeTab = (id: string) => {
    const index = openTabs.indexOf(id);
    const next = openTabs.filter((tab) => tab !== id);
    setOpenTabs(next);
    if (id === activeId && next.length > 0) {
      setActiveId(next[Math.max(0, index - 1)]);
    }
  };

  const runCommand = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (value === "clear") {
      setTerminal([]);
      setCommand("");
      return;
    }
    const output = COMMAND_OUTPUT[value];
    setTerminal((lines) => [
      ...lines,
      `$ ${value}`,
      ...(output || [`command not found: ${value}`, "type `help` for available commands"]),
      "",
    ]);
    setCommand("");
  };

  return (
    <section
      id="workspace"
      dir={isFa ? "rtl" : "ltr"}
      className="container-page mt-24 text-start sm:mt-32"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-base-content/40">
            {isFa ? "محیط توسعه" : "developer.workspace"}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {isFa
              ? "یک محیط توسعه واقعی، داخل سایت"
              : "A real developer environment, inside the site."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-base-content/50">
            {isFa
              ? "فایل‌ها را باز کن، بین تب‌ها جابه‌جا شو و چند دستور نمونه را اجرا کن."
              : "Open files, switch between tabs and run a few representative commands."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-base-content/12 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-base-content/45">
            <Code2 size={11} aria-hidden="true" /> {isFa ? "تعاملی" : "interactive"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-base-content/12 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-base-content/45 sm:inline-flex">
            <GitBranch size={11} aria-hidden="true" /> {isFa ? "شاخه اصلی" : "main"}
          </span>
        </div>
      </div>

      <div
        dir="ltr"
        className="mt-9 overflow-hidden rounded-2xl border border-base-content/15 bg-[#070707] text-left shadow-[0_40px_100px_-55px_rgba(0,0,0,0.95)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-white/35" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/12" />
            <span className="ms-3 font-mono text-[0.6rem] tracking-[0.12em] text-white/40">
              nima@workspace
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-white/30">
            <span className="inline-flex items-center gap-1.5">
              <Circle size={7} className="fill-white/70 text-white/70" aria-hidden="true" />
              connected
            </span>
            <span className="hidden sm:inline">typescript / tsx</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="hidden border-e border-white/10 bg-white/[0.025] p-3 lg:block">
            <p className="px-2 pb-2 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-white/25">
              explorer
            </p>
            <div className="flex flex-col gap-3">
              {Object.entries(groups).map(([group, files]) => (
                <div key={group}>
                  <div className="flex items-center gap-1.5 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-white/35">
                    <ChevronRight size={10} aria-hidden="true" />
                    <Folder size={11} aria-hidden="true" />
                    {group}
                  </div>
                  <div className="mt-1 flex flex-col">
                    {files.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => openFile(file.id)}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-start font-mono text-[0.62rem] transition ${
                          activeId === file.id
                            ? "bg-white/10 text-white/90"
                            : "text-white/35 hover:bg-white/5 hover:text-white/65"
                        }`}
                      >
                        <FileCode2 size={11} aria-hidden="true" className="text-white/45" />
                        {file.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-white/[0.02] px-2 pt-2">
              {openTabs.map((id) => {
                const file = FILES.find((item) => item.id === id);
                if (!file) return null;
                return (
                  <div
                    key={id}
                    className={`group flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3 py-2 font-mono text-[0.6rem] ${
                      activeId === id
                        ? "border-white/15 bg-[#0b0b0b] text-white/85"
                        : "border-transparent text-white/35 hover:text-white/60"
                    }`}
                  >
                    <button type="button" onClick={() => setActiveId(id)}>
                      {file.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => closeTab(id)}
                      aria-label={`Close ${file.name}`}
                      className="text-white/20 transition hover:text-white/70"
                    >
                      <X size={11} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              <div className="min-w-0 border-b border-white/10 xl:border-b-0 xl:border-e">
                <div className="max-h-[430px] overflow-auto p-4 sm:p-5">
                  <div className="min-w-max font-mono text-[0.68rem] leading-6 sm:text-[0.72rem]">
                    {activeFile.lines.map((line, index) => (
                      <div key={`${activeFile.id}-${index}`} className="flex gap-4">
                        <span className="w-5 shrink-0 select-none text-end text-white/15">
                          {index + 1}
                        </span>
                        <span className="whitespace-pre text-white/70">
                          <Line line={line} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2 font-mono text-[0.54rem] uppercase tracking-[0.12em] text-white/25">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText size={10} aria-hidden="true" />
                    {activeFile.path}
                  </span>
                  <span>{activeFile.language} · utf-8 · ln {activeFile.lines.length}</span>
                </div>
              </div>

              <div className="flex min-h-[240px] flex-col bg-[#050505]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-white/40">
                    <TerminalSquare size={12} aria-hidden="true" className="text-white/60" />
                    terminal
                  </span>
                  <button
                    type="button"
                    onClick={() => setTerminal([])}
                    className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-white/25 transition hover:text-white/60"
                  >
                    clear
                  </button>
                </div>

                <div
                  ref={terminalRef}
                  className="max-h-[260px] flex-1 overflow-auto p-4 font-mono text-[0.64rem] leading-6 text-white/55"
                  aria-live="polite"
                >
                  {terminal.map((line, index) => (
                    <div
                      key={`${index}-${line}`}
                      className={
                        line.startsWith("$")
                          ? "text-white/85"
                          : line.startsWith("✓") || line.startsWith("▲")
                            ? "text-white/60"
                            : line.includes("not found")
                              ? "text-white/35"
                              : ""
                      }
                    >
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-white/10 p-3">
                  {["npm run build", "git status", "curl /api/health", "help"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => runCommand(item)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 font-mono text-[0.54rem] text-white/40 transition hover:border-white/25 hover:text-white/75"
                    >
                      <Play size={8} aria-hidden="true" />
                      {item}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    runCommand(command);
                  }}
                  className="flex items-center gap-2 border-t border-white/10 px-3 py-2"
                >
                  <span className="font-mono text-[0.68rem] text-white/70">$</span>
                  <input
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    placeholder={isFa ? "دستور را تایپ کن..." : "type a command..."}
                    className="min-w-0 flex-1 bg-transparent font-mono text-[0.64rem] text-white/70 outline-none placeholder:text-white/20"
                    aria-label="Terminal command"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
