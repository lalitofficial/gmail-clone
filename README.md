# Gmail Clone

A pixel-faithful Gmail UI clone for **web** and **mobile**, built UI-first with mock data
(no backend yet). Built on **Material Design 3** — Gmail's real design language — using
Google's M3 tokens, Material Symbols icons, and Roboto.

## Structure (npm workspaces monorepo)

```
packages/shared   Framework-agnostic types, design tokens (M3), helpers
apps/server       Real backend — Express + WebSocket + JSON store; 5 accounts, live delivery
apps/web          Desktop Gmail — React + Vite, custom hash router, custom CSS on M3 tokens
apps/mobile       Gmail app — Expo + React Native + React Navigation
```

The 5 accounts (lalitkofficial@gmail.com, me24b124@smail.iitm.ac.in,
aiforkidsofficial@gmail.com, ccw@smail.iitm.ac.in, gsmandakb@smail.iitm.ac.in) send mail to
each other in real time over the LAN. Web talks to the server through a Vite proxy
(`/api`, `/ws`); mobile derives the server host from the Expo dev host.

## Run (3 parts)

```bash
npm install            # once, from the repo root

npm run server         # backend → http://0.0.0.0:4000  (start this first)
npm run web            # web app → http://localhost:5173  (sign in, pick an account)
npm run mobile         # mobile  → Expo (press w for web, i/a for simulators)
```

URLs mirror Gmail: `/mail/u/0/#inbox`, `#category/social`, `#search/<q>`,
`#settings/general`, `#inbox/<threadId>`. Account switching uses `/mail/u/<N>/`.

### Serve at https://mail.google.com (local testing)

```bash
npm run gmail:setup -w apps/web          # mkcert trusted cert
sudo bash tools/gmail-local.sh enable    # point mail.google.com → 127.0.0.1
sudo npm run gmail -w apps/web           # https on :443
sudo bash tools/gmail-local.sh disable   # restore real Gmail
```

## Screens (all clickable against mock data)

| Screen            | Web                                   | Mobile                                  |
| ----------------- | ------------------------------------- | --------------------------------------- |
| Inbox / mail list | Sidebar, category tabs, hover actions | Search bar, avatar rows, Compose FAB    |
| Thread view       | Toolbar, message, attachments, reply  | Header actions, reply bar               |
| Compose           | Docked window (minimize/expand/close) | Full-screen modal                       |
| Search            | `/search?q=` results                  | Dedicated search screen                 |
| Folders / labels  | Sidebar nav                           | Slide-in navigation drawer              |

Interactions wired up: star, archive, delete, mark read/unread, category tabs, folder/label
switching, search, and compose (Send appends to Sent).

## Status

UI-first pass complete on both platforms. Messaging/backend is intentionally deferred.
The exact-pixel calibration is done against reference screenshots (see `tools/screenshot.mjs`
for the screenshot-compare loop).
```
