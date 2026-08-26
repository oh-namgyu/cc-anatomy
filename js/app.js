/**
 * App shell: hash routing, the locale toggle, and the load-time schema gate
 * that decides between the player and the static fallback view.
 */

import { allLessons, getLesson, register } from './lessons/index.js';
import { validateLesson } from './engine/schema.js';
import { pickText } from './engine/locale.js';
import { readLocale, writeLocale, readProgress, markProgress } from './store.js';
import { applyChrome } from './ui-text.js';
import { renderHome, renderLesson, renderFallback, renderMissing } from './views.js';

const mount = document.getElementById('view');
let locale = readLocale();
let view = null;

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts[0] === 'lesson' && parts[1]) return { name: 'lesson', id: decodeURIComponent(parts[1]) };
  return { name: 'home' };
}

function setTitle(text) {
  document.title = text ? `${text} · cc-anatomy` : 'cc-anatomy';
}

function openLesson(id) {
  const lesson = getLesson(id);
  if (!lesson) {
    setTitle('');
    return renderMissing(mount, locale);
  }
  setTitle(pickText(lesson.title, locale));
  const check = validateLesson(lesson);
  if (!check.ok) {
    return renderFallback(mount, { lesson, errors: check.errors, locale });
  }
  return renderLesson(mount, {
    lesson,
    locale,
    onStep: (index, total) => markProgress(lesson.id, index, total),
  });
}

function route() {
  if (view && view.destroy) view.destroy();
  const target = parseHash();
  if (target.name === 'lesson') {
    view = openLesson(target.id);
  } else {
    setTitle('');
    view = renderHome(mount, { lessons: allLessons(), locale, progress: readProgress() });
  }
  document.body.dataset.route = target.name;
  window.scrollTo(0, 0);
}

function paintLocaleButtons() {
  for (const button of document.querySelectorAll('.loc-btn')) {
    const on = button.dataset.locale === locale;
    button.classList.toggle('is-on', on);
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

function setLocale(next) {
  if (next === locale) return;
  locale = next;
  writeLocale(next);
  document.documentElement.lang = next;
  applyChrome(document.body, locale);
  paintLocaleButtons();
  if (view && view.setLocale) view.setLocale(locale);
}

function wireLocaleButtons() {
  for (const button of document.querySelectorAll('.loc-btn')) {
    button.addEventListener('click', () => setLocale(button.dataset.locale));
  }
}

/**
 * Test hook: `?lesson=broken` registers a deliberately invalid lesson so the
 * data-error fallback can be exercised. It is never part of the normal build's
 * lesson list unless the query parameter is present.
 */
async function loadTestFixture() {
  const requested = new URLSearchParams(window.location.search).get('lesson');
  if (requested !== 'broken') return;
  const module = await import('./lessons/broken.js');
  register(module.broken);
}

async function boot() {
  await loadTestFixture();
  document.documentElement.lang = locale;
  applyChrome(document.body, locale);
  paintLocaleButtons();
  wireLocaleButtons();
  window.addEventListener('hashchange', route);
  route();
  document.body.dataset.ready = 'true';
}

boot();
