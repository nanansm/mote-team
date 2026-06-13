import nodemailer from "nodemailer";
import { env } from "./env";

export function isMailerConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

let cached: nodemailer.Transporter | null = null;
function transporter(): nodemailer.Transporter {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: env.SMTP_SECURE === "true",
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return cached;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!isMailerConfigured()) return false;
  try {
    await transporter().sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL || env.SMTP_USER}>`,
      to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    console.error("[mailer] send failed:", e);
    return false;
  }
}

/* ----------------------------------------------------------- templates */

const BRAND = "#1a3a2a";

function shell(title: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
    <div style="padding:20px 0;border-bottom:2px solid ${BRAND}">
      <span style="font-weight:700;font-size:18px;color:${BRAND}">MOTE TEAM</span>
    </div>
    <h2 style="font-size:18px;margin:24px 0 8px">${title}</h2>
    ${body}
    <p style="color:#9ca3af;font-size:12px;margin-top:32px">Mote Kreatif · Internal · email otomatis, jangan dibalas.</p>
  </div>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px">${label}</td><td style="padding:4px 0;font-size:13px;font-weight:600">${value}</td></tr>`;
}

export function taskAssignedEmail(p: {
  taskTitle: string;
  clientName: string;
  status: string;
  dueDate: string | null;
  url: string;
}): string {
  return shell(
    "Kamu di-assign sebuah task",
    `<p style="font-size:14px">Halo, kamu baru saja ditugaskan untuk:</p>
     <p style="font-size:15px;font-weight:700;margin:8px 0 16px">${p.taskTitle}</p>
     <table>${row("Klien", p.clientName)}${row("Status", p.status)}${row("Deadline", p.dueDate ?? "—")}</table>
     <p style="margin-top:20px"><a href="${p.url}" style="background:${BRAND};color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Buka di Mote Team</a></p>`,
  );
}

export function resetPasswordEmail(p: { url: string }): string {
  return shell(
    "Reset password",
    `<p style="font-size:14px">Ada permintaan reset password untuk akun Mote Team kamu. Klik tombol di bawah untuk membuat password baru (berlaku 1 jam).</p>
     <p style="margin-top:20px"><a href="${p.url}" style="background:${BRAND};color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Reset password</a></p>
     <p style="margin-top:16px;color:#9ca3af;font-size:12px">Kalau bukan kamu yang minta, abaikan email ini.</p>`,
  );
}

export function deadlineReminderEmail(p: {
  name: string;
  tasks: { title: string; clientName: string; dueDate: string | null }[];
  url: string;
}): string {
  const items = p.tasks
    .map(
      (t) =>
        `<li style="margin-bottom:8px"><b>${t.title}</b><br><span style="color:#6b7280;font-size:13px">${t.clientName} · deadline ${t.dueDate ?? "—"}</span></li>`,
    )
    .join("");
  return shell(
    `Pengingat deadline — ${p.tasks.length} task`,
    `<p style="font-size:14px">Halo ${p.name}, task berikut mendekati / lewat deadline:</p>
     <ul style="padding-left:18px">${items}</ul>
     <p style="margin-top:20px"><a href="${p.url}" style="background:${BRAND};color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Lihat task</a></p>`,
  );
}
