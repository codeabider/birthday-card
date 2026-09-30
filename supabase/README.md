# Supabase setup

The card content (copy, planets, gifts, birthday date, reel photo) is stored in
Supabase and configured through the owner-only admin at `/admin`.

## One-time setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `cards` table, the `updated_at` trigger, the RLS policies,
   and the public `card-photos` storage bucket.
3. Copy `.env.example` to `.env` and fill it in:
   - `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` —
     Dashboard → your project → **Settings → API Keys**
     (direct link: `https://supabase.com/dashboard/project/<your-ref>/settings/api-keys`)
   - `PUBLIC_OWNER_EMAIL` — the account allowed to edit cards

   The **Connect** button at the top of the project page shows both values if you
   would rather not dig through settings. The publishable key is the current
   browser key (`sb_publishable_...`); the legacy `anon`/`public` JWT still works
   and is accepted under `PUBLIC_SUPABASE_ANON_KEY`.
4. Create the owner user under **Authentication → Users → Add user**, using the
   same email as `PUBLIC_OWNER_EMAIL`.

Without a `.env` the site still builds and runs on the built-in defaults in
`src/lib/config/defaults.js` — nothing breaks, there is just no admin.

## Adding a card

Either use `/admin` in the browser, or seed from the CLI:

```sh
npm run seed -- namita
npm run seed -- namita "Ada Lovelace" 2027-03-14
```

The card is then live at `/c/<slug>` with no rebuild — the slug is resolved
client-side and deep links are served by the `404.html` fallback.

## Editing

- **Planets** and **gifts** are ordered lists: add, remove, reorder. Their
  visuals (size, colour, orbit) are generated from list position, so only the
  name/text/emoji/body are stored.
- **Screen copy** edits the shared strings. Use `{name}` in any text field and it
  is replaced with the card's name.
- **The four planner stages are fixed** in shape. The personalised closing line
  branches on the exact choice indices, so stage count and choice counts must not
  change — only their text is editable.
- The **reel photo** should be a PNG with transparency (a cutout), which layers
  cleanly over the rising animation.

## Security notes

- The anon key ships in the browser bundle. That is fine — RLS, not key secrecy,
  is what protects the data.
- Read policies are public, so every card row is readable by anyone with the
  anon key. That is intentional for public card pages, but it does mean card
  content is not private.
- Write policies allow any authenticated account. `PUBLIC_OWNER_EMAIL` is the
  real single-owner guard: the admin refuses to load for a signed-in user whose
  email does not match.
