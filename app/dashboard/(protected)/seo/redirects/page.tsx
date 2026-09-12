import { Button } from "@/components/ui/button";
import { ArrowDown, ChevronDown, Search, Trash2 } from "lucide-react";
import { CmsFieldShell, CmsInput } from "@/modules/cms/components/form";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsRouteToast } from "@/modules/cms/components/route-toast";
import { CmsEmptyState } from "@/modules/cms/components/state-blocks";
import { createRedirectAction, deleteRedirectAction, updateRedirectAction } from "@/modules/redirects/actions";
import { getRedirectList } from "@/modules/redirects/queries";

type RedirectsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RedirectsPage({ searchParams }: RedirectsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, redirects } = await getRedirectList(rawParams);

  return <div className="mx-auto max-w-[1280px] space-y-6">
    <CmsPageHeader title="إعادة التوجيه" description="اربط المسارات القديمة بوجهاتها النهائية مع إبقاء عناوين الموقع المنشورة قابلة للوصول." />
    <CmsRouteToast cleanHref="/dashboard/seo/redirects" error={typeof rawParams.error === "string" ? rawParams.error : undefined} success={typeof rawParams.success === "string" ? rawParams.success : undefined} />

    <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-rest)] sm:p-5" aria-labelledby="new-redirect-title">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h2 className="text-lg font-semibold" id="new-redirect-title">إضافة إعادة توجيه</h2>
        <p className="max-w-[55ch] text-sm leading-[1.6] text-text-secondary">استخدم مسارات داخلية كاملة. يمنع النظام التكرار والحلقات ويختصر السلاسل.</p>
      </div>
      <form action={createRedirectAction} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <CmsFieldShell id="new-source" label="مسار المصدر"><CmsInput className="text-left" dir="ltr" id="new-source" name="sourcePath" placeholder="/services/old-slug" required /></CmsFieldShell>
        <CmsFieldShell id="new-destination" label="مسار الوجهة"><CmsInput className="text-left" dir="ltr" id="new-destination" name="destinationPath" placeholder="/services/new-slug" required /></CmsFieldShell>
        <Button className="min-h-11" type="submit">إضافة المسار</Button>
      </form>
    </section>

    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]" aria-labelledby="redirect-list-title">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" id="redirect-list-title">المسارات الحالية</h2>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{pagination.totalItems.toLocaleString("ar-SA")} مسار</p>
        </div>
        <form action="/dashboard/seo/redirects" className="flex gap-2">
          <CmsFieldShell id="redirect-search" label="البحث في المسارات">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <CmsInput className="w-full pe-3 ps-9 text-left sm:w-80" defaultValue={params.q} dir="ltr" id="redirect-search" name="q" type="search" />
            </div>
          </CmsFieldShell>
          <Button className="min-h-11 self-end" variant="outline" type="submit">بحث</Button>
        </form>
      </div>

      {redirects.length === 0 ? <div className="p-4"><CmsEmptyState title={params.q ? "لا توجد نتائج" : "لا توجد مسارات معاد توجيهها"} description={params.q ? "غيّر عبارة البحث لعرض مسارات أخرى." : "ستظهر هنا المسارات المضافة يدويًا أو الناتجة عن تغيير رابط منشور."} /></div> : <>
      <div className="hidden overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:block" tabIndex={0} aria-label="جدول إعادة التوجيه">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead className="bg-secondary/70 text-right text-xs text-text-secondary"><tr><th className="px-4 py-3 font-semibold">المصدر</th><th className="px-4 py-3 font-semibold">الوجهة</th><th className="w-20 px-4 py-3 text-center font-semibold">الرمز</th><th className="w-64 px-4 py-3 font-semibold">الإجراءات</th></tr></thead>
          <tbody>{redirects.map((item) => <tr className="border-t border-border align-top" key={item.id}>
            <td colSpan={4} className="p-0"><form action={updateRedirectAction} className="grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_80px_256px] items-start gap-3 p-3">
              <input name="redirectId" type="hidden" value={item.id} />
              <label><span className="sr-only">مسار المصدر</span><CmsInput aria-label="مسار المصدر" className="w-full text-left" defaultValue={item.sourcePath} dir="ltr" name="sourcePath" required /></label>
              <label><span className="sr-only">مسار الوجهة</span><CmsInput aria-label="مسار الوجهة" className="w-full text-left" defaultValue={item.destinationPath} dir="ltr" name="destinationPath" required /></label>
              <span className="inline-flex min-h-11 items-center justify-center justify-self-center rounded-md bg-info-soft px-2 text-xs font-bold tabular-nums text-info" dir="ltr" title="إعادة توجيه دائمة">301</span>
              <div className="flex items-start gap-2">
                <Button className="min-h-11" variant="outline" type="submit">حفظ</Button>
                <details className="group min-w-0 flex-1">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-3 text-sm font-semibold text-destructive outline-none transition-colors hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-destructive/30 marker:content-none">
                    <span className="flex items-center gap-2"><Trash2 className="size-4" aria-hidden="true" />حذف</span>
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="mt-2 rounded-md border border-destructive/20 bg-danger-soft p-3 text-destructive">
                    <p className="mb-3 text-xs leading-[1.6]">سيعود مسار المصدر إلى سلوكه السابق. أكد الحذف للمتابعة.</p>
                    <Button className="min-h-11 w-full" formAction={deleteRedirectAction} name="redirectId" value={item.id} variant="destructive">تأكيد حذف المسار</Button>
                  </div>
                </details>
              </div>
            </form></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="divide-y divide-border md:hidden">{redirects.map((item) => <form action={updateRedirectAction} className="grid gap-3 p-4" key={item.id}>
        <input name="redirectId" type="hidden" value={item.id} />
        <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-muted-foreground">إعادة توجيه دائمة</span><span className="inline-flex min-h-7 items-center rounded-md bg-info-soft px-2 text-xs font-bold tabular-nums text-info" dir="ltr">301</span></div>
        <label className="grid gap-1.5"><span className="text-xs font-semibold text-text-secondary">مسار المصدر</span><CmsInput className="w-full text-left" defaultValue={item.sourcePath} dir="ltr" name="sourcePath" required /></label>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowDown className="size-4" aria-hidden="true" /><span>يُنقل الزائر إلى</span></div>
        <label className="grid gap-1.5"><span className="text-xs font-semibold text-text-secondary">مسار الوجهة</span><CmsInput className="w-full text-left" defaultValue={item.destinationPath} dir="ltr" name="destinationPath" required /></label>
        <div className="mt-1 grid gap-2"><Button className="min-h-11" type="submit" variant="outline">حفظ التغييرات</Button><details className="group"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md text-sm font-semibold text-destructive outline-none hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-destructive/30"><Trash2 className="size-4" />حذف<ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary><div className="mt-2 rounded-md border border-destructive/20 bg-danger-soft p-3"><p className="text-xs leading-5 text-destructive">سيعود مسار المصدر إلى سلوكه السابق.</p><Button className="mt-3 w-full" formAction={deleteRedirectAction} name="redirectId" value={item.id} variant="destructive">تأكيد حذف المسار</Button></div></details></div>
      </form>)}</div>
      </>}
    </section>
    <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/seo/redirects" query={{ q: params.q }} />
  </div>;
}
