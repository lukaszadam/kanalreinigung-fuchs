import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BLOG_DIR = path.join(ROOT, 'src/content/blog');

const client = new Anthropic();

const topics = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf-8'));

const existingSlugs = new Set(
  fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
);

const nextTopic = topics.find(t => !existingSlugs.has(t.slug));

if (!nextTopic) {
  console.log('Alle Themen wurden bereits veröffentlicht.');
  process.exit(0);
}

console.log(`Generiere Artikel: "${nextTopic.title}"`);

const dateStr = new Date().toISOString().split('T')[0];

const prompt = `Du schreibst einen Blogartikel für Kanal- und Rohrreinigung Fuchs (kanal-fuchs.de), einen professionellen Rohr- und Kanalreinigungsbetrieb aus Rosbach vor der Höhe (Wetterau, Hessen).

Thema: "${nextTopic.title}"

Schreibe einen deutschen Blogartikel mit ca. 1.500–2.000 Wörtern, der Hausbesitzern und Mietern in der Region Frankfurt/Wetterau wirklich weiterhilft.

STIL & TON (orientiere dich genau an diesen Beispielartikeln des Betriebs):
- Anrede: "Sie" (formell)
- Ton: sachkundig, aber menschlich und leicht zugänglich – wie ein erfahrener Handwerker, der einem Bekannten erklärt, was er wissen muss
- Sprache: konkret, kein Fachjargon ohne Erklärung, keine generischen Aussagen
- Örtlicher Bezug: Wetterau, Frankfurt-Umland, Rosbach, Friedberg, Bad Homburg, Karben, Niddatal – immer dann einbauen, wenn es natürlich wirkt (Altbauten, Grundwasser, Wasserqualität in der Region)
- Schreibe so, als kämen die Infos von einem Profi, der das täglich erlebt

STRUKTUR:
- Packender Einstiegssatz (keine langweilige Einleitung, sofort ins Thema)
- H2-Abschnitte für die Hauptthemen (2–5 Abschnitte)
- Nach jedem Abschnitt ein **Profi-Tipp:** mit einem konkreten Handlungshinweis
- Ein Praxisbeispiel aus dem Einsatzgebiet (echter Kundenfall, anonymisiert, mit Ortsangabe aus der Wetterau)
- Schluss mit Fazit und Handlungsaufforderung

ABSCHLUSS – beende den Artikel immer mit genau diesem CTA (exakt so):
**[Jetzt unverbindliche Beratung anfragen oder Notdienst rufen: 06003 / 8276464](tel:060038276464)**

FORMAT – gib NUR den Markdown-Dateiinhalt aus, beginnend mit dem Frontmatter. Kein erklärender Text davor oder danach, keine Code-Fences:

---
title: "${nextTopic.title}"
description: "[SEO-Beschreibung unter 155 Zeichen, konkret und nützlich formuliert]"
date: ${dateStr}
author: Kanal Fuchs
draft: false
---

[Artikeltext]`;

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [{ role: 'user', content: prompt }],
});

let articleContent = response.content[0].text.trim();

// Strip any accidental code fences
articleContent = articleContent.replace(/^```(?:markdown)?\n/, '').replace(/\n```$/, '');

// Write article file
fs.writeFileSync(path.join(BLOG_DIR, `${nextTopic.slug}.md`), articleContent);
console.log(`Geschrieben: src/content/blog/${nextTopic.slug}.md`);

// Ping Google and Bing sitemap endpoints
const sitemapUrl = encodeURIComponent('https://kanal-fuchs.de/sitemap-index.xml');
await Promise.allSettled([
  fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
  fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
]);
console.log('Google und Bing benachrichtigt.');

console.log(`\nFertig — veröffentlicht unter: /blog/${nextTopic.slug}`);
