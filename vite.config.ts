import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import config from './src/config.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || './';
  const siteUrl = env.VITE_SITE_URL?.replace(/\/$/, '');
  return {
    base,
    plugins: [react(), {
      name: 'static-meta-and-offline',
      transformIndexHtml(html) {
        return html.replaceAll('VotoCiego', config.name).replace('</head>', siteUrl ? `<link rel="canonical" href="${siteUrl}/" /><meta property="og:url" content="${siteUrl}/" /></head>` : '</head>');
      },
      closeBundle() {
        const assets = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? assets(join(dir, entry.name)) : [join(dir, entry.name).replace(/^dist\//, '')]);
        const files = assets('dist').filter(file => !['sw.js', 'sitemap.xml'].includes(file));
        writeFileSync('dist/manifest.webmanifest', JSON.stringify({ name: config.name, short_name: config.name, description: config.description, lang: 'es', id: './', start_url: './', scope: './', display: 'standalone', background_color: '#fafbfb', theme_color: '#444851', icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }));
        if (!files.includes('manifest.webmanifest')) files.push('manifest.webmanifest');
        const hash = createHash('sha256');
        files.forEach(file => hash.update(readFileSync(join('dist', file))));
        const version = hash.digest('hex').slice(0, 16);
        writeFileSync('dist/sw.js', `const ROOT = new URL('./', self.location.href);
const PREFIX = 'votociego-' + ROOT.pathname + '-';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(files)}.map(file => new URL(file, ROOT).href);
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (event.request.method !== 'GET' || url.origin !== ROOT.origin || !url.href.startsWith(ROOT.href)) return;
 if (event.request.mode === 'navigate') { event.respondWith(fetch(event.request).catch(async () => (await caches.match(event.request, { ignoreVary: true })) || caches.match(new URL('index.html', ROOT).href))); return; }
 if (FILES.includes(url.href)) event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached => cached || fetch(event.request)));
});`);
        if (siteUrl) writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>`);
        if (siteUrl) writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
        readFileSync('dist/index.html');
      },
    }],
  };
});
