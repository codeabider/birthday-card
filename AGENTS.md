# Birthday Card — Ship & Local-Test Workflow

## Local-test-only edits (never ship these)
Three files carry changes that exist ONLY for local development convenience:

| File | Local-test edit | Why |
| --- | --- | --- |
| `src/lib/components/BirthdayGate.svelte` | test timer active (`const birthdayTimestamp = Date.now() + 5000;`), real date line commented | so the gate opens ~5s after load instead of waiting for the real date |
| `src/routes/greet/+page.svelte` | `<BirthdayMusic />` is commented out | no music while iterating locally |
| `src/routes/final/+page.svelte` | `<BirthdayMusic />` is commented out | no music while iterating locally |

When the user ships the deployable state of these files, keep all other
session changes (copy, sizing, etc.) intact — ONLY toggle these three things.

## How to ship
Whenever the user asks to ship/deploy (or says "ship it"):

1. `python3 scripts/toggle_local_test.py ship`
   - restores the real birthday date and enables music on greet + final.
2. Deploy/push as requested (e.g., `npm run build` + `gh-pages -d build`).
3. Immediately after, `python3 scripts/toggle_local_test.py local`
   - re-enables the test timer and re-mutes music, restoring the convenient
     local-testing state.
4. Optionally rebuild so the local preview serves the restored state.

The script is idempotent: running `ship` then `local` always returns the tree
to the current local-test state.

## Guardrail
Never commit/push with the test timer active or music disabled — those mark a
"local test" state and should only exist in the working tree.