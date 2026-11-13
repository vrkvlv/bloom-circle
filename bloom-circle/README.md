# Bloom Circle — clickable prototype

Static site (HTML + CSS + JS), no build step. Palette C: cocoa, cream, olive + terracotta.

## What's interactive
- **Onboarding**: toggle activities, pick a time, drag the distance slider, "Find my circle".
- **Discover**: swipe cards with mouse/finger (or ← → keys), ✕ / ♥ / ⚡ buttons, filter chips.
  Mutual likes (Sofia, Olha, Anna, Ira) open the match screen; ⚡ always matches.
- **Match**: "Say hi" opens the chat with that person, "Keep swiping" goes back.
- **Chat**: send messages (fake auto-reply), quick replies, "I'm in" confirms the plan, "Change time" suggests another time.

## Deploy to Vercel
**Option A — via GitHub (no terminal):**
1. Create a new GitHub repo and upload `index.html`, `style.css`, `app.js`.
2. vercel.com → Add New → Project → import that repo.
3. Framework preset: **Other**, leave build settings empty → Deploy.

**Option B — CLI:** in this folder run `npx vercel` and follow the prompts (then `npx vercel --prod`).

Run locally: just open `index.html` in a browser.
