#!/usr/bin/env python3
"""Write a day's rundown into the STC website's Task Track timeline file
(.planning/TASK-TRACK-TIMELINE.md in the STC-Comrehensive-main repo) and
push it, so the live site's right-rail timeline picks it up.

That file is baked into the site at build time (`?raw` import in
timelineData.ts) — editing it locally does nothing to the live site until
it's committed and pushed (Vercel auto-deploys on push to master).

Only replaces the target weekday's "## <Weekday> Priorities" and
"## <Weekday>" sections. Leaves "## Every Day" and every other weekday's
section untouched.

Usage:
  python3 update_task_track.py data.json --repo /path/to/STC-Comrehensive-main [--no-push]

data.json shape:
{
  "weekday": "Monday",
  "priorities": [
    {"priority": "P1", "title": "...", "note": "..."},   // note may be ""; priority is required (P1 or P2)
    ...
  ],
  "timeline": [
    {"time": "10:30am", "priority": "P1", "title": "...", "note": "..."},  // priority may be "" for an untagged landmark
    ...
  ]
}
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

TIMELINE_REL_PATH = Path(".planning/TASK-TRACK-TIMELINE.md")
DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]


def _priority_line(item):
    if not item.get("priority"):
        raise ValueError(f"priorities entries require a priority (P1/P2): {item!r}")
    text = f"- [{item['priority']}] {item['title']}"
    if item.get("note"):
        text += f" — {item['note']}"
    return text


def _timeline_line(item):
    tag = f"[{item['priority']}] " if item.get("priority") else ""
    text = f"- {tag}{item['time']} — {item['title']}"
    if item.get("note"):
        text += f" — {item['note']}"
    return text


def build_section_text(data):
    priorities = "\n".join(_priority_line(i) for i in data["priorities"]) or "-"
    timeline = "\n".join(_timeline_line(i) for i in data["timeline"]) or "-"
    return priorities, timeline


def replace_day_sections(md_text, weekday, priorities_text, timeline_text):
    if weekday not in DAY_ORDER:
        raise ValueError(f"unknown weekday {weekday!r}, expected one of {DAY_ORDER}")

    def replace_section(text, heading, new_body):
        pat = re.compile(
            r"(## %s\n\n)(.*?)(?=\n\n## |\Z)" % re.escape(heading), re.DOTALL
        )
        m = pat.search(text)
        if not m:
            raise ValueError(f"section '## {heading}' not found in timeline file")
        return text[: m.start(2)] + new_body + text[m.end(2):]

    md_text = replace_section(md_text, f"{weekday} Priorities", priorities_text)
    md_text = replace_section(md_text, weekday, timeline_text)
    return md_text


def run(repo, data, push=True):
    timeline_path = repo / TIMELINE_REL_PATH
    original = timeline_path.read_text(encoding="utf-8")
    priorities_text, timeline_text = build_section_text(data)
    updated = replace_day_sections(original, data["weekday"], priorities_text, timeline_text)
    timeline_path.write_text(updated, encoding="utf-8")

    subprocess.run(["git", "add", str(TIMELINE_REL_PATH)], cwd=repo, check=True)
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=repo)
    if diff.returncode == 0:
        print("no changes to commit (timeline already matched)")
        return
    subprocess.run(
        ["git", "commit", "-m", f"chore: update Task Track timeline for {data['weekday']}"],
        cwd=repo, check=True,
    )
    if push:
        subprocess.run(["git", "push"], cwd=repo, check=True)
        print(f"committed and pushed Task Track update for {data['weekday']}")
    else:
        print(f"committed (not pushed) Task Track update for {data['weekday']}")


def _selftest():
    import tempfile

    sample_md = """# Task Track — Daily Timeline

## Every Day

8:00am - Sean Communications

## Monday Priorities

- [P1] old item — stale

## Monday

- [P1] 9:00am — old event — stale

## Tuesday Priorities

-

## Tuesday

-
"""
    data = {
        "weekday": "Monday",
        "priorities": [
            {"priority": "P1", "title": "Print group schedule", "note": "Google Doc from Amy"},
            {"priority": "P2", "title": "Confirm UA list for Tuesday", "note": ""},
        ],
        "timeline": [
            {"time": "10:30am", "priority": "P1", "title": "QOL with Zainah", "note": "Scheduled Friday"},
            {"time": "2:00pm", "priority": "", "title": "Check Mail", "note": ""},
        ],
    }
    priorities_text, timeline_text = build_section_text(data)
    assert priorities_text == (
        "- [P1] Print group schedule — Google Doc from Amy\n"
        "- [P2] Confirm UA list for Tuesday"
    ), priorities_text
    assert timeline_text == (
        "- [P1] 10:30am — QOL with Zainah — Scheduled Friday\n"
        "- 2:00pm — Check Mail"
    ), timeline_text

    updated = replace_day_sections(sample_md, "Monday", priorities_text, timeline_text)
    assert "old item" not in updated and "old event" not in updated
    assert "Print group schedule" in updated and "QOL with Zainah" in updated
    assert "## Every Day" in updated and "8:00am - Sean Communications" in updated, "untouched section got mangled"
    assert "## Tuesday Priorities\n\n-\n\n## Tuesday\n\n-" in updated, "other weekday got mangled"

    with tempfile.TemporaryDirectory() as tmp:
        repo = Path(tmp)
        (repo / ".planning").mkdir()
        (repo / TIMELINE_REL_PATH).write_text(sample_md, encoding="utf-8")
        subprocess.run(["git", "init", "-q"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.email", "test@test"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.name", "test"], cwd=repo, check=True)
        subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=repo, check=True)

        run(repo, data, push=False)
        committed = subprocess.run(
            ["git", "log", "-1", "--pretty=%s"], cwd=repo, capture_output=True, text=True, check=True
        ).stdout.strip()
        assert committed == "chore: update Task Track timeline for Monday", committed
        final = (repo / TIMELINE_REL_PATH).read_text(encoding="utf-8")
        assert "Print group schedule" in final

    print("selftest OK — section replace correct, other sections untouched, git commit verified")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--selftest":
        _selftest()
        sys.exit(0)

    parser = argparse.ArgumentParser()
    parser.add_argument("data_file")
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--no-push", action="store_true")
    args = parser.parse_args()

    data = json.load(open(args.data_file))
    run(args.repo.resolve(), data, push=not args.no_push)
