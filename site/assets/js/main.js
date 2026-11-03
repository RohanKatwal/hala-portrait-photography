(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // year
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  // header state
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  const btn = $('.menu-btn'), menu = $('.mobile-menu');
  const setMenu = (open) => {
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open; document.body.classList.toggle('locked', open);
  };
  btn.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // scroll reveal
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px 12% 0px' });
  $$('.reveal').forEach((el, i) => {
    if (!el.style.getPropertyValue('--d') && el.classList.contains('tile')) el.style.setProperty('--d', `${(i % 3) * 50}ms`);
    io.observe(el);
  });

  // hero: load the hidden slideshow images only after the page has finished loading
  const loadHero = () => $$('.hero img[data-src]').forEach((im) => { im.srcset = im.dataset.srcset; im.src = im.dataset.src; });
  if (document.readyState === 'complete') loadHero(); else addEventListener('load', loadHero);

  // hero crossfade, columns staggered
  if (!reduced) $$('.hero-col').forEach((col, c) => {
    const imgs = $$('img', col); let i = 0;
    setTimeout(() => setInterval(() => {
      imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on');
    }, 5200), c * 1300 + 2500);
  });

  // gallery filters
  const grid = $('[data-filterable]');
  $$('.filters button').forEach((b) => b.addEventListener('click', () => {
    $$('.filters button').forEach((x) => x.classList.toggle('on', x === b));
    const f = b.dataset.filter;
    $$('.tile', grid).forEach((t) => t.classList.toggle('hide', f !== 'all' && t.dataset.cat !== f));
  }));

  // lightbox
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let group = [], idx = 0, lastFocus;
  const show = (n) => {
    idx = (n + group.length) % group.length;
    const a = group[idx];
    lbImg.classList.add('loading');
    lbImg.onload = () => lbImg.classList.remove('loading');
    lbImg.src = a.href; lbImg.alt = $('img', a).alt;
    lbCap.textContent = `${idx + 1} / ${group.length}`;
    [group[idx + 1], group[idx - 1]].forEach((p) => p && (new Image().src = p.href));
  };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('locked'); lastFocus?.focus(); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lightbox]'); if (!a) return;
    e.preventDefault(); lastFocus = a;
    group = $$(`[data-lightbox="${a.dataset.lightbox}"]`).filter((t) => !t.classList.contains('hide'));
    show(group.indexOf(a)); lb.hidden = false; document.body.classList.add('locked'); $('.lb-close', lb).focus();
  });
  $('.lb-close', lb).onclick = closeLb;
  $('.lb-prev', lb).onclick = () => show(idx - 1);
  $('.lb-next', lb).onclick = () => show(idx + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') closeLb(); });
  let tx = 0;
  lb.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });

  // films: hover preview + player (player on /films/, otherwise go to films page)
  const player = $('.player');
  const pv = player && $('video', player);
  const hover = matchMedia('(hover: hover)').matches;
  $$('.film').forEach((f) => {
    const v = $('video', f);
    if (hover && !reduced) {
      f.addEventListener('mouseenter', () => { v.preload = 'auto'; v.play().catch(() => {}); });
      f.addEventListener('mouseleave', () => { v.pause(); });
    }
    f.addEventListener('click', () => {
      if (!player) { location.href = `/films/#${f.dataset.film}`; return; }
      v.pause(); lastFocus = f;
      pv.src = `/assets/video/${f.dataset.film}.mp4`; pv.poster = v.poster;
      $('.player-title', player).textContent = f.dataset.title;
      player.hidden = false; document.body.classList.add('locked');
      pv.play().catch(() => {}); $('.lb-close', player).focus();
    });
  });
  const closePlayer = () => { pv.pause(); pv.removeAttribute('src'); pv.load(); player.hidden = true; document.body.classList.remove('locked'); lastFocus?.focus(); };
  if (player) {
    $('.lb-close', player).onclick = closePlayer;
    player.addEventListener('click', (e) => e.target === player && closePlayer());
    const target = location.hash && $(`.film[data-film="${location.hash.slice(1)}"]`);
    if (target) setTimeout(() => target.click(), 300);
  }

  addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    } else if (player && !player.hidden && e.key === 'Escape') closePlayer();
    else if (!menu.hidden && e.key === 'Escape') setMenu(false);
  });

  // contact form -> WhatsApp
  const form = $('.contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const text = `Hi Hala! My name is ${d.name}.\nShoot: ${d.type}${d.date ? `\nPreferred date: ${d.date}` : ''}\n\n${d.message}`;
    window.open(`${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
