/** Route-level loading skeleton for the protected app (shown while server
 *  components stream). Keeps layout stable instead of a blank flash. */
export default function AppLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
