const overviewItems = [
  ["الخدمات المنشورة", "-"],
  ["المشاريع المنشورة", "-"],
  ["المقالات المنشورة", "-"],
  ["المسودات", "-"],
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold leading-[1.45] md:text-[1.75rem]">
          نظرة عامة
        </h1>
        <p className="max-w-[55ch] text-base leading-[1.65] text-[oklch(42%_0.018_150)]">
          لوحة تشغيل أولية لإدارة المحتوى. ستظهر العدادات وروابط التحرير عند تنفيذ وحدات المحتوى في المراحل التالية.
        </p>
      </div>

      <section
        aria-label="ملخص المحتوى"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {overviewItems.map(([label, value]) => (
          <article
            className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-5"
            key={label}
          >
            <p className="text-sm font-medium text-[oklch(50%_0.014_150)]">
              {label}
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-5">
        <h2 className="text-xl font-semibold leading-[1.5]">حالة المرحلة</h2>
        <p className="mt-2 max-w-[55ch] text-base leading-[1.65] text-[oklch(42%_0.018_150)]">
          المصادقة وحماية لوحة التحكم جاهزة. إنشاء المسودات والنشر والأرشفة ستضاف ضمن مراحل إدارة المحتوى اللاحقة.
        </p>
      </section>
    </div>
  );
}
