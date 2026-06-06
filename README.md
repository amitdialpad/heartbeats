# Heartbeats

Private written updates between Amit and Josh. Write once, read when ready, and
keep the useful context in one durable place instead of scattering it through
chat or meetings.

Heartbeats is a small practice, not a status dashboard: end the day by writing
what mattered, what needs attention, and what you think should happen next.

**Live:** https://amitdialpad.github.io/heartbeats/

---

## Daily use (the whole thing)

Open the live page, write the end-of-day note, hit **Done**.

The page turns the note into an `updates/*.md` beat in the configured private
updates repo. Status is inferred from the text, so you do not need to fill out
green / concern / red fields.

One-time browser setup: save a fine-grained GitHub token in the page setup dialog
with access to the private updates repo and Contents read/write permission.

## Privacy model

The public GitHub Pages repo is only the app shell. It can be open so anyone can
copy or use the writing tool.

Amit's actual updates should live in a separate private repo, default:

```text
amitdialpad/heartbeats-private
```

Give Josh read access to that private repo. Amit needs Contents read/write to
publish and edit. Josh only needs Contents read to read updates, unless he will
also edit or publish.

Each person stores their own fine-grained GitHub token in the browser Setup
dialog. Without private repo access, the archive cannot load the updates.

To make setup easier for someone else, send the app link with the private repo
pre-filled:

```text
https://amitdialpad.github.io/heartbeats/?repo=owner/repo
```

That link opens Setup and fills the private repo field. It does not grant access;
GitHub repo permissions still decide who can read or write.

## Terminal fallback

```bash
beat
```

The browser flow is the recommended private flow.

The old terminal command writes to the git repo it is run inside. Do not use it
from the public app repo for private updates unless it is updated to target the
private updates repo.

---

## One-time setup (~10 min)

1. **Create the app repo** named `heartbeats` under `amitdialpad`, push these files to `main`.
2. **Turn on Pages:** repo → Settings → Pages → Source = **GitHub Actions**.
3. **Create the private updates repo** named `heartbeats-private` under `amitdialpad`.
   Keep it private and give Josh repo access. The app will create `updates/` and
   `assets/` content when publishing.
4. **Josh:** give him access to the private updates repo. He can use the page
   with his own fine-grained token.

For another 1:1 pair, repeat step 3 with their own private repo. The public app
can stay shared; every pair chooses its own private content repo in Setup.

---

## Preview locally

```bash
npm run preview   # builds the index and serves http://localhost:4321
```

---

## If you'd rather host it inside house-of-air

Drop `index.html` (renamed, e.g. `heartbeats.html`), `updates/`, `scripts/`,
`data/` and `bin/` into that repo, point the `beat` alias there, and either keep the
Action or, if house-of-air builds with Vite, put `index.html` + `data/` under
`public/heartbeats/` and run `build-index` as a prebuild step. Everything else is
identical.

## Format

Each beat is one Markdown file in the private repo under `updates/` with
frontmatter (`author`, `date`, `status: green|concern|red`) and Markdown body.
The page writes a plain `Note` section and infers status from the text. First
draft is yours, in your own words.
