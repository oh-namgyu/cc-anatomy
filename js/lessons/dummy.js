/**
 * Engine demo lesson — placeholder content, not teaching material.
 *
 * It exists to exercise every engine feature end to end: a cluster box, an
 * elbow edge, a straight edge, a loop-back edge with a bow, two widget types,
 * the full 2x2 branch matrix, badges of each tone, and EN/KO throughout.
 * The real lessons (L1-L4) land in the next stage from docs/CONTENT-SPEC.md.
 */

const NODE_H = 56;

export const dummy = {
  id: 'dummy',
  demo: true,
  minutes: 2,
  title: { en: 'Engine demo', ko: '엔진 데모' },
  intro: {
    en: 'A placeholder lesson used to exercise the simulation engine. The wording here teaches nothing — the documented lessons arrive in the next stage.',
    ko: '시뮬레이션 엔진을 점검하려고 만든 자리표시 레슨입니다. 여기 문구는 학습 내용이 아니며, 문서 기반 레슨은 다음 단계에 들어옵니다.',
  },

  diagram: {
    nodes: [
      {
        id: 'd.input', role: 'event', x: 0, y: 60, w: 200, h: NODE_H,
        label: { en: 'You send a prompt', ko: '프롬프트를 보냅니다' },
      },
      {
        id: 'd.context', role: 'cluster', x: 322, y: -30, group: ['d.rules', 'd.tools'],
        label: { en: 'Loaded together — no order', ko: '함께 로드 — 순서 없음' },
      },
      {
        id: 'd.rules', role: 'artifact', x: 340, y: 10, h: NODE_H,
        label: { en: 'Project rules', ko: '프로젝트 규칙' },
      },
      {
        id: 'd.tools', role: 'artifact', x: 340, y: 82, h: NODE_H,
        label: { en: 'Tool list', ko: '도구 목록' },
      },
      {
        id: 'd.gate', role: 'decision', x: 680, y: 60, h: NODE_H,
        label: { en: 'Guard check', ko: '가드 점검' },
      },
      {
        id: 'd.result', role: 'terminal', x: 1000, y: 60, h: NODE_H,
        label: { en: 'Result', ko: '결과' },
      },
    ],
    edges: [
      { from: 'd.input', to: 'd.context', label: { en: 'starts a turn', ko: '턴 시작' } },
      { from: 'd.context', to: 'd.gate', label: { en: 'evaluated', ko: '판단' } },
      { from: 'd.gate', to: 'd.result', label: { en: 'passes', ko: '통과' } },
      { from: 'd.gate', to: 'd.input', bow: 78, label: { en: 'sent back', ko: '되돌아감' } },
    ],
  },

  inputs: {
    mode: ['ask', 'edit'],
    guard: ['off', 'on'],
  },

  widgets: {
    mode: {
      type: 'chips',
      label: { en: 'What you asked for', ko: '요청 내용' },
      valueLabels: {
        ask: { en: '"what is in here?"', ko: '"여기 뭐가 있어?"' },
        edit: { en: '"edit the config file"', ko: '"설정 파일을 수정해줘"' },
      },
    },
    guard: {
      type: 'toggle',
      label: { en: 'Guard hook', ko: '가드 훅' },
      valueLabels: {
        off: { en: 'not configured', ko: '설정 안 함' },
        on: { en: 'configured', ko: '설정함' },
      },
    },
  },

  scenarios: [
    {
      id: 'd.s1',
      trigger: { mode: 'ask', guard: 'off' },
      steps: [
        {
          node: 'd.input',
          explain: { en: 'You ask a read-only question.', ko: '읽기만 하는 질문을 던집니다.' },
        },
        {
          node: 'd.context',
          edge: 'd.input->d.context',
          explain: {
            en: 'The cluster box lights up as a whole: its members are drawn together because nothing orders them.',
            ko: '클러스터 상자가 통째로 켜집니다 — 구성원 사이에 순서가 없어 함께 그려집니다.',
          },
          badge: 'unordered',
        },
        {
          node: 'd.gate',
          edge: 'd.context->d.gate',
          explain: { en: 'No guard is configured, so nothing intercepts the request.', ko: '가드가 설정되지 않아 아무것도 요청을 가로채지 않습니다.' },
        },
        {
          node: 'd.result',
          edge: 'd.gate->d.result',
          explain: { en: 'The turn finishes.', ko: '턴이 끝납니다.' },
          badge: 'end',
        },
      ],
    },
    {
      id: 'd.s2',
      trigger: { mode: 'ask', guard: 'on' },
      steps: [
        {
          node: 'd.input',
          explain: { en: 'You ask a read-only question, and a guard is configured.', ko: '읽기만 하는 질문을 던지고, 가드가 설정돼 있습니다.' },
        },
        {
          node: 'd.context',
          edge: 'd.input->d.context',
          explain: { en: 'The same unordered cluster loads first.', ko: '순서 없는 같은 클러스터가 먼저 로드됩니다.' },
          badge: 'unordered',
        },
        {
          node: 'd.gate',
          edge: 'd.context->d.gate',
          explain: { en: 'The guard inspects the request.', ko: '가드가 요청을 살펴봅니다.' },
        },
        {
          node: 'd.gate',
          explain: { en: 'Reading changes nothing, so the guard lets it through.', ko: '읽기는 아무것도 바꾸지 않으므로 가드가 통과시킵니다.' },
          badge: 'allowed',
        },
        {
          node: 'd.result',
          edge: 'd.gate->d.result',
          explain: { en: 'The turn finishes.', ko: '턴이 끝납니다.' },
          badge: 'end',
        },
      ],
    },
    {
      id: 'd.s3',
      trigger: { mode: 'edit', guard: 'off' },
      steps: [
        {
          node: 'd.input',
          explain: { en: 'You ask for a file to be changed.', ko: '파일을 바꿔 달라고 요청합니다.' },
        },
        {
          node: 'd.context',
          edge: 'd.input->d.context',
          explain: { en: 'Rules and tool names load together, in no stated order.', ko: '규칙과 도구 이름이 순서 없이 함께 로드됩니다.' },
          badge: 'unordered',
        },
        {
          node: 'd.gate',
          edge: 'd.context->d.gate',
          explain: { en: 'With no guard configured, the write is not intercepted.', ko: '가드가 없어 쓰기가 가로채이지 않습니다.' },
        },
        {
          node: 'd.gate',
          explain: { en: 'Nothing checks the change before it happens.', ko: '변경 전에 무엇도 검사하지 않습니다.' },
          badge: 'allowed',
        },
        {
          node: 'd.result',
          edge: 'd.gate->d.result',
          explain: { en: 'The file is written and the turn finishes.', ko: '파일이 쓰이고 턴이 끝납니다.' },
          badge: 'end',
        },
      ],
    },
    {
      id: 'd.s4',
      trigger: { mode: 'edit', guard: 'on' },
      steps: [
        {
          node: 'd.input',
          explain: { en: 'You ask for a file to be changed, and a guard is configured.', ko: '파일 변경을 요청하고, 가드가 설정돼 있습니다.' },
        },
        {
          node: 'd.context',
          edge: 'd.input->d.context',
          explain: { en: 'Rules and tool names load together, in no stated order.', ko: '규칙과 도구 이름이 순서 없이 함께 로드됩니다.' },
          badge: 'unordered',
        },
        {
          node: 'd.gate',
          edge: 'd.context->d.gate',
          explain: { en: 'The guard inspects the write before it runs.', ko: '가드가 실행 전에 쓰기를 검사합니다.' },
        },
        {
          node: 'd.gate',
          explain: { en: 'It refuses the write, so the flow never reaches the result node.', ko: '쓰기를 거부하므로 흐름이 결과 노드까지 가지 않습니다.' },
          badge: 'blocked',
        },
        {
          node: 'd.input',
          edge: 'd.gate->d.input',
          explain: { en: 'The bowed trace carries control back to the start of the turn.', ko: '휘어진 선이 제어를 턴 시작 지점으로 되돌립니다.' },
          badge: 'end',
        },
      ],
    },
  ],
};

export default dummy;
