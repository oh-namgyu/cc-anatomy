/**
 * Step player: walks a scenario's steps over a rendered diagram.
 *
 * Each step highlights its node (a cluster node lights all its members at
 * once), optionally pulses one edge, and writes the explanation and badge into
 * the side panel. Motion is CSS-driven, so `prefers-reduced-motion` turns the
 * trace pulse into a static highlight without changing this logic.
 */

import { pickText } from './locale.js';

export const AUTO_MS = 1600;

const TONE_BY_TEXT = new Map(Object.entries({
  blocked: 'blocked',
  denied: 'blocked',
  'not blocked': 'allowed',
  allowed: 'allowed',
  end: 'allowed',
  continues: 'warn',
  'exit 2': 'warn',
  'exit 0': 'neutral',
  unordered: 'neutral',
}));

/** Presentation-side tone for a badge; data may override with `tone`. */
export function badgeTone(badge, locale) {
  if (badge && typeof badge === 'object' && badge.tone) return badge.tone;
  const text = pickText(badge, locale).trim().toLowerCase();
  return TONE_BY_TEXT.get(text) || 'neutral';
}

function isTypingTarget(target) {
  if (!target || !target.tagName) return false;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

/**
 * @param {object} opts
 * @param {object} opts.diagram controller returned by createDiagram
 * @param {object} opts.els {explain, badge, indicator, dots, prev, next, auto}
 * @param {string} opts.locale
 * @param {(index:number, total:number)=>void} [opts.onStep]
 */
export function createPlayer({ diagram, els, locale = 'en', autoMs = AUTO_MS, onStep }) {
  let current = locale;
  let scenario = null;
  let index = 0;
  let timer = null;
  const dotEls = [];

  const steps = () => (scenario ? scenario.steps : []);
  const total = () => steps().length;

  function buildDots() {
    els.dots.textContent = '';
    dotEls.length = 0;
    steps().forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.dataset.dot = String(i);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Step ${i + 1}`);
      dot.addEventListener('click', () => goto(i));
      els.dots.appendChild(dot);
      dotEls.push(dot);
    });
  }

  function paintBadge(step) {
    const text = pickText(step.badge, current);
    els.badge.hidden = !text;
    els.badge.textContent = text;
    els.badge.dataset.tone = text ? badgeTone(step.badge, current) : 'neutral';
  }

  function paint() {
    const step = steps()[index];
    if (!step) return;
    diagram.setActive([step.node]);
    diagram.pulse(step.edge || null);
    els.explain.textContent = pickText(step.explain, current);
    paintBadge(step);
    els.indicator.textContent = `${index + 1} / ${total()}`;
    dotEls.forEach((dot, i) => {
      dot.classList.toggle('is-on', i === index);
      dot.classList.toggle('is-past', i < index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    els.prev.disabled = index === 0;
    els.next.disabled = index >= total() - 1;
    if (onStep) onStep(index, total());
  }

  function goto(next) {
    if (!scenario) return;
    index = Math.max(0, Math.min(total() - 1, next));
    paint();
  }

  function stopAuto() {
    if (timer != null) clearInterval(timer);
    timer = null;
    els.auto.setAttribute('aria-pressed', 'false');
    els.auto.classList.remove('is-on');
  }

  function startAuto() {
    stopAuto();
    if (!scenario) return;
    if (index >= total() - 1) goto(0);
    els.auto.setAttribute('aria-pressed', 'true');
    els.auto.classList.add('is-on');
    timer = setInterval(() => {
      if (index >= total() - 1) stopAuto();
      else goto(index + 1);
    }, autoMs);
  }

  function toggleAuto() {
    if (timer != null) stopAuto();
    else startAuto();
  }

  function onKey(event) {
    if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
    if (event.key === 'ArrowRight') {
      stopAuto();
      goto(index + 1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      stopAuto();
      goto(index - 1);
      event.preventDefault();
    }
  }

  function onPrev() {
    stopAuto();
    goto(index - 1);
  }

  function onNext() {
    stopAuto();
    goto(index + 1);
  }

  els.prev.addEventListener('click', onPrev);
  els.next.addEventListener('click', onNext);
  els.auto.addEventListener('click', toggleAuto);
  document.addEventListener('keydown', onKey);

  return {
    /** Load a scenario and reset to its first step. */
    load(next) {
      stopAuto();
      scenario = next;
      index = 0;
      buildDots();
      if (!scenario) {
        diagram.clear();
        els.explain.textContent = '';
        els.badge.hidden = true;
        els.indicator.textContent = '';
        return;
      }
      paint();
    },
    setLocale(next) {
      current = next;
      diagram.setLocale(next);
      if (scenario) paint();
    },
    goto,
    next: onNext,
    prev: onPrev,
    toggleAuto,
    stopAuto,
    get index() { return index; },
    get total() { return total(); },
    get scenarioId() { return scenario ? scenario.id : null; },
    destroy() {
      stopAuto();
      els.prev.removeEventListener('click', onPrev);
      els.next.removeEventListener('click', onNext);
      els.auto.removeEventListener('click', toggleAuto);
      document.removeEventListener('keydown', onKey);
    },
  };
}
