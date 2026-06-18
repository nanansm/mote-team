"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Camera, Database, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  WA_TEMPLATE_DEFAULTS,
  WA_TEMPLATE_PLACEHOLDERS,
} from "@/lib/wa-templates";
import { saveSettings } from "./actions";

function StatusBadge({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        on
          ? "bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-400/15 dark:text-zinc-400",
      )}
    >
      {on ? "Terhubung" : "Belum diatur"}
    </span>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  desc,
  enabled,
  hasKey,
  enableKey,
  tokenKey,
  tokenLabel,
  note,
}: {
  icon: typeof Camera;
  title: string;
  desc: string;
  enabled: boolean;
  hasKey: boolean;
  enableKey: string;
  tokenKey: string;
  tokenLabel: string;
  note?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [on, setOn] = useState(enabled);
  const [token, setToken] = useState("");

  function toggle(next: boolean) {
    setOn(next);
    start(async () => {
      const r = await saveSettings({ [enableKey]: String(next) });
      if (r.ok) {
        toast.success(next ? `${title} diaktifkan` : `${title} dimatikan`);
        router.refresh();
      } else {
        setOn(!next);
        toast.error(r.error);
      }
    });
  }

  function saveToken() {
    if (!token.trim()) return;
    start(async () => {
      const r = await saveSettings({ [tokenKey]: token.trim() });
      if (r.ok) {
        toast.success("Token disimpan");
        setToken("");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-[18px]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              <StatusBadge on={hasKey} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
        <Switch checked={on} onCheckedChange={toggle} disabled={pending} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">{tokenLabel}</Label>
          <Input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={hasKey ? "•••••••• (tersimpan — isi untuk ganti)" : "Belum diisi"}
          />
        </div>
        <Button onClick={saveToken} disabled={pending || !token.trim()}>
          Simpan token
        </Button>
      </div>

      {note && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          {note}
        </p>
      )}
    </div>
  );
}

function WhatsAppCard({
  enabled,
  baseUrl,
  instance,
  hasKey,
  tplAssign,
  tplReminder,
}: {
  enabled: boolean;
  baseUrl: string;
  instance: string;
  hasKey: boolean;
  tplAssign: string;
  tplReminder: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [on, setOn] = useState(enabled);
  const [base, setBase] = useState(baseUrl);
  const [inst, setInst] = useState(instance);
  const [key, setKey] = useState("");
  // Show the effective template: stored override, else the built-in default.
  const [assignTpl, setAssignTpl] = useState(
    tplAssign || WA_TEMPLATE_DEFAULTS.assign,
  );
  const [reminderTpl, setReminderTpl] = useState(
    tplReminder || WA_TEMPLATE_DEFAULTS.reminder,
  );

  function toggle(next: boolean) {
    setOn(next);
    start(async () => {
      const r = await saveSettings({ wa_enabled: String(next) });
      if (r.ok) {
        toast.success(next ? "WhatsApp diaktifkan" : "WhatsApp dimatikan");
        router.refresh();
      } else {
        setOn(!next);
        toast.error(r.error);
      }
    });
  }

  function save() {
    const values: Record<string, string> = {
      wa_base_url: base.trim(),
      wa_instance: inst.trim(),
    };
    // Only overwrite the key when a new one is typed (blank = keep existing).
    if (key.trim()) values.wa_api_key = key.trim();
    start(async () => {
      const r = await saveSettings(values);
      if (r.ok) {
        toast.success("Konfigurasi WhatsApp disimpan");
        setKey("");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function saveTemplates() {
    start(async () => {
      const r = await saveSettings({
        wa_tpl_assign: assignTpl,
        wa_tpl_reminder: reminderTpl,
      });
      if (r.ok) {
        toast.success("Template pesan disimpan");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  const configured = Boolean(base.trim() && inst.trim() && hasKey);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <MessageCircle className="size-[18px]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">WhatsApp (Evolution)</h3>
              <StatusBadge on={configured} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Notif task & reminder deadline ke nomor WA tiap anggota.
            </p>
          </div>
        </div>
        <Switch checked={on} onCheckedChange={toggle} disabled={pending} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Base URL</Label>
          <Input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="https://...easypanel.host"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Instance</Label>
          <Input
            value={inst}
            onChange={(e) => setInst(e.target.value)}
            placeholder="mote-ryan"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">API Key (instance)</Label>
          <Input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasKey ? "•••••••• (tersimpan — isi untuk ganti)" : "Belum diisi"}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={pending}>
          Simpan konfigurasi
        </Button>
      </div>

      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Pakai API key per-instance dari dashboard Evolution (bukan global key).
        Pesan dikirim dari nomor instance ini.
      </p>

      {/* Editable message templates */}
      <div className="mt-5 border-t pt-4">
        <h4 className="text-sm font-medium">Template pesan</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Placeholder otomatis diganti saat kirim. Kosongkan untuk pakai default.
        </p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Saat di-assign task</Label>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setAssignTpl(WA_TEMPLATE_DEFAULTS.assign)}
            >
              Reset default
            </button>
          </div>
          <Textarea
            rows={9}
            value={assignTpl}
            onChange={(e) => setAssignTpl(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Placeholder: {WA_TEMPLATE_PLACEHOLDERS.assign.join(" ")}
          </p>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Reminder deadline (cron)</Label>
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setReminderTpl(WA_TEMPLATE_DEFAULTS.reminder)}
            >
              Reset default
            </button>
          </div>
          <Textarea
            rows={9}
            value={reminderTpl}
            onChange={(e) => setReminderTpl(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Placeholder: {WA_TEMPLATE_PLACEHOLDERS.reminder.join(" ")} —{" "}
            <code>{"{list}"}</code> = daftar task otomatis.
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <Button onClick={saveTemplates} disabled={pending}>
            Simpan template
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsView({
  windsor,
  meta,
  wa,
  r2Configured,
  smtpConfigured,
  smtpFrom,
}: {
  windsor: { enabled: boolean; hasKey: boolean };
  meta: { enabled: boolean; hasKey: boolean };
  wa: {
    enabled: boolean;
    baseUrl: string;
    instance: string;
    hasKey: boolean;
    tplAssign: string;
    tplReminder: string;
  };
  r2Configured: boolean;
  smtpConfigured: boolean;
  smtpFrom: string;
}) {
  return (
    <div className="space-y-4">
      <IntegrationCard
        icon={BarChart3}
        title="Windsor.ai"
        desc="Performa organic Instagram & TikTok per klien."
        enabled={windsor.enabled}
        hasKey={windsor.hasKey}
        enableKey="windsor_enabled"
        tokenKey="windsor_api_key"
        tokenLabel="Windsor API Key"
      />

      <IntegrationCard
        icon={Camera}
        title="Meta Ads"
        desc="Performa paid ads (spend, reach, leads) via Graph API."
        enabled={meta.enabled}
        hasKey={meta.hasKey}
        enableKey="meta_enabled"
        tokenKey="meta_access_token"
        tokenLabel="Meta Access Token"
        note="Meta punya rate limit. Kalau usage developer mendekati 100%, matikan toggle ini sementara — semua call Meta berhenti & usage berhenti naik. Limit reset otomatis tiap ~1 jam."
      />

      <WhatsAppCard
        enabled={wa.enabled}
        baseUrl={wa.baseUrl}
        instance={wa.instance}
        hasKey={wa.hasKey}
        tplAssign={wa.tplAssign}
        tplReminder={wa.tplReminder}
      />

      {/* Read-only status (env-managed for now) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <Database className="size-[18px]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Cloudflare R2</h3>
                <StatusBadge on={r2Configured} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Penyimpanan file (logo & media task).
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <Mail className="size-[18px]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Email (SMTP)</h3>
                <StatusBadge on={smtpConfigured} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Notifikasi task & deadline {smtpConfigured ? `· dari ${smtpFrom}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        R2 & SMTP diatur lewat environment variable saat deploy. Windsor & Meta
        bisa diubah langsung di sini (tersimpan di database).
      </p>
    </div>
  );
}
