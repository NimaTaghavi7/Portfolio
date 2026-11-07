import { Sparkles } from "lucide-react";

export default function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="relative z-10 mt-6 overflow-hidden border-y border-base-content/10 bg-base-200/20 py-5 select-none">
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((item) => (
              <div key={`${copy}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap text-lg font-medium tracking-tight text-base-content/45 sm:text-xl">
                  {item}
                </span>
                <Sparkles
                  size={16}
                  aria-hidden="true"
                  className="mx-7 text-base-content/25 motion-safe:animate-[spin_14s_linear_infinite] sm:mx-10"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
