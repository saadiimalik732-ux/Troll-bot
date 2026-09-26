# Rage Bro — rebuilt (bug-fix pass)

A Cloudflare Workers chatbot for a school project: a "troll" persona
(Gemini-powered) that answers every message with a funny/sarcastic
Hinglish reply instead of a normal answer.

## What was actually wrong (and fixed)

1. **Invalid/unstable Gemini model name.** The code was hardcoded to
   `gemini-3.5-flash`, which is why almost every message failed with
   "Gemini ne reply dene se mana kar diya". The Worker now tries
   `gemini-flash-latest` first (a Google-managed alias that always points
   at their current recommended fast model, so it won't go stale the way a
   pinned model name eventually will), then falls back to `gemini-2.5-flash`
   and `gemini-3-flash-preview` if that ever fails. Note: `gemini-2.5-flash`
   is scheduled to be retired by Google around **October 16, 2026** — if
   you're reading this after that date and still see failures, drop it from
   the `MODELS_TO_TRY` list in `src/index.js` and swap in whatever Gemini
   currently calls its latest stable flash model.
2. **`/health` returning a 404.** Cloudflare's static-asset layer can
   intercept a direct browser visit to a path like `/health` before it ever
   reaches your Worker code, if `assets.run_worker_first` isn't set for
   that path. `wrangler.jsonc` now explicitly forces `/api/*` and `/health`
   to always run the Worker first.
3. **"Failed to execute 'json' on 'Response': Unexpected end of JSON
   input"** on the frontend. This happens when the server sends back a
   response that isn't valid JSON (e.g. an unhandled exception produces
   Cloudflare's own generic error page instead of your `{ error: ... }`
   JSON). The whole `fetch` handler is now wrapped so it always returns a
   proper JSON body from `/api/*`, and the Gemini call has a 12-second
   timeout so a hung request can't stall past that.
4. A stray, non-standard `"secrets": { "required": [...] }` block was
   removed from `wrangler.jsonc` — that isn't a real Wrangler config field
   and did nothing. Secrets are set the normal way (see below).
5. README said the Worker was named `rage-bro`; the actual deployed name
   (in `wrangler.jsonc` and your live URL, `troll-bot.hulksmp9.workers.dev`)
   is `troll-bot`. Fixed the docs to match.

## 1) Add the Gemini key as a secret

Easiest way, from the project folder:

```
npx wrangler secret put GEMINI_API_KEY
```

It'll prompt you to paste the key — paste it and press Enter. You can also
do this from the dashboard instead:

Cloudflare Dashboard → Workers & Pages → `troll-bot` → Settings →
Variables and Secrets → add a **Secret** named `GEMINI_API_KEY`.

Never put the key directly in `src/index.js` or commit it to GitHub.

## 2) Install and deploy

```
npm install
npx wrangler deploy
```

**Important:** every time you change any file in `src/` or `public/`, you
have to run `npx wrangler deploy` again — editing the file locally does
not update what's live. This is the most common reason a fix "doesn't
work": the old buggy version is still the one actually deployed.

## 3) Test

Open your Worker URL, e.g.:
`https://troll-bot.hulksmp9.workers.dev`

Check the health endpoint (should return JSON, not a 404):
`https://troll-bot.hulksmp9.workers.dev/health`

Try in the chat:
- `2+2 kitna hota hai?`
- `Kal school jana hai?`
- `Mere dost ko roast karo`
- `Who are you?`

If you ever get the "Gemini ne reply dene se mana kar diya" message, run
`npx wrangler tail` while you send a test message — it prints the real
Gemini error (model name, status, quota, etc.) that's hidden from the
frontend on purpose.

## Model

`MODELS_TO_TRY` in `src/index.js` is the list of models attempted in order.
Edit that array if you want to change or reorder them.

## Security

If an API key has ever been pasted into a chat, screenshot, GitHub commit,
or public log, revoke/rotate it and create a fresh key.
