import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('assets/img');
await fs.mkdir(output, { recursive: true });

const images = [
  ['hero-main', 1600, 2000, '撮影予定｜窓の光が入る院内の壁や空間'],
  ['hero-hands', 1000, 1200, '撮影予定｜施術者の手元'],
  ['treat-assess', 1200, 1600, '撮影予定｜からだの動きを確かめる様子'],
  ['treat-tools', 1200, 900, '撮影予定｜鍼と灸の道具'],
  ['space', 1200, 1500, '撮影予定｜光の入る施術スペース'],
  ['practitioner', 1200, 1500, '撮影予定｜施術者ポートレート'],
  ['exterior', 1500, 1000, '撮影予定｜中島ビル外観と入口']
];

function svg(width, height, caption) {
  const safe = caption.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  const step = Math.max(32, Math.round(Math.min(width, height) / 22));
  let noise = '';
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const opacity = ((x * 17 + y * 29) % 9) / 100;
      noise += `<circle cx="${x}" cy="${y}" r="1.2" fill="#24262a" opacity="${opacity}"/>`;
    }
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0f1f1"/><stop offset=".5" stop-color="#d8dadd"/><stop offset="1" stop-color="#bfc3c8"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>${noise}
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/>
    <rect x="14" y="${height - 115}" width="${Math.min(width - 28, safe.length * 30 + 48)}" height="101" fill="#24262a" opacity=".78"/>
    <text x="40" y="${height - 55}" fill="#fff" font-family="sans-serif" font-size="${Math.max(22, Math.round(width / 42))}" letter-spacing="2">${safe}</text>
  </svg>`);
}

for (const [name, width, height, caption] of images) {
  const base = sharp(svg(width, height, caption));
  await base.clone().jpeg({ quality: 82, progressive: true }).toFile(path.join(output, `${name}.jpg`));
  await base.clone().webp({ quality: 80 }).toFile(path.join(output, `${name}.webp`));
}

const ogp = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f3f4f3"/><path d="M80 80h1040v470H80z" fill="none" stroke="#d5d7d6"/><text x="90" y="190" font-family="sans-serif" font-size="45" letter-spacing="10" fill="#24262a">R・A・C</text><text x="90" y="350" font-family="serif" font-size="62" fill="#24262a">今ある不調の緩和で、</text><text x="90" y="445" font-family="serif" font-size="62" fill="#24262a">ここにいない23時間の充実を。</text><rect x="90" y="500" width="150" height="8" fill="#2d3fc0"/></svg>`);
await sharp(ogp).jpeg({ quality: 88 }).toFile(path.join(output, 'ogp.jpg'));
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#2d3fc0' } })
  .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><text x="90" y="110" text-anchor="middle" font-family="sans-serif" font-size="52" fill="white">RAC</text></svg>') }])
  .png().toFile(path.join(output, 'apple-touch-icon.png'));

console.log(`Generated ${images.length * 2 + 2} placeholder assets.`);
