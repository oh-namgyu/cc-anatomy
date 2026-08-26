/**
 * Shell strings (everything outside lesson data) in both locales, plus the
 * helper that fills every `[data-t]` element in a subtree.
 */

import { pickText } from './engine/locale.js';

export const UI = {
  tagline: {
    en: 'A conceptual model of documented behavior — not the actual implementation.',
    ko: '문서로 확인된 동작의 개념 모델입니다 — 실제 구현이 아닙니다.',
  },
  unofficial: {
    en: 'Unofficial community project — a conceptual model of documented behavior, not affiliated with Anthropic.',
    ko: '비공식 커뮤니티 프로젝트 — 문서로 확인된 동작의 개념 모델이며, Anthropic 과 무관합니다.',
  },
  heroKicker: { en: 'open it up', ko: '열어 봅니다' },
  heroTitle: {
    en: 'See how Claude Code actually runs — step by step.',
    ko: 'Claude Code 가 실제로 어떻게 도는지 — 한 단계씩 봅니다.',
  },
  heroLead: {
    en: 'Each lesson is a diagram you can drive. Change an input, replay the flow step by step, and watch where the signal goes.',
    ko: '각 레슨은 직접 움직여 보는 다이어그램입니다. 입력을 바꾸고, 흐름을 한 단계씩 재생하며, 신호가 어디로 가는지 지켜보세요.',
  },
  back: { en: '← All lessons', ko: '← 레슨 목록' },
  auto: { en: 'auto', ko: '자동' },
  hint: { en: 'Use ← and → to step through.', ko: '← → 키로 단계를 넘길 수 있습니다.' },
  dataError: { en: 'This lesson could not be played.', ko: '이 레슨은 재생할 수 없습니다.' },
  dataErrorBody: {
    en: 'Its data failed the schema check, so the simulation is unavailable. The overview above is shown instead.',
    ko: '레슨 데이터가 스키마 검사를 통과하지 못해 시뮬레이션을 쓸 수 없습니다. 대신 위 개요를 표시합니다.',
  },
  notFound: { en: 'Lesson not found', ko: '레슨을 찾을 수 없습니다' },
  notFoundBody: { en: 'No lesson is registered under that address.', ko: '그 주소로 등록된 레슨이 없습니다.' },
  minutes: { en: 'min', ko: '분' },
  demoTag: { en: 'engine demo', ko: '엔진 데모' },
  notStarted: { en: 'not started', ko: '시작 전' },
  viewed: { en: 'viewed', ko: '열어 봄' },
  completed: { en: 'completed', ko: '완료' },
  stepOf: { en: 'Step', ko: '단계' },
  quizOpen: { en: 'Quiz', ko: '퀴즈' },
  quizHead: { en: 'Check yourself', ko: '스스로 점검' },
  quizLead: {
    en: 'Three questions on what the documentation says. Answering all three marks the lesson complete.',
    ko: '문서가 말하는 내용에 대한 세 문항입니다. 세 문항을 모두 답하면 레슨이 완료로 기록됩니다.',
  },
  correct: { en: 'Correct', ko: '정답' },
  incorrect: { en: 'Not quite', ko: '오답' },
  scoreSuffix: { en: 'correct', ko: '정답' },
  learnMore: { en: 'Learn more', ko: '더 알아보기' },
  asOf: { en: 'Documentation baseline', ko: '문서 기준일' },

  /* accessible names — applied as aria-label via [data-t-aria] */
  language: { en: 'Language', ko: '언어' },
  prevStep: { en: 'Previous step', ko: '이전 단계' },
  nextStep: { en: 'Next step', ko: '다음 단계' },
  autoPlay: { en: 'Play the scenario automatically', ko: '시나리오 자동 재생' },
  stepList: { en: 'Steps', ko: '단계 목록' },
  currentStep: { en: 'Current step', ko: '현재 단계' },
  diagramLabel: { en: 'Lesson flow diagram', ko: '레슨 흐름 다이어그램' },
};

/**
 * Fill every `[data-t]` element's text and every `[data-t-aria]` element's
 * accessible name under `root`, in `locale`. Called on mount and on every
 * locale switch, so assistive tech follows the language toggle too.
 */
export function applyChrome(root, locale) {
  for (const node of root.querySelectorAll('[data-t]')) {
    const value = UI[node.dataset.t];
    if (value) node.textContent = pickText(value, locale);
  }
  for (const node of root.querySelectorAll('[data-t-aria]')) {
    const value = UI[node.dataset.tAria];
    if (value) node.setAttribute('aria-label', pickText(value, locale));
  }
}

/** One shell string. */
export function t(key, locale) {
  return pickText(UI[key], locale);
}
