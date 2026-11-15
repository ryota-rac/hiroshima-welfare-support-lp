import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');
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
  'リラクセーション・運動・制作を、', '子どもたちと',
  'これまでのやり方を、', '否定しません。',
  'その子の特性だけで、', '説明しません。',
  '一度で正解を、', '出そうとしません。'
];
phraseGuards.forEach((text) => check(html.includes(`<span class="phrase">${text}</span>`), `改行ガード不足: ${text}`));
check(css.includes('.phrase{display:inline-block}'), 'デスクトップ改行ガードCSS不足');
check(css.includes('@media(max-width:760px){.phrase{display:inline}}'), 'スマホ改行ガード解除不足');
check(css.includes('@media(max-width:900px){.service-grid{grid-template-columns:1fr}}'), 'タブレットでのサービス1列化不足');
check(html.includes('assets/css/style.css?v=3'), 'CSSキャッシュ更新用バージョン不足');
check(html.includes('assets/js/main.js?v=3'), 'JSキャッシュ更新用バージョン不足');

check(html.includes('mailto:[メールアドレス]'), 'メール送信先プレースホルダー不足');
check(html.includes('name="同意"'), '同意チェック不足');
check((html.match(/class="image-placeholder/g) || []).length >= 10, '画像プレースホルダー不足');
check(!/<img\b/.test(html), '未承認画像が含まれる');
check(!/gradient\(/i.test(css), 'グラデーション禁止');
check(!/[😀-🙏]/u.test(html), '絵文字禁止');
check(css.includes('#2b6f73'), 'アクセント色不足');
check(css.includes('@media(max-width:760px)'), 'SPブレークポイント不足');
check(css.includes('prefers-reduced-motion'), 'reduced-motion対応不足');
check(html.includes('aria-hidden="true"'), 'aria-hidden不足');
check(html.includes('data-related-site="trael"') && html.includes('data-related-site="acupuncture"'), '関連LP接続口不足');
check(js.includes('SITE_LINKS'), '関連LP設定処理不足');
check(fs.existsSync(path.join(root, '.github/workflows/pages.yml')), 'GitHub Pages workflow不足');

if (failures.length) {
  console.error(`Gauntlet failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Gauntlet passed: ${requiredCopy.length} copy checks, ${credentials.length} credentials, ${phraseGuards.length} line-break guards.`);
