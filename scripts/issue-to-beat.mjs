#!/usr/bin/env node
/**
 * issue-to-beat — convert a submitted "New beat" issue into updates/<date>-<author>.md
 * Reads the issue body from ISSUE_BODY. Prints the written path to stdout.
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const body = process.env.ISSUE_BODY || "";

// GitHub issue forms render each field as: "### <Label>\n\n<value>"
function field(label) {
  const re = new RegExp("###\\s*" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\n+([\\s\\S]*?)(?=\\n###\\s|$)");
  const m = body.match(re);
  if (!m) return "";
  const v = m[1].trim();
  return /^_no response_$/i.test(v) ? "" : v;
}
const bullets = (s) => s ? s.split("\n").map(l => l.trim()).filter(Boolean)
  .map(l => (l.startsWith("-") ? l : "- " + l)).join("\n") : "";

const author = (field("Who's writing") || "someone").toLowerCase();
const status = (field("Status") || "green").toLowerCase();
const where = field("Where I'm at");
const green = bullets(field("Green"));
const concerns = bullets(field("Concerns"));
const red = bullets(field("Red flags"));
const pov = bullets(field("Point of view"));

const d = new Date();
const p = (n) => String(n).padStart(2, "0");
const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;

const dir = join(root, "updates");
mkdirSync(dir, { recursive: true });
let name = `${date}-${author}.md`;
if (existsSync(join(dir, name))) name = `${date}-${author}-${p(d.getHours())}${p(d.getMinutes())}.md`;

let md = `---\nauthor: ${author}\ndate: ${date}\nstatus: ${status}\n---\n\n## Where I'm at\n${where}\n`;
if (green) md += `\n## Green\n${green}\n`;
if (concerns) md += `\n## Concerns\n${concerns}\n`;
if (red) md += `\n## Red flags\n${red}\n`;
if (pov) md += `\n## Point of view\n${pov}\n`;

writeFileSync(join(dir, name), md, "utf8");
console.log("updates/" + name);
