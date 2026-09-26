# 🤡 TrollBot
Cloudflare Workers Free-friendly funny Hinglish AI chatbot.

Uses Workers Static Assets + Workers AI. No Docker, Flask or Containers.

## Deploy
1. Upload this repo to GitHub.
2. Cloudflare Workers & Pages -> Create -> Import repository.
3. Deploy with `wrangler.jsonc` as-is.
4. Ensure the Worker has a Workers AI binding named `AI` (the config already declares it).
