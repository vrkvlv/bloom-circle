# Bloom Circle — clickable mockup

Swipe-based app: find a buddy nearby for running, yoga, gym, walks, cycling, dance.
This is a clickable demo deployed on Vercel, NOT a real product.

## Rules
- Plain HTML + CSS + JS. No frameworks, no build step, no backend, no database.
- Fake users live in the PEOPLE array (move it to data.js when asked). State lives in JS variables.
- Write the simplest code that works. Don't add libraries without asking.
- Change only what the task needs; don't rewrite screens that already work.
- After a change, swipes, match and chat must still work.
- App texts are in English.

## Design — palette C (keep it exactly)
Look at design/*.png before building a new screen and match that style.
(Screenshots were taken without web fonts; the real fonts are below.)

| Token | Hex | Use |
| --- | --- | --- |
| --cocoa | #4A3832 | main dark background |
| --cream | #F5F2EC | light background, cards |
| --olive | #6E6B4A | secondary (invite button, sent messages, progress) |
| --terra | #D9774B | the ONE accent: like button, logo text, match screen, key highlights |
| --ink | #2E211D | text, 2–3px outlines |
| tints | #B8B58F, #E8A07E, #E3DED3 | soft fills only |

- Max 4 colors + their tints. Never add a new hue. Use the CSS variables in :root of style.css.
- Fonts: Shrikhand (headings, names, logo), Fredoka 400–700 (everything else).
- Style: thick dark outlines (2–3px #2E211D), big radii (20–34px), pill buttons,
  flower logo (6 cream petals, terracotta center), 4-point sparkle shapes as decor,
  small "hard" shadows like `0 4px 0 #2E211D` on selected items. No gradients, no emoji in UI.
- Phone first: 390×844 frame on desktop, full screen on mobile. Buttons >= 44px.
- Text contrast >= 4.5:1.

## Files
- index.html — all screens as `<section class="screen" id="...">`; `data-go="id"` switches screens.
  Profile holds two pages: `#profMain` and `#profSettings` (the gear opens settings, the arrow goes back).
- style.css — styles; tokens in :root. Profile classes are prefixed `p-` so they don't clash with the card styles.
- app.js — onboarding, swipe deck (pointer drag), match, chat with fake replies,
  profile (edit/preview, prompts, availability, badges) and settings.
  Profile data lives in `myProfile`; activities, availability and distance live in `state`
  and are shared with onboarding and the discover filters — edit them in one place and the other follows.
- design/ — reference screenshots of the 5 screens

## Deploy
Static site on Vercel: Framework preset "Other", no build command, output = repo root.
