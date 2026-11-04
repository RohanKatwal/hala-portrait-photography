// Generates every HTML page of the site into ./site from the data below.
// Run: node scripts/build.mjs   (after scripts/optimize.sh has produced the media)
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const dims = JSON.parse(readFileSync(join(root, 'scripts/dimensions.json'), 'utf8'));

// ---------------------------------------------------------------- site data
const SITE = {
  url: 'https://hala-portrait-photography.vercel.app',
  brand: 'hala.portrait.photography',
  name: 'Hala Jalal',
  phoneDisplay: '+971 50 603 3277',
  phoneTel: '+971506033277',
  whatsapp: 'https://wa.me/971506033277',
  instagram: 'https://www.instagram.com/hala.portrait.photography/',
  tiktok: 'https://www.tiktok.com/@looolih',
  location: 'Abu Dhabi, UAE',
  permit: '5291081',
};

const ALBUMS = {
  portrait: {
    title: 'Portrait',
    tagline: 'Faces, light and quiet moments',
    blurb: 'Natural, honest portraits — on the beach, in the city and in the studio. Every session is built around you: your story, your style and the way you want to be remembered.',
    cover: 29,
    ids: [70, 46, 29, 66, 60, 33, 37, 62, 13, 75, 68, 31, 36, 59, 16, 39, 34, 61, 14, 63, 17, 24, 69, 30, 15, 58, 67, 32, 48, 38, 35, 76, 56, 64],
  },
  fashion: {
    title: 'Fashion',
    tagline: 'Editorial, couture & brand campaigns',
    blurb: 'Campaign and lookbook work for designers, jewellery houses and modest-fashion labels — heritage pieces, couture and street style, captured with a cinematic eye.',
    cover: 20,
    ids: [28, 1, 20, 9, 83, 2, 74, 21, 10, 26, 18, 11, 6, 50, 12, 23, 25, 7, 44, 22, 5, 52, 51, 54, 53, 55],
  },
  wedding: {
    title: 'Wedding',
    tagline: 'Brides, love stories & bridal campaigns',
    blurb: 'Wedding days, bridal portraits and bridal-collection campaigns — the getting ready, the gold, the gown and the quiet moments in between, captured with care.',
    cover: 84,
    ids: [84, 78, 85, 77, 27, 80, 79, 45, 81, 47],
  },
  monochrome: {
    title: 'Monochrome',
    tagline: 'Black & white, stripped back',
    blurb: 'When colour falls away, what is left is shape, shadow and emotion. A collection of black-and-white portraits that feel timeless.',
    cover: 71,
    ids: [8, 3, 82, 40, 42, 71, 19, 4, 41, 65, 57, 43, 49, 72, 73],
  },
};

const FILMS = [
  { slug: 'wedding-love-story', title: 'A Love Story — Wedding Film', meta: 'Wedding film · Bride & groom', dur: '1:10', wide: true },
  { slug: 'heritage-couture', title: 'Where Heritage Meets Haute Couture', meta: 'Fashion film · Sudanese couture', dur: '0:32' },
  { slug: 'tiyab-rourue', title: 'Tiyab Rourue × Elham Jewellery', meta: 'Brand campaign', dur: '0:24' },
  { slug: 'wedding-edition', title: 'Wedding Edition — Silk & Gold', meta: 'Bridal collection · Almaqam Jewellery', dur: '0:18' },
  { slug: 'the-nun', title: 'Inspired by The Nun', meta: 'Creative concept shoot', dur: '0:22' },
  { slug: 'wedding-season', title: 'Wedding Season Collection', meta: 'Jewellery campaign', dur: '0:18' },
  { slug: 'hayzo-dubai', title: 'H.A.Y.Z.O — Dubai', meta: 'Fashion shoot · Dubai', dur: '0:23' },
  { slug: 'kwetu-tiyab', title: 'Luxury Handpicked Tiyab', meta: 'Product film · Kwetu Africa', dur: '0:16' },
  { slug: 'peony-perfume', title: 'Peony — Perfume Teaser', meta: 'Product film', dur: '0:15' },
  { slug: 'sudan-independence', title: 'عزيز انت يا وطني — Sudan Independence Day', meta: 'Social-responsibility film', dur: '1:08' },
];

