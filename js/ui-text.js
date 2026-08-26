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
    en: 'Unofficial community learning tool. Not affiliated with Anthropic.',
    ko: '비공식 커뮤니티 학습 도구입니다. Anthropic 과 무관합니다.',
  },
  heroKicker: { en: 'open it up', ko: '열어 봅니다' },
  heroTitle: { en: 'See what happens after you hit enter.', ko: '엔터를 누른 뒤에 무슨 일이 벌어지는지 봅니다.' },
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
  started: { en: 'started', ko: '진행 중' },
  finished: { en: 'finished', ko: '완료' },
  stepOf: { en: 'Step', ko: '단계' },
};

/** Replace the text of every `[data-t]` element under `root`. */
export function applyChrome(root, locale) {
  for (const node of root.querySelectorAll('[data-t]')) {
    const value = UI[node.dataset.t];
    if (value) node.textContent = pickText(value, locale);
  }
}

/** One shell string. */
export function t(key, locale) {
  return pickText(UI[key], locale);
}
