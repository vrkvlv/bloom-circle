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
- app.js — splash, sign up / sign in, onboarding, swipe deck (pointer drag), match,
  chat list, chat with fake replies, profile (view/edit/preview, availability, badges) and settings.
  Profile data lives in `myProfile`; activities, availability and distance live in `state`
  and are shared with onboarding and the discover filters — edit them in one place and the other follows.
- design/ — reference screenshots of the screens

## How it hangs together
- Screen order: `splash` → `register` → `verify` → `liveness` → `onboarding` → `discover`.
  `Sign in` skips straight to `discover`. Log out goes back to `splash`.
- The splash flower blooms petal by petal, then the name, then the buttons — about 1.3s,
  driven by `.splash.active` so it replays every time the screen opens.
- Sign-up is a flow, not an account system: nothing is stored or sent. The phone code accepts
  any four digits and the liveness check is a timed stub with no camera — both say so on screen.
  Keep it that way unless someone asks for a real backend.
- The profile opens in **view** mode (fields read-only); `Edit` makes them editable, `Preview`
  shows the discover card others see. `setMode()` puts `mode-view|mode-edit|mode-preview` on `#profile`
  and most of the difference is CSS.
- `ACTIVITIES` holds the six basics plus whatever the user types in; `SUGGESTIONS` only feeds the
  autocomplete. Anything added shows up on the onboarding grid and in the discover filters too,
  so the onboarding grid scrolls when it gets long.
- Locked Pro options are `.p-lockrow` buttons with `data-lock="<phrase>"`; one handler sends them all
  to `openPaywall()`, which writes "Upgrade to Pro to unlock <phrase>." into `#premiumModal`.
  To add another, write the markup — no JS needed. The price and the benefit list live in that modal.
  Buying is still a toast: nothing actually unlocks.
- One chat per person in `state.chats`, unread flags in `state.unread`. `addMsg(from, text, person)`
  always writes to that person's thread — never to whoever happens to be on screen.

## Deploy
Static site on Vercel: Framework preset "Other", no build command, output = repo root.
