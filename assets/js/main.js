const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLabel = menuButton?.querySelector('.sr-only');

function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  if (menuLabel) menuLabel.textContent = open ? 'メニューを閉じる' : 'メニューを開く';
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

document.querySelectorAll('[data-related-site]').forEach((link) => {
  const url = window.SITE_LINKS?.[link.dataset.relatedSite];
  if (!url) {
    link.addEventListener('click', (event) => event.preventDefault());
    return;
  }
  link.href = url;
  link.removeAttribute('aria-disabled');
  link.querySelector('span')?.remove();
});

document.body.classList.add('motion-ready');
const revealGroups = [
  '.section-head', '.worry-grid article', '.service-grid article', '.center-head',
  '.value-grid article', '.flow-list li', '.price-grid article', '.stories-empty',
  '.profile-grid > *', '.contact header', '.contact-cards article', '.contact-form'
];
const revealItems = [...document.querySelectorAll(revealGroups.join(','))];
revealItems.forEach((item, index) => {
  item.classList.add('reveal');
  item.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const floatingTab = document.querySelector('.floating-contact-tab');
const hero = document.querySelector('#top');
const contact = document.querySelector('#contact');
let heroVisible = true;
let contactVisible = false;
const updateFloatingTab = () => floatingTab?.classList.toggle('is-visible', !heroVisible && !contactVisible);

if ('IntersectionObserver' in window && floatingTab && hero && contact) {
  const tabObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      if (entry.target === contact) contactVisible = entry.isIntersecting;
    });
    updateFloatingTab();
  }, { threshold: 0.08 });
  tabObserver.observe(hero);
  tabObserver.observe(contact);
}

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = data.get('お名前');
  const subject = `【RAC 個別相談】${name}さま`;
  const body = [
    'RAC 個別相談のお問い合わせ', '',
    `お名前：${name}`,
    `メールアドレス：${data.get('メールアドレス')}`,
    `立場：${data.get('立場')}`,
    `希望：${data.get('希望')}`, '',
    'ご相談内容：',
    data.get('ご相談内容'), '',
    '※事業所の方は、利用者さまが特定できない内容でお送りください。'
  ].join('\n');
  status.textContent = '入力内容を入れたメールアプリを開きました。内容をご確認のうえ送信してください。';
  window.location.href = `mailto:ryota.rac18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
