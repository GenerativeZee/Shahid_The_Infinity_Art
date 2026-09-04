#!/usr/bin/env node
// Fails the build if the "/" route's first-load JS exceeds the §11 budget
// (150 KB gzipped). Run after `next build`. Reads Next's own bundle stats
// diagnostics rather than re-parsing build output, since Next 16 no longer
// prints a size table for Turbopack builds.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 150 * 1024;
const statsPath = path.join(process.cwd(), ".next/diagnostics/route-bundle-stats.json");

if (!existsSync(statsPath)) {
  console.error(`check:budget: ${statsPath} not found — run "next build" first.`);
  process.exit(1);
}

const stats = JSON.parse(readFileSync(statsPath, "utf8"));
const root = stats.find((r) => r.route === "/");

if (!root) {
  console.error('check:budget: no "/" route found in route-bundle-stats.json');
  process.exit(1);
}

let gzipBytes = 0;
for (const chunkPath of root.firstLoadChunkPaths) {
  const absolute = path.join(process.cwd(), chunkPath.replace(/\\/g, path.sep));
  if (!existsSync(absolute)) {
    console.warn(`check:budget: chunk not found on disk, skipping: ${chunkPath}`);
    continue;
  }
  gzipBytes += gzipSync(readFileSync(absolute)).length;
}

const gzipKb = (gzipBytes / 1024).toFixed(1);
const budgetKb = (BUDGET_BYTES / 1024).toFixed(0);

if (gzipBytes > BUDGET_BYTES) {
  console.error(`check:budget: FAIL — "/" first-load JS is ${gzipKb} KB gzipped, budget is ${budgetKb} KB.`);
  process.exit(1);
}

console.log(`check:budget: OK — "/" first-load JS is ${gzipKb} KB gzipped (budget ${budgetKb} KB).`);
