#!/usr/bin/env node
/**
 * build-index — turn updates/*.md into data/index.json (with rendered HTML).
 * Zero dependencies. Runs locally (npm run build) and in CI on every push.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const updatesDir = join(root, "updates");
const outDir = join(root, "data");

// ---- tiny frontmatter parser (key: value only) ----------------------------
function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2].trim() };
}

// ---- minimal markdown -> HTML (the subset our template uses) ---------------
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
function mdToHtml(md) {
  const out = [];
  let list = null; // current <ul> buffer
  const flush = () => {
    if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
  };
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    if (t.startsWith("## ")) { flush(); out.push(`<h3>${inline(t.slice(3))}</h3>`); continue; }
    if (t.startsWith("- ")) { (list ||= []).push(`<li>${inline(t.slice(2))}</li>`); continue; }
    flush(); out.push(`<p>${inline(t)}</p>`);
  }
  flush();
  return out.join("\n");
}

// ---- collect sections so the UI can flag concerns / red flags --------------
function sections(md) {
  const map = {};
  let cur = null, buf = [];
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) {
      if (cur) map[cur] = buf.join("\n").trim();
      cur = t.slice(3).toLowerCase(); buf = [];
    } else if (cur) buf.push(line);
  }
  if (cur) map[cur] = buf.join("\n").trim();
  return map;
}
const hasContent = (s) => s && !/^(-?\s*<[^>]*>\s*)$/.test(s.trim()) && s.trim() !== "";

// ---- build -----------------------------------------------------------------
const files = existsSync(updatesDir)
  ? readdirSync(updatesDir).filter((f) => f.endsWith(".md")).sort().reverse()
  : [];

const entries = files.map((f) => {
  const { meta, body } = parse(readFileSync(join(updatesDir, f), "utf8"));
  const sec = sections(body);
  const status = (meta.status || "green").toLowerCase();
  return {
    id: basename(f, ".md"),
    author: (meta.author || "someone").toLowerCase(),
    date: meta.date || basename(f, ".md").slice(0, 10),
    status: ["green", "concern", "red"].includes(status) ? status : "green",
    hasConcerns: hasContent(sec["concerns"]),
    hasRedFlags: hasContent(sec["red flags"]),
    html: mdToHtml(body),
  };
});

entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({ generated: new Date().toISOString(), entries }, null, 2)
);
console.log(`build-index: ${entries.length} beat(s) -> data/index.json`);
