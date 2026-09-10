import Image from "next/image";

import { Button } from "@/components/ui/button";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { deleteMediaAction, updateMediaMetadataAction, uploadMediaAction } from "@/modules/media/actions";
import { mediaConfig } from "@/modules/media/config";
import { prisma } from "@/server/db/prisma";

type MediaPageSearchParams = Promise<{
  q?: string;
  success?: string;
  error?: string;
}>;

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
});

export default async function MediaPage({ searchParams }: { searchParams: MediaPageSearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const mediaItems = await prisma.media.findMany({
    where: query
      ? {
          OR: [
            { originalFilename: { contains: query, mode: "insensitive" } },
            { altText: { contains: query, mode: "insensitive" } },
            { caption: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div className="space-y-8">
      <CmsPageHeader
        title="الوسائط"
        description="ارفع صوراً آمنة إلى التخزين الدائم، وأعد استخدام الوسائط الموجودة في وحدات المحتوى القادمة."
      />

      {params.success ? (
        <CmsStateBlock tone="success" title="اكتملت العملية" description={params.success} />
      ) : null}
      {params.error ? (
        <CmsStateBlock tone="error" title="تعذرت العملية" description={params.error} />
      ) : null}

      <section className="grid gap-4 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <form action="" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="grid gap-2">
            <span className="text-[0.8125rem] font-semibold leading-[1.55]">بحث في الوسائط</span>
            <input
              className="min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
              defaultValue={query}
              name="q"
              placeholder="اسم الملف أو الوصف أو التعليق"
              type="search"
            />
          </label>
          <div className="flex items-end">
            <Button className="min-h-10 w-full rounded-[4px] md:w-auto" type="submit">
              تطبيق البحث
            </Button>
          </div>
        </form>

        <form action={uploadMediaAction} className="grid gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(96.5%_0.009_120)] p-4">
          <label className="grid gap-2">
            <span className="text-[0.8125rem] font-semibold leading-[1.55]">رفع صورة جديدة</span>
            <input
              accept={mediaConfig.allowedMimeTypes.join(",")}
              className="min-h-12 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base file:ml-3 file:min-h-8 file:rounded-[4px] file:border-0 file:bg-[oklch(37%_0.075_155)] file:px-3 file:text-[0.8125rem] file:font-semibold file:text-[oklch(99%_0.004_100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]"
              name="file"
              required
              type="file"
            />
          </label>
          <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
            الأنواع المسموحة: JPEG و PNG و WebP. الحد الأقصى {mediaConfig.maxUploadBytes / 1024 / 1024} ميجابايت.
          </p>
          <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">
            رفع الوسيط
          </Button>
        </form>
      </section>

      {mediaItems.length === 0 ? (
        <CmsEmptyState
          title={query ? "لا توجد نتائج مطابقة" : "لا توجد وسائط بعد"}
          description={query ? "غيّر عبارة البحث لعرض وسائط أخرى." : "ابدأ برفع صورة آمنة إلى التخزين الدائم لتصبح قابلة لإعادة الاستخدام."}
        />
      ) : (
        <section aria-label="متصفح الوسائط" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {mediaItems.map((item) => (
            <article className="overflow-hidden rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]" key={item.id}>
              <div className="relative aspect-square bg-[oklch(95%_0.012_110)]">
                <Image
                  alt={item.altText ?? ""}
                  className="object-contain p-2"
                  fill
                  sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={item.url}
                />
              </div>

              <div className="space-y-4 p-4">
                <div className="space-y-1">
                  <h2 className="break-words text-base font-semibold leading-[1.55]" dir="ltr">
                    {item.originalFilename}
                  </h2>
                  <p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">
                    <span dir="ltr">{item.mimeType}</span> · <span className="tabular-nums">{formatBytes(item.sizeBytes)}</span>
                    {item.width && item.height ? (
                      <> · <span dir="ltr">{item.width} x {item.height}</span></>
                    ) : null}
                  </p>
                  <p className="text-xs font-medium leading-[1.65] text-[oklch(50%_0.014_150)]">
                    أضيف في {dateFormatter.format(item.createdAt)}
                  </p>
                </div>

                <form action={updateMediaMetadataAction} className="grid gap-3">
                  <input name="id" type="hidden" value={item.id} />
                  <label className="grid gap-2">
                    <span className="text-[0.8125rem] font-semibold leading-[1.55]">النص البديل</span>
                    <input
                      className="min-h-10 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
                      defaultValue={item.altText ?? ""}
                      name="altText"
                      placeholder="وصف عربي موجز عند الحاجة"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[0.8125rem] font-semibold leading-[1.55]">التعليق</span>
                    <textarea
                      className="min-h-24 rounded-[4px] border border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] px-3 py-2 text-base outline-none focus:border-[oklch(37%_0.075_155)] focus:ring-2 focus:ring-[oklch(51%_0.09_155)] focus:ring-offset-2"
                      defaultValue={item.caption ?? ""}
                      name="caption"
                      placeholder="تعليق اختياري للوسيط"
                    />
                  </label>
                  <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">
                    حفظ الوصف
                  </Button>
                </form>

                <form action={deleteMediaAction}>
                  <input name="id" type="hidden" value={item.id} />
                  <Button
                    className="min-h-10 w-full rounded-[4px] border-[oklch(46%_0.16_28)] bg-[oklch(94%_0.025_28)] text-[oklch(46%_0.16_28)] hover:bg-[oklch(94%_0.025_28)]"
                    type="submit"
                    variant="outline"
                  >
                    حذف الوسيط إذا لم يكن مستخدماً
                  </Button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  const formatter = new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });

  if (bytes < 1024 * 1024) {
    return `${formatter.format(bytes / 1024)} كيلوبايت`;
  }

  return `${formatter.format(bytes / 1024 / 1024)} ميجابايت`;
}
