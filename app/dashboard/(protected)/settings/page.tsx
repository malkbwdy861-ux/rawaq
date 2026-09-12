import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsStateBlock } from "@/modules/cms/components/state-blocks";
import { SettingsForm } from "@/modules/settings/components/settings-form";
import { getSiteSettingsEditorData } from "@/modules/settings/queries";

type SettingsPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [data, messages] = await Promise.all([getSiteSettingsEditorData(), searchParams]);

  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <CmsPageHeader title="إعدادات الموقع" description="إدارة بيانات الشركة والتواصل والروابط الاجتماعية وافتراضيات SEO وواتساب ضمن الحقول المعتمدة فقط." />
      {messages.success ? <CmsStateBlock tone="success" title="اكتملت العملية" description={messages.success} /> : null}
      {messages.error ? <CmsStateBlock tone="error" title="تعذرت العملية" description={messages.error} /> : null}
      <SettingsForm settings={data.settings} media={data.media} />
    </div>
  );
}
