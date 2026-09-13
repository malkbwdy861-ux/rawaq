export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="جار تحميل البيانات" className="mx-auto w-full max-w-[1360px] animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-9 w-44 rounded bg-secondary" />
        <div className="h-4 w-72 max-w-full rounded bg-secondary" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-16 border-b border-border bg-secondary/50" />
        {Array.from({ length: 7 }, (_, index) => <div className="h-16 border-b border-border last:border-0" key={index} />)}
      </div>
    </div>
  );
}
