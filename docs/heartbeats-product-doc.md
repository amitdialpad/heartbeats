# Heartbeats Product Doc

## Summary

Heartbeats is a small writing-first daily update tool for Amit to open at the end
of the day, write a clear update, and hit one button: **Done**.

The core idea is deliberately simple:

- The first screen is a blank white writing canvas.
- The writer does not fill out forms.
- The writer does not pre-sort work into a dashboard.
- The writer writes in their own words, adds screenshots or links if needed, and
  publishes.
- The system stores the update as Markdown and turns it into a readable archive.

The product is built as a static GitHub Pages app shell backed by Markdown files
in a separate private updates repository. The live app shell is:

https://amitdialpad.github.io/heartbeats/

## Problem We Solved

The original direction was too feed-like. It made the page feel like a status
dashboard instead of a calm writing place.

The corrected brief was:

- Dropbox Paper-like page.
- End-to-end writing surface.
- Clean text only as the primary activity.
- Open the page at the end of the day.
- Write the update.
- Hit one button.
- Let the system handle the rest.

That became the product principle for the whole implementation: **write first,
classify and package second**.

## Why This Exists

Heartbeats creates a private written check-in habit for work that needs thought,
not interruption.

The useful practice is simple:

- Write once at the end of the day.
- Let the reader read when they are ready.
- Keep decisions, concerns, screenshots, and links attached to the update.
- Make important context durable instead of letting it dissolve in chat.
- Ask clearly for help or a decision only when that is actually needed.

The app should help Amit write clearly without turning the act of writing into
form-filling. The archive should help Josh understand the thread of work without
needing meetings or real-time status pings.

This framing appears in Setup, not on the blank writing canvas, so new users can
understand the practice without making daily writing feel like a landing page.

## What We Created

We created a static web app with three main surfaces:

1. **Writer**
   The blank daily writing canvas at `index.html`.

2. **Preview**
   A reading view of the current draft before publishing.

3. **Past updates**
   The archive page at `archive.html`, where older updates can be read, edited,
   or deleted.

The app is intentionally quiet:

- White background.
- Black text.
- Neutral gray lines and secondary text.
- No color-coded status UI.
- No dashboard cards.
- No marketing-style hero.
- No always-visible toolbar.

## Primary Workflow

The intended daily flow is:

1. Open the live page.
2. Start writing.
3. Add screenshots or links if needed.
4. Optionally mark a thought with a small section badge.
5. Optionally preview the formatted reading view.
6. Hit **Done**.

On the live GitHub Pages site, Done publishes the update to the configured
private updates repo using the GitHub Contents API.

On localhost, Done saves locally so the flow can be tested without pushing
content to GitHub.

## Writer Experience

The writer is the main product.

### Blank Canvas

The page loads into a clean white canvas with:

- Large writing type.
- `Start writing` placeholder text.
- A blinking cursor.
- No header.
- No visible controls until needed.

This was done to preserve the feeling of writing into a blank document instead of
operating software.

### Zero-distraction Controls

The footer controls are hidden by default.

They appear when the user hovers or taps near the bottom of the screen, and then
fade away after the user starts typing again.

The footer only shows the essentials:

- Today.
- Local state when relevant.
- Word/image count.
- Preview.
- Tools.
- Done.

Everything else lives in Tools, keyboard shortcuts, slash commands, or contextual
controls so the writing surface stays quiet.

### Autosave

Drafts autosave while typing.

Autosave uses:

- IndexedDB as the primary draft store.
- localStorage as fallback.
- A draft context so a new draft and an edited past update do not overwrite each
  other.

This protects against losing work if:

- The tab closes.
- The browser reloads.
- The user navigates away before pressing Done.

Image-heavy drafts are more likely to survive because IndexedDB is better suited
to larger browser-side data than localStorage.

## Sections

Instead of forcing the user to fill out four fields, sections are applied as
small badges while writing.

The available badges are:

- **Green**
- **Concerns**
- **Red flags**
- **POV**

The intended interaction is:

1. Write a thought naturally.
2. Click the correct badge.
3. The current thought gets labeled.
4. The cursor moves to a new line.
5. Continue writing.

This matches the requested workflow: write first, then label the thought when it
makes sense.

### Section Meaning

**Green**
Things moving fine, no action needed. Just list them.

**Concerns**
The issue, how Amit is thinking about handling it, and what, if anything, he
wants from the reader.

**Red flags**
Something stuck, drastic, blocked, or decision-worthy, with why it matters and
what help or decision is needed.

