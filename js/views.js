/**
 * View rendering: home grid, lesson player, and the two static fallbacks.
 * Markup comes from the <template> elements in index.html; every dynamic
 * string is written with textContent.
 */

import { pickText } from './engine/locale.js';
import { paintText } from './engine/richtext.js';
import { createDiagram } from './engine/diagram.js';
import { createPlayer } from './engine/player.js';
import { createWidgets } from './engine/widgets.js';
import { createQuiz } from './engine/quiz.js';
import { findScenario } from './engine/schema.js';
import { applyChrome, t } from './ui-text.js';

function clone(id) {
  const tpl = document.getElementById(id);
  return tpl.content.cloneNode(true);
}

function mountView(mount, fragment, locale) {
  mount.textContent = '';
  mount.appendChild(fragment);
  applyChrome(mount, locale);
}

/** not started / viewed / completed — the three states a home card shows. */
function progressLabel(entry, locale) {
  if (!entry) return t('notStarted', locale);
  return entry.done ? t('completed', locale) : t('viewed', locale);
}

function buildCard(lesson, ordinal, locale, progress) {
  const frag = clone('tpl-card');
  const link = frag.querySelector('[data-card]');
  link.href = `#/lesson/${lesson.id}`;
  link.dataset.lessonId = lesson.id;
  frag.querySelector('[data-num]').textContent = String(ordinal).padStart(2, '0');
  frag.querySelector('[data-title]').textContent = pickText(lesson.title, locale);
  paintText(frag.querySelector('[data-intro]'), pickText(lesson.intro, locale));
  const meta = [];
  if (lesson.minutes) meta.push(`${lesson.minutes} ${t('minutes', locale)}`);
  if (lesson.demo) meta.push(t('demoTag', locale));
  frag.querySelector('[data-meta]').textContent = meta.join(' · ');
  const mark = frag.querySelector('[data-progress]');
  const entry = progress[lesson.id];
  mark.textContent = progressLabel(entry, locale);
  mark.dataset.state = entry ? (entry.done ? 'completed' : 'viewed') : 'none';
  return frag;
}

/** Home: hero plus the lesson card grid. */
export function renderHome(mount, { lessons, locale, progress }) {
  const frag = clone('tpl-home');
  const grid = frag.querySelector('[data-grid]');
  lessons.forEach((lesson, i) => grid.appendChild(buildCard(lesson, i + 1, locale, progress)));
  mountView(mount, frag, locale);
  return { setLocale() {}, destroy() {} };
}

/** Static overview shown when a lesson fails the schema gate. */
export function renderFallback(mount, { lesson, errors, locale }) {
  const frag = clone('tpl-fallback');
  frag.querySelector('[data-title]').textContent = pickText(lesson.title, locale) || lesson.id;
  paintText(frag.querySelector('[data-intro]'), pickText(lesson.intro, locale));
  const list = frag.querySelector('[data-errors]');
  for (const message of errors) {
    const item = document.createElement('li');
    item.textContent = message;
    list.appendChild(item);
  }
  mountView(mount, frag, locale);
  return { setLocale() {}, destroy() {} };
}

/** Unknown lesson id. */
export function renderMissing(mount, locale) {
  mountView(mount, clone('tpl-missing'), locale);
  return { setLocale() {}, destroy() {} };
}

function lessonEls(root) {
  const q = (sel) => root.querySelector(sel);
  return {
    title: q('[data-title]'),
    intro: q('[data-intro]'),
    widgets: q('[data-widgets]'),
    canvas: q('[data-canvas]'),
    stepline: q('[data-stepline]'),
    explain: q('[data-explain]'),
    badge: q('[data-badge]'),
    indicator: q('[data-indicator]'),
    dots: q('[data-dots]'),
    prev: q('[data-prev]'),
    next: q('[data-next]'),
    auto: q('[data-auto]'),
    quizOpen: q('[data-quiz-open]'),
    quiz: q('[data-quiz]'),
    sources: q('[data-sources]'),
    sourceList: q('[data-source-list]'),
    asOf: q('[data-as-of]'),
  };
}

/** `lesson.sources` as external links. Links are not resource loads. */
function paintSources(els, lesson) {
  const urls = Array.isArray(lesson.sources) ? lesson.sources : [];
  els.sources.hidden = urls.length === 0;
  els.sourceList.textContent = '';
  for (const url of urls) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = url;
    item.appendChild(link);
    els.sourceList.appendChild(item);
  }
  els.asOf.textContent = lesson.asOf || '';
}

/**
 * Lesson view: widget zone, diagram canvas, explanation panel, control bar.
 * @returns {{setLocale: (l: string) => void, destroy: () => void}}
 */
export function renderLesson(mount, { lesson, locale, onStep, onComplete }) {
  let current = locale;
  const frag = clone('tpl-lesson');
  mount.textContent = '';
  mount.appendChild(frag);
  const els = lessonEls(mount);

  const diagram = createDiagram(els.canvas, lesson.diagram, current);

  function paintHead() {
    els.title.textContent = pickText(lesson.title, current);
    paintText(els.intro, pickText(lesson.intro, current));
  }

  function showQuiz() {
    if (!els.quiz.hidden) return;
    els.quiz.hidden = false;
    els.quizOpen.setAttribute('aria-expanded', 'true');
  }

  function paintStepline(index, total) {
    els.stepline.textContent = `${t('stepOf', current)} ${index + 1} / ${total}`;
    if (index >= total - 1) showQuiz();
    if (onStep) onStep(index, total);
  }

  const player = createPlayer({
    diagram,
    els,
    locale: current,
    onStep: paintStepline,
  });

  const widgets = createWidgets(els.widgets, lesson, {
    locale: current,
    onChange: (selection) => player.load(findScenario(lesson, selection)),
  });

  const quiz = createQuiz(els.quiz, lesson, { locale: current, onComplete });

  els.quizOpen.addEventListener('click', showQuiz);
  els.quizOpen.hidden = !Array.isArray(lesson.quiz) || lesson.quiz.length === 0;

  paintHead();
  paintSources(els, lesson);
  applyChrome(mount, current);
  player.load(widgets.getScenario());

  return {
    setLocale(next) {
      current = next;
      paintHead();
      applyChrome(mount, next);
      widgets.setLocale(next);
      player.setLocale(next);
      quiz.setLocale(next);
    },
    destroy() {
      player.destroy();
      widgets.destroy();
      quiz.destroy();
    },
  };
}
