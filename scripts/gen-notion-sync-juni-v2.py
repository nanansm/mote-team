#!/usr/bin/env python3
"""
Generate idempotent SQL to sync Master Task (Notion) → Mote Team prod/local.
Source: Notion CSV export (_all.csv). Scope: 3 active clients, June 2026.

Maps title, status, due_date, posting_date, type_content, caption, 4 link fields.
Assignee intentionally skipped (Notion nicknames don't map cleanly; team assigns
in-app — same decision as notion-sync-juni-v1). Content brief/VO body lives in
the Markdown export, not the CSV — out of scope for this pass.

Idempotent: INSERT ... WHERE NOT EXISTS (by exact title) so re-runs never dup;
UPDATE by exact title refreshes status + detail from Notion (Notion = source of
truth for this sync).
"""
import csv
import sys
from datetime import datetime

CSV = "/Users/nanansomanan/Downloads/Private & Shared/Master Task (Task Management) 2c04a5a63bac803796bccae8234fc06b_all.csv"
OUT = "scripts/notion-sync-juni-v2.sql"

CLIENTS = [
    "Rancabango Hotel & Resort",
    "Kedai Nasi Sinar Berkah",
    "Restorasa",
]
STATUS_MAP = {
    "Not started": "not_started",
    "In Progress": "in_progress",
    "Done": "done",
    "Ready": "ready",
    "Scheduled": "scheduled",
    "Published": "published",
}
TYPE_MAP = {"Carousel": "carousel", "Reels": "reels"}


def g(r, k):
    return (r.get(k) or "").strip()


def client_of(r):
    cd = g(r, "Client Directory")
    for name in CLIENTS:
        if cd.startswith(name):
            return name
    return None


def is_june(r):
    for k in ("Tanggal Posting", "Due Date"):
        v = g(r, k)
        if "2026" in v and "June" in v:
            return True
    t = g(r, "﻿Task Name")
    return "- Juni -" in t or " Juni " in t


def parse_date(v):
    v = v.strip()
    if not v or "June" not in v and "2026" not in v:
        # try anyway
        pass
    for fmt in ("%B %d, %Y", "%B %d, %Y %I:%M %p"):
        try:
            return datetime.strptime(v.split(" → ")[0].strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def lit(v):
    """Dollar-quoted SQL string literal, or NULL."""
    if v is None or v == "":
        return "NULL"
    return f"$t${v}$t$"


def main():
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    sel = [r for r in rows if client_of(r) and is_june(r)]
    skipped = [r for r in sel if not g(r, "﻿Task Name")]
    sel = [r for r in sel if g(r, "﻿Task Name")]
    out = []
    out.append("-- Notion → Mote Team sync v2, June 2026 (status + detail).")
    out.append("-- Source: Notion CSV export. Scope: 3 active clients, June 2026.")
    out.append("-- Idempotent: INSERT WHERE NOT EXISTS (by title) + UPDATE by title.")
    out.append("-- Assignee skipped (team assigns in-app). Run on local first, then prod.")
    out.append("-- Apply with: psql --single-transaction -f this.sql  (atomic, rolls back on error).")
    out.append("")
    counts = {}
    for r in sel:
        cname = client_of(r)
        counts[cname] = counts.get(cname, 0) + 1
        title = g(r, "﻿Task Name")
        status = STATUS_MAP.get(g(r, "Status"), "not_started")
        due = parse_date(g(r, "Due Date"))
        posting = parse_date(g(r, "Tanggal Posting"))
        tc = TYPE_MAP.get(g(r, "Type Content"))
        caption = g(r, "Caption")
        l_materi = g(r, "Link Materi")
        l_output = g(r, "Link Output") or g(r, "Link Output ")
        l_ig = g(r, "Link Posting IG")
        l_tt = g(r, "Link Posting TT")

        cid = (
            f"(SELECT id FROM moteteam.client WHERE name = $t${cname}$t$)"
        )
        tlit = lit(title)
        out.append(
            f"INSERT INTO moteteam.task "
            f"(title, status, client_id, due_date, posting_date, type_content, "
            f"caption, link_materi, link_output, link_ig, link_tiktok)\n"
            f"SELECT {tlit}, '{status}', {cid}, "
            f"{('DATE ' + chr(39) + due + chr(39)) if due else 'NULL'}, "
            f"{('DATE ' + chr(39) + posting + chr(39)) if posting else 'NULL'}, "
            f"{(chr(39) + tc + chr(39)) if tc else 'NULL'}, "
            f"{lit(caption)}, {lit(l_materi)}, {lit(l_output)}, {lit(l_ig)}, {lit(l_tt)}\n"
            f"WHERE NOT EXISTS (SELECT 1 FROM moteteam.task WHERE title = {tlit});"
        )
        # UPDATE existing by title (refresh status + detail from Notion).
        sets = [f"status = '{status}'"]
        sets.append(f"due_date = {('DATE ' + chr(39) + due + chr(39)) if due else 'NULL'}")
        sets.append(f"posting_date = {('DATE ' + chr(39) + posting + chr(39)) if posting else 'NULL'}")
        sets.append(f"type_content = {(chr(39) + tc + chr(39)) if tc else 'NULL'}")
        sets.append(f"caption = {lit(caption)}")
        sets.append(f"link_materi = {lit(l_materi)}")
        sets.append(f"link_output = {lit(l_output)}")
        sets.append(f"link_ig = {lit(l_ig)}")
        sets.append(f"link_tiktok = {lit(l_tt)}")
        out.append(
            f"UPDATE moteteam.task SET {', '.join(sets)} WHERE title = {tlit};"
        )
        out.append("")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))
    print(f"Wrote {OUT}: {len(sel)} tasks (skipped {len(skipped)} empty-title)")
    for c, n in counts.items():
        print(f"  {n:3} {c}")


if __name__ == "__main__":
    main()