const FEATURED = [84, 3, 37, 9, 46, 78, 60, 40, 74, 70, 27, 33];
const HERO = [[28, 70, 1], [8, 46, 20], [66, 74, 60]]; // three columns that crossfade

const SERVICES = [
  ['Portrait sessions', 'Personal, family, graduation and creative portraits — outdoors or in studio.'],
  ['Weddings & bridal', 'Wedding days, bridal portraits and cinematic wedding films — from getting ready to the last dance.'],
  ['Fashion & editorial', 'Lookbooks, campaigns and editorials for designers and boutiques.'],
  ['Brand & product content', 'Jewellery, perfume and product imagery that sells the story.'],
  ['Videography & reels', 'Short cinematic films and vertical reels for Instagram and TikTok.'],
];

const COLLABS = ['Tibid Community', 'Alma Fragrance', 'A&H Collection', 'Blanch Group', 'Creative Boutique', 'Noub Collection', 'Amna’s Wardrobe',
  'Tiyab Rourue', 'Elham Jewellery', 'Almaqam Jewellery', 'Kwetu Africa', 'H.A.Y.Z.O'];
const collabList = () => `<ul>${COLLABS.map((c) => `<li class="reveal">${esc(c)}</li>`).join('')}</ul>`;

// ---------------------------------------------------------------- helpers
const albumOf = Object.fromEntries(Object.entries(ALBUMS).flatMap(([k, a]) => a.ids.map((id) => [id, k])));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const alt = (id) => `${ALBUMS[albumOf[id]]?.title ?? 'Portrait'} photography by Hala Jalal, Abu Dhabi`;
const size = (id) => { const [w, h] = dims[id]; return w > 1600 ? [1600, Math.round(h * 1600 / w)] : [w, h]; };

