/**
 * L3 — Hooks.
 *
 * Data transcribed from docs/CONTENT-SPEC.md §3. The diagram draws the
 * lifecycle spine down the left (request → permission flow → execute → result
 * → turn end → done) and hangs each hook off it as a detour, so the "no hook"
 * edges and the hook path are visibly the same lifecycle.
 *
 * Scenarios live in l3_hooks_scenarios.js — see the exit-code rule there.
 */

import { l3Scenarios } from './l3_hooks_scenarios.js';

const H = 64;

export const l3 = {
  id: 'l3-hooks',
  minutes: 8,
  asOf: '2026-08-26',
  title: { en: 'Hooks', ko: '훅' },
  intro: {
    en: 'Hooks are shell commands Claude Code runs at fixed lifecycle points. The exit code is how a hook talks back — and exit 2 does not mean the same thing on every event. This lesson makes that difference the point.',
    ko: '훅은 정해진 생애주기 지점에서 Claude Code 가 실행하는 셸 명령입니다. 훅은 종료 코드로 응답하는데, exit 2 의 의미는 이벤트마다 다릅니다. 이 레슨은 그 차이를 정면으로 다룹니다.',
  },

  diagram: {
    nodes: [
      { id: 'l3.request', role: 'event', x: 0, y: 0, h: H,
        label: { en: 'Claude requests a tool', ko: '클로드가 도구를 요청' } },
      { id: 'l3.pre', role: 'event', x: 140, y: 150, h: H,
        label: { en: 'PreToolUse fires', ko: 'PreToolUse 발화' } },
      { id: 'l3.blocked', role: 'terminal', x: 140, y: 300, h: H,
        label: { en: 'Tool call blocked', ko: '도구 호출 차단' } },
      { id: 'l3.perm', role: 'decision', x: 280, y: 0, h: H,
        label: { en: 'Permission flow', ko: '권한 흐름' } },
      { id: 'l3.exec', role: 'event', x: 560, y: 0, h: H,
        label: { en: 'Tool executes', ko: '도구 실행' } },
      { id: 'l3.post', role: 'event', x: 840, y: 150, h: H,
        label: { en: 'PostToolUse fires', ko: 'PostToolUse 발화' } },
      { id: 'l3.feedback', role: 'artifact', x: 1120, y: 150, h: H,
        label: { en: 'stderr shown to Claude', ko: 'stderr 를 클로드에게 표시' } },
      { id: 'l3.debug_log', role: 'artifact', x: 840, y: 300, h: H,
        label: { en: 'Debug log', ko: '디버그 로그' } },
      { id: 'l3.result', role: 'event', x: 560, y: 440, h: H,
        label: { en: 'Result returns to Claude', ko: '결과가 클로드에게' } },
      { id: 'l3.turn_end', role: 'event', x: 280, y: 440, h: H,
        label: { en: 'Claude finishes responding', ko: '클로드가 응답 완료' } },
      { id: 'l3.stop', role: 'event', x: 140, y: 590, h: H,
        label: { en: 'Stop fires', ko: 'Stop 발화' } },
      { id: 'l3.continue', role: 'terminal', x: 140, y: 740, h: H,
        label: { en: 'Claude keeps working', ko: '클로드가 계속 작업' } },
      { id: 'l3.done', role: 'terminal', x: 0, y: 440, h: H,
        label: { en: 'Turn ends', ko: '턴 종료' } },
    ],
    edges: [
      { from: 'l3.request', to: 'l3.pre' },
      { from: 'l3.request', to: 'l3.perm', label: { en: 'no hook', ko: '훅 없음' } },
      { from: 'l3.pre', to: 'l3.blocked', label: { en: 'exit 2', ko: 'exit 2' } },
      { from: 'l3.pre', to: 'l3.perm', label: { en: 'exit 0', ko: 'exit 0' } },
      { from: 'l3.perm', to: 'l3.exec' },
      { from: 'l3.exec', to: 'l3.post', label: { en: 'on success', ko: '성공 후' } },
      { from: 'l3.exec', to: 'l3.result', label: { en: 'no hook', ko: '훅 없음' } },
      { from: 'l3.post', to: 'l3.feedback', label: { en: 'exit 2', ko: 'exit 2' } },
      { from: 'l3.post', to: 'l3.debug_log', label: { en: 'exit 0', ko: 'exit 0' } },
      { from: 'l3.feedback', to: 'l3.result', bow: 70 },
      { from: 'l3.debug_log', to: 'l3.result' },
      { from: 'l3.result', to: 'l3.turn_end' },
      { from: 'l3.turn_end', to: 'l3.stop' },
      { from: 'l3.turn_end', to: 'l3.done', label: { en: 'no hook', ko: '훅 없음' } },
      { from: 'l3.stop', to: 'l3.continue', label: { en: 'exit 2', ko: 'exit 2' } },
      { from: 'l3.stop', to: 'l3.done', label: { en: 'exit 0', ko: 'exit 0' } },
    ],
  },

  inputs: {
    hook: ['off', 'PreToolUse', 'PostToolUse', 'Stop'],
    exit: ['0', '2'],
  },

  widgets: {
    hook: {
      type: 'chips',
      label: { en: 'Configured hook', ko: '설정된 훅' },
      valueLabels: {
        off: { en: 'none', ko: '없음' },
        PreToolUse: { en: 'PreToolUse', ko: 'PreToolUse' },
        PostToolUse: { en: 'PostToolUse', ko: 'PostToolUse' },
        Stop: { en: 'Stop', ko: 'Stop' },
      },
    },
    exit: {
      type: 'toggle',
      label: { en: 'Exit code', ko: '종료 코드' },
      valueLabels: {
        0: { en: 'exit 0', ko: 'exit 0' },
        2: { en: 'exit 2', ko: 'exit 2' },
      },
    },
  },

  scenarios: l3Scenarios,

  quiz: [
    {
      q: {
        en: 'A `PostToolUse` hook exits 2. What do the docs say happens?',
        ko: '`PostToolUse` 훅이 exit 2 로 종료했습니다. 문서는 어떻게 된다고 합니까?' },
      choices: [
        { en: 'The tool call is blocked', ko: '도구 호출이 차단된다' },
        { en: "The tool's effect is rolled back", ko: '도구의 결과가 롤백된다' },
        { en: 'stderr is shown to Claude; the tool already ran', ko: 'stderr 가 클로드에게 표시되고, 도구는 이미 실행됐다' },
        { en: 'The session ends', ko: '세션이 종료된다' },
      ],
      answer: 2,
    },
    {
      q: {
        en: 'A `Stop` hook exits 2. What do the docs say happens?',
        ko: '`Stop` 훅이 exit 2 로 종료했습니다. 문서는 어떻게 된다고 합니까?' },
      choices: [
        { en: 'Claude is prevented from stopping and the conversation continues', ko: '클로드가 멈추지 못하고 대화가 계속된다' },
        { en: 'The last tool call is blocked', ko: '마지막 도구 호출이 차단된다' },
        { en: 'The turn ends immediately', ko: '턴이 즉시 끝난다' },
        { en: 'Nothing; `Stop` cannot block', ko: '아무 일도 없다; `Stop` 은 차단 불가다' },
      ],
      answer: 0,
    },
    {
      q: {
        en: 'A `PreToolUse` hook exits 0. Is the tool call approved?',
        ko: '`PreToolUse` 훅이 exit 0 으로 종료했습니다. 도구 호출이 승인된 것입니까?' },
      choices: [
        { en: 'Yes, exit 0 approves it', ko: '예, exit 0 이 승인이다' },
        { en: 'No — the normal permission flow still applies', ko: '아니오 — 일반 권한 흐름이 그대로 적용된다' },
        { en: 'Only in `bypassPermissions` mode', ko: '`bypassPermissions` 모드에서만' },
        { en: 'Only if stdout is empty', ko: 'stdout 이 비어 있을 때만' },
      ],
      answer: 1,
    },
  ],

  sources: [
    'https://code.claude.com/docs/en/hooks',
    'https://code.claude.com/docs/en/hooks-guide',
  ],
};

export default l3;
