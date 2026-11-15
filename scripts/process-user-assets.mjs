import sharp from 'sharp';
import { join } from 'node:path';

const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('usage: node scripts/process-user-assets.mjs SOURCE_DIRECTORY');

const outputDir = new URL('../assets/img/', import.meta.url).pathname;
const photos = [
  ['hero-main.jpg', 'hero-main', 1600, 2000, 'attention'],
  ['hero-hands.jpg', 'hero-hands', 1000, 1200, 'attention'],
  ['treat-assess.jpg', 'treat-assess', 1200, 1600, 'attention'],
  ['treat-tools.jpg', 'treat-tools', 1200, 900, 'attention'],
  ['space.jpg', 'space', 1200, 1500, 'attention'],
];

for (const [source, name, width, height, position] of photos) {
  const pipeline = sharp(join(sourceDir, source)).rotate().resize({ width, height, fit: 'cover', position });
  await pipeline.clone().jpeg({ quality: 86, progressive: true, mozjpeg: true }).toFile(join(outputDir, `${name}.jpg`));
  await pipeline.clone().webp({ quality: 84, effort: 5 }).toFile(join(outputDir, `${name}.webp`));
}
