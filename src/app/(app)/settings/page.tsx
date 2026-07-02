import { PageHeader } from "@/components/page-header";
import {
  getGmbClientId,
  getGmbClientSecret,
  getGmbRefreshToken,
  getMetaToken,
  getReplizAccessKey,
  getReplizSecret,
  getSettings,
  getSmtpConfig,
  getWaConfig,
  getWaTemplates,
  getWindsorKey,
  isGmbEnabled,
  isMetaEnabled,
  isReplizEnabled,
  isSmtpConfigured,
  isWaEnabled,
  isWindsorEnabled,
} from "@/lib/config";
import { isR2Configured } from "@/lib/r2";
import { requireAdmin } from "@/lib/session";
import { SettingsView } from "./settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();

  const [
    windsorKey,
    windsorEnabled,
    metaToken,
    metaEnabled,
    replizAccess,
    replizSecret,
    replizEnabled,
    gmbClientId,
    gmbSecret,
    gmbRefresh,
    gmbEnabled,
    waEnabled,
    waCfg,
    waTpl,
    smtpCfg,
    smtpOn,
  ] = await Promise.all([
    getWindsorKey(),
    isWindsorEnabled(),
    getMetaToken(),
    isMetaEnabled(),
    getReplizAccessKey(),
    getReplizSecret(),
    isReplizEnabled(),
    getGmbClientId(),
    getGmbClientSecret(),
    getGmbRefreshToken(),
    isGmbEnabled(),
    isWaEnabled(),
    getWaConfig(),
    getWaTemplates(),
    getSmtpConfig(),
    isSmtpConfigured(),
  ]);
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
        repliz={{
          enabled: replizEnabled,
          hasAccess: Boolean(replizAccess),
          hasSecret: Boolean(replizSecret),
        }}
        gmb={{
          enabled: gmbEnabled,
          hasClientId: Boolean(gmbClientId),
          hasSecret: Boolean(gmbSecret),
          hasRefresh: Boolean(gmbRefresh),
        }}
        wa={{
          enabled: waEnabled,
          baseUrl: waCfg.baseUrl,
          instance: waCfg.instance,
          hasKey: Boolean(waCfg.apiKey),
          tplAssign: waTpl.assign,
          tplReminder: waTpl.reminder,
        }}
        r2Configured={isR2Configured()}
        smtp={{
          configured: smtpOn,
          host: smtpCfg.host,
          port: smtpCfg.port,
          secure: smtpCfg.secure,
          user: smtpCfg.user,
          hasPassword: Boolean(smtpCfg.password),
          fromName: smtpCfg.fromName,
          fromEmail: smtpCfg.fromEmail,
        }}
      />
    </div>
  );
}
