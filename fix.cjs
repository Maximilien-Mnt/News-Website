'use strict';
const fs = require('fs');
let s = fs.readFileSync('apps/web/src/lib/filters.ts', 'utf8');

// Remove duplicate serializeFilters at line 304 (second occurrence)
// Handle Windows line endings (\r\n)
const marker = '/** Sérialise un objet `Filters`';
const startIdx = s.indexOf(marker);
if (startIdx >= 0) {
  // Find the end of this function: scan forward for matching closing brace
  const fnStart = s.indexOf('export function serializeFilters(filters: Filters): string', startIdx);
  // Find matching closing brace - scan forward
  let depth = 0;
  let endIdx = fnStart;
  for (let i = fnStart; i < s.length; i++) {
    if (s[i] === '{') depth++;
    if (s[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
  }
  // Also remove trailing blank lines
  while (endIdx < s.length && (s[endIdx] === '\n' || s[endIdx] === '\r')) endIdx++;
  s = s.slice(0, startIdx) + s.slice(endIdx);
  fs.writeFileSync('apps/web/src/lib/filters.ts', s, 'utf8');
  console.log('Duplicate serializeFilters removed');
} else {
  console.log('Marker not found');
}

