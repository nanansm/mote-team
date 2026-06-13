import { PageHeader } from "@/components/page-header";
import {
  getMetaToken,
  getSettings,
  getWindsorKey,
  isMetaEnabled,
  isWindsorEnabled,
} from "@/lib/config";
import { env } from "@/lib/env";
import { isMailerConfigured } from "@/lib/mailer";
import { isR2Configured } from "@/lib/r2";
import { requireAdmin } from "@/lib/session";
import { SettingsView } from "./settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();

  const [windsorKey, windsorEnabled, metaToken, metaEnabled] = await Promise.all(
    [getWindsorKey(), isWindsorEnabled(), getMetaToken(), isMetaEnabled()],
  );
  // Touch getSettings so it's cached for this request (no-op safety).
  await getSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Kelola integrasi & token. Hanya admin."
      />
      <SettingsView
        windsor={{ enabled: windsorEnabled, hasKey: Boolean(windsorKey) }}
        meta={{ enabled: metaEnabled, hasKey: Boolean(metaToken) }}
        r2Configured={isR2Configured()}
        smtpConfigured={isMailerConfigured()}
        smtpFrom={env.SMTP_FROM_EMAIL || env.SMTP_USER}
      />
    </div>
  );
}