**Point of view**
Reasoning before a pushback conversation, such as disagreeing with an email
design, a PM plan, or a proposed direction.

## Images and Screenshots

The writer supports screenshots and images.

Images can be added by:

- Pasting screenshots.
- Dropping image files into the editor.
- Using Tools > Add image.

Images render inline in the writer and preview. Pasted images get a generated
filename from nearby writing context where possible, and the writer exposes small
inline size controls when an image is selected.

When publishing live, data URL images are uploaded to:

```text
assets/updates/<beat-id>/<image-file>
```

The Markdown update then references the uploaded asset path.

Captions are supported through editable figure captions.

## Links

Links can be added in two ways:

- Select text and use Tools > Add link or Cmd/Ctrl + K.
- Select text and paste a URL to turn that selected text into a link.
- Paste or type a standalone URL.

Inline links render as normal text links.

Standalone URLs render as clean white link cards in Preview and Past updates.
The card shows:

- A readable label.
- The host/domain.

This avoids the ugly raw URL problem while keeping the visual system quiet and
colorless.

## Preview

Preview is the formatted reading view of the current draft.

Important details:

- It keeps the same large font size as the writer.
- It preserves paragraph breaks from contenteditable input.
- It uses a readable line length.
- It hides the "Preview" label so the view feels like the content itself.
- Standalone links render as link cards.
- Section headings render as small badges.

The write view stays full-width and unconstrained.

The reading view is constrained for usability:

- Preview text is capped at `52ch`.
- Past update text is capped at `64ch`.
- Images are allowed to remain wider so screenshots can still be inspected.

This balances the requested large type with readable line lengths.

## Past Updates

Past updates live at:

```text
archive.html
```

The archive is date-led, not author-led.

Each update shows:

- A large date.
- The rendered Markdown body.
- Section badges.
- Images.
- Link cards.
- Quiet Edit and Delete actions.

The author name is intentionally not repeated on every update because the date is
the more important scanning anchor.

## Editing Past Updates

Past updates can be edited.

When Edit is clicked:

1. The selected update is loaded into the writer.
2. The writer becomes the edit surface.
3. Done saves the edit instead of creating a duplicate.

On localhost:

- Editing built/demo entries is simulated locally.
- Local edits are stored as overrides.

On the live site:

- Editing uses the GitHub Contents API.
- The app fetches the existing file SHA.
- The app saves the updated Markdown back to the same private repo path.

## Deleting Past Updates

Past updates can be deleted.

On localhost:

- Local entries can be removed.
- Built entries can be hidden locally for testing.

On the live site:

- Delete uses the GitHub Contents API.
- The app fetches the file SHA.
- The app sends a DELETE request for the Markdown file.

Deletion asks for confirmation first.

## Setup

Because the site is static, publishing requires browser-side GitHub auth.

The Setup dialog stores:

- Author name.
- GitHub token.
- Private updates repo.

Setup explains the privacy model in plain terms: the page is public, but updates
are saved in a private repo chosen by the user.

The token should be:

- Fine-grained.
- Scoped to the private updates repo, default `amitdialpad/heartbeats-private`.
- Allowed Contents read and write.

The token is stored in browser storage. There is no backend service in this
implementation.

Invite links can pre-fill the private repo:

```text
https://amitdialpad.github.io/heartbeats/?repo=owner/repo
```

Opening that URL shows Setup automatically and fills the repo field. It does not
grant access; the private GitHub repo permissions still control who can read or
write.

## Publishing Model

Live publishing works through the GitHub Contents API against the configured
private updates repo.

When Done is clicked on the live site:

1. The editor content is serialized to Markdown.
2. Images are uploaded first if needed.
3. A Markdown update is created under `updates/`.
4. The private archive reads the update through the reader's GitHub token.

The generated update path is:

```text
updates/<date>-<author>-<time>.md
```

Each update has frontmatter:

```markdown
---
author: amit
date: 2026-06-06
status: green
---
```

The body is normal Markdown.

## Local Testing Model

On localhost, the app does not publish to GitHub.

Instead it uses browser storage:

- `heartbeats.localEntries`
- `heartbeats.localOverrides`
- `heartbeats.hiddenEntries`
- `heartbeats.draft`
- `heartbeats.draftContext`
- IndexedDB database `heartbeats-drafts`

This lets the product be tested locally without polluting the live repo with test
updates.

## Archive Build

The archive is generated by:

```text
scripts/build-index.mjs
```

That script:

- Reads `updates/*.md`.
- Parses frontmatter.
- Converts the Markdown body to HTML.
- Preserves raw Markdown for future editing.
- Adds repo path metadata.
- Detects concern/red flag presence.
- Writes `data/index.json`.

