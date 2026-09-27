#!/usr/bin/env python3
"""Toggle local-test-only edits between local and ship states.

Three files carry changes that are ONLY meant for local development:
  1. src/lib/components/BirthdayGate.svelte  -> test timer forces gate open in ~5s
  2. src/routes/greet/+page.svelte           -> music is commented out
  3. src/routes/final/+page.svelte           -> music is commented out

Usage:
    python3 scripts/toggle_local_test.py local   # enable test timer + mute music (for local dev)
    python3 scripts/toggle_local_test.py ship    # real date + music on (for deploy)

Run 'ship' right before deploying, then 'local' again afterwards to keep the
working tree convenient for local testing.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GATE = ROOT / "src/lib/components/BirthdayGate.svelte"
GREET = ROOT / "src/routes/greet/+page.svelte"
FINAL = ROOT / "src/routes/final/+page.svelte"

REAL_DATE = "const birthdayTimestamp = new Date('2026-10-01T00:00:00+05:30').getTime();"
TEST_TIMER = "const birthdayTimestamp = Date.now() + 5000; // test timer — never commit! (LOCAL TEST)"

MUSIC = "<BirthdayMusic />"
MUSIC_OFF = f"<!-- {MUSIC} -->"


def set_gate(opened):
    p = GATE
    text = p.read_text()
    if opened:
        text = re.sub(r"^(?P<ws>\s*)// (?P<real>const birthdayTimestamp = new Date\(.*getTime\(\);)$",
                      lambda m: f"{m.group('ws')}{m.group('real')}", text, flags=re.MULTILINE)
        text = re.sub(r"^(?P<ws>\s*)(?P<test>const birthdayTimestamp = Date\.now\(\) \+ 5000;.*)$",
                      lambda m: f"{m.group('ws')}// {m.group('test')}", text, flags=re.MULTILINE)
    else:
        text = re.sub(r"^(?P<ws>\s*)(?P<real>const birthdayTimestamp = new Date\(.*getTime\(\);)$",
                      lambda m: f"{m.group('ws')}// {m.group('real')}", text, flags=re.MULTILINE)
        text = re.sub(r"^(?P<ws>\s*)// (?P<test>const birthdayTimestamp = Date\.now\(\) \+ 5000;.*)$",
                      lambda m: f"{m.group('ws')}{m.group('test')}", text, flags=re.MULTILINE)
    p.write_text(text)


def set_music(on):
    for p in (GREET, FINAL):
        text = p.read_text()
        if on:
            text = text.replace(MUSIC_OFF, MUSIC)
        else:
            text = text.replace(MUSIC, MUSIC_OFF)
        p.write_text(text)


def main():
    mode = (sys.argv[1] if len(sys.argv) > 1 else "").lower()
    if mode == "ship":
        set_gate(opened=True)
        set_music(on=True)
        print("ship state set: real birthday date active, music enabled on greet + final")
    elif mode == "local":
        set_gate(opened=False)
        set_music(on=False)
        print("local state set: test timer active, music muted on greet + final")
    else:
        sys.exit("usage: python3 scripts/toggle_local_test.py <ship|local>")


if __name__ == "__main__":
    main()