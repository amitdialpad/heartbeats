# Heartbeats

Async written updates between Amit and Josh. Write instead of meet. Inspired by
Basecamp's "Heartbeats" (Jason Fried): short, considered notes anyone can read on
their own time. Green is fine, concerns need a nudge, red flags need a decision.

**Live:** https://amitdialpad.github.io/heartbeats/

---

## Daily use (the whole thing)

Open the live page, write the end-of-day note, hit **Done**.

The page turns the note into an `updates/*.md` beat, commits it to GitHub, and the
site updates in about a minute. Status is inferred from the text, so you do not
need to fill out green / concern / red fields.

One-time browser setup: save a fine-grained GitHub token in the page setup dialog
with access to `amitdialpad/heartbeats` and Contents read/write permission.

## Terminal fallback

```bash
beat
```

Your editor opens with today's template filled in. Write, save, close. It commits
and pushes immediately and the site updates in ~1 minute. Close without saving (or
leave the body as placeholders) and nothing posts.

No token or terminal? Open a **New beat** issue on the repo. It still converts to a
post and closes itself.

---

## One-time setup (~10 min)

1. **Create the repo** named `heartbeats` under `amitdialpad`, push these files to `main`.
2. **Turn on Pages:** repo → Settings → Pages → Source = **GitHub Actions**.
3. **Make `beat` runnable from anywhere.** From the repo folder:
   ```bash
   chmod +x bin/beat.mjs
   npm link            # gives you a global `beat` command
   ```
   Then set who you are and your editor in your shell profile (`~/.zshrc`):
   ```bash
   export BEAT_AUTHOR=amit
   export EDITOR="code --wait"   # or: nano / vim / "cursor --wait"
   ```
   Reload: `source ~/.zshrc`. Now `beat` works from inside the repo folder.
   > `npm link` resolves the command globally, but `beat` must be run **inside the
   > repo** (it commits there). Tip: add `alias beat="cd ~/code/heartbeats && beat"`.

4. **Josh:** give him write access to the repo. He can use the page with his own
   token, or the **New beat** issue form with no setup.

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

Each beat is one Markdown file in `updates/` with frontmatter (`author`, `date`,
`status: green|concern|red`) and Markdown body. The page writes a plain `Note`
section and infers status from the text. First draft is yours, in your own words.
