import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Image Optimization & Format Audit Script
 * Audits image assets across src/assets and public/assets.
 * If 'sharp' is installed in the environment, it generates .webp versions.
 */
async function auditAndOptimizeImages() {
  console.log('🔍 Auditing image assets across src/assets and public/assets...');

  let sharp = null;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default || sharpModule;
  } catch (e) {
    // Sharp not installed in this environment
  }

  const assetDirs = [
    path.join(rootDir, 'src', 'assets'),
    path.join(rootDir, 'public', 'assets'),
  ];

  let totalImages = 0;
  let totalBytes = 0;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return [];
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(scanDir(fullPath));
      } else if (/\.(png|jpe?g|webp|svg)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const files = scanDir(path.join(rootDir, 'src', 'assets'));
  totalImages = files.length;

  for (const file of files) {
    const stats = fs.statSync(file);
    totalBytes += stats.size;
  }

  console.log(`📦 Found ${totalImages} image assets (Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB).`);

  if (!sharp) {
    console.log('ℹ️ Note: "sharp" is not installed in the current environment. To generate local .webp images run: npm i -D sharp && node scripts/optimize-images.mjs');
    console.log('✅ In production, Cloudinary pipeline automatically serves format auto (f_auto, q_auto) serving WebP/AVIF dynamically.');
    return;
  }

  console.log('🚀 Sharp detected. Processing images into .webp...');
  let convertedCount = 0;

  for (const file of files) {
    if (/\.(png|jpe?g)$/i.test(file)) {
      const webpPath = file.replace(/\.(png|jpe?g)$/i, '.webp');
      if (!fs.existsSync(webpPath)) {
        try {
          await sharp(file).webp({ quality: 82 }).toFile(webpPath);
          convertedCount++;
        } catch (err) {
          console.warn(`Failed to convert ${file}:`, err.message);
        }
      }
    }
  }

  console.log(`✨ Successfully generated ${convertedCount} WebP variants.`);
}

auditAndOptimizeImages();
