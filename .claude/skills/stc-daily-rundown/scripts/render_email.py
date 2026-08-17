#!/usr/bin/env python3
"""Fill templates/email.html with rundown data via exact string substitution.

The STC logo is referenced as a hosted URL
(https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp), NOT a
base64 data: URI or a cid: inline attachment — both of those require
reproducing the ~59,000-character base64 blob verbatim inside a tool call,
which is prohibitively expensive (and error-prone) for an LLM to retype from
its own context. A plain https image src avoids that entirely: email clients
(including Gmail) fetch it directly, no attachment needed. Do not switch this
back to cid:/data: embedding — see git history / SKILL.md for why. This
script only touches the named placeholders and repeat blocks; every other
byte passes through unchanged.

Usage:
  python3 render_email.py data.json > rendered.html
  cat data.json | python3 render_email.py > rendered.html
  python3 render_email.py --selftest

data.json shape:
{
  "date_long": "Monday, August 17, 2026",
  "week_range": "8/17-8/21",
  "priorities": [{"title": "...", "note": "..."}, ...],   // note may be ""
  "timeline": [
    {"time": "12:00", "ampm": "PM", "priority": "P1"|"P2"|"", "title": "...", "note": "..."},
    ...
  ]
}
"""
import html
import json
import re
import sys
from pathlib import Path

TEMPLATE = Path(__file__).parent.parent / "templates" / "email.html"
REPEAT_RE = re.compile(r"<!-- BEGIN REPEAT.*?-->\n(.*?)\n<!-- END REPEAT.*?-->", re.DOTALL)


def _strip_or_keep(block, flag, keep):
    pat = re.compile(r"<!-- IF %s -->(.*?)<!-- END IF -->" % re.escape(flag), re.DOTALL)
    return pat.sub(lambda m: m.group(1) if keep else "", block)


def _fill_priority_badge(block, priority):
    for tag in ("P1", "P2"):
        pat = re.compile(r"<!-- IF PRIORITY = %s -->(.*?)<!-- END IF -->" % tag, re.DOTALL)
        block = pat.sub(lambda m: m.group(1) if priority == tag else "", block)
    return block


def render(data):
    out = TEMPLATE.read_text(encoding="utf-8")
    out = out.replace("{{DATE_LONG}}", html.escape(data["date_long"]))
    out = out.replace("{{WEEK_RANGE}}", html.escape(data["week_range"]))

    # Priorities repeat block — first remaining REPEAT region.
    m = REPEAT_RE.search(out)
    tpl = m.group(1)
    rows = []
    for item in data["priorities"]:
        block = _strip_or_keep(tpl, "PRIORITY_NOTE", bool(item.get("note")))
        block = block.replace("{{PRIORITY_TITLE}}", html.escape(item["title"]))
        block = block.replace("{{PRIORITY_NOTE}}", html.escape(item.get("note", "")))
        rows.append(block)
    out = out[: m.start()] + "\n".join(rows) + out[m.end():]

    # Timeline repeat block — next remaining REPEAT region.
    m = REPEAT_RE.search(out)
    tpl = m.group(1)
    rows = []
    items = data["timeline"]
    for i, item in enumerate(items):
        block = _fill_priority_badge(tpl, item.get("priority", ""))
        block = _strip_or_keep(block, "NOTE", bool(item.get("note")))
        block = block.replace("{{TIME}}", html.escape(item["time"]))
        block = block.replace("{{AMPM}}", html.escape(item["ampm"]))
        block = block.replace("{{TITLE}}", html.escape(item["title"]))
        block = block.replace("{{NOTE}}", html.escape(item.get("note", "")))
        if i == len(items) - 1:
            block = block.replace("border-left:2px solid #c7d2fe; ", "")
        rows.append(block)
    out = out[: m.start()] + "\n".join(rows) + out[m.end():]

    return out


def _selftest():
    sample = {
        "date_long": "Monday, August 17, 2026",
        "week_range": "8/17-8/21",
        "priorities": [
            {"title": "Print group schedule", "note": "Google Doc from Amy"},
            {"title": "Confirm UA list for Tuesday", "note": ""},
        ],
        "timeline": [
            {"time": "8:00", "ampm": "AM", "priority": "", "title": "Sean Communications", "note": ""},
            {"time": "12:00", "ampm": "PM", "priority": "P2", "title": "DIOP (Amy)", "note": "inferred"},
            {"time": "3:00", "ampm": "PM", "priority": "P1", "title": "DaSu with Amy", "note": "Confirmed"},
        ],
    }
    out = render(sample)
    assert "{{" not in out, "unfilled placeholder remains"
    assert 'src="https://stc-comprehensive.vercel.app/stc-logo-horizontal-v2.webp"' in out, "logo URL reference missing"
    assert "data:image" not in out, "a data: URI image slipped back in — Gmail strips these"
    assert "cid:stc_logo" not in out, "stale cid: reference — logo is now a hosted URL, no inline attachment needed"
    assert out.count("border-left:2px solid #c7d2fe") == len(sample["timeline"]) - 1, "last-row border not stripped"
    assert out.count(">P1<") >= 1 and out.count(">P2<") >= 1, "priority badges missing"
    print(f"selftest OK — {len(out)} bytes, hosted logo URL intact, {len(sample['timeline'])} timeline rows")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selftest":
        _selftest()
        sys.exit(0)
    raw = open(sys.argv[1]) if len(sys.argv) > 1 else sys.stdin
    sys.stdout.write(render(json.load(raw)))
