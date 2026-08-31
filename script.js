(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  const progress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--progress', max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener('scroll', progress, { passive: true });
  progress();

  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  }

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="close" aria-label="Close image">×</button><img alt="">';
  document.body.appendChild(lightbox);
  const image = lightbox.querySelector('img');
  const close = () => lightbox.classList.remove('open');
  document.querySelectorAll('img.zoom').forEach(img => {
    img.addEventListener('click', () => {
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || 'CarePath interface';
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  lightbox.querySelector('.close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  const links = [...document.querySelectorAll('.navlinks a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.remove('active'));
        const active = links.find(link => link.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }
})();
