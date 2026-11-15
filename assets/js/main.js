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

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');
form?.addEventListener('submit', (event) => {
  if (form.action.includes('%5B') || form.action.includes('[')) {
    event.preventDefault();
    status.textContent = '送信先メールアドレスは公開前に設定します。';
  }
});
