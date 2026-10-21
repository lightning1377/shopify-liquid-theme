#!/usr/bin/env node

/**
 * KAVRA Shopify Theme Link Checker
 * Crawls internal links starting from the root and reports any that return 404 or errors.
 *
 * Usage:
 *   node scripts/check-links.js [http://127.0.0.1:9292]
 *   make check-links
 */

const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:9292';

const IGNORED_PREFIXES = [
  '/cdn/',
  '/cart',
  '/checkout',
  '/localization',
  '/wpm@',
  '/.well-known/',
  '/admin',
  '/services/',
];

const IGNORED_EXTENSIONS = [
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.ico',
  '.xml',
  '.txt',
];

function normalizePath(rawHref, currentUrl) {
  if (!rawHref) return null;
  const trimmed = rawHref.trim();

  // Skip external schemes & anchors
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('whatsapp:')
  ) {
    return null;
  }

  try {
    const resolved = new URL(trimmed, currentUrl);
    const baseOrigin = new URL(BASE_URL).origin;

    // Only crawl same-origin links
    if (resolved.origin !== baseOrigin) {
      return null;
    }

    let pathname = resolved.pathname;
    const search = resolved.search;

    // Remove trailing slash if longer than 1 character
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    // Check ignored prefixes
    for (const prefix of IGNORED_PREFIXES) {
      if (pathname.startsWith(prefix)) return null;
    }

    // Check ignored file extensions
    const lower = pathname.toLowerCase();
    for (const ext of IGNORED_EXTENSIONS) {
      if (lower.endsWith(ext)) return null;
    }

    // Keep query params if relevant (e.g. ?gateway=1)
    return search ? pathname + search : pathname;
  } catch {
    return null;
  }
}

function extractLinks(html, pageUrl) {
  const links = new Set();
  const regex = /<a\b[^>]*?\bhref\s*=\s*(['"])(.*?)\1/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const normalized = normalizePath(match[2], pageUrl);
    if (normalized) {
      links.add(normalized);
    }
  }
  return Array.from(links);
}

async function checkLinks() {
  console.log(`\n==============================================`);
  console.log(`🔍 KAVRA Theme Broken Link Checker`);
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`==============================================\n`);

  const queue = ['/'];
  const queuedSet = new Set(['/']);
  const visited = new Set();
  const sources = new Map(); // path -> Set of referring paths
  const broken404 = [];
  const serverErrors = [];

  // Seed primary entry points
  const seedPaths = [
    '/',
    '/collections/erkek-anasayfa',
    '/collections/kadin-anasayfa',
    '/collections/all',
  ];

  for (const s of seedPaths) {
    if (!queuedSet.has(s)) {
      queue.push(s);
      queuedSet.add(s);
    }
  }

  let checkedCount = 0;

  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (visited.has(currentPath)) continue;
    visited.add(currentPath);
    checkedCount++;

    const fullUrl = new URL(currentPath, BASE_URL).href;

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'KavraLinkChecker/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });

      const status = response.status;
      const refList = Array.from(sources.get(currentPath) || ['(initial)']).join(', ');

      if (status === 404) {
        console.log(`❌ [404 Not Found] ${currentPath} (linked from: ${refList})`);
        broken404.push({
          URL: currentPath,
          Status: 404,
          'Found On': refList,
        });
        continue;
      } else if (status >= 500) {
        console.log(`💥 [${status} Server Error] ${currentPath} (linked from: ${refList})`);
        serverErrors.push({
          URL: currentPath,
          Status: status,
          'Found On': refList,
        });
        continue;
      } else {
        process.stdout.write(`✔ [${status}] ${currentPath}\n`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await response.text();
        const foundLinks = extractLinks(html, fullUrl);

        for (const link of foundLinks) {
          if (!sources.has(link)) {
            sources.set(link, new Set());
          }
          sources.get(link).add(currentPath);

          if (!visited.has(link) && !queuedSet.has(link)) {
            queue.push(link);
            queuedSet.add(link);
          }
        }
      }
    } catch (err) {
      console.log(`⚠️ Network Error on ${currentPath}: ${err.message}`);
      serverErrors.push({
        URL: currentPath,
        Status: 'FETCH_ERROR',
        'Found On': Array.from(sources.get(currentPath) || ['(initial)']).join(', '),
      });
    }
  }

  console.log(`\n==============================================`);
  console.log(`📊 Summary: Checked ${checkedCount} unique URLs`);
  console.log(`==============================================\n`);

  if (broken404.length === 0 && serverErrors.length === 0) {
    console.log(`✨ SUCCESS: No broken links found! All pages resolved properly.\n`);
    process.exit(0);
  } else {
    if (broken404.length > 0) {
      console.log(`❌ Found ${broken404.length} broken 404 links:`);
      console.table(broken404);
    }
    if (serverErrors.length > 0) {
      console.log(`💥 Found ${serverErrors.length} failed/error requests:`);
      console.table(serverErrors);
    }
    console.log('');
    process.exit(1);
  }
}

checkLinks();
