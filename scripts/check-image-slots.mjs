/**
 * Guard script to enforce that all media in src/ is rendered via EditableMedia or defined in central registry.
 *
 * Scans src/ for:
 * - <img> tags
 * - <video> tags
 * - <iframe> tags (outside functional Google Maps embeds)
 * - CSS/SCSS asset url()
 *
 * Fails the build if any unauthorized raw media tag or asset url exists.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Allowed files where raw media tags are legitimately permitted:
// 1. Universal media component
// 2. Registries
// 3. Admin editor modal & admin thumbnail manager
// 4. Admin QR generator (dynamic canvas data-url only)
// 5. Test files
const ALLOWED_FILES = new Set([
  path.normalize('src/components/VisualEdit/EditableMedia.tsx'),
  path.normalize('src/data/images.js'),
  path.normalize('src/data/imageSlots.ts'),
  path.normalize('src/components/VisualEdit/ImageSlotModal.tsx'),
  path.normalize('src/admin/pages/ImageSlotsManager.tsx'),
  path.normalize('src/admin/pages/QrGenerator.tsx'),
]);

// Functional iframes allowed (e.g. Google Maps interactive clinic location)
const ALLOWED_MAP_IFRAMES = new Set([
  path.normalize('src/sections/Appointment/Appointment.jsx'),
  path.normalize('src/pages/ContactPage.jsx'),
]);

export function scanFileForMediaViolations(filePath, content) {
  const relativePath = path.normalize(path.relative(path.resolve(__dirname, '..'), filePath));
  const violations = [];

  // Exclude test files
  if (relativePath.includes('__tests__') || relativePath.endsWith('.test.ts') || relativePath.endsWith('.test.tsx')) {
    return violations;
  }

  // Allowed files
  if (ALLOWED_FILES.has(relativePath)) {
    return violations;
  }

  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Check <img>
    if (/<img\b[^>]*>/i.test(line)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: '<img> tag',
        content: trimmed,
      });
    }

    // Check <video>
    if (/<video\b[^>]*>/i.test(line)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: '<video> tag',
        content: trimmed,
      });
    }

    // Check <iframe> (allow only in designated maps sections)
    if (/<iframe\b[^>]*>/i.test(line) && !ALLOWED_MAP_IFRAMES.has(relativePath)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: '<iframe> tag',
        content: trimmed,
      });
    }

    // Check CSS asset url(...) in css/scss files or inline styles
    if (/\burl\s*\(\s*['"]?(\/assets|http|\.\/|\.\.\/)[^'")]+['"]?\s*\)/i.test(line)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        type: 'asset url()',
        content: trimmed,
      });
    }
  });

  return violations;
}

export function scanDirectory(dir) {
  let allViolations = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      allViolations = allViolations.concat(scanDirectory(fullPath));
    } else if (/\.(jsx?|tsx?|scss|css)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const violations = scanFileForMediaViolations(fullPath, content);
      allViolations = allViolations.concat(violations);
    }
  }

  return allViolations;
}

export function runCheck() {
  console.log('🔍 Checking image slots & media usage across src/...');
  const violations = scanDirectory(SRC_DIR);

  if (violations.length > 0) {
    console.error(`\n❌ Found ${violations.length} media violation(s) outside EditableMedia and central registries:\n`);
    violations.forEach((v) => {
      console.error(`  - [${v.file}:${v.line}] (${v.type}): ${v.content}`);
    });
    console.error('\nEvery image, video, and non-maps iframe must use <EditableMedia slotId="..." />.\n');
    return false;
  }

  console.log('✅ All media usages conform to EditableMedia and the central slot registry.\n');
  return true;
}

// Direct execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const success = runCheck();
  if (!success) {
    process.exit(1);
  }
}