On localhost, the static pages read from `data/index.json` and merge local
browser entries for testing. On the live app shell, the archive reads private
updates through the GitHub Contents API, using the reader's saved token.

## Supported Markdown Subset

The renderer supports the subset needed for this product:

- Paragraphs.
- Headings.
- Section badges from `## Green`, `## Concerns`, `## Red flags`, and
  `## Point of view`.
- Bulleted lists.
- Blockquotes.
- Horizontal rules.
- Inline code.
- Bold text.
- Inline links.
- Standalone link cards.
- Images with captions.

The renderer is intentionally small and dependency-free.

## Status Inference

Status is inferred from the text rather than selected manually.

The app currently stores one of:

- `green`
- `concern`
- `red`

The UI no longer centers the experience around these status labels. The section
badges are the more useful thinking structure for the user.

The status remains useful as metadata for future filtering or escalation.

## Files Changed or Created

Main files:

- `index.html`
  Writer, preview, autosave, section badges, image/link insertion, local/live
  publishing, edit handling, GitHub save logic.

- `archive.html`
  Past updates view, date-led reading layout, edit/delete actions, local merge
  behavior, private repo loading, GitHub delete logic.

- `scripts/build-index.mjs`
  Static archive index generation, Markdown rendering, link cards, section badge
  rendering, edit metadata.

- `data/index.json`
  Generated archive index.

Supporting existing files:

- `README.md`
  Setup, usage, purpose, and privacy model.

- `bin/beat.mjs`
  Terminal fallback for creating updates.

- `scripts/serve.mjs`
  Local preview server.

## Design Decisions

### Writing and Reading Are Different Modes

The write view is intentionally open and full-width.

The read view is constrained for comprehension. Long lines are hard to scan, so
Preview and Past updates use a readable measure while preserving the large type.

### No Always-visible Header

The header was removed because it competed with the writing task. Setup and
navigation moved to the footer.

### Footer Appears Only When Needed

Controls are hidden by default to keep the page calm. They appear on bottom hover
or tap and disappear after typing resumes.

The always-visible command model is intentionally small: Done is primary,
Preview is secondary, and everything else is Tools.

### Date Is the Archive Anchor

Past updates emphasize date instead of repeating the author name.

### Badges Instead of Big Sections

The four thinking categories are badges, not pre-created sections. This lets the
user write naturally and label thoughts only when needed.

### Local First for Testing

Localhost uses browser storage rather than GitHub writes, so experiments can be
tested without publishing junk content.

## Validation Used

During implementation, the app was repeatedly checked with:

```bash
npm run build
node -e "...inline script parse check..."
node .agents/skills/impeccable/scripts/detect.mjs --json index.html archive.html
```

Additional manual validation included:

- Local static server testing.
- Screenshot checks.
- Live GitHub Pages fetch checks after deploy.
- GitHub Actions deploy status checks.

## Current Behavior

As of the latest deployed version:

- Writer opens blank with `Start writing`.
- Controls are hidden until needed.
- Drafts autosave.
- Images and links are supported.
- Preview preserves paragraphs and uses readable line length.
- Past updates can be edited or deleted.
- Live publishing writes Markdown to the configured private updates repo.
- The public Pages repo is the app shell, not the content store.
- Localhost testing stays local.

## Known Constraints

The app is intentionally static, so some tradeoffs remain:

- Browser-side GitHub publishing requires a token stored in the browser.
- There is no backend permission layer; privacy comes from the private GitHub
  repo permissions and each reader's token.
- Link cards do not fetch remote page titles or images; they stay simple and
  show the URL host.
- Conflict handling is basic. If two places edit the same update at once, GitHub
  may reject the save.
- GitHub Pages deploy is not instant; the update usually appears after the
  Actions workflow completes.
- The GitHub Actions workflow currently shows a non-blocking Node 20 deprecation
  warning.

## Future Improvements

Useful next improvements would be:

- Better conflict messaging when editing old updates.
- Optional "discard draft" control.
- More explicit "editing past update" state in the writer footer.
- Token health check in Setup.
- Safer image size handling before upload.
- Optional search in Past updates once there are many entries.
- Node 24 update for the GitHub Actions workflow before the runner deprecation
  becomes a problem.

## One-line Product Definition

Heartbeats is a quiet end-of-day writing surface that lets Amit write once, add
screenshots and links, mark thoughts with lightweight badges, and publish a clean
readable daily update to GitHub Pages with one button.
