"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitApproval } from "../actions";

type Status = "pending" | "approved" | "revision" | null;

export function ApprovalForm({
  token,
  status,
  note,
}: {
  token: string;
  status: Status;
  note: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [revising, setRevising] = useState(false);
  const [revNote, setRevNote] = useState(note ?? "");

  function send(decision: "approved" | "revision") {
    if (decision === "revision" && !revNote.trim()) {
      toast.error("Tulis catatan revisi dulu");
      return;
    }
    startTransition(async () => {
      const res = await submitApproval({
        token,
        decision,
        note: decision === "revision" ? revNote.trim() : undefined,
      });
      if (res.ok) {
        toast.success(decision === "approved" ? "Disetujui ✓" : "Revisi terkirim");
        setRevising(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  if (status === "approved") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
        <CheckCircle2 className="size-5 shrink-0" />
        <span>
          Konten ini sudah <strong>disetujui</strong>. Terima kasih!
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-4">
      {status === "revision" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
          Revisi sudah dikirim. Bisa diperbarui di bawah.
          {note && <p className="mt-1 whitespace-pre-wrap text-xs">“{note}”</p>}
        </div>
      )}

      {revising ? (
        <div className="space-y-2">
          <Textarea
            value={revNote}
            onChange={(e) => setRevNote(e.target.value)}
            placeholder="Apa yang perlu direvisi?"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRevising(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={() => send("revision")}
              disabled={pending}
            >
              Kirim Revisi
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className={cn("flex-1")}
            onClick={() => setRevising(true)}
            disabled={pending}
          >
            <RotateCcw className="size-4" />
            Minta Revisi
          </Button>
          <Button className="flex-1" onClick={() => send("approved")} disabled={pending}>
            <CheckCircle2 className="size-4" />
            Setujui
          </Button>
        </div>
      )}
    </div>
  );
}
