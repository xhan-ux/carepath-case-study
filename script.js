(() => {
  // Load the small presentation layer after the base styles.
  const presentation = document.createElement('link');
  presentation.rel = 'stylesheet';
  presentation.href = 'refine.css?v=5';
  document.head.appendChild(presentation);

  // Final mobile overrides load last so the legacy three-line menu rules cannot win.
  const mobileFixes = document.createElement('link');
  mobileFixes.rel = 'stylesheet';
  mobileFixes.href = 'mobile-fixes.css?v=4';
  document.head.appendChild(mobileFixes);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  const progress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--progress', max > 0 ? window.scrollY / max : 0);
  };
  window.addEventListener('scroll', progress, { passive: true });
  progress();

  // Reveal sections as the reader moves through the case study.
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

  // Image inspection lightbox.
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="close" aria-label="Close image">×</button><img alt="">';
  document.body.appendChild(lightbox);
  const image = lightbox.querySelector('img');
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  document.querySelectorAll('img.zoom').forEach(img => {
    img.addEventListener('click', () => {
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || 'CarePath interface';
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  lightbox.querySelector('.close').addEventListener('click', closeLightbox);

  // Responsive navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = [...document.querySelectorAll('.mobile-menu a')];

  // Move the mobile menu out of the sticky/backdrop-filter header. This prevents
  // fixed-position containing-block bugs on iOS/Android after the page is scrolled.
  if (mobileMenu && mobileMenu.parentElement !== document.body) {
    document.body.appendChild(mobileMenu);
  }

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });

    // Close FIRST, then perform the anchor scroll. This prevents the menu from
    // becoming an orphaned overlay while the page moves to the selected section.
    mobileLinks.forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) {
          closeMenu();
          return;
        }

        const target = document.querySelector(href);
        if (!target) {
          closeMenu();
          return;
        }

        event.preventDefault();
        closeMenu();

        // Update the URL without triggering a page reload, then scroll after the
        // menu has fully left the viewport.
        history.pushState(null, '', href);
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        });
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 800) closeMenu();
    });

    window.addEventListener('hashchange', closeMenu);
    window.addEventListener('pageshow', closeMenu);
  }

  // Keep the desktop and mobile navigation in sync with the section currently in view.
  const links = [...document.querySelectorAll('.navlinks a'), ...mobileLinks];
  const sections = [...new Set(links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean))];
  const setActive = id => links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMenu();
    }
  });
})();