function img(id, { cls = '', eager = false, defer = false, sizes = '(max-width: 700px) 50vw, 33vw' } = {}) {
  const [w, h] = size(id);
  if (defer) return `<img class="${cls}" data-src="/assets/img/${id}-640.webp" data-srcset="/assets/img/${id}-640.webp 640w, /assets/img/${id}-1600.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="" decoding="async">`;
  return `<img class="${cls}" src="/assets/img/${id}-640.webp" srcset="/assets/img/${id}-640.webp 640w, /assets/img/${id}-1600.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt(id))}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function tile(id, group) {
  return `<a class="tile reveal" href="/assets/img/${id}-1600.webp" data-lightbox="${group}" data-cat="${albumOf[id]}">${img(id)}</a>`;
}

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.8 2.2 4.6 5 5"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 2.2 2.3 4.3 4.6 4.8l1-1.1 1.6.8-.4 1.4c-3.4.2-6.6-3-6.4-6.4l1.4-.4.8 1.6z" fill="currentColor" stroke="none"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  sun: '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg>',
};

const socials = () => `
  <a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
  <a href="${SITE.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}</a>
  <a href="${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>`;

const NAV = [['/work/', 'Work'], ['/albums/', 'Albums'], ['/films/', 'Films'], ['/about/', 'About'], ['/contact/', 'Contact']];

function layout({ path, title, description, body, ogImage = '/assets/og.jpg', schema = '', bodyClass = '' }) {
  const url = SITE.url + path;
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0e0d0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.brand}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${schema}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <a class="wordmark" href="/" aria-label="${SITE.brand} — home"><span>hala</span><em>.portrait.photography</em></a>
  <div class="header-right">
    <nav class="nav" aria-label="Main">${nav}</nav>
    <button class="theme-btn" aria-label="Switch to light mode" title="Light / dark mode">${ICONS.sun}${ICONS.moon}</button>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>
<div class="mobile-menu" hidden>
  <nav aria-label="Mobile">${NAV.map(([h, l], i) => `<a href="${h}" style="--i:${i}">${l}</a>`).join('')}</nav>
  <div class="socials">${socials()}</div>
</div>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="footer-cta">
    <p class="eyebrow">Bookings open</p>
    <h2>Let’s create something <em>beautiful.</em></h2>
    <a class="btn" href="/contact/">Book a session ${ICONS.arrow}</a>
  </div>
  <div class="footer-grid">
    <div>
      <a class="wordmark" href="/"><span>hala</span><em>.portrait.photography</em></a>
      <p class="muted">Portrait, fashion, wedding &amp; brand photographer and videographer based in ${SITE.location}.</p>
    </div>
    <div>
      <h3>Contact</h3>
      <p><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a><br><a href="${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><br>${SITE.location}</p>
    </div>
    <div>
      <h3>Explore</h3>
      <p>${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('<br>')}</p>
    </div>
    <div>
      <h3>Follow</h3>
      <div class="socials">${socials()}</div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© <span data-year>2026</span> ${SITE.name} · ${SITE.brand}</span>
    <span class="permit">UAE Advertiser Permit No. <strong>${SITE.permit}</strong></span>
  </div>
</footer>
<div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Image viewer">
  <button class="lb-close" aria-label="Close">×</button>
  <button class="lb-prev" aria-label="Previous">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-next" aria-label="Next">›</button>
</div>
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

const pageHead = (eyebrow, title, lead) => `
<section class="page-head">
  <p class="eyebrow reveal">${eyebrow}</p>
  <h1 class="reveal">${title}</h1>
  ${lead ? `<p class="lead reveal">${lead}</p>` : ''}
</section>`;

const filmCard = (f, i) => `
<button class="film reveal${f.wide ? ' wide' : ''}" data-film="${f.slug}" data-title="${esc(f.title)}" style="--d:${(i % 4) * 80}ms">
  <video muted loop playsinline preload="none" poster="/assets/video/${f.slug}.webp" src="/assets/video/${f.slug}.mp4#t=0.1"></video>
  <span class="film-play">${ICONS.play}</span>
  <span class="film-info"><strong>${esc(f.title)}</strong><small>${esc(f.meta)} · ${f.dur}</small></span>
</button>`;

const albumCard = (key, a, big = false) => `
<a class="album reveal${big ? ' big' : ''}" href="/albums/${key}/">
  ${img(a.cover, { sizes: '(max-width: 700px) 100vw, 33vw' })}
  <span class="album-info"><small>${a.ids.length} photographs</small><strong>${a.title}</strong><em>${a.tagline}</em></span>
</a>`;

const schemaLD = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.brand,
  alternateName: `${SITE.name} Photography`,
  description: 'Portrait, fashion, wedding and brand photographer & videographer based in Abu Dhabi, UAE.',
  url: SITE.url,
  image: SITE.url + '/assets/og.jpg',
  telephone: SITE.phoneTel,
  founder: { '@type': 'Person', name: SITE.name, jobTitle: 'Photographer & Videographer' },
  address: { '@type': 'PostalAddress', addressLocality: 'Abu Dhabi', addressCountry: 'AE' },
  areaServed: ['Abu Dhabi', 'Dubai', 'United Arab Emirates'],
  sameAs: [SITE.instagram, SITE.tiktok],
})}</script>`;

// Featured shots first, then the albums interleaved so categories stay mixed.
function galleryOrder() {
  const rest = Object.values(ALBUMS).map((a) => a.ids.filter((id) => !FEATURED.includes(id)));
  const mixed = [];
  for (let i = 0; rest.some((r) => i < r.length); i++) rest.forEach((r) => r[i] !== undefined && mixed.push(r[i]));
  return [...FEATURED, ...mixed];
}

// ---------------------------------------------------------------- pages
const pages = {};

pages['/'] = layout({
  path: '/',
  title: 'Hala Jalal — Portrait, Fashion & Wedding Photographer in Abu Dhabi | hala.portrait.photography',
  description: 'Hala Jalal is a portrait, fashion, wedding and brand photographer & videographer based in Abu Dhabi, UAE. View the portfolio and book a session.',
  schema: schemaLD,
  bodyClass: 'home',
  body: `
