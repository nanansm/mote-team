"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Columns3,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { visibleNav } from "./nav-items";

type Item = { group: string; label: string; icon: LucideIcon; href: string };

export function CommandPalette({
  clients,
  isAdmin,
}: {
  clients: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("mote:command", onEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("mote:command", onEvent);
    };
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const items = useMemo<Item[]>(
    () => [
      { group: "Aksi cepat", label: "Task baru", icon: Plus, href: "/tasks?new=1" },
      { group: "Aksi cepat", label: "Buka Board", icon: Columns3, href: "/tasks?view=board" },
      { group: "Aksi cepat", label: "Buka Kalender", icon: CalendarDays, href: "/tasks?view=calendar" },
      ...visibleNav(isAdmin).map((i) => ({
        group: "Navigasi",
        label: i.label,
        icon: i.icon,
        href: i.href,
      })),
      ...clients.map((c) => ({
        group: "Klien",
        label: c.name,
        icon: Building2,
        href: `/tasks?client=${c.id}`,
      })),
    ],
    [clients, isAdmin],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? items.filter((i) => i.label.toLowerCase().includes(needle))
      : items;
  }, [items, q]);

  const groups = useMemo(() => {
    const order = ["Aksi cepat", "Navigasi", "Klien"];
    return order
      .map((g) => ({ group: g, items: filtered.filter((i) => i.group === g) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Perintah cepat</DialogTitle>
        <DialogDescription className="sr-only">
          Cari klien, navigasi, atau aksi cepat
        </DialogDescription>

        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) go(filtered[0].href);
            }}
            placeholder="Cari klien, navigasi, atau aksi cepat…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada hasil.
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.group} className="mb-1">
                <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {g.group}
                </p>
                {g.items.map((i) => (
                  <button
                    key={i.group + i.href + i.label}
                    onClick={() => go(i.href)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
                    )}
                  >
                    <i.icon className="size-4 text-muted-foreground" />
                    {i.label}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
