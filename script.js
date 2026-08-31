const style = document.createElement('style');
style.textContent = `
  :root{--cp-ease:cubic-bezier(.22,1,.36,1)}
  .cp-progress{position:fixed;top:0;left:0;width:100%;height:3px;z-index:100;background:transparent;pointer-events:none}
  .cp-progress i{display:block;width:0;height:100%;background:var(--teal);transform-origin:left;transition:width .08s linear}
  .reveal{opacity:0;transform:translateY(24px);transition:opacity .75s var(--cp-ease),transform .75s var(--cp-ease)}
  .reveal.visible{opacity:1;transform:none}
  .screen-card,.fake-screen,.hero-card,.journey-line article{transition:transform .4s var(--cp-ease),box-shadow .4s ease,border-color .3s ease}
  .screen-card:hover,.hero-card:hover{transform:translateY(-6px)}
  .screen-card:hover .fake-screen{box-shadow:0 22px 55px rgba(17,45,46,.15)}
  .journey-line article:hover{background:rgba(223,238,238,.45);transform:translateY(-2px)}
  .cp-lightbox{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:24px;background:rgba(10,27,27,.84);backdrop-filter:blur(12px);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease}
  .cp-lightbox.open{opacity:1;visibility:visible}
  .cp-lightbox figure{max-width:94vw;max-height:92vh;margin:0;transform:translateY(16px) scale(.97);transition:transform .45s var(--cp-ease)}
  .cp-lightbox.open figure{transform:none}
  .cp-lightbox img{display:block;max-width:100%;max-height:84vh;width:auto;height:auto;border-radius:12px;box-shadow:0 30px 90px rgba(0,0,0,.35);background:#fff}
  .cp-lightbox figcaption{margin-top:12px;text-align:center;color:#fff;font:12px var(--mono);opacity:.8}
  .cp-close{position:absolute;right:20px;top:18px;width:44px;height:44px;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:25px;cursor:pointer;transition:transform .2s ease,background .2s ease}
  .cp-close:hover{transform:rotate(90deg);background:rgba(255,255,255,.22)}
  .site-header nav a{transition:color .2s ease,opacity .2s ease;position:relative}
  .site-header nav a[aria-current="page"]{color:var(--teal);font-weight:700}
  .site-header nav a[aria-current="page"]::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;background:var(--teal);transform-origin:left;animation:cpLine .3s var(--cp-ease)}
  @keyframes cpLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .cp-top{position:fixed;right:22px;bottom:22px;z-index:80;width:44px;height:44px;border:1px solid var(--line);border-radius:50%;background:rgba(255,255,255,.92);color:var(--teal);cursor:pointer;font-size:18px;box-shadow:0 10px 28px rgba(17,45,46,.14);opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s ease,transform .25s var(--cp-ease)}
  .cp-top.show{opacity:1;transform:none;pointer-events:auto}
  @media(max-width:520px){.cp-top{right:14px;bottom:14px}.cp-lightbox{padding:14px}}
  @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.screen-card:hover,.hero-card:hover,.journey-line article:hover{transform:none}.site-header nav a[aria-current="page"]::after{animation:none}}
`;
document.head.appendChild(style);

const progress = document.createElement('div');
progress.className = 'cp-progress';
progress.innerHTML = '<i></i>';
document.body.prepend(progress);

const top = document.createElement('button');
top.className = 'cp-top';
top.type = 'button';
top.setAttribute('aria-label', 'Back to top');
top.textContent = '↑';
document.body.appendChild(top);

const lightbox = document.createElement('div');
lightbox.className = 'cp-lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.innerHTML = '<button class="cp-close" type="button" aria-label="Close">×</button><figure><img alt=""><figcaption></figcaption></figure>';
document.body.appendChild(lightbox);
const lightImg = lightbox.querySelector('img');
const lightCaption = lightbox.querySelector('figcaption');
const closeLightbox = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
lightbox.querySelector('.cp-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

document.querySelectorAll('.screen-card img, .browser-frame img, img[data-lightbox]').forEach((img) => {
  const card = img.closest('.screen-card, .browser-frame') || img;
  card.style.cursor = 'zoom-in';
  const open = () => {
    lightImg.src = img.currentSrc || img.src;
    lightImg.alt = img.alt || 'CarePath screen';
    lightCaption.textContent = img.alt || 'CarePath screen';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  card.addEventListener('click', open);
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
document.querySelectorAll('.section, .hero, .hero-card, .screen-card, .system-grid, .journey-line, .reflection, .final-cta').forEach((el) => {
  if (!el.classList.contains('reveal')) { el.classList.add('reveal'); observer.observe(el); }
});

const links = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((link) => link.setAttribute('aria-current', link.getAttribute('href') === '#' + entry.target.id ? 'page' : 'false'));
    }
  });
}, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

const updateScrollUI = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.querySelector('i').style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  top.classList.toggle('show', window.scrollY > 600);
};
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();
top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('.site-header nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.site-header nav a').forEach((item) => item.setAttribute('aria-current', 'false'));
    link.setAttribute('aria-current', 'page');
  });
});