<section class="hero">
  <div class="hero-media" aria-hidden="true">
    ${HERO.map((col, c) => `<div class="hero-col" style="--c:${c}">${col.map((id, i) =>
      img(id, { cls: i === 0 ? 'on' : '', eager: i === 0, defer: i > 0, sizes: '(max-width: 700px) 100vw, 34vw' })).join('')}</div>`).join('')}
  </div>
  <div class="hero-text">
    <p class="eyebrow">Photographer &amp; Videographer · ${SITE.location}</p>
    <h1><span class="line"><span>Hala Jalal</span></span><span class="line"><em>portraits that feel like you</em></span></h1>
    <div class="hero-actions">
      <a class="btn" href="/work/">View portfolio ${ICONS.arrow}</a>
      <a class="btn ghost" href="/contact/">Book a session</a>
    </div>
  </div>
  <span class="scroll-cue" aria-hidden="true">Scroll</span>
</section>

<div class="marquee" aria-hidden="true"><div>${Array(2).fill('<span>Portrait</span><i>✦</i><span>Fashion</span><i>✦</i><span>Weddings</span><i>✦</i><span>Monochrome</span><i>✦</i><span>Brand films</span><i>✦</i><span>Abu Dhabi · UAE</span><i>✦</i>').join('')}</div></div>

<section class="intro wrap">
  <p class="eyebrow reveal">Hello, I’m Hala</p>
  <p class="statement reveal">I photograph people the way they deserve to be seen — <em>bold, elegant and real.</em> From weddings and heritage couture to fine jewellery and quiet portraits by the sea, every frame is made with care.</p>
  <a class="link reveal" href="/about/">More about me ${ICONS.arrow}</a>
</section>

<section class="wrap section">
  <div class="section-head"><h2 class="reveal">Selected <em>work</em></h2><a class="link reveal" href="/work/">Full gallery ${ICONS.arrow}</a></div>
  <div class="masonry">${FEATURED.map((id) => tile(id, 'featured')).join('')}</div>
</section>

<section class="wrap section">
  <div class="section-head"><h2 class="reveal">Albums</h2><a class="link reveal" href="/albums/">All albums ${ICONS.arrow}</a></div>
  <div class="albums">${Object.entries(ALBUMS).map(([k, a]) => albumCard(k, a)).join('')}</div>
</section>

<section class="section films-band">
  <div class="wrap">
    <div class="section-head"><h2 class="reveal">Films &amp; <em>reels</em></h2><a class="link reveal" href="/films/">All films ${ICONS.arrow}</a></div>
    <div class="films rail">${FILMS.filter((f) => !f.wide).slice(0, 4).map(filmCard).join('')}</div>
  </div>
</section>

<section class="wrap section wedding-band">
  <div class="wedding-text">
    <p class="eyebrow reveal">Now booking weddings</p>
    <h2 class="reveal">Your love story, <em>beautifully told.</em></h2>
    <p class="reveal muted">From the getting-ready moments to the last dance — bridal portraits, wedding-day photography and cinematic wedding films across Abu Dhabi and the UAE.</p>
    <div class="hero-actions reveal"><a class="btn" href="/albums/wedding/">Wedding album ${ICONS.arrow}</a><a class="btn ghost" href="/contact/">Enquire</a></div>
  </div>
  ${filmCard(FILMS.find((f) => f.wide), 0)}
</section>

<section class="wrap section services">
  <div class="section-head"><h2 class="reveal">What I <em>do</em></h2></div>
  <ol>${SERVICES.map(([t, d], i) => `<li class="reveal"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</section>

<section class="wrap section collabs">
  <p class="eyebrow reveal">Brands I’ve worked with</p>
  ${collabList()}
</section>`,
});

