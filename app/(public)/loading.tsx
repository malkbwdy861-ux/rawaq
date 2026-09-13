export default function PublicLoading() {
  return (
    <main aria-busy="true" aria-label="جار تحميل الصفحة" className="min-h-screen bg-background">
      <div className="public-container animate-pulse py-14 md:py-20">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="mt-5 h-12 w-full max-w-2xl rounded bg-muted md:h-16" />
        <div className="mt-4 h-5 w-full max-w-xl rounded bg-muted" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div className="aspect-[4/3] rounded-2xl bg-muted" key={index} />)}
        </div>
      </div>
    </main>
  );
}
