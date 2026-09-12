"use client";

import { useState } from "react";

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
    <section className="rounded-[8px] border border-[oklch(82%_0.012_145)] bg-[oklch(99%_0.004_110)] p-5 md:p-6" aria-labelledby="whatsapp-form-title">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold leading-[1.35]" id="whatsapp-form-title">إرسال التفاصيل عبر واتساب</h2>
        <p className="max-w-[55ch] text-sm leading-[1.7] text-[oklch(42%_0.018_150)]">أدخل التفاصيل المتاحة فقط. لن يحفظ الموقع هذه البيانات، وسيتم فتح واتساب برسالة جاهزة.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RelatedSelect label="الخدمة" value={values.service} options={services} onChange={(value) => update("service", value)} />
        <RelatedSelect label="الحل" value={values.solution} options={solutions} onChange={(value) => update("solution", value)} />
        <RelatedSelect label="المادة" value={values.material} options={materials} onChange={(value) => update("material", value)} />
        <Field label="الأبعاد التقريبية" value={values.dimensions} onChange={(value) => update("dimensions", value)} />
        <Field label="المدينة" value={values.city} onChange={(value) => update("city", value)} />
        <Field label="الحي" value={values.district} onChange={(value) => update("district", value)} />
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-[0.8125rem] font-semibold leading-[1.55]">ملاحظات</span>
          <Textarea className="min-h-28 rounded-[4px] border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] text-base focus-visible:border-[oklch(37%_0.075_155)] focus-visible:ring-[oklch(51%_0.09_155)] focus-visible:ring-offset-2" value={values.notes} onChange={(event) => update("notes", event.target.value)} />
        </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a className="inline-flex min-h-12 items-center justify-center rounded-[4px] bg-[oklch(37%_0.075_155)] px-5 text-sm font-semibold text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(51%_0.09_155)]" href={href} rel="noopener noreferrer" target="_blank">فتح واتساب بالرسالة</a>
        <button className="inline-flex min-h-12 items-center justify-center rounded-[4px] border border-[oklch(64%_0.018_145)] px-5 text-sm font-semibold text-[oklch(37%_0.075_155)]" type="button" onClick={() => setValues(emptyValues)}>مسح التفاصيل</button>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold leading-[1.55]">{label}</span><Input className="min-h-12 rounded-[4px] border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] text-base focus-visible:border-[oklch(37%_0.075_155)] focus-visible:ring-[oklch(51%_0.09_155)] focus-visible:ring-offset-2" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function RelatedSelect({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className="grid gap-2"><span className="text-[0.8125rem] font-semibold leading-[1.55]">{label}</span><UiSelect value={value || "NONE"} onValueChange={(nextValue) => onChange(nextValue === "NONE" ? "" : nextValue)}><SelectTrigger className="min-h-12 rounded-[4px] border-[oklch(64%_0.018_145)] bg-[oklch(99%_0.004_110)] text-base focus-visible:border-[oklch(37%_0.075_155)] focus-visible:ring-[oklch(51%_0.09_155)] focus-visible:ring-offset-2"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="NONE">غير محدد</SelectItem>{options.map((option) => <SelectItem key={option.id} value={option.label}>{option.label}</SelectItem>)}</SelectContent></UiSelect></label>;
}
