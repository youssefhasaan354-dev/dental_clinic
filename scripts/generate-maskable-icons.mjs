import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateMaskableIcons() {
  const iconsDir = path.resolve('public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sourceIcon = path.resolve('public/logo512.png');
  const brandBg = '#0c6674';

  const targets = [
    { size: 512, filename: 'maskable-512.png' },
    { size: 192, filename: 'maskable-192.png' },
  ];

  for (const { size, filename } of targets) {
    // 80% safe zone: inner logo is size * 0.8
    const logoSize = Math.round(size * 0.8);
    const padding = Math.round((size - logoSize) / 2);

    // Resize original logo to fit within safe zone while preserving aspect ratio
    const resizedLogo = await sharp(sourceIcon)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Composite resized logo onto solid brand-colored canvas of dimension size x size
    const destPath = path.join(iconsDir, filename);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: brandBg,
      },
    })
      .composite([
        {
          input: resizedLogo,
          top: padding,
          left: padding,
        },
      ])
      .png()
      .toFile(destPath);

    console.log(`✓ Generated ${destPath} (${size}x${size}, safe-zone: ${logoSize}px)`);
  }
}

generateMaskableIcons().catch((err) => {
  console.error('Error generating maskable icons:', err);
  process.exit(1);
});
