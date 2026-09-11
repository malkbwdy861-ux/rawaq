import { Button } from "@/components/ui/button";
import { CmsFieldGroup, CmsFieldShell, cmsInputClassName } from "@/modules/cms/components/form";
import { MediaPicker, type MediaPickerItem } from "@/modules/media/components/media-picker";

import { saveSiteSettingsAction } from "../actions";
import type { SocialLinksInput } from "../validation";

type Settings = {
  companyName: string;
  companyDescription: string | null;
  logoMediaId: string | null;
  primaryPhone: string;
  secondaryPhone: string | null;
  whatsappNumber: string;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  socialLinks: SocialLinksInput;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
  defaultOpenGraphImageId: string | null;
  defaultCtaText: string | null;
  defaultWhatsappText: string | null;
};

export function SettingsForm({ settings, media }: { settings: Settings | null; media: MediaPickerItem[] }) {
  return (
    <form action={saveSiteSettingsAction} className="space-y-8">
      <CmsFieldGroup title="الشركة" description="بيانات الشركة العامة التي تظهر في الواجهات العامة وبيانات SEO عند الحاجة.">
        <Text id="companyName" label="اسم الشركة" value={settings?.companyName} required />
        <Area id="companyDescription" label="وصف الشركة" value={settings?.companyDescription} />
        <MediaPicker items={media} name="logoMediaId" defaultValue={settings?.logoMediaId} label="شعار الشركة" />
        <Area id="address" label="العنوان" value={settings?.address} />
        <Area id="businessHours" label="ساعات العمل" value={settings?.businessHours} />
      </CmsFieldGroup>

      <CmsFieldGroup title="التواصل" description="هذه القيم تستخدمها أزرار الهاتف وواتساب، ولا تنشئ أي طلبات أو سجلات عملاء.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="primaryPhone" label="الهاتف الأساسي" value={settings?.primaryPhone} ltr required />
          <Text id="secondaryPhone" label="هاتف ثانوي اختياري" value={settings?.secondaryPhone} ltr />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="whatsappNumber" label="رقم واتساب" value={settings?.whatsappNumber} ltr required />
          <Text id="email" label="البريد الإلكتروني" value={settings?.email} ltr />
        </div>
      </CmsFieldGroup>

      <CmsFieldGroup title="روابط التواصل الاجتماعي" description="أدخل الروابط المعتمدة فقط. الحقول الفارغة لا تظهر في الواجهة العامة.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="facebook" label="Facebook" value={settings?.socialLinks.facebook} ltr />
          <Text id="instagram" label="Instagram" value={settings?.socialLinks.instagram} ltr />
          <Text id="x" label="X" value={settings?.socialLinks.x} ltr />
          <Text id="tiktok" label="TikTok" value={settings?.socialLinks.tiktok} ltr />
          <Text id="youtube" label="YouTube" value={settings?.socialLinks.youtube} ltr />
          <Text id="linkedin" label="LinkedIn" value={settings?.socialLinks.linkedin} ltr />
        </div>
      </CmsFieldGroup>

      <CmsFieldGroup title="افتراضيات SEO والدعوات" description="تستخدم كقيم عامة عند عدم وجود قيمة أدق في المحتوى المنشور.">
        <Text id="defaultSeoTitle" label="عنوان SEO الافتراضي" value={settings?.defaultSeoTitle} />
        <Area id="defaultSeoDescription" label="وصف SEO الافتراضي" value={settings?.defaultSeoDescription} />
        <MediaPicker items={media} name="defaultOpenGraphImageId" defaultValue={settings?.defaultOpenGraphImageId} label="صورة Open Graph الافتراضية" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="defaultCtaText" label="نص الاتصال الافتراضي" value={settings?.defaultCtaText} />
          <Area id="defaultWhatsappText" label="رسالة واتساب الافتراضية" value={settings?.defaultWhatsappText} />
        </div>
      </CmsFieldGroup>

      <div className="flex justify-start border-t border-[oklch(82%_0.012_145)] pt-6">
        <Button className="min-h-10 rounded-[4px] bg-[oklch(37%_0.075_155)] px-4 text-[oklch(99%_0.004_100)] hover:bg-[oklch(29%_0.055_155)]" type="submit">
          حفظ إعدادات الموقع
        </Button>
      </div>
    </form>
  );
}

function Text({ id, label, value, ltr, required }: { id: string; label: string; value?: string | null; ltr?: boolean; required?: boolean }) {
  return <CmsFieldShell id={id} label={label}><input className={cmsInputClassName} dir={ltr ? "ltr" : undefined} id={id} name={id} defaultValue={value ?? ""} required={required} /></CmsFieldShell>;
}

function Area({ id, label, value }: { id: string; label: string; value?: string | null }) {
  return <CmsFieldShell id={id} label={label}><textarea className={`${cmsInputClassName} min-h-24`} id={id} name={id} defaultValue={value ?? ""} /></CmsFieldShell>;
}
