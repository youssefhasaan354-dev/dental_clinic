import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getAllFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css']) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check case of each segment in a relative path on disk
function verifyPathCasing(fromFile, importPath) {
  // Ignore non-relative packages like 'react', '@supabase/supabase-js'
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return { ok: true };
  }

  let basePath;
  let relativePart;
  if (importPath.startsWith('@/')) {
    basePath = srcDir;
    relativePart = importPath.slice(2);
  } else {
    basePath = path.dirname(fromFile);
    relativePart = importPath;
  }

  const segments = relativePart.split('/');
  let currentDir = basePath;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === '.' || segment === '') continue;
    if (segment === '..') {
      currentDir = path.dirname(currentDir);
      continue;
    }

    const isLast = (i === segments.length - 1);
    const entries = fs.readdirSync(currentDir);

    if (!isLast) {
      // Must be an exact directory match
      const match = entries.find(e => e.toLowerCase() === segment.toLowerCase());
      if (!match) {
        return { ok: false, error: `Directory "${segment}" not found in ${currentDir}` };
      }
      if (match !== segment) {
        return { ok: false, error: `Case mismatch: import used "${segment}" but disk has "${match}" in ${currentDir}` };
      }
      currentDir = path.join(currentDir, match);
    } else {
      // Last segment could have extension omitted
      let match = entries.find(e => e === segment);
      if (match) {
        // Exact match with extension
        continue;
      }

      // Check if it's a file without extension (e.g. ./App -> App.jsx)
      const potentialExtensions = ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
      let foundExact = false;
      let caseMismatch = null;

      for (const ext of potentialExtensions) {
        if (ext.startsWith('/')) {
          const subDir = entries.find(e => e === segment);
          if (subDir) {
            const subDirPath = path.join(currentDir, subDir);
            if (fs.statSync(subDirPath).isDirectory()) {
              const subEntries = fs.readdirSync(subDirPath);
              const subMatch = subEntries.find(e => e === ext.slice(1));
              if (subMatch) {
                foundExact = true;
                break;
              }
            }
          }
        } else {
          const candidateName = segment + ext;
          if (entries.includes(candidateName)) {
            foundExact = true;
            break;
          }
          const caseMatches = entries.find(e => e.toLowerCase() === candidateName.toLowerCase());
          if (caseMatches) {
            caseMismatch = { expected: segment, actual: caseMatches };
          }
        }
      }

      if (!foundExact) {
        if (caseMismatch) {
          return { ok: false, error: `Case mismatch: import used "${segment}" but disk has "${caseMismatch.actual}" in ${currentDir}` };
        }
        // Could be directory index import with case mismatch on directory
        const dirMatch = entries.find(e => e.toLowerCase() === segment.toLowerCase());
        if (dirMatch && dirMatch !== segment) {
          return { ok: false, error: `Case mismatch on directory: import used "${segment}" but disk has "${dirMatch}" in ${currentDir}` };
        }
      }
    }
  }

  return { ok: true };
}

const allFiles = getAllFiles(srcDir);
const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
const requireRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

let errorsFound = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const res = verifyPathCasing(file, importPath);
    if (!res.ok) {
      console.error(`[CASE ERROR] in ${path.relative(srcDir, file)}: import "${importPath}" -> ${res.error}`);
      errorsFound++;
    }
  }

  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1];
    const res = verifyPathCasing(file, importPath);
    if (!res.ok) {
      console.error(`[DYNAMIC IMPORT CASE ERROR] in ${path.relative(srcDir, file)}: import("${importPath}") -> ${res.error}`);
      errorsFound++;
    }
  }
}

if (errorsFound === 0) {
  console.log(`\n✓ SUCCESS: Checked all ${allFiles.length} files. Zero case-sensitivity mismatches found.`);
} else {
  console.error(`\n✗ FAILED: Found ${errorsFound} case-sensitivity mismatches.`);
  process.exit(1);
}
