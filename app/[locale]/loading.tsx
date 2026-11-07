export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-live="polite">
      <div className="h-3 w-24 animate-pulse rounded-full bg-base-content/10" />
      <div className="mt-6 h-12 w-3/4 max-w-xl animate-pulse rounded-xl bg-base-content/10" />
      <div className="mt-4 h-4 w-2/3 max-w-lg animate-pulse rounded-full bg-base-content/5" />
      <div className="mt-6 h-4 w-1/2 max-w-md animate-pulse rounded-full bg-base-content/5" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
