#!/usr/bin/env node
// Minimal static server for `npm run preview`. Not used in production.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html", ".json": "application/json", ".js": "text/javascript", ".css": "text/css", ".md": "text/plain" };

createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  try {
    const data = await readFile(join(root, p));
    res.writeHead(200, { "Content-Type": types[extname(p)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(4321, () => console.log("preview: http://localhost:4321/"));