pages['/work/'] = layout({
  path: '/work/',
  title: 'Portfolio Gallery — Hala Jalal Photography, Abu Dhabi',
  description: 'Portrait, fashion, wedding and monochrome photography by Hala Jalal, Abu Dhabi. Browse the full gallery.',
  body: `${pageHead('Gallery', 'The <em>work</em>', 'A selection of portrait, fashion, wedding and black-and-white photography.')}
<section class="wrap">
  <div class="filters reveal" role="tablist">
    <button class="on" data-filter="all">All</button>
    ${Object.entries(ALBUMS).map(([k, a]) => `<button data-filter="${k}">${a.title}</button>`).join('')}
  </div>
  <div class="masonry" data-filterable>${galleryOrder().map((id) => tile(id, 'work')).join('')}</div>
</section>`,
});

pages['/albums/'] = layout({
  path: '/albums/',
  title: 'Albums — Portrait, Fashion, Wedding & Monochrome | Hala Jalal Photography',
  description: 'Photo albums by Hala Jalal: portrait, fashion, wedding and monochrome collections from Abu Dhabi and across the UAE.',
  body: `${pageHead('Collections', 'Albums', 'Four collections, four moods. Choose one to step inside.')}
<section class="wrap"><div class="albums tall">${Object.entries(ALBUMS).map(([k, a]) => albumCard(k, a, true)).join('')}</div></section>`,
});

const keys = Object.keys(ALBUMS);
for (const [k, a] of Object.entries(ALBUMS)) {
  const next = keys[(keys.indexOf(k) + 1) % keys.length];
  pages[`/albums/${k}/`] = layout({
    path: `/albums/${k}/`,
    title: `${a.title} Photography — Hala Jalal, Abu Dhabi`,
    description: `${a.title} photography by Hala Jalal. ${a.blurb}`.slice(0, 158),
    ogImage: `/assets/img/${a.cover}-1600.webp`,
    body: `${pageHead(`Album · ${a.ids.length} photographs`, a.title, a.blurb)}
<section class="wrap"><div class="masonry">${a.ids.map((id) => tile(id, k)).join('')}</div>
<a class="next-album reveal" href="/albums/${next}/"><small>Next album</small><strong>${ALBUMS[next].title} ${ICONS.arrow}</strong></a></section>`,
  });
}

pages['/films/'] = layout({
  path: '/films/',
  title: 'Films & Reels — Hala Jalal Videography, Abu Dhabi',
  description: 'Wedding films, fashion films, brand campaigns and reels by videographer Hala Jalal, Abu Dhabi, UAE.',
  body: `${pageHead('Videography', 'Films &amp; <em>reels</em>', 'Cinematic wedding films and short films for fashion labels, jewellery houses and brands. Tap any film to watch with sound.')}
<section class="wrap"><div class="films grid">${FILMS.map(filmCard).join('')}</div></section>
<div class="player" hidden role="dialog" aria-modal="true" aria-label="Video player">
  <button class="lb-close" aria-label="Close">×</button>
  <video controls playsinline></video>
  <p class="player-title"></p>
</div>`,
});

