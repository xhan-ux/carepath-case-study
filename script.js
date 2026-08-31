
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal sections/cards as they enter the viewport.
  const revealTargets = document.querySelectorAll(
    'section, .screen-card, .principle, .tl-row, .callout, .priority-row, .type-spec, .browser-frame'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  // Image lightbox for every case-study screenshot.
  const images = document.querySelectorAll('.browser-frame img, .screen-card img, img[data-lightbox]');
  if (images.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close image">×</button>
      <div class="lightbox-inner">
        <img alt="">
        <div class="lightbox-hint">Click outside or press Esc to close</div>
      </div>`;
    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector('img');
    const close = () => {
      overlay.classList.remove('open');
      document.body.classList.remove('lightbox-open');
    };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || 'CarePath interface screen';
        overlay.classList.add('open');
        document.body.classList.add('lightbox-open');
      });
    });
  }

  // Scroll progress.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Active in-page navigation.
  const links = [...document.querySelectorAll('.topbar-links a, .site-header nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.removeAttribute('aria-current'));
          const active = links.find(a => a.getAttribute('href') === `#${entry.target.id}`);
          if (active) active.setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(s => navIO.observe(s));
  }
})();
