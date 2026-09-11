import { Button } from "@/components/ui/button";
import { CmsFieldShell, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsPaginationControls } from "@/modules/cms/components/pagination";
import { CmsEmptyState, CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { createRedirectAction, deleteRedirectAction, updateRedirectAction } from "@/modules/redirects/actions";
import { getRedirectList } from "@/modules/redirects/queries";

type RedirectsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RedirectsPage({ searchParams }: RedirectsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, redirects } = await getRedirectList(rawParams);

  return <div className="space-y-8">
    <CmsPageHeader title="إعادة التوجيه" description="حافظ على الروابط المنشورة القديمة بمسارات دائمة من المصدر إلى الوجهة النهائية. تُنشأ تغييرات الروابط المنشورة تلقائيًا هنا." />
    {typeof rawParams.success === "string" ? <CmsStateBlock tone="success" title="اكتملت العملية" description={rawParams.success} /> : null}
    {typeof rawParams.error === "string" ? <CmsStateBlock tone="error" title="تعذرت العملية" description={rawParams.error} /> : null}

    <section className="space-y-5 border-y border-[oklch(82%_0.012_145)] py-6" aria-labelledby="new-redirect-title">
      <div className="space-y-1"><h2 className="text-xl font-semibold" id="new-redirect-title">إضافة مسار دائم</h2><p className="max-w-[55ch] text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">استخدم مسارات داخلية كاملة مثل <bdi dir="ltr">/services/old-slug</bdi>. سيمنع النظام التكرار والحلقات ويختصر السلاسل.</p></div>
      <form action={createRedirectAction} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <CmsFieldShell id="new-source" label="مسار المصدر"><input className={cmsInputClassName} dir="ltr" id="new-source" name="sourcePath" placeholder="/services/old-slug" required /></CmsFieldShell>
        <CmsFieldShell id="new-destination" label="مسار الوجهة"><input className={cmsInputClassName} dir="ltr" id="new-destination" name="destinationPath" placeholder="/services/new-slug" required /></CmsFieldShell>
        <Button className="min-h-11 rounded-[4px] bg-[oklch(37%_0.075_155)] px-4 text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">إضافة إعادة التوجيه</Button>
      </form>
    </section>

    <form action="/dashboard/seo/redirects" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <CmsFieldShell id="redirect-search" label="البحث في المسارات"><input className={`${cmsInputClassName} w-full sm:w-96`} defaultValue={params.q} dir="ltr" id="redirect-search" name="q" /></CmsFieldShell>
      <Button className="min-h-11 rounded-[4px]" variant="outline" type="submit">بحث</Button>
    </form>

    {redirects.length === 0 ? <CmsEmptyState title={params.q ? "لا توجد نتائج" : "لا توجد مسارات معاد توجيهها"} description={params.q ? "غيّر عبارة البحث لعرض مسارات أخرى." : "ستظهر هنا المسارات المضافة يدويًا أو الناتجة عن تغيير رابط منشور."} /> : <div className="overflow-x-auto rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)]">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead className="bg-[oklch(96.5%_0.009_120)] text-right"><tr><th className="p-4 font-semibold">المصدر</th><th className="p-4 font-semibold">الوجهة</th><th className="p-4 font-semibold">الحالة</th><th className="p-4 font-semibold">الإجراءات</th></tr></thead>
        <tbody>{redirects.map((item) => <tr className="border-t border-[oklch(82%_0.012_145)] align-top" key={item.id}>
          <td colSpan={4} className="p-0"><form action={updateRedirectAction} className="grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_90px_220px] items-center gap-4 p-4">
            <input name="redirectId" type="hidden" value={item.id} />
            <label><span className="sr-only">مسار المصدر</span><input aria-label="مسار المصدر" className={`${cmsInputClassName} w-full`} defaultValue={item.sourcePath} dir="ltr" name="sourcePath" required /></label>
            <label><span className="sr-only">مسار الوجهة</span><input aria-label="مسار الوجهة" className={`${cmsInputClassName} w-full`} defaultValue={item.destinationPath} dir="ltr" name="destinationPath" required /></label>
            <span className="tabular-nums" dir="ltr">301</span>
            <div className="flex items-start gap-2"><Button className="min-h-10 rounded-[4px]" variant="outline" type="submit">حفظ</Button><details className="w-44"><summary className="flex min-h-10 cursor-pointer list-none items-center rounded-[4px] px-3 text-sm font-semibold text-[oklch(46%_0.16_28)] hover:bg-[oklch(94%_0.025_28)]">حذف</summary><div className="mt-2 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(94%_0.025_28)] p-3"><p className="mb-3 leading-[1.6]">سيعود المصدر إلى سلوكه السابق. هل تريد المتابعة؟</p><Button className="min-h-10 w-full rounded-[4px] bg-[oklch(46%_0.16_28)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(40%_0.14_28)]" formAction={deleteRedirectAction} name="redirectId" value={item.id}>حذف إعادة التوجيه</Button></div></details></div>
          </form></td>
        </tr>)}</tbody>
      </table>
    </div>}
    <CmsPaginationControls pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} basePath="/dashboard/seo/redirects" query={{ q: params.q }} />
  </div>;
}
