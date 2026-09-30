#!/usr/bin/env python3
"""Toggle local-test-only edits between local and ship states.

Three files carry changes that are ONLY meant for local development:
  1. src/lib/components/BirthdayGate.svelte  -> LOCAL_TEST_TIMER forces the gate open in ~5s
  2. src/routes/{greet,c/[slug]/greet}        -> music is commented out
  3. src/routes/{final,c/[slug]/final}        -> music is commented out

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
SLUG = ROOT / "src/routes/c/[slug]"
GREET_FILES = [ROOT / "src/routes/greet/+page.svelte", SLUG / "greet/+page.svelte"]
FINAL_FILES = [ROOT / "src/routes/final/+page.svelte", SLUG / "final/+page.svelte"]

TEST_TIMER_ON = "const LOCAL_TEST_TIMER = true;"
TEST_TIMER_OFF = "const LOCAL_TEST_TIMER = false;"

MUSIC = "<BirthdayMusic />"
MUSIC_OFF = f"<!-- {MUSIC} -->"


def set_gate(opened):
    """Flip the LOCAL_TEST_TIMER boolean in BirthdayGate.svelte.

    Rewrites the declaration pair from scratch so it is idempotent and does not
    depend on the file's starting state. `opened=True` means ship state (real
    card date), so the test timer is switched off.
    """
    p = GATE
    lines = p.read_text().splitlines()
    active = TEST_TIMER_OFF if opened else TEST_TIMER_ON
    inactive = TEST_TIMER_ON if opened else TEST_TIMER_OFF
    out = []
    done = False
    for line in lines:
        if "const LOCAL_TEST_TIMER" in line:
            if done:
                continue  # collapse any stray duplicate declarations
            out.append(f"\t// {inactive}")
            out.append(f"\t{active}")
            done = True
            continue
        out.append(line)
    if not done:
        sys.exit("could not find the LOCAL_TEST_TIMER declaration in BirthdayGate.svelte")
    p.write_text("\n".join(out) + "\n")


def set_music(on):
    """Rewrite the BirthdayMusic mount lines in greet + final.

    Line based and idempotent: replacing the raw marker as a substring would
    wrap an already-commented line again on every run, producing nested
    comment markers.
    """
    for p in (*GREET_FILES, *FINAL_FILES):
        lines = p.read_text().splitlines()
        out = []
        touched = False
        for line in lines:
            if "BirthdayMusic />" in line:
                indent = line[: len(line) - len(line.lstrip())]
                out.append(f"{indent}{MUSIC}" if on else f"{indent}{MUSIC_OFF}")
                touched = True
                continue
            out.append(line)
        if not touched:
            sys.exit(f"no BirthdayMusic marker found in {p}")
        p.write_text("\n".join(out) + "\n")


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