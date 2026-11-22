import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
const commerce = fs.readFileSync(path.join(root, 'commerce.html'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const requiredCopy = [
  'この関わりで、いいのかな', 'そう思ったときに、', '一緒に考える人がいます。',
  'Every', 'Question', 'Work', 'Together', '大切にしていること',
  'ご相談の流れ', 'Our', 'Stories', 'Get In', 'Touch',
  'ご相談の内容は外部に漏らしません。'
];
requiredCopy.forEach((text) => check(html.includes(text), `必須文言不足: ${text}`));

const credentials = ['作業療法士', 'はり師', 'きゅう師'];
credentials.forEach((credential) => check(html.includes(`<li>${credential}</li>`), `資格表記不足: ${credential}`));
check(html.includes('aria-label="保有資格"'), '資格一覧のアクセシブルラベル不足');

const phraseGuards = [
  'こんなとき、', 'ご相談ください。', '決まったメニューは、', 'ありません。',
  'SSTや活動の組み立てを、', '一緒に考える',
  'リラクゼーション・運動・制作を、', '子どもたちと',
  'これまでのやり方を、', '否定しません。',
  'その子の特性だけで、', '説明しません。',
  '一度で正解を、', '出そうとしません。'
];
phraseGuards.forEach((text) => check(html.includes(`<span class="phrase">${text}</span>`), `改行ガード不足: ${text}`));
check(css.includes('.phrase{display:inline-block}'), 'デスクトップ改行ガードCSS不足');
check(css.includes('@media(max-width:760px){.phrase{display:inline}}'), 'スマホ改行ガード解除不足');
check(css.includes('text-wrap:balance'), '見出しの均等改行指定不足');
check(!html.includes('リラクセーション'), '誤記「リラクセーション」が残っている');
check(html.includes('リラクゼーション'), '「リラクゼーション」の表記不足');
check(css.includes('.floating-contact-tab strong') && css.includes('white-space:nowrap'), '追従タブの改行防止不足');
check(html.includes('assets/css/style.css?v=6'), 'CSSキャッシュ更新用バージョン不足');
check(html.includes('assets/js/main.js?v=4'), 'JSキャッシュ更新用バージョン不足');

check(html.includes('assets/img/rac-logo.png'), 'RACロゴ参照不足');
check(fs.existsSync(path.join(root, 'assets/img/rac-logo.png')), 'RACロゴファイル不足');
check(html.includes('mailto:ryota.rac18@gmail.com'), 'メール送信先不足');
check(js.includes('mailto:ryota.rac18@gmail.com?subject='), '入力内容付きメール生成処理不足');
check(html.includes('name="同意"'), '同意チェック不足');
const photoFiles = ['hero-creative.webp', 'worry-facility.webp', 'worry-family.webp', 'worry-worker.webp', 'service-on-site.webp', 'service-planning.webp', 'service-relaxation.webp', 'service-workshop.webp', 'service-consultation.webp', 'service-online.webp', 'values-room.webp'];
photoFiles.forEach((file) => {
  check(fs.existsSync(path.join(root, 'assets/img', file)), `写真ファイル不足: ${file}`);
  check(html.includes(`assets/img/${file}`), `写真参照不足: ${file}`);
});
check((html.match(/class="image-placeholder/g) || []).length === 1 && html.includes('class="image-placeholder portrait"'), 'プロフィール以外の画像プレースホルダーが残っている');
check(!html.includes('photo-placeholder') && !html.includes('dark-photo') && !html.includes('dark-veil'), '問い合わせまたは写真帯に不要なプレースホルダーが残っている');
check(!/gradient\(/i.test(css), 'グラデーション禁止');
check(!/[😀-🙏]/u.test(html), '絵文字禁止');
check(css.includes('#2b6f73'), 'アクセント色不足');
check(css.includes('prefers-reduced-motion'), 'reduced-motion対応不足');
check(html.includes('class="floating-contact-tab"'), '右側追従相談タブ不足');
check(js.includes('IntersectionObserver') && js.includes('motion-ready'), 'スクロール表示アニメーション不足');
const contactCardsBlock = html.split('<div class="contact-cards">')[1]?.split('</div>\n<form')[0] || '';
check((contactCardsBlock.match(/<article>/g) || []).length === 2, '相談カードは個人向け2件であること');
check(!contactCardsBlock.includes('事業所の方'), '相談カードに事業所向けが残っている');
check(html.includes('data-related-site="trael"') && html.includes('data-related-site="acupuncture"'), '関連LP接続口不足');
check(js.includes('SITE_LINKS'), '関連LP設定処理不足');
check(privacy.includes('利用目的') && privacy.includes('安全管理措置') && privacy.includes('ryota.rac18@gmail.com'), 'プライバシーポリシー内容不足');
check(commerce.includes('支払方法・支払時期') && commerce.includes('キャンセル・日程変更'), '特商法表記内容不足');
check(fs.existsSync(path.join(root, '.github/workflows/pages.yml')), 'GitHub Pages workflow不足');

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    const target = path.resolve(root, relative);
    if (!target.startsWith(`${root}${path.sep}`) && target !== path.join(root, 'index.html')) throw new Error('invalid path');
    const body = await fsp.readFile(target);
    response.writeHead(200, { 'content-type': mime[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

const orphanLines = () => {
  const results = [];
  document.querySelectorAll('.service-grid h3,.value-grid h3,.section-head h2').forEach((element) => {
    const rows = new Map();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      [...node.textContent].forEach((char, index) => {
        if (!char.trim()) return;
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width) return;
        const key = Math.round(rect.top);
        rows.set(key, `${rows.get(key) || ''}${char}`);
      });
    }
    const lines = [...rows.values()];
    const last = lines.at(-1)?.replace(/[。、，．・／]/g, '') || '';
    if (lines.length > 1 && [...last].length <= 1) results.push({ text: element.textContent.trim(), lines });
  });
  return results;
};

async function inspectViewport(page, name, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4387/', { waitUntil: 'domcontentloaded' });
  await new Promise((resolve) => setTimeout(resolve, 700));
  await page.evaluate(async () => {
    for (const item of document.querySelectorAll('.reveal')) {
      item.scrollIntoView({ block: 'center' });
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
  const report = await page.evaluate(orphanLines);
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
    logoLoaded: [...document.querySelectorAll('img[src*="rac-logo"]')].every((image) => image.complete && image.naturalWidth > 0),
    photoCount: document.querySelectorAll('.site-photo,.card-photo').length,
    photosLoaded: [...document.querySelectorAll('.site-photo,.card-photo')].every((image) => image.complete && image.naturalWidth > 0),
    contactCards: document.querySelectorAll('.contact-cards article').length,
    floatingTabExists: Boolean(document.querySelector('.floating-contact-tab')),
    floatingTabLabelSingleLine: (() => {
      const label = document.querySelector('.floating-contact-tab strong');
      if (!label) return false;
      const style = getComputedStyle(label);
      return label.getBoundingClientRect().height <= Number.parseFloat(style.lineHeight) + 1;
    })(),
    revealCount: document.querySelectorAll('.reveal.is-visible').length,
    revealTotal: document.querySelectorAll('.reveal').length
  }));
  check(metrics.pageWidth <= metrics.viewport + 1, `${name}: 横方向にはみ出し (${metrics.pageWidth}px > ${metrics.viewport}px)`);
  check(metrics.logoLoaded, `${name}: RACロゴ読込失敗`);
  check(metrics.photoCount === 11 && metrics.photosLoaded, `${name}: LP写真の件数または読込に問題がある (${metrics.photoCount}/11)`);
  check(metrics.contactCards === 2, `${name}: 相談カード数が2件ではない`);
  check(metrics.floatingTabExists, `${name}: 右側追従タブがない`);
  check(metrics.floatingTabLabelSingleLine, `${name}: 追従タブ「相談はこちら」が複数行になっている`);
  check(metrics.revealTotal > 0 && metrics.revealCount === metrics.revealTotal, `${name}: スクロール表示されない要素がある (${metrics.revealCount}/${metrics.revealTotal})`);
  report.forEach((item) => failures.push(`${name}: 見出しに1文字孤立行「${item.text}」 → ${item.lines.join(' / ')}`));
  await fsp.mkdir(path.join(root, 'work', 'gauntlet'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'work', 'gauntlet', `${name}.png`), fullPage: true });
}

if (process.env.RUN_BROWSER_GAUNTLET === '1') {
  let browser;
  try {
    await new Promise((resolve) => server.listen(4387, '127.0.0.1', resolve));
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await inspectViewport(page, 'desktop-1440', 1440, 1000);
    await inspectViewport(page, 'mobile-390', 390, 844);
    pageErrors.forEach((message) => failures.push(`ブラウザJSエラー: ${message}`));
  } catch (error) {
    failures.push(`実描画ガントレットを起動できない: ${error.message}`);
  } finally {
    await browser?.close();
    server.close();
  }
}

if (failures.length) {
  console.error(`Gauntlet failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Gauntlet passed: copy ${requiredCopy.length}, credentials ${credentials.length}, line guards ${phraseGuards.length}.`);
