import type { TimelineItem } from "@/lib/content/site";

export default function Timeline({
  heading,
  items,
  presentLabel,
}: {
  heading: string;
  items: TimelineItem[];
  presentLabel: string;
}) {
  return (
    <div className="reveal">
      <h3 className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-base-content/40">
        {heading}
      </h3>
      <ol className="mt-6 border-s border-base-content/10 ps-6">
        {items.map((item) => (
          <li key={item.id} className="relative pb-8 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -start-[1.72rem] top-1.5 size-2.5 rounded-full border border-base-content/30 bg-base-100"
            />
            <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-base-content/40">
              <span className="tabular-nums">
                {item.startDate} — {item.current ? presentLabel : item.endDate || ""}
              </span>
              {item.isPlaceholder && <span className="placeholder-badge">Sample</span>}
            </div>
            <p className="mt-2 font-semibold tracking-tight text-base-content/85">
              {item.title}
            </p>
            {item.organization && (
              <p className="mt-0.5 text-sm text-base-content/50">{item.organization}</p>
            )}
            {item.description && (
              <p className="mt-2 text-sm leading-relaxed text-base-content/50">
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
