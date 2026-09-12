import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { CreateFaqDialog, FaqDialog } from "@/modules/faqs/components/create-faq-dialog";
import { FaqsPagination } from "@/modules/faqs/components/faqs-pagination";
import { getFaqList } from "@/modules/faqs/queries";
import { ServiceRouteToast } from "@/modules/services/components/service-route-toast";
import { ServicesToolbar } from "@/modules/services/components/services-toolbar";

type FaqsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FaqsPage({ searchParams }: FaqsPageProps) {
  const rawParams = await searchParams;
  const { params, pagination, faqs, statusCounts } = await getFaqList(rawParams);
  const filtered = Boolean(params.q || params.status !== "ALL");
  return <div className="mx-auto w-full max-w-[1360px] space-y-5">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[1.75rem] font-bold leading-10">الأسئلة الشائعة</h1><p className="mt-1 text-sm leading-6 text-text-secondary">إدارة الأسئلة القابلة لإعادة الاستخدام وحالة نشرها.</p></div><CreateFaqDialog /></header>
    <ServiceRouteToast cleanHref="/dashboard/faqs" error={typeof rawParams.error === "string" ? rawParams.error : undefined} success={typeof rawParams.success === "string" ? rawParams.success : undefined} />
    <section aria-label="مجموعة الأسئلة الشائعة" className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-rest)]">
      <ServicesToolbar allLabel="كل الأسئلة" basePath="/dashboard/faqs" itemLabel="سؤال" pageSize={pagination.pageSize} query={params.q} searchLabel="الأسئلة" status={params.status} statusCounts={statusCounts} totalItems={pagination.totalItems} />
      {faqs.length === 0 ? <div className="grid min-h-72 place-items-center px-6 py-12 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-md bg-secondary text-muted-foreground"><FileQuestion className="size-5" /></span><h2 className="mt-4 text-lg font-semibold">{filtered ? "لا توجد نتائج مطابقة" : "لا توجد أسئلة بعد"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{filtered ? "غيّر عبارة البحث أو الحالة لعرض أسئلة أخرى." : "أنشئ أول سؤال مع إجابته، ثم انشره عندما يصبح جاهزاً للظهور."}</p>{filtered ? <Link className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-primary underline underline-offset-4" href="/dashboard/faqs">عرض كل الأسئلة</Link> : <div className="mt-5"><CreateFaqDialog compact /></div>}</div></div> : <>
        <div className="hidden md:block"><table className="w-full table-fixed text-start text-sm"><thead className="bg-dashboard-canvas/65 text-xs font-medium text-muted-foreground"><tr className="h-11"><th className="w-auto px-4 text-start font-medium">السؤال</th><th className="w-52 px-4 text-start font-medium">الحالة</th><th className="w-40 px-4 text-start font-medium">آخر تحديث</th><th className="w-16 px-3"><span className="sr-only">الإجراءات</span></th></tr></thead><tbody>{faqs.map((faq) => { const version = faq.draftVersion ?? faq.publishedVersion; return <tr className="h-16 border-t border-border/80 transition-colors hover:bg-dashboard-hover/55" key={faq.id}><td className="px-4"><span className="block truncate font-semibold text-foreground">{version?.question ?? "سؤال بدون عنوان"}</span><span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{version?.answer ?? "لا توجد إجابة في هذه النسخة"}</span></td><td className="px-4"><FaqStatus status={faq.status} /></td><td className="px-4 text-xs text-text-secondary"><time dateTime={faq.updatedAt.toISOString()}>{faq.updatedAt.toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: faq.updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric" })}</time></td><td className="px-3"><FaqDialog faq={faq} /></td></tr>; })}</tbody></table></div>
        <div className="divide-y divide-border md:hidden">{faqs.map((faq) => { const version = faq.draftVersion ?? faq.publishedVersion; return <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4" key={faq.id}><div className="min-w-0 text-start"><span className="block truncate font-semibold">{version?.question ?? "سؤال بدون عنوان"}</span>{version?.answer ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{version.answer}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-3"><FaqStatus status={faq.status} /><time className="text-xs text-muted-foreground" dateTime={faq.updatedAt.toISOString()}>{faq.updatedAt.toLocaleDateString("ar-SA")}</time></div></div><FaqDialog faq={faq} /></article>; })}</div>
      </>}
      <FaqsPagination pagination={{ page: pagination.page, pageSize: pagination.pageSize, totalItems: pagination.totalItems }} query={{ q: params.q, status: params.status, pageSize: pagination.pageSize }} />
    </section>
  </div>;
}

function FaqStatus({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  const label = status === "PUBLISHED" ? "منشور" : "مسودة";
  const tone = status === "PUBLISHED" ? "bg-success-soft text-success" : "bg-secondary text-text-secondary";
  return <span className={`inline-flex min-h-6 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ${tone}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{label}</span>;
}
