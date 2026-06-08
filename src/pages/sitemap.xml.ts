import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://kanal-fuchs.de';

const staticPages = [
  { path: '/',                               priority: '1.0', changefreq: 'weekly'  },
  { path: '/kanalsanierung-frankfurt',       priority: '0.9', changefreq: 'monthly' },
  { path: '/kanalreinigung-bad-nauheim',     priority: '0.9', changefreq: 'monthly' },
  { path: '/kanalreinigung-giessen',         priority: '0.9', changefreq: 'monthly' },
  { path: '/kanalreinigung-raunheim',        priority: '0.9', changefreq: 'monthly' },
  { path: '/kanalreinigung-wiesbaden',       priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-bad-homburg',      priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-friedberg',        priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-friedrichsdorf',   priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-karben',           priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-neu-anspach',      priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-oberursel',        priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-ockstadt',         priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-offenbach',        priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-rodheim',          priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-rosbach',          priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-usingen',          priority: '0.9', changefreq: 'monthly' },
  { path: '/rohrreinigung-wehrheim',         priority: '0.9', changefreq: 'monthly' },
  { path: '/rohr-kanalreinigung',            priority: '0.9', changefreq: 'monthly' },
  { path: '/bodenablaeufe-keller-rueckstau', priority: '0.8', changefreq: 'monthly' },
  { path: '/dichtheitspruefung',             priority: '0.8', changefreq: 'monthly' },
  { path: '/industriereinigung-frankfurt',   priority: '0.8', changefreq: 'monthly' },
  { path: '/kanaltechnik-vorsorge',          priority: '0.8', changefreq: 'monthly' },
  { path: '/rueckstauklappe-wartung',        priority: '0.8', changefreq: 'monthly' },
  { path: '/tv-kanalinspektion',             priority: '0.8', changefreq: 'monthly' },
  { path: '/wc-bad-kueche-verstopfung',      priority: '0.8', changefreq: 'monthly' },
  { path: '/wurzelfraesen-kanal',            priority: '0.8', changefreq: 'monthly' },
  { path: '/ueber-uns',                      priority: '0.7', changefreq: 'monthly' },
  { path: '/kontakt',                        priority: '0.7', changefreq: 'monthly' },
  { path: '/blog',                           priority: '0.7', changefreq: 'weekly'  },
];

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const urls = [
    ...staticPages.map(({ path, priority, changefreq }) => `
  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`),
    ...posts.map(post => `
  <url>
    <loc>${SITE}/blog/${post.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
