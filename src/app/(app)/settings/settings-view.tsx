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
import { saveSettings, sendTestEmail } from "./actions";

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

type SmtpProps = {
  configured: boolean;
  host: string;
  port: string;
  secure: boolean;
  user: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
};

function SmtpCard({ smtp }: { smtp: SmtpProps }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [testing, startTest] = useTransition();
  const [host, setHost] = useState(smtp.host);
  const [port, setPort] = useState(smtp.port || "587");
  const [secure, setSecure] = useState(smtp.secure);
  const [user, setUser] = useState(smtp.user);
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState(smtp.fromName);
  const [fromEmail, setFromEmail] = useState(smtp.fromEmail);

  function save() {
    const values: Record<string, string> = {
      smtp_host: host.trim(),
      smtp_port: port.trim() || "587",
      smtp_secure: String(secure),
      smtp_user: user.trim(),
      smtp_from_name: fromName.trim(),
      smtp_from_email: fromEmail.trim(),
    };
    // Blank password = keep the stored one (don't overwrite with empty).
    if (password.trim()) values.smtp_password = password.trim();
    start(async () => {
      const r = await saveSettings(values);
      if (r.ok) {
        toast.success("Konfigurasi SMTP disimpan");
        setPassword("");
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function test() {
    startTest(async () => {
      const r = await sendTestEmail();
      if (r.ok) toast.success("Email test terkirim — cek inbox admin");
      else toast.error(r.error);
    });
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mail className="size-[18px]" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Email (SMTP)</h3>
            <StatusBadge on={smtp.configured} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Notif task, reminder deadline & reset password anggota.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">SMTP Host</Label>
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Port</Label>
          <Input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="587"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">User (email pengirim)</Label>
          <Input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="motekreatif@gmail.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Password (Gmail app-password)</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              smtp.hasPassword
                ? "•••••••• (tersimpan — isi untuk ganti)"
                : "Belum diisi"
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From name</Label>
          <Input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Mote Team"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From email (opsional)</Label>
          <Input
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="kosong = pakai User"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Switch checked={secure} onCheckedChange={setSecure} disabled={pending} />
        <span className="text-sm text-muted-foreground">
          SSL/TLS (secure) — port 465 nyalakan, port 587 matikan
        </span>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={test}
          disabled={testing || pending || !smtp.configured}
        >
          {testing ? "Mengirim…" : "Test kirim"}
        </Button>
        <Button onClick={save} disabled={pending}>
          Simpan konfigurasi
        </Button>
      </div>

      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
        Gmail: butuh 2FA aktif + app-password 16 huruf (bukan password akun
        biasa). &quot;Test kirim&quot; mengirim ke email admin yang login —
        verifikasi password beneran diterima Gmail, bukan cuma terisi.
      </p>
    </div>
  );
}

export function SettingsView({
  windsor,
  meta,
  wa,
  r2Configured,
  smtp,
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
  smtp: SmtpProps;
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

      <SmtpCard smtp={smtp} />

      {/* R2 stays env-managed (read-only) */}
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

      <p className="text-xs text-muted-foreground">
        R2 diatur lewat environment variable saat deploy. Windsor, Meta, WhatsApp
        & SMTP bisa diubah langsung di sini (tersimpan di database).
      </p>
    </div>
  );
}
