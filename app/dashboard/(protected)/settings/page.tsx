import { CmsPageHeader } from "@/modules/cms/components/page-header";
import { CmsRouteToast } from "@/modules/cms/components/route-toast";
import { AccountForm } from "@/modules/settings/components/account-form";
import { SettingsForm } from "@/modules/settings/components/settings-form";
import { getAdminAccountEditorData, getSiteSettingsEditorData } from "@/modules/settings/queries";

type SettingsPageProps = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [data, account, messages] = await Promise.all([getSiteSettingsEditorData(), getAdminAccountEditorData(), searchParams]);

  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <CmsPageHeader title="إعدادات الموقع" description="إدارة بيانات الشركة والتواصل والروابط الاجتماعية وافتراضيات محركات البحث وواتساب ضمن الحقول المعتمدة فقط." />
      <CmsRouteToast cleanHref="/dashboard/settings" error={messages.error} success={messages.success} />
      <SettingsForm settings={data.settings} media={data.media} />
      <AccountForm account={account} />
    </div>
  );
}