pages['/about/'] = layout({
  path: '/about/',
  title: 'About Hala Jalal — Photographer & Videographer, Abu Dhabi',
  description: 'Meet Hala Jalal, the portrait, fashion, wedding and brand photographer & videographer behind hala.portrait.photography in Abu Dhabi, UAE.',
  schema: schemaLD,
  body: `
<section class="about wrap">
  <div class="about-img reveal">${img(8, { sizes: '(max-width: 800px) 100vw, 45vw', eager: true })}</div>
  <div class="about-text">
    <p class="eyebrow reveal">About</p>
    <h1 class="reveal">Hi, I’m <em>Hala.</em></h1>
    <p class="lead reveal">I’m a photographer and videographer based in Abu Dhabi, working across the UAE.</p>
    <p class="reveal">My work lives where portraiture meets fashion. I love strong light, rich colour and the quiet confidence of someone who feels truly seen — and I’m just as happy shooting black and white when the moment calls for it.</p>
    <p class="reveal">I work with individuals, designers, jewellery houses and brands to create images and short films that tell their story — from weddings, heritage couture and bridal collections to graduations, creative concepts and portraits by the sea.</p>
    <p class="reveal">Whether it’s your first photoshoot or your next campaign, I’ll guide you through every step so you can relax and enjoy it.</p>
    <div class="about-meta reveal">
      <div><h3>Based in</h3><p>${SITE.location}</p></div>
      <div><h3>Specialities</h3><p>Portrait · Fashion · Wedding · Film</p></div>
      <div><h3>Licensed</h3><p>UAE Advertiser Permit<br>No. ${SITE.permit}</p></div>
    </div>
    <a class="btn reveal" href="/contact/">Work with me ${ICONS.arrow}</a>
  </div>
</section>

<section class="wrap section services">
  <div class="section-head"><h2 class="reveal">Services</h2></div>
  <ol>${SERVICES.map(([t, d], i) => `<li class="reveal"><span>0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
</section>

<section class="wrap section collabs">
  <p class="eyebrow reveal">Brands I’ve worked with</p>
  ${collabList()}
</section>`,
});

pages['/contact/'] = layout({
  path: '/contact/',
  title: 'Contact & Bookings — Hala Jalal Photography, Abu Dhabi',
  description: 'Book a wedding, portrait, fashion or brand photoshoot with Hala Jalal in Abu Dhabi, UAE. Contact via WhatsApp, phone, Instagram or TikTok.',
  schema: schemaLD,
  body: `${pageHead('Contact', 'Let’s <em>talk</em>', 'Tell me about your idea — a wedding, a portrait session, a campaign or a brand film. I usually reply within a day.')}
<section class="wrap contact">
  <form class="contact-form reveal" data-whatsapp="${SITE.whatsapp}">
    <label>Your name<input name="name" required autocomplete="name"></label>
    <label>Type of shoot
      <select name="type">
        <option>Portrait session</option><option>Wedding / bridal</option><option>Fashion / editorial</option><option>Brand or product</option>
        <option>Video / reels</option><option>Graduation</option><option>Something else</option>
      </select>
    </label>
    <label>Preferred date<input name="date" type="date"></label>
    <label>Message<textarea name="message" rows="5" required placeholder="A few words about what you have in mind…"></textarea></label>
    <button class="btn" type="submit">Send via WhatsApp ${ICONS.whatsapp}</button>
    <p class="muted small">This opens WhatsApp with your message ready to send.</p>
  </form>
  <aside class="contact-info reveal">
    <a href="${SITE.whatsapp}" target="_blank" rel="noopener">${ICONS.whatsapp}<span><small>WhatsApp</small>${SITE.phoneDisplay}</span></a>
    <a href="tel:${SITE.phoneTel}">${ICONS.phone}<span><small>Call</small>${SITE.phoneDisplay}</span></a>
    <a href="${SITE.instagram}" target="_blank" rel="noopener">${ICONS.instagram}<span><small>Instagram</small>@hala.portrait.photography</span></a>
    <a href="${SITE.tiktok}" target="_blank" rel="noopener">${ICONS.tiktok}<span><small>TikTok</small>@looolih</span></a>
    <div>${ICONS.pin}<span><small>Location</small>Based in Abu Dhabi · available across the UAE</span></div>
    <p class="permit-card">UAE Advertiser Permit No. <strong>${SITE.permit}</strong><br><span class="muted">For advertising &amp; brand collaborations.</span></p>
  </aside>
</section>`,
});

pages['/404.html'] = layout({
  path: '/404.html',
  title: 'Page not found — hala.portrait.photography',
  description: 'This page could not be found.',
  body: `${pageHead('404', 'Lost in the <em>dark room</em>', 'The page you’re looking for doesn’t exist.')}<p class="wrap center"><a class="btn" href="/">Back home ${ICONS.arrow}</a></p>`,
});

// ---------------------------------------------------------------- write
for (const [path, html] of Object.entries(pages)) {
  const file = path.endsWith('.html') ? join(out, path) : join(out, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
const urls = Object.keys(pages).filter((p) => !p.endsWith('.html'));
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
writeFileSync(join(out, 'assets/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0e0d0c"/><text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="38" fill="#d2b48c">h</text></svg>`);
console.log(`Built ${Object.keys(pages).length} pages into site/`);
