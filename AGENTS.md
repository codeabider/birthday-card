# Birthday Card — Ship & Local-Test Workflow

## Code conventions
- Use ES6 arrow functions everywhere: `const foo = () => {}` (or `export const foo = () => {}` in
  modules). There are NO `function` declarations in this codebase — arrow style is required so
  top-level ordering stays predictable and state bindings (`this`-free) work.
  Note: arrow consts are NOT hoisted, so if a function is called in a top-level statement or used
  as a `$props()` default, define it BEFORE that use.
- Runes mode only (`$state`, `$derived`, `$props`, `$effect`).
- A derived value cannot be `export`ed from a `.svelte.js` module — export a plain function
  (`export const isOwner = () => ...`) that the template calls instead.
- All user-facing copy lives in `src/lib/config/defaults.js` (baked in) and is overridden per card
  by the `settings`/`planets`/`gifts` columns in Supabase. Do NOT hardcode copy back into
  components — read it from the card store.

## Card config architecture
- `src/lib/config/defaults.js` — `DEFAULT_CARD` is the built-in fallback and the shape every card
  must satisfy. Edit this to change the shipped copy for every card.
- `src/lib/config/supabase.js` — browser client + `isConfigured` + `photoPublicUrl`. Uses
  `$env/dynamic/public` on purpose: a `$env/static/public` import of a missing key is a hard build
  error, and the app must build with no `.env` present.
- `src/lib/config/card.svelte.js` — the reactive store (`card`, `cardState`, `loadCard`, `fill`).
  Loads by slug, deep-merges over `DEFAULT_CARD`, and pushes the name into `persona`.
- `src/lib/config/finale.svelte.js` — `closingText`, `buildPlan`, `finaleWishes`, `themeEmoji`.
- `src/lib/config/auth.svelte.js` + `src/lib/config/admin.svelte.js` — `/admin` session + CRUD.
- Public cards: `src/routes/c/[slug]/` (6 pages mirroring the root routes). These are
  `prerender = false, ssr = false` and are served by the `404.html` fallback
  (`fallback: '404.html'` in `vite.config.js`), so **new cards need no rebuild** — the slug is
  resolved client-side.
- The root `+layout.svelte` strips a `/c/<slug>` prefix before matching `FLOW_ROUTES`, so the same
  route table drives both the default card and every slug. Navigation is prefix-aware via
  `cardPrefix`; keep it that way when touching nav code.
- `?for=<name>` still works as a name override preview.
- `scripts/seed_card.mjs` (`npm run seed -- <slug> [name] [YYYY-MM-DD]`) upserts a card from the
  defaults.

## Local-test-only edits (never ship these)
Three files carry changes that exist ONLY for local development convenience:

| File | Local-test edit | Why |
| --- | --- | --- |
| `src/lib/components/BirthdayGate.svelte` | `const LOCAL_TEST_TIMER = true;` active (`false` commented out) | so the gate opens ~5s after load instead of waiting for the real date |
| `src/routes/greet/+page.svelte` | `<BirthdayMusic />` is commented out | no music while iterating locally |
| `src/routes/final/+page.svelte` | `<BirthdayMusic />` is commented out | no music while iterating locally |

The same three edits also exist under `src/routes/c/[slug]/` and are toggled by the same script.
In ship state the gate reads the card's own `birthdayAt` from Supabase, so the date is no longer
a hardcoded constant in the component.

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

## Finale reel (inside route `/final`, after gifts)
The `final` route is ONE merged screen: the retro-style reel plays (title card →
single shot → **end card = the final birthday message**). The closing text
(wishes from the person's choices, heart, restart button) is rendered as the
reel's last segment in `RetroReel.svelte`; it stays on screen after the reel
finishes. Wording is built in `src/routes/final/+page.svelte` from
`flow.choices` (same copy that used to live in the deleted
`Final.svelte` / `CinematicSky` screen).
- Reusable via `?for=<name>` (default "Namita") — captions use the persona name.
- Single slide: the reel shows one shot only; drop the image as
  `static/reel-photos/01.png` (a transparent PNG cutout — tried first), falling
  back to `01.jpg`. The scene: big egg at the bottom cracks open in sync while
  the cutout image rises slowly from below (0% → 60% of its height) and stays,
  then a pink cake with candles flies in. Missing image → generated placeholder
  scene (build never breaks).
  NOTE: the folder must NOT be named `final` — a `static/final/` directory
  collides with the prerendered `final.html` route on gh-pages (would 404).
- Song: drop `static/songs/retro.mp3`; until it exists the reel plays only the
  synthesized click/chime SFX (also never breaks the build).
- Flow: `final` is the LAST route in `FLOW_ROUTES`; the reel completes when the
  reel ends and the message card stays up (no auto-advance). A tap on the boot
  "PRESS PLAY" card starts audio (autoplay requires a gesture). Ambient
  `BirthdayMusic` mounts on `/final` once the reel is done.