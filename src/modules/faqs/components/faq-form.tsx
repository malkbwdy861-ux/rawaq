import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, CmsTextarea, cmsInputClassName } from "@/modules/cms/components/form";
import { CmsStatusBadge } from "@/modules/cms/components/status-badge";

import { archiveFaqAction, publishFaqAction, saveFaqDraftAction } from "../actions";

type FaqFormProps = {
  faq: {
    id: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    publishedVersionId: string | null;
    draftVersion: { question: string | null; answer: string | null; sortOrder: number | null } | null;
  };
};

export function FaqForm({ faq }: FaqFormProps) {
  const draft = faq.draftVersion;
  return <form className="space-y-8" action={saveFaqDraftAction}>
    <input name="faqId" type="hidden" value={faq.id} />
    <div className="flex flex-col gap-3 rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="grid gap-2"><CmsStatusBadge status={{ status: faq.status, hasDraftVersion: Boolean(draft), hasPublishedVersion: Boolean(faq.publishedVersionId) }} /><p className="text-sm leading-[1.6] text-[oklch(42%_0.018_150)]">الحفظ يغير المسودة فقط. الصفحات العامة تستمر في عرض السؤال المنشور حتى نجاح النشر.</p></div>
      <div className="flex flex-wrap gap-2">
        <Button className="min-h-10 rounded-[4px]" type="submit" variant="outline">حفظ المسودة</Button>
        <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" formAction={publishFaqAction} type="submit">نشر</Button>
        <Button className="min-h-10 rounded-[4px]" formAction={archiveFaqAction} type="submit" variant="outline">أرشفة</Button>
        <Link className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-4 py-2 text-sm font-semibold text-[oklch(37%_0.075_155)]" href={`/preview/faqs/${faq.id}`}>معاينة</Link>
      </div>
    </div>
    <CmsFieldGroup title="محتوى السؤال" description="السؤال والإجابة مطلوبان عند النشر. يمكن حفظ مسودة غير مكتملة.">
      <CmsFieldShell id="question" label="السؤال"><input className={cmsInputClassName} id="question" name="question" defaultValue={draft?.question ?? ""} /></CmsFieldShell>
      <CmsFieldShell id="answer" label="الإجابة"><CmsTextarea className="min-h-40" id="answer" name="answer" defaultValue={draft?.answer ?? ""} /></CmsFieldShell>
      <CmsFieldShell id="sortOrder" label="ترتيب العرض" hint="رقم أصغر يعني ظهورًا أبكر عندما تعتمد الصفحة ترتيب السؤال."><input className={cmsInputClassName} dir="ltr" id="sortOrder" min="0" name="sortOrder" type="number" defaultValue={draft?.sortOrder ?? ""} /></CmsFieldShell>
    </CmsFieldGroup>
  </form>;
}
