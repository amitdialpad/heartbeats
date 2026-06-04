#!/usr/bin/env node
/**
 * beat — write a heartbeat, save, done.
 *
 *   $ beat
 *
 * Opens your $EDITOR with today's template pre-filled. You write, save, close.
 * On save it commits and pushes immediately. Close without saving (or leave the
 * body empty) and nothing is posted — that's your escape hatch.
 *
 * Who you are:  set BEAT_AUTHOR=amit  (falls back to your git user name)
 */

import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

// ---- helpers ---------------------------------------------------------------

function git(args, opts = {}) {
  return spawnSync("git", args, { encoding: "utf8", ...opts });
}

function repoRoot() {
  const r = git(["rev-parse", "--show-toplevel"]);
  if (r.status !== 0) {
    console.error("✗ Not inside the heartbeats git repo. cd into it and try again.");
    process.exit(1);
  }
  return r.stdout.trim();
}

function author() {
  if (process.env.BEAT_AUTHOR) return process.env.BEAT_AUTHOR.trim().toLowerCase();
  const name = git(["config", "user.name"]).stdout.trim();
  const first = (name.split(/\s+/)[0] || "someone").toLowerCase();
  return first;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// ---- main ------------------------------------------------------------------

const root = repoRoot();
const who = author();

const now = new Date();
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;

const dir = join(root, "updates");
mkdirSync(dir, { recursive: true });

let file = join(dir, `${date}-${who}.md`);
if (existsSync(file)) file = join(dir, `${date}-${who}-${hhmm}.md`); // 2nd beat same day

const template = `---
author: ${who}
date: ${date}
status: green
---

## Where I'm at
<one or two lines — what you're heads-down on right now>

## Green
- <things moving fine; just list them>

## Concerns
- **<topic>** — what the issue is, how you're handling it, what you need

## Red flags
- <delete this section if none — otherwise: what's stuck/drastic, *why*, the decision you need>

## Point of view
- <delete if none — your reasoning on something you'll need to push back on, written before the call>
`;

writeFileSync(file, template, "utf8");

// open the editor and wait for it to close
const editor = process.env.VISUAL || process.env.EDITOR || "nano";
const ed = spawnSync(editor, [file], { stdio: "inherit", shell: true });
if (ed.status !== 0 && ed.error) {
  console.error(`✗ Couldn't open editor (${editor}). Set $EDITOR and retry.`);
  unlinkSync(file);
  process.exit(1);
}

// escape hatch: unchanged or empty body => don't post
const written = readFileSync(file, "utf8");
const body = written.replace(/^---[\s\S]*?---/, "").trim();
const placeholdersOnly = body
  .split("\n")
  .filter((l) => l.trim() && !l.trim().startsWith("#"))
  .every((l) => l.trim().startsWith("<") || l.trim() === "- <things moving fine; just list them>");

if (written === template || body === "" || placeholdersOnly) {
  unlinkSync(file);
  console.log("· nothing posted (no edits). beat discarded.");
  process.exit(0);
}

// commit + push immediately
const rel = file.replace(root + "/", "");
git(["add", file], { cwd: root });
const commit = git(["commit", "-m", `beat: ${who} ${date}`], { cwd: root });
if (commit.status !== 0) {
  console.error("✗ commit failed:\n" + (commit.stderr || commit.stdout));
  process.exit(1);
}
const push = git(["push"], { cwd: root });
if (push.status !== 0) {
  console.error("✗ push failed (committed locally, not live):\n" + (push.stderr || push.stdout));
  process.exit(1);
}

console.log(`✓ posted — ${rel}`);
console.log("  live at https://amitdialpad.github.io/heartbeats/ in ~1 min");
