# Rage Bro — rebuilt

A clean Cloudflare Workers chatbot for a school project.

© 2026 Rage Bro — Created by Saad Malik & Ghulam Dastagir.

## What changed

- Gemini API on the server side (API key is a Cloudflare Secret, never frontend code)
- Fresh Hinglish trolling instead of fixed replies
- Conversation history so replies can react to the previous messages
- Random meme generator with 20 different built-in meme cards
- No external meme-image dependency
- Web Audio sound effects: Boom, Bonk, Suspicious, Pop
- Sound ON/OFF
- Light/dark mode
- Responsive mobile UI
- Worker name remains `troll-bot` to preserve the existing Cloudflare project URL; the visible bot name is `Rage Bro`.

## 1) Add the Gemini key

Cloudflare Dashboard:

Workers & Pages → `troll-bot` → Settings → Variables and Secrets

Add a secret:

Name:
`GEMINI_API_KEY`

Value:
your NEW Gemini API key

Do not put the key in GitHub or `src/index.js`.

## 2) Deploy

Your GitHub Build settings can use:

Deploy command:
`npx wrangler deploy`

Build command:
leave empty

Then deploy again.

## 3) Test

Open:
`https://troll-bot.YOUR-SUBDOMAIN.workers.dev`

Try:
- `2+2 kitna hota hai?`
- `Kal school jana hai?`
- `Mere dost ko roast karo`
- `Who are you?`

## Model

The Worker currently uses `gemini-3.8-flash`.
You can change `MODEL` in `src/index.js` if you want another Gemini model.

## Security

If an API key has ever been pasted into a chat, screenshot, GitHub commit, or public log, revoke/rotate it and create a fresh key.
