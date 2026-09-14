"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { WhatsappIcon } from "@/components/icons/whatsapp-icon";
import { Input } from "@/components/ui/input";
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { buildWhatsAppUrl } from "../contact";

type Option = { id: string; label: string };
type Values = { service: string; solution: string; material: string; dimensions: string; city: string; district: string; notes: string };

const emptyValues: Values = { service: "", solution: "", material: "", dimensions: "", city: "", district: "", notes: "" };

export function ContactWhatsappForm({ whatsappNumber, defaultMessage, services, solutions, materials }: { whatsappNumber: string; defaultMessage?: string | null; services: Option[]; solutions: Option[]; materials: Option[] }) {
  const [values, setValues] = useState(emptyValues);
  const href = buildWhatsAppUrl(whatsappNumber, defaultMessage, values);

  function update(name: keyof Values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="rounded-[12px] border border-border bg-card p-5 md:p-7" aria-labelledby="whatsapp-form-title">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-clay-strong">تفاصيل اختيارية</p>
        <h2 className="text-[clamp(1.4rem,2.5vw,1.75rem)] font-bold leading-[1.4]" id="whatsapp-form-title">جهّز تفاصيل مشروعك قبل فتح واتساب</h2>
        <p className="max-w-[58ch] text-sm leading-[1.75] text-text-secondary">أدخل المعلومات المتاحة فقط. لن يحفظ الموقع هذه البيانات، وسيتم فتح واتساب برسالة جاهزة.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RelatedSelect label="الخدمة" value={values.service} options={services} onChange={(value) => update("service", value)} />
        <RelatedSelect label="الحل" value={values.solution} options={solutions} onChange={(value) => update("solution", value)} />
        <RelatedSelect label="المادة" value={values.material} options={materials} onChange={(value) => update("material", value)} />
        <Field label="الأبعاد التقريبية" value={values.dimensions} onChange={(value) => update("dimensions", value)} />
        <Field label="المدينة" value={values.city} onChange={(value) => update("city", value)} />
        <Field label="الحي" value={values.district} onChange={(value) => update("district", value)} />
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-semibold leading-[1.55]">ملاحظات</span>
          <Textarea className="min-h-32 resize-y rounded-[9px] border-border-strong bg-background px-3.5 py-3 text-base focus-visible:border-primary focus-visible:ring-ring/35" value={values.notes} onChange={(event) => update("notes", event.target.value)} />
        </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href={href} rel="noopener noreferrer" target="_blank"><WhatsappIcon aria-hidden="true" className="size-[18px]" />فتح واتساب بالرسالة</a>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[9px] border border-border-strong px-5 text-sm font-semibold text-brand-accent-strong transition-colors hover:border-brand-accent-strong hover:bg-brand-accent-soft" type="button" onClick={() => setValues(emptyValues)}><RotateCcw aria-hidden="true" className="size-4" />مسح التفاصيل</button>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2"><span className="text-sm font-semibold leading-[1.55]">{label}</span><Input className="min-h-12 rounded-[9px] border-border-strong bg-background px-3.5 text-base focus-visible:border-primary focus-visible:ring-ring/35" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function RelatedSelect({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className="grid gap-2"><span className="text-sm font-semibold leading-[1.55]">{label}</span><UiSelect value={value || "NONE"} onValueChange={(nextValue) => onChange(nextValue === "NONE" ? "" : nextValue)}><SelectTrigger className="min-h-12 rounded-[9px] border-border-strong bg-background px-3.5 text-base focus-visible:border-primary focus-visible:ring-ring/35"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="NONE">غير محدد</SelectItem>{options.map((option) => <SelectItem key={option.id} value={option.label}>{option.label}</SelectItem>)}</SelectContent></UiSelect></label>;
}
