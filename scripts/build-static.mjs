import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const storiesDir = path.join(root, 'content', 'stories');
let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const esc = (value = '') => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

async function renderStories() {
  await fs.mkdir(storiesDir, { recursive: true });
  const files = (await fs.readdir(storiesDir)).filter((file) => file.endsWith('.md')).sort().reverse();
  if (!files.length) return '<div class="stories-empty">記事は準備中です。これまでの関わりを、少しずつ綴っていきます。</div>';
  const cards = [];
  for (const file of files) {
    const source = await fs.readFile(path.join(storiesDir, file), 'utf8');
    const front = source.match(/^---\n([\s\S]*?)\n---/);
    const meta = {};
    front?.[1].split('\n').forEach((line) => {
      const index = line.indexOf(':');
      if (index > -1) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
    });
    if (!meta.title) throw new Error(`${file}: title is required`);
    cards.push(`<a class="story-card" href="${esc(meta.url || '#')}"><div class="image-placeholder"><span>PHOTO</span><p>${esc(meta.image || '記事の内容に合う写真')}</p></div><span class="pill">${esc(meta.tag || 'コラム')}</span><h3>${esc(meta.title)}</h3></a>`);
  }
  return `<div class="stories-grid">${cards.join('')}</div>`;
}

html = html.replace(/<!-- STORIES_START -->[\s\S]*?<!-- STORIES_END -->/, `<!-- STORIES_START -->${await renderStories()}<!-- STORIES_END -->`);
await fs.rm(dist, { recursive: true, force: true });
for (const dir of ['img', 'css', 'js']) await fs.mkdir(path.join(dist, 'assets', dir), { recursive: true });
await fs.writeFile(path.join(dist, 'index.html'), html);
for (const file of ['privacy.html', 'commerce.html']) await fs.copyFile(path.join(root, file), path.join(dist, file));
await fs.copyFile(path.join(root, 'assets/css/style.css'), path.join(dist, 'assets/css/style.css'));
for (const file of ['main.js', 'site-config.js']) await fs.copyFile(path.join(root, 'assets/js', file), path.join(dist, 'assets/js', file));
for (const file of ['favicon.svg', 'ogp.svg', 'rac-logo.png', 'hero-creative.webp', 'worry-facility.webp', 'worry-family.webp', 'worry-worker.webp', 'service-on-site.webp', 'service-planning.webp', 'service-relaxation.webp', 'service-workshop.webp', 'service-consultation.webp', 'service-online.webp', 'values-room.webp']) await fs.copyFile(path.join(root, 'assets/img', file), path.join(dist, 'assets/img', file));
await fs.writeFile(path.join(dist, '.nojekyll'), '');
console.log('Built static site in dist/.');
