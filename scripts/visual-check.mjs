import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:\\XUPERTV\\.shots';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

await fs.mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: [
    '--window-size=1920,1080',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-gpu',
    '--no-sandbox',
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

const snap = async (name) => {
  await wait(700);
  await page.screenshot({ path: `${OUT}\\${name}.png` });
  console.log('  shot:', name);
};

const active = () =>
  page.evaluate(() => {
    const element = document.activeElement;
    if (!element) return null;
    return {
      tag: element.tagName,
      cls: typeof element.className === 'string' ? element.className : '',
      text: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
    };
  });

const videoInfo = () =>
  page.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) return null;
    return {
      src: (video.currentSrc || video.src || '').slice(0, 90),
      readyState: video.readyState,
      paused: video.paused,
      error: video.error?.code ?? null,
      time: Number(video.currentTime.toFixed(1)),
      duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(1)) : null,
    };
  });

console.log('1. Home');
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('.hero', { timeout: 30000 });
await wait(2000);
const layout = await page.evaluate(() => {
  const hero = document.querySelector('.hero')?.getBoundingClientRect();
  const sidebar = document.querySelector('.sidebar')?.getBoundingClientRect();
  return {
    viewport: [window.innerWidth, window.innerHeight],
    hero: hero ? { x: Math.round(hero.x), y: Math.round(hero.y), w: Math.round(hero.width), h: Math.round(hero.height) } : null,
    sidebar: sidebar ? { w: Math.round(sidebar.width), h: Math.round(sidebar.height) } : null,
    scroll: window.scrollY,
    title: document.querySelector('.hero-title')?.textContent,
    fonts: document.fonts.status,
  };
});
console.log('  layout:', layout);
console.log('  active:', await active());
await snap('01-home');

console.log('2. D-pad navigation + live player');
await page.keyboard.press('ArrowDown');
await wait(500);
console.log('  after ArrowDown:', await active());
await snap('02-home-focus');
await page.keyboard.press('Enter');
await wait(3500);
console.log('  url:', page.url());
console.log('  video:', await videoInfo());
console.log('  active:', await active());
await snap('03-live-player');
await page.keyboard.press('ArrowRight');
await wait(2500);
console.log('  after channel zap:', await page.evaluate(() => document.querySelector('.player-title')?.textContent), await videoInfo());
await snap('04-live-zapped');
await page.keyboard.press('Escape');
await wait(1200);
console.log('  after Escape url:', page.url());

console.log('3. Movies + detail + VOD player');
await page.evaluate(() => { location.hash = '#/movies'; });
await page.waitForSelector('.poster-grid');
await wait(900);
console.log('  active:', await active());
await snap('05-movies');
await page.keyboard.press('Enter');
await wait(1200);
console.log('  url:', page.url());
console.log('  active:', await active());
await snap('06-movie-detail');
await page.keyboard.press('Enter');
await wait(3500);
console.log('  url:', page.url());
console.log('  video:', await videoInfo());
await snap('07-movie-player');
await page.keyboard.press('ArrowRight');
await wait(800);
console.log('  after seek:', await videoInfo());
await page.keyboard.press(' ');
await wait(400);
console.log('  after pause:', await videoInfo());
await snap('08-movie-paused');
await page.keyboard.press('Escape');
await wait(1000);
console.log('  after Escape url:', page.url());

console.log('4. Series');
await page.evaluate(() => { location.hash = '#/series'; });
await page.waitForSelector('.poster-grid');
await wait(800);
await snap('09-series');
console.log('  active:', await active());
await page.keyboard.press('Enter');
await wait(1200);
console.log('  url:', page.url());
console.log('  active:', await active());
await snap('10-series-detail');
await page.keyboard.press('Escape');
await wait(800);

console.log('5. Search');
await page.evaluate(() => { location.hash = '#/search'; });
await page.waitForSelector('.search-box');
await wait(700);
await page.keyboard.type('neon');
await wait(900);
console.log('  active:', await active());
await snap('11-search');
await page.keyboard.press('ArrowDown');
await wait(400);
console.log('  after ArrowDown:', await active());
await page.keyboard.press('Enter');
await wait(600);
console.log('  query after keypress:', await page.evaluate(() => document.querySelector('.search-box input')?.value));
await snap('12-search-typing');

console.log('6. Favorites empty state + Settings');
await page.evaluate(() => { location.hash = '#/favorites'; });
await wait(800);
await snap('13-favorites-empty');
await page.evaluate(() => { location.hash = '#/settings'; });
await page.waitForSelector('.mode-grid');
await wait(700);
console.log('  active:', await active());
await snap('14-settings');
await page.evaluate(() => { location.hash = '#/live'; });
await page.waitForSelector('.channel-grid');
await wait(900);
await snap('15-live');

console.log('Console/page errors:', errors.length ? errors : 'none');
await browser.close();
