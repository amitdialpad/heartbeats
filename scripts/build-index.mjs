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
function attr(s) {
  return esc(s).replace(/"/g, "&quot;");
}
function safeUrl(raw) {
  const url = raw.trim();
  return /^(https?:|mailto:|#|\/|\.\/|\.\.\/|assets\/|[a-z0-9._~/-]+(?:[?#][^\s]*)?$)/i.test(url) ? attr(url) : "#";
}
function sectionKey(s) {
  const key = s.trim().toLowerCase();
  return ["green", "concerns", "red flags", "point of view"].includes(key) ? key : "";
}
function inline(s) {
  const tokens = [];
  const stash = (html) => {
    tokens.push(html);
    return `\u0000${tokens.length - 1}\u0000`;
  };

  let html = esc(s);
  html = html.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${code}</code>`));
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const label = text.trim() || url.trim();
    return stash(`<a href="${safeUrl(url)}" target="_blank" rel="noopener">${inline(label)}</a>`);
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g, (_, lead, url) => {
    const clean = url.replace(/[.,;:!?]+$/, "");
    const tail = url.slice(clean.length);
    return `${lead}${stash(`<a href="${safeUrl(clean)}" target="_blank" rel="noopener">${attr(clean)}</a>`)}${tail}`;
  });
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[Number(i)] || "");
}
function mdToHtml(md) {
  const out = [];
  let list = null;
  let quote = null;
  const flush = () => {
    if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
    if (quote) { out.push("<blockquote>" + quote.join("") + "</blockquote>"); quote = null; }
  };
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    const image = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flush();
      const caption = image[1].trim();
      out.push(`<figure><img src="${safeUrl(image[2])}" alt="${attr(caption)}" loading="lazy">${caption ? `<figcaption>${inline(caption)}</figcaption>` : ""}</figure>`);
      continue;
    }
    if (/^-{3,}$/.test(t)) { flush(); out.push("<hr>"); continue; }
    if (t.startsWith("# ")) { flush(); out.push(`<h2>${inline(t.slice(2))}</h2>`); continue; }
    if (t.startsWith("## ")) {
      flush();
      const label = t.slice(3).trim();
      const key = sectionKey(label);
      out.push(key ? `<h3 class="section-label" data-section="${attr(key)}">${inline(label)}</h3>` : `<h3>${inline(label)}</h3>`);
      continue;
    }
    if (t.startsWith("### ")) { flush(); out.push(`<h4>${inline(t.slice(4))}</h4>`); continue; }
    if (t.startsWith("- ")) { (list ||= []).push(`<li>${inline(t.slice(2))}</li>`); continue; }
    if (t.startsWith("> ")) { (quote ||= []).push(`<p>${inline(t.slice(2))}</p>`); continue; }
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
    path: `updates/${f}`,
    author: (meta.author || "someone").toLowerCase(),
    date: meta.date || basename(f, ".md").slice(0, 10),
    status: ["green", "concern", "red"].includes(status) ? status : "green",
    hasConcerns: hasContent(sec["concerns"]),
    hasRedFlags: hasContent(sec["red flags"]),
    markdown: body,
    html: mdToHtml(body),
  };
});

entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({ generated: new Date().toISOString(), entries }, null, 2) + "\n"
);
console.log(`build-index: ${entries.length} beat(s) -> data/index.json`);
